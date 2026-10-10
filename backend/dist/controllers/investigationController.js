"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.investigationController = exports.InvestigationController = void 0;
const db_1 = require("../database/db");
const blockchain_1 = require("../services/blockchain");
const graphEngine_1 = require("../services/graphEngine");
const attributionEngine_1 = require("../services/attributionEngine");
class InvestigationController {
    /**
     * GET /api/investigations
     */
    async getInvestigations(_req, res) {
        try {
            const rawCases = await db_1.db.getInvestigations();
            const cases = rawCases.map(c => ({
                ...c,
                targetWallet: c.targetWallet || c.walletAddress,
                blockchain: c.blockchain || c.network || 'ethereum',
                network: c.network || c.blockchain || 'ethereum',
                riskLevel: c.riskLevel || 'LOW',
                riskScore: c.riskScore !== undefined ? c.riskScore : 25,
                status: c.status || 'Open'
            }));
            return res.status(200).json({ success: true, cases, count: cases.length });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to fetch investigations', details: err.message });
        }
    }
    /**
     * GET /api/investigations/:id
     */
    async getInvestigation(req, res) {
        try {
            const { id } = req.params;
            const caseItem = await db_1.db.getInvestigation(id);
            if (!caseItem) {
                return res.status(404).json({ error: 'Investigation case not found' });
            }
            const enriched = {
                ...caseItem,
                targetWallet: caseItem.targetWallet || caseItem.walletAddress,
                blockchain: caseItem.blockchain || caseItem.network || 'ethereum',
                network: caseItem.network || caseItem.blockchain || 'ethereum',
                riskLevel: caseItem.riskLevel || 'LOW',
                riskScore: caseItem.riskScore !== undefined ? caseItem.riskScore : 25,
                status: caseItem.status || 'Open'
            };
            return res.status(200).json({ success: true, case: enriched, investigation: enriched });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to fetch investigation', details: err.message });
        }
    }
    /**
     * POST /api/investigations
     */
    async createInvestigation(req, res) {
        try {
            const { targetWallet, target_wallet, walletAddress, wallet_address, caseTitle, title, investigatorNotes, notes, priority = 'MEDIUM', tags = [], network = 'ethereum', blockchain = 'ethereum', hopDepth = 2, primaryVaspCandidate, attributionScore, riskScore, riskLevel, riskIndicators = [], supportingEvidence, status = 'Open' } = req.body;
            const targetAddr = (targetWallet || target_wallet || walletAddress || wallet_address || '').trim().toLowerCase();
            const finalTitle = (caseTitle || title || `Case Ref: ${targetAddr.slice(0, 10)}... (VASP Tracing)`).trim();
            if (!targetAddr) {
                return res.status(400).json({ error: 'targetWallet or walletAddress is required.' });
            }
            const id = `CASE-${new Date().getFullYear()}-NEX-${Math.floor(1000 + Math.random() * 9000)}`;
            const now = new Date().toISOString();
            const initialTimeline = [
                {
                    id: `tl-case-created-${Date.now()}`,
                    eventType: 'WALLET_FLAGGED',
                    title: 'Wallet Flagged for Investigation',
                    description: `Case ${id} opened. Target ${targetAddr} flagged with ${riskLevel || 'EVALUATED'} risk profile.`,
                    timestamp: now,
                    metadata: { caseId: id, status: 'Open' }
                }
            ];
            const newCase = {
                id,
                walletAddress: targetAddr,
                targetWallet: targetAddr,
                blockchain: blockchain || network,
                network: network || blockchain,
                caseTitle: finalTitle,
                investigatorNotes: investigatorNotes || notes || '',
                status: status || 'Open',
                priority,
                tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
                primaryVaspCandidate: primaryVaspCandidate || 'Unassigned',
                attributionScore: attributionScore !== undefined ? Number(attributionScore) : undefined,
                riskScore: riskScore !== undefined ? Number(riskScore) : undefined,
                riskLevel: riskLevel || undefined,
                hopDepth: Number(hopDepth) || 2,
                riskIndicators: Array.isArray(riskIndicators) ? riskIndicators : [],
                supportingEvidence: supportingEvidence || {},
                timeline: initialTimeline,
                createdAt: now,
                updatedAt: now
            };
            await db_1.db.saveInvestigation(newCase);
            // Log in Audit Trail
            await db_1.db.saveAuditLog({
                id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                action: 'Case created',
                caseId: id,
                targetWallet: targetAddr,
                analyst: 'Investigator-Desk',
                timestamp: now,
                status: 'OPEN',
                details: `Opened investigation dossier "${finalTitle}" for subject wallet.`
            });
            await db_1.db.saveAuditLog({
                id: `audit-flag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                action: 'Wallet flagged',
                caseId: id,
                targetWallet: targetAddr,
                analyst: 'Investigator-Desk',
                timestamp: now,
                status: 'RECORDED',
                details: `Wallet flagged for investigation with risk level ${riskLevel || 'EVALUATED'}.`
            });
            return res.status(201).json({
                success: true,
                case: newCase,
                investigation: newCase,
                message: 'Wallet flagged for investigation.'
            });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to create investigation', details: err.message });
        }
    }
    /**
     * PUT /api/investigations/:id
     */
    async updateInvestigation(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const existing = await db_1.db.getInvestigation(id);
            if (!existing) {
                return res.status(404).json({ error: 'Investigation case not found' });
            }
            // Add timeline event if status is changing
            let updatedTimeline = existing.timeline || [];
            if (updates.status && updates.status !== existing.status) {
                updatedTimeline = [
                    ...updatedTimeline,
                    {
                        id: `tl-status-${Date.now()}`,
                        eventType: 'CASE_STATUS_UPDATED',
                        title: `Case Status Updated to ${updates.status}`,
                        description: `Investigator transitioned status from ${existing.status} to ${updates.status}.`,
                        timestamp: new Date().toISOString(),
                        metadata: { oldStatus: existing.status, newStatus: updates.status }
                    }
                ];
                updates.timeline = updatedTimeline;
                // Log in Audit Trail
                await db_1.db.saveAuditLog({
                    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                    action: 'Case status updated',
                    caseId: id,
                    targetWallet: existing.walletAddress,
                    analyst: 'Analyst-Supervisor',
                    timestamp: new Date().toISOString(),
                    status: updates.status.toUpperCase(),
                    details: `Case status changed from ${existing.status} to ${updates.status}.`
                });
            }
            const updated = await db_1.db.updateInvestigation(id, updates);
            return res.status(200).json({ success: true, case: updated, investigation: updated });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to update investigation', details: err.message });
        }
    }
    /**
     * POST /api/investigations/:id/evidence-package
     * Compiles and persists complete structured Evidence Package
     */
    async generateEvidencePackage(req, res) {
        try {
            const { id } = req.params;
            const caseItem = await db_1.db.getInvestigation(id);
            if (!caseItem) {
                return res.status(404).json({ error: 'Investigation case not found' });
            }
            const normalized = caseItem.walletAddress.toLowerCase();
            const { wallet, transactions } = await blockchain_1.blockchainService.getWalletDetails(normalized);
            const graph = await graphEngine_1.graphEngine.buildTransactionGraph(normalized, transactions, caseItem.hopDepth || 2);
            const attribution = await attributionEngine_1.attributionEngine.computeAttribution(normalized, transactions, graph);
            const pkg = {
                packageId: `CRX-EVP-${normalized.slice(2, 8).toUpperCase()}-${Date.now()}`,
                targetWallet: normalized,
                blockchain: caseItem.blockchain || 'ethereum',
                network: caseItem.network || caseItem.blockchain || 'ethereum',
                transactionSummary: wallet.statistics,
                transactionHashes: transactions.map(t => ({
                    txHash: t.txHash,
                    fromAddress: t.fromAddress,
                    toAddress: t.toAddress,
                    value: t.value,
                    token: t.token,
                    timestamp: t.timestamp,
                    blockNumber: t.blockNumber
                })),
                senderReceiverInfo: {
                    totalIncoming: wallet.statistics.incomingTransactions,
                    totalOutgoing: wallet.statistics.outgoingTransactions,
                    uniqueCounterparties: wallet.statistics.uniqueCounterparties
                },
                transactionAmounts: transactions.map(t => t.value),
                timestamps: transactions.map(t => t.timestamp),
                hopDepth: caseItem.hopDepth || 2,
                transactionGraphSummary: {
                    totalNodes: graph.nodes.length,
                    totalEdges: graph.edges.length,
                    intermediaryCount: graph.nodes.filter(n => n.type === 'INTERMEDIARY').length,
                    vaspNodeCount: graph.nodes.filter(n => n.isVASP).length
                },
                vaspAttributionCandidates: attribution.rankings.map(r => ({
                    rank: r.rank,
                    vaspName: r.vasp.name,
                    vaspType: r.vasp.type,
                    score: r.score,
                    confidence: r.confidence,
                    shortestHop: r.evidence.shortestHopDistance,
                    volumeOverlapETH: r.evidence.volumeOverlapETH
                })),
                vaspCandidates: attribution.rankings.map(r => ({
                    rank: r.rank,
                    vaspName: r.vasp.name,
                    vaspType: r.vasp.type,
                    score: r.score,
                    confidence: r.confidence,
                    shortestHop: r.evidence.shortestHopDistance,
                    volumeOverlapETH: r.evidence.volumeOverlapETH
                })),
                attributionScores: {
                    primaryVasp: attribution.mostLikelyVasp.vasp.name,
                    score: attribution.mostLikelyVasp.score,
                    confidence: attribution.mostLikelyVasp.confidence
                },
                fiveFactorEvidenceBreakdown: attribution.mostLikelyVasp.evidence.factors,
                fiveFactorBreakdown: attribution.mostLikelyVasp.evidence.factors,
                riskIndicators: attribution.riskIndicators,
                analystNotes: caseItem.investigatorNotes || 'Forensic telemetry and cluster proximity verified against VASP registry.',
                caseMetadata: {
                    caseId: caseItem.id,
                    generatedAt: new Date().toISOString(),
                    classification: 'OFFICIAL RECORD // LAW ENFORCEMENT & COMPLIANCE (TLP:AMBER)',
                    status: caseItem.status
                }
            };
            // Add timeline event
            const updatedTimeline = [
                ...(caseItem.timeline || []),
                {
                    id: `tl-evp-${Date.now()}`,
                    eventType: 'EVIDENCE_PACKAGE_GENERATED',
                    title: 'Evidence Package Generated',
                    description: `Compiled 14-section forensic evidence dossier (ID: ${pkg.packageId}).`,
                    timestamp: new Date().toISOString(),
                    metadata: { packageId: pkg.packageId }
                }
            ];
            const updatedCase = await db_1.db.updateInvestigation(id, {
                evidencePackage: pkg,
                timeline: updatedTimeline
            });
            // Audit Log
            await db_1.db.saveAuditLog({
                id: `audit-evp-${Date.now()}`,
                action: 'Evidence generated',
                caseId: id,
                targetWallet: normalized,
                analyst: 'Forensic-Specialist',
                timestamp: new Date().toISOString(),
                status: 'SUCCESS',
                details: `Generated complete forensic Evidence Package (${pkg.packageId}).`
            });
            return res.status(200).json({
                success: true,
                evidencePackage: pkg,
                package: pkg,
                case: updatedCase,
                investigation: updatedCase
            });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to generate evidence package', details: err.message });
        }
    }
    /**
     * POST /api/investigations/:id/authority-submission
     * Prepare a non-blocking authority submission draft for regulatory or LE reporting
     */
    async prepareAuthoritySubmission(req, res) {
        try {
            const { id } = req.params;
            const { submissionStatus = 'Draft', analystNotes } = req.body;
            const caseItem = await db_1.db.getInvestigation(id);
            if (!caseItem) {
                return res.status(404).json({ error: 'Investigation case not found' });
            }
            const markPrepared = submissionStatus === 'Prepared';
            const normalized = caseItem.walletAddress.toLowerCase();
            const { wallet, transactions } = await blockchain_1.blockchainService.getWalletDetails(normalized);
            const graph = await graphEngine_1.graphEngine.buildTransactionGraph(normalized, transactions, caseItem.hopDepth || 2);
            const attribution = await attributionEngine_1.attributionEngine.computeAttribution(normalized, transactions, graph);
            const submission = {
                submissionId: `SUB-${new Date().getFullYear()}-${normalized.slice(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`,
                caseId: caseItem.id,
                targetWallet: normalized,
                blockchain: caseItem.blockchain || 'ethereum',
                riskLevel: caseItem.riskLevel || attribution.riskAssessment?.riskLevel || 'MEDIUM',
                riskScore: caseItem.riskScore || attribution.riskAssessment?.riskScore || 50,
                probableVasp: caseItem.primaryVaspCandidate || attribution.mostLikelyVasp.vasp.name,
                attributionScore: caseItem.attributionScore || attribution.mostLikelyVasp.score,
                supportingTransactions: transactions.slice(0, 10).map(t => ({
                    txHash: t.txHash,
                    fromAddress: t.fromAddress,
                    toAddress: t.toAddress,
                    value: t.value,
                    token: t.token,
                    timestamp: t.timestamp
                })),
                graphEvidence: {
                    totalNodes: graph.nodes.length,
                    totalEdges: graph.edges.length,
                    shortestHop: attribution.mostLikelyVasp.evidence.shortestHopDistance,
                    matchedClusterCount: attribution.mostLikelyVasp.evidence.matchedClusters.length
                },
                riskIndicators: attribution.riskIndicators,
                analystNotes: analystNotes || caseItem.investigatorNotes || 'Prepared for review by designated financial intelligence and law enforcement units.',
                submissionStatus: (req.body.submissionStatus === 'Draft') ? 'Draft' : 'Prepared',
                preparedAt: new Date().toISOString(),
                preparedBy: 'Authorized AML/CFT Analyst',
                disclaimer: 'Risk and attribution results are analytical assessments based on available blockchain evidence and should not be interpreted as definitive proof of ownership, fraud, or criminal activity. CRYPTO-NEX does not possess authority to unilaterally seize, freeze, or block blockchain wallets.',
                nonBlockingDisclaimer: 'CRYPTO-NEX DOES NOT freeze or block blockchain assets directly. This submission dossier is for formal legal and law-enforcement investigation workflows only.'
            };
            const updatedTimeline = [
                ...(caseItem.timeline || []),
                {
                    id: `tl-sub-${Date.now()}`,
                    eventType: 'SUBMISSION_PREPARED',
                    title: markPrepared ? 'Authority Submission Prepared' : 'Authority Submission Drafted',
                    description: `Submission dossier ${submission.submissionId} compiled (Status: ${submission.submissionStatus}).`,
                    timestamp: new Date().toISOString(),
                    metadata: { submissionId: submission.submissionId, status: submission.submissionStatus }
                }
            ];
            const updatedCase = await db_1.db.updateInvestigation(id, {
                authoritySubmission: submission,
                timeline: updatedTimeline,
                status: markPrepared ? 'Escalated' : caseItem.status
            });
            // Audit Log
            await db_1.db.saveAuditLog({
                id: `audit-sub-${Date.now()}`,
                action: 'Submission prepared',
                caseId: id,
                targetWallet: normalized,
                analyst: 'Authorized AML/CFT Analyst',
                timestamp: new Date().toISOString(),
                status: submission.submissionStatus.toUpperCase(),
                details: `Authority submission ${submission.submissionId} compiled with status "${submission.submissionStatus}".`
            });
            return res.status(200).json({
                success: true,
                submission,
                authoritySubmission: submission,
                case: updatedCase,
                investigation: updatedCase
            });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to prepare authority submission', details: err.message });
        }
    }
    /**
     * GET /api/audit-trail
     */
    async getAuditTrail(_req, res) {
        try {
            const logs = await db_1.db.getAuditLogs();
            return res.status(200).json({ success: true, auditLogs: logs, logs, count: logs.length });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to fetch audit trail', details: err.message });
        }
    }
    /**
     * POST /api/audit-trail
     */
    async logAuditAction(req, res) {
        try {
            const { action, caseId, targetWallet, analyst, status, details } = req.body;
            if (!action) {
                return res.status(400).json({ error: 'action is required' });
            }
            const newLog = {
                id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                action,
                caseId,
                targetWallet,
                analyst: analyst || 'Analyst-Session',
                timestamp: new Date().toISOString(),
                status: status || 'RECORDED',
                details: details || ''
            };
            const saved = await db_1.db.saveAuditLog(newLog);
            return res.status(201).json({ success: true, log: saved });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to record audit log', details: err.message });
        }
    }
    /**
     * GET /api/reports/:address
     * Generate comprehensive printable/exportable investigation intelligence dossier
     */
    async generateReport(req, res) {
        try {
            const { address } = req.params;
            const normalized = address.toLowerCase();
            // Ensure data is up to date
            const { wallet, transactions } = await blockchain_1.blockchainService.getWalletDetails(normalized);
            const graph = await graphEngine_1.graphEngine.buildTransactionGraph(normalized, transactions, 2);
            const attribution = await attributionEngine_1.attributionEngine.computeAttribution(normalized, transactions, graph);
            const report = {
                reportId: `CRX-REP-${normalized.slice(2, 8).toUpperCase()}-${Date.now()}`,
                generatedAt: new Date().toISOString(),
                classification: 'LAW ENFORCEMENT & COMPLIANCE INTELLIGENCE / TLP:AMBER',
                targetWallet: {
                    address: normalized,
                    blockchain: 'Ethereum EVM',
                    statistics: wallet.statistics,
                    firstActivity: wallet.firstActivity,
                    lastActivity: wallet.lastActivity,
                },
                attributionSummary: {
                    mostLikelyVasp: attribution.mostLikelyVasp.vasp.name,
                    attributionScore: attribution.mostLikelyVasp.score,
                    confidenceLevel: attribution.mostLikelyVasp.confidence,
                    rankings: attribution.rankings.map(r => ({
                        rank: r.rank,
                        vaspName: r.vasp.name,
                        vaspType: r.vasp.type,
                        country: r.vasp.country,
                        score: `${r.score}%`,
                        confidence: r.confidence,
                        shortestHopDistance: r.evidence.shortestHopDistance,
                        volumeOverlapETH: r.evidence.volumeOverlapETH,
                        volumeOverlapPercent: `${r.evidence.volumeOverlapPercent}%`,
                        directInteractions: r.evidence.directInteractionsCount,
                        totalInteractions: r.evidence.totalInteractionsCount,
                        isDemoData: r.isDemoAttribution
                    }))
                },
                evidenceDossier: attribution.mostLikelyVasp.evidence,
                riskIndicators: attribution.riskIndicators,
                graphSummary: {
                    totalNodes: graph.nodes.length,
                    totalEdges: graph.edges.length,
                    hopDistribution: {
                        hop0_target: 1,
                        hop1_direct: graph.nodes.filter(n => n.hop === 1).length,
                        hop2_multi: graph.nodes.filter(n => n.hop === 2).length,
                        hop3_extended: graph.nodes.filter(n => n.hop === 3).length
                    },
                    vaspNodesMatched: graph.nodes.filter(n => n.isVASP).map(n => ({
                        label: n.label,
                        vaspName: n.vaspName,
                        hop: n.hop,
                        volume: n.totalVolume
                    }))
                },
                methodology: {
                    model: 'CRYPTO-NEX Multi-Factor Graph Proximity & Behavioral Ingestion Signature v1.0',
                    weightsApplied: attribution.scoringWeights,
                    factors: [
                        'Graph Proximity (Decay model across 1-3 shortest topological hops)',
                        'Transaction Volume Overlap (Cumulative native & token flow routed to cluster)',
                        'Interaction Frequency (Log-normalized transaction cardinality)',
                        'Behavioral Similarity (Deposit sweep and batch timing profiling)',
                        'Temporal Pattern (Burst activity alignment with exchange maintenance schedules)'
                    ]
                },
                limitationsAndDisclaimer: [
                    'PROBABILISTIC ATTRIBUTION: This report represents probabilistic attribution based on heuristic blockchain analysis, not mathematical or physical proof of wallet ownership.',
                    'NO INDIVIDUAL IDENTIFICATION: The system does not identify natural persons or store personally identifiable information (PII).',
                    'DATA INTEGRITY: Data is partitioned into Verified Public Clusters and Inferred/Demo Simulations as indicated.',
                    'INDICATORS ONLY: Risk indicators denote behavioral anomalies and do not constitute proof of illicit conduct.'
                ]
            };
            return res.status(200).json({ success: true, report });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to generate report', details: err.message });
        }
    }
    /**
     * GET /api/settings/weights
     */
    async getScoringWeights(_req, res) {
        const weights = db_1.db.getScoringWeights();
        return res.status(200).json({ success: true, weights });
    }
    /**
     * POST /api/settings/weights
     */
    async updateScoringWeights(req, res) {
        try {
            const { graphProximity, transactionVolume, interactionFrequency, behavioralSimilarity, temporalPattern } = req.body;
            const sum = (Number(graphProximity) || 0) + (Number(transactionVolume) || 0) + (Number(interactionFrequency) || 0) + (Number(behavioralSimilarity) || 0) + (Number(temporalPattern) || 0);
            if (Math.abs(sum - 1.0) > 0.05 && Math.abs(sum - 100) > 5) {
                return res.status(400).json({ error: 'Weights must sum to approximately 1.0 (or 100%).' });
            }
            const normalizedWeights = {
                graphProximity: sum > 5 ? graphProximity / 100 : Number(graphProximity),
                transactionVolume: sum > 5 ? transactionVolume / 100 : Number(transactionVolume),
                interactionFrequency: sum > 5 ? interactionFrequency / 100 : Number(interactionFrequency),
                behavioralSimilarity: sum > 5 ? behavioralSimilarity / 100 : Number(behavioralSimilarity),
                temporalPattern: sum > 5 ? temporalPattern / 100 : Number(temporalPattern)
            };
            const updated = db_1.db.setScoringWeights(normalizedWeights);
            return res.status(200).json({ success: true, weights: updated });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to update weights', details: err.message });
        }
    }
}
exports.InvestigationController = InvestigationController;
exports.investigationController = new InvestigationController();
