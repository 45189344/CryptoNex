"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = void 0;
const ethers_1 = require("ethers");
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
// Public zero-config Ethereum RPC endpoints
const PUBLIC_ETH_RPCS = [
    'https://cloudflare-eth.com',
    'https://eth.llamarpc.com',
    'https://rpc.ankr.com/eth',
    'https://ethereum.publicnode.com'
];
class BlockchainService {
    static rpcProviders = [];
    static getProviders() {
        if (this.rpcProviders.length === 0) {
            this.rpcProviders = PUBLIC_ETH_RPCS.map((url) => new ethers_1.JsonRpcProvider(url));
        }
        return this.rpcProviders;
    }
    /**
     * Helper to log debug info in development mode
     */
    static logDev(message, data) {
        if (env_1.CONFIG.NODE_ENV !== 'production') {
            const ts = new Date().toISOString();
            if (data !== undefined) {
                console.log(`[BlockchainService ${ts}] ${message}`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
            }
            else {
                console.log(`[BlockchainService ${ts}] ${message}`);
            }
        }
    }
    /**
     * Validates if string is a valid Ethereum / EVM address format and normalizes to checksum
     */
    static validateAddress(address) {
        const trimmed = address.trim();
        if (!trimmed) {
            return { isValid: false, normalizedAddress: '', error: 'Address cannot be empty' };
        }
        if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
            return { isValid: false, normalizedAddress: '', error: 'Invalid EVM hex format. Expected 0x followed by 40 hex characters.' };
        }
        try {
            const checksummed = (0, ethers_1.getAddress)(trimmed);
            return { isValid: true, normalizedAddress: checksummed };
        }
        catch {
            return { isValid: false, normalizedAddress: '', error: 'Invalid address checksum' };
        }
    }
    /**
     * Checks if address is designated for benchmark demo simulations
     */
    static isDemoAddress(address) {
        const lower = address.toLowerCase();
        return (lower.startsWith('0x1111111111111111111111111111111111111111') ||
            lower.startsWith('0x2222222222222222222222222222222222222222') ||
            lower.startsWith('0x3333333333333333333333333333333333333333') ||
            lower.startsWith('0x4444444444444444444444444444444444444444') ||
            lower.startsWith('0x5555555555555555555555555555555555555555'));
    }
    /**
     * Fetches transactions and on-chain metadata for a wallet.
     * Priority:
     * 1. If designated synthetic demo address -> Generate reproducible benchmark case (isDemo = true, dataSource = 'BENCHMARK_DEMO')
     * 2. Live Ethereum Address:
     *    a. Fetch true independent live balance & contract status via Ethereum RPC / Blockscout API
     *    b. Fetch live recent on-chain transactions via Blockscout/Etherscan explorer with pagination
     *    c. Construct accurate AnalysisCoverage metadata (tx counts, block span, first/last tx, limited window badge)
     */
    static async fetchTransactions(walletAddress, page = 1, limit = 50) {
        const validation = this.validateAddress(walletAddress);
        const normalized = validation.normalizedAddress || (0, ethers_1.getAddress)(walletAddress);
        const nowIso = new Date().toISOString();
        this.logDev(`Starting analysis for address: ${normalized} (page=${page}, limit=${limit})`);
        // 1. Synthetic Demo Benchmarks (explicit isolation so demo cases are never polluted by mainnet dust)
        if (this.isDemoAddress(normalized)) {
            this.logDev(`Address ${normalized} identified as synthetic benchmark demo scenario`);
            const demoResult = this.generateForensicScenario(normalized);
            return demoResult;
        }
        // 2. Fetch True Live Balance and Contract Code independently
        const { liveBalanceEth, isContract, rpcSource } = await this.fetchLiveBalanceAndState(normalized);
        this.logDev(`Live balance for ${normalized}: ${liveBalanceEth} ETH (isContract=${isContract}, source=${rpcSource})`);
        // 3. Fetch Live On-Chain Transactions via Public Blockscout / Etherscan Explorer
        try {
            const explorerData = await this.fetchFromPublicExplorer(normalized, page, limit, liveBalanceEth, isContract);
            if (explorerData && explorerData.transactions.length > 0) {
                this.logDev(`Fetched ${explorerData.transactions.length} transactions from explorer for ${normalized}`);
                return explorerData;
            }
        }
        catch (err) {
            this.logDev(`Explorer transaction fetch warning for ${normalized}: ${err.message}`);
        }
        // 4. Fallback if explorer returned 0 transactions (e.g. fresh address or API rate limits): return accurate live wallet info
        this.logDev(`Returning live RPC baseline for ${normalized} (0 transactions found)`);
        const fallbackWallet = {
            id: `w_${normalized.toLowerCase()}`,
            address: normalized,
            blockchain: 'ethereum',
            balance_eth: liveBalanceEth,
            live_balance_eth: liveBalanceEth,
            tx_count: 0,
            incoming_tx_count: 0,
            outgoing_tx_count: 0,
            total_volume_in: 0,
            total_volume_out: 0,
            net_volume_eth: 0,
            first_activity: nowIso,
            last_activity: nowIso,
            last_analyzed_at: nowIso,
            is_contract: isContract,
            is_demo_data: false
        };
        const fallbackCoverage = {
            transactions_analyzed: 0,
            incoming_tx_count: 0,
            outgoing_tx_count: 0,
            block_range: { from_block: 0, to_block: 0, span: 0 },
            first_tx_analyzed: null,
            last_tx_analyzed: null,
            data_source: 'LIVE_MAINNET_RPC',
            data_source_detail: `Live Ethereum Mainnet RPC (${rpcSource})`,
            is_window_limited: false,
            window_limit: limit,
            analyzed_at: nowIso
        };
        return {
            wallet: fallbackWallet,
            transactions: [],
            isDemo: false,
            dataSource: 'LIVE_MAINNET_RPC',
            coverage: fallbackCoverage
        };
    }
    /**
     * Fetches real live on-chain ETH balance and contract state from Ethereum JSON-RPC / Blockscout
     */
    static async fetchLiveBalanceAndState(address) {
        const providers = this.getProviders();
        // Try JSON-RPC endpoints
        for (let i = 0; i < providers.length; i++) {
            const provider = providers[i];
            const rpcUrl = PUBLIC_ETH_RPCS[i] || 'Ethereum RPC';
            try {
                const [balanceWei, code] = await Promise.all([
                    provider.getBalance(address),
                    provider.getCode(address)
                ]);
                const liveBalanceEth = parseFloat((0, ethers_1.formatEther)(balanceWei));
                const isContract = code !== '0x' && code !== '0x0' && code.length > 2;
                this.logDev(`[RPC Success] Provider: ${rpcUrl} | Balance: ${liveBalanceEth} ETH | Contract: ${isContract}`);
                return { liveBalanceEth, isContract, rpcSource: rpcUrl };
            }
            catch (err) {
                this.logDev(`[RPC Warning] Provider ${rpcUrl} failed: ${err.message}`);
            }
        }
        // Fallback: Query Blockscout address API
        try {
            this.logDev(`Querying Blockscout v2 address endpoint as RPC fallback for ${address}`);
            const res = await axios_1.default.get(`https://eth.blockscout.com/api/v2/addresses/${address}`, {
                timeout: 5000,
                headers: { 'Accept': 'application/json' }
            });
            if (res.data) {
                const liveBalanceEth = parseFloat(res.data.coin_balance || '0') / 1e18;
                const isContract = !!res.data.is_contract;
                return { liveBalanceEth, isContract, rpcSource: 'Blockscout API (Coin Balance)' };
            }
        }
        catch (e) {
            this.logDev(`Blockscout address fallback failed: ${e.message}`);
        }
        return { liveBalanceEth: 0, isContract: false, rpcSource: 'Unavailable' };
    }
    /**
     * Fetches real live on-chain transactions via public Ethereum block explorers (Etherscan / Blockscout)
     */
    static async fetchFromPublicExplorer(address, page = 1, limit = 50, liveBalanceEth, isContract) {
        let url = '';
        let sourceDetail = '';
        if (env_1.CONFIG.ETHERSCAN_API_KEY) {
            url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${limit}&sort=desc&apikey=${env_1.CONFIG.ETHERSCAN_API_KEY}`;
            sourceDetail = 'Etherscan Pro API (Ethereum Mainnet)';
        }
        else {
            url = `https://eth.blockscout.com/api?module=account&action=txlist&address=${address}&page=${page}&offset=${limit}&sort=desc`;
            sourceDetail = 'Blockscout Ethereum Mainnet (txlist API)';
        }
        this.logDev(`Fetching raw explorer transactions from: ${url}`);
        const response = await axios_1.default.get(url, {
            timeout: 8000,
            headers: { 'Accept': 'application/json' }
        });
        this.logDev(`Explorer HTTP ${response.status} Response:`, {
            status: response.data?.status,
            message: response.data?.message,
            resultCount: Array.isArray(response.data?.result) ? response.data.result.length : typeof response.data?.result
        });
        if (response.data && response.data.status === '1' && Array.isArray(response.data.result) && response.data.result.length > 0) {
            const rawTxs = response.data.result;
            const targetLower = address.toLowerCase();
            let totalIn = 0;
            let totalOut = 0;
            let incomingCount = 0;
            let outgoingCount = 0;
            let minBlock = Number.MAX_SAFE_INTEGER;
            let maxBlock = 0;
            const txs = rawTxs.map((tx, idx) => {
                const valEth = parseFloat(tx.value) / 1e18;
                const fromLower = (tx.from || '').toLowerCase();
                const toLower = (tx.to || '').toLowerCase();
                const isOut = fromLower === targetLower;
                const blockNum = parseInt(tx.blockNumber, 10) || 0;
                if (blockNum > 0) {
                    if (blockNum < minBlock)
                        minBlock = blockNum;
                    if (blockNum > maxBlock)
                        maxBlock = blockNum;
                }
                if (isOut) {
                    totalOut += valEth;
                    outgoingCount++;
                }
                else {
                    totalIn += valEth;
                    incomingCount++;
                }
                return {
                    id: `tx_${tx.hash}_${idx}`,
                    tx_hash: tx.hash,
                    from_address: tx.from,
                    to_address: tx.to || '0x0000000000000000000000000000000000000000',
                    blockchain: 'ethereum',
                    value: Math.round(valEth * 1000000) / 1000000,
                    token_symbol: 'ETH',
                    timestamp: new Date(parseInt(tx.timeStamp, 10) * 1000).toISOString(),
                    block_number: blockNum,
                    gas_price_gwei: parseFloat(tx.gasPrice) / 1e9 || 20.0,
                    is_sweep: false,
                    hop_level: 1
                };
            });
            if (minBlock === Number.MAX_SAFE_INTEGER)
                minBlock = 0;
            // Sort transactions descending by timestamp / block
            txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const newestTx = txs[0];
            const oldestTx = txs[txs.length - 1];
            const nowIso = new Date().toISOString();
            const wallet = {
                id: `w_${targetLower}`,
                address,
                blockchain: 'ethereum',
                balance_eth: liveBalanceEth,
                live_balance_eth: liveBalanceEth,
                tx_count: txs.length,
                incoming_tx_count: incomingCount,
                outgoing_tx_count: outgoingCount,
                total_volume_in: Math.round(totalIn * 10000) / 10000,
                total_volume_out: Math.round(totalOut * 10000) / 10000,
                net_volume_eth: Math.round((totalIn - totalOut) * 10000) / 10000,
                first_activity: oldestTx?.timestamp || nowIso,
                last_activity: newestTx?.timestamp || nowIso,
                last_analyzed_at: nowIso,
                is_contract: isContract,
                is_demo_data: false
            };
            const coverage = {
                transactions_analyzed: txs.length,
                incoming_tx_count: incomingCount,
                outgoing_tx_count: outgoingCount,
                block_range: {
                    from_block: minBlock,
                    to_block: maxBlock,
                    span: Math.max(0, maxBlock - minBlock)
                },
                first_tx_analyzed: oldestTx ? {
                    hash: oldestTx.tx_hash,
                    timestamp: oldestTx.timestamp,
                    block_number: oldestTx.block_number,
                    value_eth: oldestTx.value,
                    direction: oldestTx.from_address.toLowerCase() === targetLower ? 'OUT' : 'IN'
                } : null,
                last_tx_analyzed: newestTx ? {
                    hash: newestTx.tx_hash,
                    timestamp: newestTx.timestamp,
                    block_number: newestTx.block_number,
                    value_eth: newestTx.value,
                    direction: newestTx.from_address.toLowerCase() === targetLower ? 'OUT' : 'IN'
                } : null,
                data_source: 'LIVE_MAINNET_EXPLORER',
                data_source_detail: sourceDetail,
                is_window_limited: txs.length >= limit,
                window_limit: limit,
                analyzed_at: nowIso
            };
            return {
                wallet,
                transactions: txs,
                isDemo: false,
                dataSource: 'LIVE_MAINNET_EXPLORER',
                coverage
            };
        }
        return null;
    }
    /**
     * Generates reproducible benchmark testing scenarios with explicitly declared provenance
     */
    static generateForensicScenario(address) {
        const lower = address.toLowerCase();
        // Known Public VASP cluster targets
        const BINANCE_SWEEPER = '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE';
        const BINANCE_HOT_14 = '0x28C6c06298d514Db089934071355E5743bf21d60';
        const COINBASE_10 = '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3';
        const COINBASE_6 = '0x503828934E226cdBDC5473293272ffd9e8bFe90e';
        const KRAKEN_4 = '0x2910543Af39aba0Cd09dBb2D50200b3E800A63D2';
        const KRAKEN_7 = '0x0A0C329b353D45e741E6160756821c042eD79A81';
        const OKX_HOT_1 = '0x6cC5F688a30D375E561503469f3D030807b57F26';
        // Intermediaries
        const INTERMEDIARY_1 = '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB';
        const INTERMEDIARY_2 = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
        const PEER_A = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
        const PEER_B = '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5';
        let txs = [];
        const now = Date.now();
        // Scenario 1: Case A - Binance Fast Sweep Peel Chain (0x1111...)
        if (lower.startsWith('0x1111')) {
            txs = [
                {
                    id: 'tx_demo_bin_1',
                    tx_hash: '0x3a4b9c1f8e2d7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
                    from_address: PEER_A,
                    to_address: address,
                    blockchain: 'ethereum',
                    value: 15.5,
                    token_symbol: 'ETH',
                    timestamp: new Date(now - 1000 * 3600 * 48).toISOString(),
                    block_number: 19842100,
                    gas_price_gwei: 28.5,
                    is_sweep: false,
                    hop_level: 1
                },
                {
                    id: 'tx_demo_bin_2',
                    tx_hash: '0x9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b',
                    from_address: PEER_B,
                    to_address: address,
                    blockchain: 'ethereum',
                    value: 8.2,
                    token_symbol: 'ETH',
                    timestamp: new Date(now - 1000 * 3600 * 36).toISOString(),
                    block_number: 19842450,
                    gas_price_gwei: 32.1,
                    is_sweep: false,
                    hop_level: 1
                },
                {
                    id: 'tx_demo_bin_3',
                    tx_hash: '0x7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e',
                    from_address: address,
                    to_address: BINANCE_SWEEPER,
                    blockchain: 'ethereum',
                    value: 21.8,
                    token_symbol: 'ETH',
                    timestamp: new Date(now - 1000 * 3600 * 35.7).toISOString(),
                    block_number: 19842460,
                    gas_price_gwei: 35.0,
                    is_sweep: true,
                    hop_level: 1
                },
                {
                    id: 'tx_demo_bin_4',
                    tx_hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
                    from_address: BINANCE_SWEEPER,
                    to_address: BINANCE_HOT_14,
                    blockchain: 'ethereum',
                    value: 450.0,
                    token_symbol: 'ETH',
                    timestamp: new Date(now - 1000 * 3600 * 35.5).toISOString(),
                    block_number: 19842472,
                    gas_price_gwei: 35.0,
                    is_sweep: true,
                    hop_level: 2
                }
            ];
        }
        // Scenario 2: Case B - Coinbase Trader (0x2222...)
        else if (lower.startsWith('0x2222')) {
            txs = [
                {
                    id: 'tx_demo_cb_1',
                    tx_hash: '0xca123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
                    from_address: COINBASE_10,
                    to_address: address,
                    blockchain: 'ethereum',
                    value: 34.0,
                    token_symbol: 'ETH',
                    timestamp: new Date(now - 1000 * 3600 * 72).toISOString(),
                    block_number: 19841000,
                    gas_price_gwei: 25.0,
                    is_sweep: false,
                    hop_level: 1
                },
                {
                    id: 'tx_demo_cb_2',
                    tx_hash: '0xcb23456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
                    from_address: address,
                    to_address: COINBASE_6,
                    blockchain: 'ethereum',
                    value: 28.5,
                    token_symbol: 'ETH',
                    timestamp: new Date(now - 1000 * 3600 * 48).toISOString(),
                    block_number: 19841800,
                    gas_price_gwei: 27.5,
                    is_sweep: false,
                    hop_level: 1
                }
            ];
        }
        // Scenario 3: Case C - Kraken OTC (0x3333...)
        else if (lower.startsWith('0x3333')) {
            txs = [
                {
                    id: 'tx_demo_kr_1',
                    tx_hash: '0xda123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
                    from_address: KRAKEN_4,
                    to_address: address,
                    blockchain: 'ethereum',
                    value: 75.0,
                    token_symbol: 'ETH',
                    timestamp: new Date(now - 1000 * 3600 * 80).toISOString(),
                    block_number: 19840100,
                    gas_price_gwei: 22.0,
                    is_sweep: false,
                    hop_level: 1
                },
                {
                    id: 'tx_demo_kr_2',
                    tx_hash: '0xdb23456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
                    from_address: address,
                    to_address: KRAKEN_7,
                    blockchain: 'ethereum',
                    value: 68.4,
                    token_symbol: 'ETH',
                    timestamp: new Date(now - 1000 * 3600 * 40).toISOString(),
                    block_number: 19841500,
                    gas_price_gwei: 24.5,
                    is_sweep: true,
                    hop_level: 1
                }
            ];
        }
        // Scenario 4: Case D - Multi-hop Mixer -> OKX (0x4444...)
        else if (lower.startsWith('0x4444')) {
            txs = [
                {
                    id: 'tx_demo_mix_1',
                    tx_hash: '0xfa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
                    from_address: address,
                    to_address: INTERMEDIARY_1,
                    blockchain: 'ethereum',
                    value: 12.0,
                    token_symbol: 'ETH',
                    timestamp: new Date(now - 1000 * 3600 * 60).toISOString(),
                    block_number: 19841200,
                    gas_price_gwei: 45.0,
                    is_sweep: false,
                    hop_level: 1
                },
                {
                    id: 'tx_demo_mix_2',
                    tx_hash: '0xfb23456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
                    from_address: INTERMEDIARY_1,
                    to_address: INTERMEDIARY_2,
                    blockchain: 'ethereum',
                    value: 11.95,
                    token_symbol: 'ETH',
                    timestamp: new Date(now - 1000 * 3600 * 45).toISOString(),
                    block_number: 19841700,
                    gas_price_gwei: 42.0,
                    is_sweep: false,
                    hop_level: 2
                },
                {
                    id: 'tx_demo_mix_3',
                    tx_hash: '0xfc3456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
                    from_address: INTERMEDIARY_2,
                    to_address: OKX_HOT_1,
                    blockchain: 'ethereum',
                    value: 11.85,
                    token_symbol: 'ETH',
                    timestamp: new Date(now - 1000 * 3600 * 30).toISOString(),
                    block_number: 19842200,
                    gas_price_gwei: 39.0,
                    is_sweep: true,
                    hop_level: 3
                }
            ];
        }
        // Scenario 5: Case E - Clean EOA (0x5555...)
        else {
            txs = [
                {
                    id: 'tx_demo_clean_1',
                    tx_hash: '0xea123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
                    from_address: PEER_A,
                    to_address: address,
                    blockchain: 'ethereum',
                    value: 1.5,
                    token_symbol: 'ETH',
                    timestamp: new Date(now - 1000 * 3600 * 120).toISOString(),
                    block_number: 19839000,
                    gas_price_gwei: 18.0,
                    is_sweep: false,
                    hop_level: 1
                }
            ];
        }
        let totalIn = 0;
        let totalOut = 0;
        let incomingCount = 0;
        let outgoingCount = 0;
        let minBlock = Number.MAX_SAFE_INTEGER;
        let maxBlock = 0;
        for (const tx of txs) {
            if (tx.block_number > 0) {
                if (tx.block_number < minBlock)
                    minBlock = tx.block_number;
                if (tx.block_number > maxBlock)
                    maxBlock = tx.block_number;
            }
            if (tx.from_address.toLowerCase() === lower) {
                totalOut += tx.value;
                outgoingCount++;
            }
            if (tx.to_address.toLowerCase() === lower) {
                totalIn += tx.value;
                incomingCount++;
            }
        }
        if (minBlock === Number.MAX_SAFE_INTEGER)
            minBlock = 0;
        const simulatedBalance = Math.max(0, totalIn - totalOut);
        const nowIso = new Date().toISOString();
        const wallet = {
            id: `w_${lower}`,
            address,
            blockchain: 'ethereum',
            balance_eth: simulatedBalance,
            live_balance_eth: simulatedBalance,
            tx_count: txs.length,
            incoming_tx_count: incomingCount,
            outgoing_tx_count: outgoingCount,
            total_volume_in: Math.round(totalIn * 10000) / 10000,
            total_volume_out: Math.round(totalOut * 10000) / 10000,
            net_volume_eth: Math.round((totalIn - totalOut) * 10000) / 10000,
            first_activity: txs.length > 0 ? txs[txs.length - 1].timestamp : nowIso,
            last_activity: txs.length > 0 ? txs[0].timestamp : nowIso,
            last_analyzed_at: nowIso,
            is_contract: false,
            is_demo_data: true
        };
        const coverage = {
            transactions_analyzed: txs.length,
            incoming_tx_count: incomingCount,
            outgoing_tx_count: outgoingCount,
            block_range: {
                from_block: minBlock,
                to_block: maxBlock,
                span: Math.max(0, maxBlock - minBlock)
            },
            first_tx_analyzed: txs[txs.length - 1] ? {
                hash: txs[txs.length - 1].tx_hash,
                timestamp: txs[txs.length - 1].timestamp,
                block_number: txs[txs.length - 1].block_number,
                value_eth: txs[txs.length - 1].value,
                direction: txs[txs.length - 1].from_address.toLowerCase() === lower ? 'OUT' : 'IN'
            } : null,
            last_tx_analyzed: txs[0] ? {
                hash: txs[0].tx_hash,
                timestamp: txs[0].timestamp,
                block_number: txs[0].block_number,
                value_eth: txs[0].value,
                direction: txs[0].from_address.toLowerCase() === lower ? 'OUT' : 'IN'
            } : null,
            data_source: 'BENCHMARK_DEMO',
            data_source_detail: 'Synthetic Benchmark Simulation Dataset',
            is_window_limited: false,
            window_limit: txs.length,
            analyzed_at: nowIso
        };
        return {
            wallet,
            transactions: txs,
            isDemo: true,
            dataSource: 'BENCHMARK_DEMO',
            coverage
        };
    }
}
exports.BlockchainService = BlockchainService;
