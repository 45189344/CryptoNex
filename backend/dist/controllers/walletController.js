"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletController = exports.WalletController = void 0;
const blockchain_1 = require("../services/blockchain");
const graphEngine_1 = require("../services/graphEngine");
const attributionEngine_1 = require("../services/attributionEngine");
const db_1 = require("../database/db");
const seeds_1 = require("../database/seeds");
class WalletController {
    /**
     * POST /api/analyze-wallet
     * Main entrypoint for full wallet attribution pipeline
     */
    async analyzeWallet(req, res) {
        try {
            const { address, network = 'ethereum', maxHops = 2, customWeights, caseId } = req.body;
            if (!address || typeof address !== 'string') {
                return res.status(400).json({ error: 'Wallet address is required.' });
            }
            if (!blockchain_1.blockchainService.isValidAddress(address)) {
                return res.status(400).json({ error: 'Invalid EVM cryptocurrency wallet address format.' });
            }
            const normalized = address.toLowerCase();
            const blockchain = network || 'ethereum';
            const hopDepth = Number(maxHops) || 2;
            const matchingPreset = seeds_1.DEMO_PRESET_WALLETS.find(p => p.address.toLowerCase() === normalized);
            const activeCaseId = caseId || matchingPreset?.id || null;
            const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            // 1. Fetch or generate transactions & calculate statistics
            const { wallet, transactions } = await blockchain_1.blockchainService.getWalletDetails(normalized, blockchain);
            await db_1.db.saveWallet(wallet);
            await db_1.db.saveTransactions(normalized, transactions);
            // 2. Build multi-hop transaction graph
            const graph = await graphEngine_1.graphEngine.buildTransactionGraph(normalized, transactions, hopDepth);
            // 3. Calculate 5-factor probabilistic attribution
            const attribution = await attributionEngine_1.attributionEngine.computeAttribution(normalized, transactions, graph, customWeights, blockchain);
            // Attach verification metadata to attribution object
            attribution.analysisId = analysisId;
            attribution.caseId = activeCaseId;
            attribution.network = blockchain;
            attribution.hopDepth = hopDepth;
            attribution.walletAddress = normalized;
            return res.status(200).json({
                success: true,
                analysisId,
                caseId: activeCaseId,
                network: blockchain,
                hopDepth,
                address: normalized,
                wallet,
                transactions,
                graph,
                attribution
            });
        }
        catch (err) {
            console.error('[WalletController] Error analyzing wallet:', err);
            return res.status(500).json({ error: 'Failed to analyze wallet', details: err.message });
        }
    }
    /**
     * GET /api/wallet/:address
     */
    async getWallet(req, res) {
        try {
            const { address } = req.params;
            const normalized = address.toLowerCase();
            let wallet = await db_1.db.getWallet(normalized);
            if (!wallet) {
                const details = await blockchain_1.blockchainService.getWalletDetails(normalized);
                wallet = details.wallet;
                await db_1.db.saveWallet(wallet);
                await db_1.db.saveTransactions(normalized, details.transactions);
            }
            return res.status(200).json({ success: true, wallet });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to get wallet', details: err.message });
        }
    }
    /**
     * GET /api/wallet/:address/transactions
     */
    async getTransactions(req, res) {
        try {
            const { address } = req.params;
            const normalized = address.toLowerCase();
            let txs = await db_1.db.getTransactions(normalized);
            if (txs.length === 0) {
                const details = await blockchain_1.blockchainService.getWalletDetails(normalized);
                txs = details.transactions;
                await db_1.db.saveTransactions(normalized, txs);
            }
            return res.status(200).json({ success: true, transactions: txs, total: txs.length });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to get transactions', details: err.message });
        }
    }
    /**
     * GET /api/wallet/:address/graph
     */
    async getGraph(req, res) {
        try {
            const { address } = req.params;
            const maxHops = parseInt(req.query.maxHops || '2', 10);
            const normalized = address.toLowerCase();
            let txs = await db_1.db.getTransactions(normalized);
            if (txs.length === 0) {
                const details = await blockchain_1.blockchainService.getWalletDetails(normalized);
                txs = details.transactions;
            }
            const graph = await graphEngine_1.graphEngine.buildTransactionGraph(normalized, txs, maxHops);
            return res.status(200).json({ success: true, graph });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to get graph', details: err.message });
        }
    }
    /**
     * GET /api/attribution/:address
     */
    async getAttribution(req, res) {
        try {
            const { address } = req.params;
            const normalized = address.toLowerCase();
            let attr = await db_1.db.getAttribution(normalized);
            if (!attr) {
                const details = await blockchain_1.blockchainService.getWalletDetails(normalized);
                const graph = await graphEngine_1.graphEngine.buildTransactionGraph(normalized, details.transactions, 2);
                attr = await attributionEngine_1.attributionEngine.computeAttribution(normalized, details.transactions, graph);
            }
            return res.status(200).json({ success: true, attribution: attr });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to get attribution', details: err.message });
        }
    }
    /**
     * GET /api/presets
     * Return pre-configured test cases for demo
     */
    async getPresets(_req, res) {
        return res.status(200).json({ success: true, presets: seeds_1.DEMO_PRESET_WALLETS });
    }
}
exports.WalletController = WalletController;
exports.walletController = new WalletController();
