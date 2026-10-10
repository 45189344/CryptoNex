"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForensicController = void 0;
const blockchain_service_1 = require("../services/blockchain.service");
const graph_service_1 = require("../services/graph.service");
const attribution_service_1 = require("../services/attribution.service");
const vasp_service_1 = require("../services/vasp.service");
const investigation_service_1 = require("../services/investigation.service");
const store_1 = require("../db/store");
class ForensicController {
    /**
     * POST /api/analyze-wallet
     * Main end-to-end endpoint: Validates, fetches, constructs graph, and scores VASP attribution
     */
    static async analyzeWallet(req, res) {
        try {
            const { address, weights } = req.body;
            if (!address || typeof address !== 'string') {
                return res.status(400).json({ error: 'Missing or invalid wallet address' });
            }
            // 1. Validate address
            const validation = blockchain_service_1.BlockchainService.validateAddress(address);
            if (!validation.isValid) {
                return res.status(400).json({ error: validation.error || 'Invalid Ethereum / EVM address' });
            }
            const targetAddress = validation.normalizedAddress;
            // 2. Fetch blockchain transactions
            const { wallet, transactions, isDemo, dataSource, coverage } = await blockchain_service_1.BlockchainService.fetchTransactions(targetAddress);
            store_1.store.saveWallet(wallet);
            store_1.store.saveTransactions(targetAddress, transactions);
            // 3. Build multi-hop graph
            const graphData = graph_service_1.GraphService.buildTransactionGraph(targetAddress, transactions);
            // 4. Calculate multi-factor attribution
            const attributionResult = await attribution_service_1.AttributionService.analyze(targetAddress, transactions, weights);
            // 5. Check or create baseline investigation record
            const investigation = investigation_service_1.InvestigationService.createOrUpdate(targetAddress, `Forensic Scan: ${targetAddress.substring(0, 8)}...`, `Automated scan completed via ${dataSource}. Association confidence calculated using 5-factor scoring.`, ['Automated', isDemo ? 'Benchmark Simulation' : 'Real Blockchain Data', dataSource], wallet, attributionResult.rankedVasps, weights || store_1.store.getWeights(), graphData.metrics);
            return res.json({
                target_address: targetAddress,
                is_demo_data: isDemo,
                data_source: dataSource,
                wallet,
                transactions,
                coverage,
                graph: graphData,
                attribution: {
                    ranked_vasps: attributionResult.rankedVasps,
                    top_match: attributionResult.rankedVasps.find((v) => v.is_top_match) || null,
                    weights_applied: weights || store_1.store.getWeights(),
                    summary_stats: attributionResult.summaryStats,
                    is_python_engine: attributionResult.isPythonEngine
                },
                investigation_id: investigation.id
            });
        }
        catch (err) {
            console.error('[ForensicController.analyzeWallet] Error:', err);
            return res.status(500).json({ error: `Analysis failed: ${err.message}` });
        }
    }
    /**
     * GET /api/wallet/:address
     */
    static async getWallet(req, res) {
        try {
            const { address } = req.params;
            const validation = blockchain_service_1.BlockchainService.validateAddress(address);
            if (!validation.isValid) {
                return res.status(400).json({ error: validation.error });
            }
            let wallet = store_1.store.getWallet(validation.normalizedAddress);
            if (!wallet) {
                const fetched = await blockchain_service_1.BlockchainService.fetchTransactions(validation.normalizedAddress);
                wallet = fetched.wallet;
                store_1.store.saveWallet(wallet);
                store_1.store.saveTransactions(validation.normalizedAddress, fetched.transactions);
            }
            return res.json({ wallet });
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    /**
     * GET /api/wallet/:address/transactions
     */
    static async getWalletTransactions(req, res) {
        try {
            const { address } = req.params;
            const validation = blockchain_service_1.BlockchainService.validateAddress(address);
            if (!validation.isValid) {
                return res.status(400).json({ error: validation.error });
            }
            let txs = store_1.store.getTransactions(validation.normalizedAddress);
            if (txs.length === 0) {
                const fetched = await blockchain_service_1.BlockchainService.fetchTransactions(validation.normalizedAddress);
                txs = fetched.transactions;
                store_1.store.saveWallet(fetched.wallet);
                store_1.store.saveTransactions(validation.normalizedAddress, txs);
            }
            return res.json({
                address: validation.normalizedAddress,
                count: txs.length,
                transactions: txs
            });
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    /**
     * GET /api/wallet/:address/graph
     */
    static async getWalletGraph(req, res) {
        try {
            const { address } = req.params;
            const validation = blockchain_service_1.BlockchainService.validateAddress(address);
            if (!validation.isValid) {
                return res.status(400).json({ error: validation.error });
            }
            let txs = store_1.store.getTransactions(validation.normalizedAddress);
            if (txs.length === 0) {
                const fetched = await blockchain_service_1.BlockchainService.fetchTransactions(validation.normalizedAddress);
                txs = fetched.transactions;
                store_1.store.saveWallet(fetched.wallet);
                store_1.store.saveTransactions(validation.normalizedAddress, txs);
            }
            const graph = graph_service_1.GraphService.buildTransactionGraph(validation.normalizedAddress, txs);
            return res.json({ address: validation.normalizedAddress, graph });
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    /**
     * GET /api/wallet/:address/vasps
     */
    static async getWalletVasps(req, res) {
        try {
            const { address } = req.params;
            const validation = blockchain_service_1.BlockchainService.validateAddress(address);
            if (!validation.isValid) {
                return res.status(400).json({ error: validation.error });
            }
            const attribution = store_1.store.getAttribution(validation.normalizedAddress);
            if (attribution) {
                return res.json({ address: validation.normalizedAddress, ranked_vasps: attribution });
            }
            let txs = store_1.store.getTransactions(validation.normalizedAddress);
            if (txs.length === 0) {
                const fetched = await blockchain_service_1.BlockchainService.fetchTransactions(validation.normalizedAddress);
                txs = fetched.transactions;
                store_1.store.saveWallet(fetched.wallet);
                store_1.store.saveTransactions(validation.normalizedAddress, txs);
            }
            const result = await attribution_service_1.AttributionService.analyze(validation.normalizedAddress, txs);
            return res.json({ address: validation.normalizedAddress, ranked_vasps: result.rankedVasps });
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    /**
     * GET /api/attribution/:address
     */
    static async getAttribution(req, res) {
        try {
            const { address } = req.params;
            const validation = blockchain_service_1.BlockchainService.validateAddress(address);
            if (!validation.isValid) {
                return res.status(400).json({ error: validation.error });
            }
            let txs = store_1.store.getTransactions(validation.normalizedAddress);
            if (txs.length === 0) {
                const fetched = await blockchain_service_1.BlockchainService.fetchTransactions(validation.normalizedAddress);
                txs = fetched.transactions;
                store_1.store.saveWallet(fetched.wallet);
                store_1.store.saveTransactions(validation.normalizedAddress, txs);
            }
            const result = await attribution_service_1.AttributionService.analyze(validation.normalizedAddress, txs);
            return res.json({
                address: validation.normalizedAddress,
                attribution: result.rankedVasps,
                weights_applied: store_1.store.getWeights(),
                summary_stats: result.summaryStats,
                is_python_engine: result.isPythonEngine
            });
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    /**
     * GET /api/vasps
     */
    static getAllVasps(_req, res) {
        const vasps = vasp_service_1.VaspService.getAllVasps();
        return res.json({ vasps });
    }
    /**
     * GET /api/vasp-addresses
     */
    static getAllVaspAddresses(_req, res) {
        const addresses = vasp_service_1.VaspService.getAllVaspAddresses();
        return res.json({ addresses });
    }
    /**
     * GET /api/investigations
     */
    static getInvestigations(_req, res) {
        const investigations = investigation_service_1.InvestigationService.getAll();
        return res.json({ investigations });
    }
    /**
     * GET /api/investigations/:id
     */
    static getInvestigationById(req, res) {
        const { id } = req.params;
        const inv = investigation_service_1.InvestigationService.getById(id);
        if (!inv) {
            return res.status(404).json({ error: 'Investigation record not found' });
        }
        return res.json({ investigation: inv });
    }
    /**
     * POST /api/investigations
     */
    static saveInvestigation(req, res) {
        try {
            const { wallet_address, title, notes, tags, status } = req.body;
            if (!wallet_address) {
                return res.status(400).json({ error: 'wallet_address is required' });
            }
            const wallet = store_1.store.getWallet(wallet_address) || {
                id: `w_${wallet_address.toLowerCase()}`,
                address: wallet_address,
                blockchain: 'ethereum',
                balance_eth: 0,
                tx_count: 0,
                total_volume_in: 0,
                total_volume_out: 0,
                first_activity: new Date().toISOString(),
                last_activity: new Date().toISOString(),
                last_analyzed_at: new Date().toISOString(),
                is_contract: false,
                is_demo_data: true
            };
            const rankedVasps = store_1.store.getAttribution(wallet_address) || [];
            const txs = store_1.store.getTransactions(wallet_address);
            const graph = graph_service_1.GraphService.buildTransactionGraph(wallet_address, txs);
            const inv = investigation_service_1.InvestigationService.createOrUpdate(wallet_address, title || 'Investigation Dossier', notes || '', tags || [], wallet, rankedVasps, store_1.store.getWeights(), graph.metrics);
            if (status)
                inv.status = status;
            store_1.store.saveInvestigation(inv);
            return res.json({ status: 'SUCCESS', investigation: inv });
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    /**
     * GET /api/config/weights
     */
    static getWeights(_req, res) {
        return res.json({ weights: store_1.store.getWeights() });
    }
    /**
     * POST /api/config/weights
     */
    static updateWeights(req, res) {
        const { weights } = req.body;
        if (!weights || typeof weights !== 'object') {
            return res.status(400).json({ error: 'Invalid weights object' });
        }
        const updated = store_1.store.setWeights(weights);
        return res.json({ status: 'SUCCESS', weights: updated });
    }
    /**
     * GET /api/presets
     * Real on-chain cases and benchmark scenarios
     */
    static getPresetScenarios(_req, res) {
        return res.json({
            presets: [
                {
                    id: 'preset_vitalik_real',
                    name: 'Real Case 1: Vitalik Buterin (vitalik.eth)',
                    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
                    description: 'REAL Ethereum Mainnet Wallet. Major historical deposit flows directly into Binance 14 and Coinbase 10.',
                    expected_top_vasp: 'Binance Global (Real On-Chain)',
                    is_real_data: true,
                    tags: ['Real Mainnet', 'vitalik.eth', 'Multi-CEX Flow']
                },
                {
                    id: 'preset_binance_sweep_real',
                    name: 'Real Case 2: Binance Deposit Sweeper Hub',
                    address: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
                    description: 'REAL Verified Binance Sweeper Hub. Reconstructed on-chain batch consolidations into Binance Hot 14.',
                    expected_top_vasp: 'Binance Global (Real Sweeper)',
                    is_real_data: true,
                    tags: ['Real Mainnet', 'Binance Sweeper', 'Hot 14']
                },
                {
                    id: 'preset_coinbase_real',
                    name: 'Real Case 3: Coinbase 10 Prime Hot Hub',
                    address: '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3',
                    description: 'REAL Verified Coinbase Hot Wallet 10. Large institutional liquidity routing.',
                    expected_top_vasp: 'Coinbase Inc. (Real On-Chain)',
                    is_real_data: true,
                    tags: ['Real Mainnet', 'Coinbase 10', 'Institutional']
                },
                {
                    id: 'preset_benchmark_sweep',
                    name: 'Demo Case 4: Benchmark Fast Deposit Sweep',
                    address: '0x1111111111111111111111111111111111111111',
                    description: 'Synthetic benchmark testing 18-minute rapid forward peel chains into Binance sweeper node.',
                    expected_top_vasp: 'Binance Global (~84%)',
                    is_real_data: false,
                    tags: ['Benchmark Simulation', 'Fast Forwarding', 'Peel Chain']
                },
                {
                    id: 'preset_benchmark_mixer',
                    name: 'Demo Case 5: 3-Hop Multi-Layering Trail',
                    address: '0x4444444444444444444444444444444444444444',
                    description: 'Synthetic 3-hop obfuscated trail through intermediary proxies before consolidation at OKX.',
                    expected_top_vasp: 'OKX International (~65%)',
                    is_real_data: false,
                    tags: ['Benchmark Simulation', 'Layering', 'Multi-Hop']
                }
            ]
        });
    }
}
exports.ForensicController = ForensicController;
