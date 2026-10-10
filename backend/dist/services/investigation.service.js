"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestigationService = void 0;
const store_1 = require("../db/store");
class InvestigationService {
    static getAll() {
        return store_1.store.getInvestigations();
    }
    static getById(id) {
        return store_1.store.getInvestigationById(id);
    }
    static getByAddress(address) {
        return store_1.store.getInvestigationByAddress(address);
    }
    static createOrUpdate(walletAddress, title, notes, tags, wallet, rankedVasps, weights, graphMetrics) {
        const existing = store_1.store.getInvestigationByAddress(walletAddress);
        const id = existing ? existing.id : `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = new Date().toISOString();
        const topMatch = rankedVasps.find((v) => v.is_top_match);
        const primaryPath = topMatch?.evidence?.paths?.[0]?.path || [walletAddress];
        const reportData = {
            generated_at: now,
            target_wallet: wallet,
            ranked_vasps: rankedVasps,
            weights_applied: weights,
            graph_summary: {
                node_count: graphMetrics.node_count,
                edge_count: graphMetrics.edge_count,
                primary_path: primaryPath
            },
            risk_indicators: {
                high_volume_movement: wallet.total_volume_in + wallet.total_volume_out > 20.0,
                rapid_sweep: rankedVasps.some((v) => v.evidence.factors.behavioral_similarity.sweep_detected),
                peel_chain: graphMetrics.edge_count > 3,
                dormant_reactivation: false
            },
            methodology_note: 'Multi-factor heuristic and graph-theoretic probabilistic attribution based on 5 dimensions: Graph Proximity (Hop Decay), Volume Overlap, Interaction Frequency, Behavioral Sweep Clusters, and Temporal Cadence.',
            legal_disclaimer: 'PROBABILISTIC ATTRIBUTION ONLY. This intelligence dossier provides probabilistic indicators of VASP association and does NOT constitute definitive proof of account ownership or criminal culpability. Never identify individuals without proper legal process.'
        };
        const report = {
            id,
            wallet_address: walletAddress,
            title: title || `Investigation of ${walletAddress.substring(0, 10)}...`,
            investigator_notes: notes || existing?.investigator_notes || 'Preliminary forensics scan completed.',
            tags: tags && tags.length > 0 ? tags : existing?.tags || ['Automated Scan', 'VASP Attribution'],
            status: existing ? existing.status : 'ACTIVE',
            report_data: reportData,
            created_at: existing ? existing.created_at : now,
            updated_at: now
        };
        store_1.store.saveInvestigation(report);
        return report;
    }
}
exports.InvestigationService = InvestigationService;
