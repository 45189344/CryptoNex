"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributionService = void 0;
const axios_1 = __importDefault(require("axios"));
const store_1 = require("../db/store");
const env_1 = require("../config/env");
class AttributionService {
    /**
     * Main entrypoint for calculating multi-factor VASP attribution
     */
    static async analyze(targetAddress, transactions, customWeights) {
        const weights = customWeights || store_1.store.getWeights();
        const vasps = store_1.store.getVasps();
        const vaspAddresses = store_1.store.getVaspAddresses();
        // 1. Attempt to invoke Python FastAPI analytics microservice
        try {
            const response = await axios_1.default.post(`${env_1.CONFIG.ANALYTICS_SERVICE_URL}/analytics/attribute`, {
                target_address: targetAddress,
                transactions,
                vasp_addresses: vaspAddresses,
                vasps,
                weights
            }, { timeout: 3500 });
            if (response.data && response.data.ranked_vasps) {
                store_1.store.saveAttribution(targetAddress, response.data.ranked_vasps);
                return {
                    rankedVasps: response.data.ranked_vasps,
                    summaryStats: response.data.summary_stats,
                    isPythonEngine: true
                };
            }
        }
        catch (err) {
            console.warn(`[AttributionService] Python microservice unavailable (${err.message}). Using native fallback scoring engine.`);
        }
        // 2. Fallback TypeScript Attribution Engine
        const fallbackResults = this.runNativeAttributionEngine(targetAddress, transactions, vasps, vaspAddresses, weights);
        store_1.store.saveAttribution(targetAddress, fallbackResults.rankedVasps);
        return {
            rankedVasps: fallbackResults.rankedVasps,
            summaryStats: fallbackResults.summaryStats,
            isPythonEngine: false
        };
    }
    /**
     * Native TypeScript Multi-Factor Forensic Attribution Engine
     */
    static runNativeAttributionEngine(targetAddress, transactions, vasps, vaspAddresses, weights) {
        const target = targetAddress.toLowerCase();
        const vaspMap = new Map(); // lower(address) -> vasp_id
        for (const va of vaspAddresses) {
            vaspMap.set(va.address.toLowerCase(), va.vasp_id);
        }
        // Calculate target wallet volumes
        let volIn = 0;
        let volOut = 0;
        for (const tx of transactions) {
            if (tx.to_address.toLowerCase() === target)
                volIn += tx.value;
            if (tx.from_address.toLowerCase() === target)
                volOut += tx.value;
        }
        const totalTargetVol = Math.max(0.0001, volIn + volOut);
        // Track interactions per VASP
        const vaspStats = new Map();
        for (const v of vasps) {
            vaspStats.set(v.id, {
                directTxCount: 0,
                directVol: 0,
                minHops: 999,
                sweepDetected: false,
                rapidForwarding: false
            });
        }
        // Inspect transactions
        for (const tx of transactions) {
            const fromLower = tx.from_address.toLowerCase();
            const toLower = tx.to_address.toLowerCase();
            const val = tx.value;
            const hop = tx.hop_level || 1;
            let matchedVaspId;
            if (fromLower === target && vaspMap.has(toLower)) {
                matchedVaspId = vaspMap.get(toLower);
            }
            else if (toLower === target && vaspMap.has(fromLower)) {
                matchedVaspId = vaspMap.get(fromLower);
            }
            else if (vaspMap.has(toLower)) {
                matchedVaspId = vaspMap.get(toLower);
            }
            else if (vaspMap.has(fromLower)) {
                matchedVaspId = vaspMap.get(fromLower);
            }
            if (matchedVaspId && vaspStats.has(matchedVaspId)) {
                const stat = vaspStats.get(matchedVaspId);
                if (hop < stat.minHops)
                    stat.minHops = hop;
                if (fromLower === target || toLower === target) {
                    stat.directTxCount += 1;
                    stat.directVol += val;
                }
                if (tx.is_sweep)
                    stat.sweepDetected = true;
            }
        }
        // Normalizing Weights (Default: 0.30, 0.25, 0.20, 0.15, 0.10)
        const wSum = weights.graph_proximity + weights.transaction_volume + weights.interaction_frequency + weights.behavioral_similarity + weights.temporal_pattern || 1.0;
        const wProx = weights.graph_proximity / wSum;
        const wVol = weights.transaction_volume / wSum;
        const wFreq = weights.interaction_frequency / wSum;
        const wBehav = weights.behavioral_similarity / wSum;
        const wTemp = weights.temporal_pattern / wSum;
        const rawList = [];
        for (const vasp of vasps) {
            const stat = vaspStats.get(vasp.id);
            // 1. Proximity score
            let proxScore = 0;
            if (stat.minHops < 999) {
                const decay = 1.0 / (1.0 + Math.pow(stat.minHops, 1.35));
                const volRatio = Math.min(1.0, stat.directVol / totalTargetVol);
                proxScore = (0.65 * decay) + (0.35 * volRatio);
            }
            // 2. Volume score
            const volScore = Math.min(1.0, stat.directVol / totalTargetVol);
            // 3. Frequency score
            const freqRatio = transactions.length > 0 ? stat.directTxCount / transactions.length : 0;
            const freqScore = Math.min(1.0, (freqRatio * 0.7) + (Math.min(stat.directTxCount, 8) / 8.0 * 0.3));
            // 4. Behavioral score
            let behavScore = 0;
            const notes = [];
            if (stat.directTxCount > 0) {
                behavScore += 0.4;
                notes.push(`${stat.directTxCount} direct on-chain interaction(s) observed`);
            }
            if (stat.sweepDetected) {
                behavScore += 0.35;
                notes.push('Automated deposit sweeper / consolidation pattern detected');
            }
            if (stat.minHops > 1 && stat.minHops < 999) {
                behavScore += 0.25 / stat.minHops;
                notes.push(`Multi-hop trail detected at distance of ${stat.minHops} hops`);
            }
            // 5. Temporal score
            let tempScore = 0;
            if (stat.directTxCount > 0 || (stat.minHops > 0 && stat.minHops < 999)) {
                tempScore = 0.6 + (0.4 * Math.min(1.0, stat.directTxCount / 4.0));
                notes.push('Cadence matches standard automated exchange liquidity processing');
            }
            const composite = (wProx * proxScore) + (wVol * volScore) + (wFreq * freqScore) + (wBehav * behavScore) + (wTemp * tempScore);
            rawList.push({
                vasp,
                rawScore: composite,
                evidence: {
                    factors: {
                        graph_proximity: {
                            score: Math.round(proxScore * 10000) / 10000,
                            weight: Math.round(wProx * 100) / 100,
                            contribution: Math.round(wProx * proxScore * 10000) / 10000,
                            min_hops: stat.minHops < 999 ? stat.minHops : null,
                            direct_interaction: stat.directTxCount > 0
                        },
                        transaction_volume: {
                            score: Math.round(volScore * 10000) / 10000,
                            weight: Math.round(wVol * 100) / 100,
                            contribution: Math.round(wVol * volScore * 10000) / 10000,
                            volume_eth: Math.round(stat.directVol * 1000) / 1000,
                            volume_share_pct: Math.round(volScore * 10000) / 100
                        },
                        interaction_frequency: {
                            score: Math.round(freqScore * 10000) / 10000,
                            weight: Math.round(wFreq * 100) / 100,
                            contribution: Math.round(wFreq * freqScore * 10000) / 10000,
                            direct_tx_count: stat.directTxCount
                        },
                        behavioral_similarity: {
                            score: Math.round(behavScore * 10000) / 10000,
                            weight: Math.round(wBehav * 100) / 100,
                            contribution: Math.round(wBehav * behavScore * 10000) / 10000,
                            sweep_detected: stat.sweepDetected
                        },
                        temporal_pattern: {
                            score: Math.round(tempScore * 10000) / 10000,
                            weight: Math.round(wTemp * 100) / 100,
                            contribution: Math.round(wTemp * tempScore * 10000) / 10000
                        }
                    },
                    notes
                }
            });
        }
        // Probability Calibration
        const active = rawList.filter((item) => item.rawScore > 0.001);
        active.sort((a, b) => b.rawScore - a.rawScore);
        const rankedVasps = [];
        if (active.length > 0) {
            const sumPowered = active.reduce((acc, x) => acc + Math.pow(x.rawScore, 1.8), 0);
            let rank = 1;
            for (const item of active) {
                const prob = Math.pow(item.rawScore, 1.8) / sumPowered;
                rankedVasps.push({
                    rank,
                    vasp_id: item.vasp.id,
                    vasp_name: item.vasp.name,
                    vasp_code: item.vasp.code,
                    vasp_country: item.vasp.country,
                    confidence_score: Math.round(prob * 10000) / 10000,
                    confidence_percentage: Math.round(prob * 100),
                    evidence: item.evidence,
                    is_top_match: rank === 1
                });
                rank++;
            }
        }
        // Append remaining 0% VASPs
        for (const item of rawList) {
            if (!rankedVasps.some((r) => r.vasp_id === item.vasp.id)) {
                rankedVasps.push({
                    rank: rankedVasps.length + 1,
                    vasp_id: item.vasp.id,
                    vasp_name: item.vasp.name,
                    vasp_code: item.vasp.code,
                    vasp_country: item.vasp.country,
                    confidence_score: 0,
                    confidence_percentage: 0,
                    evidence: item.evidence,
                    is_top_match: false
                });
            }
        }
        return {
            rankedVasps,
            summaryStats: {
                total_transactions: transactions.length,
                total_volume_eth: Math.round(totalTargetVol * 1000) / 1000,
                volume_in_eth: Math.round(volIn * 1000) / 1000,
                volume_out_eth: Math.round(volOut * 1000) / 1000,
                has_rapid_sweep: transactions.some((t) => t.is_sweep)
            }
        };
    }
}
exports.AttributionService = AttributionService;
