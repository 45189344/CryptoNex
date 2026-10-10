"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
const env_1 = require("../config/env");
/**
 * Resilient Forensic Data Layer
 * Handles known VASP registries, addresses, transaction caches, and investigation records.
 */
class ForensicStore {
    vasps = new Map();
    vaspAddresses = new Map(); // key: lower(address)
    wallets = new Map(); // key: lower(address)
    transactions = new Map(); // key: lower(address) -> list of txs
    attributionCache = new Map();
    investigations = new Map();
    customWeights = { ...env_1.CONFIG.DEFAULT_WEIGHTS };
    constructor() {
        this.seedVaspRegistry();
    }
    seedVaspRegistry() {
        // 1. Known VASPs
        const seedVasps = [
            {
                id: 'vasp_binance',
                name: 'Binance Global',
                code: 'BINANCE',
                type: 'Centralized Exchange (CEX)',
                country: 'Malta / Global',
                website: 'https://www.binance.com',
                risk_category: 'LOW',
                logo_url: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png'
            },
            {
                id: 'vasp_coinbase',
                name: 'Coinbase Inc.',
                code: 'COINBASE',
                type: 'Centralized Exchange (CEX)',
                country: 'United States',
                website: 'https://www.coinbase.com',
                risk_category: 'LOW',
                logo_url: 'https://cryptologos.cc/logos/coinbase-coin-logo.png'
            },
            {
                id: 'vasp_kraken',
                name: 'Kraken (Payward)',
                code: 'KRAKEN',
                type: 'Centralized Exchange (CEX)',
                country: 'United States',
                website: 'https://www.kraken.com',
                risk_category: 'LOW',
                logo_url: 'https://cryptologos.cc/logos/kraken-logo.png'
            },
            {
                id: 'vasp_okx',
                name: 'OKX International',
                code: 'OKX',
                type: 'Centralized Exchange (CEX)',
                country: 'Seychelles',
                website: 'https://www.okx.com',
                risk_category: 'LOW',
                logo_url: 'https://cryptologos.cc/logos/okb-okb-logo.png'
            },
            {
                id: 'vasp_bybit',
                name: 'Bybit Fintech',
                code: 'BYBIT',
                type: 'Centralized Exchange (CEX)',
                country: 'United Arab Emirates',
                website: 'https://www.bybit.com',
                risk_category: 'MEDIUM',
                logo_url: 'https://cryptologos.cc/logos/bybit-logo.png'
            },
            {
                id: 'vasp_kucoin',
                name: 'KuCoin Exchange',
                code: 'KUCOIN',
                type: 'Centralized Exchange (CEX)',
                country: 'Seychelles',
                website: 'https://www.kucoin.com',
                risk_category: 'MEDIUM',
                logo_url: 'https://cryptologos.cc/logos/kucoin-token-kcs-logo.png'
            },
            {
                id: 'vasp_bitfinex',
                name: 'Bitfinex (iFinex)',
                code: 'BITFINEX',
                type: 'Centralized Exchange (CEX)',
                country: 'British Virgin Islands',
                website: 'https://www.bitfinex.com',
                risk_category: 'MEDIUM',
                logo_url: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
            },
            {
                id: 'vasp_htx',
                name: 'HTX (Formerly Huobi)',
                code: 'HTX',
                type: 'Centralized Exchange (CEX)',
                country: 'Seychelles',
                website: 'https://www.htx.com',
                risk_category: 'MEDIUM',
                logo_url: 'https://cryptologos.cc/logos/huobi-token-ht-logo.png'
            }
        ];
        for (const v of seedVasps) {
            this.vasps.set(v.id, v);
        }
        // 2. Verified VASP Public Addresses
        const seedAddresses = [
            // Binance
            {
                id: 'vaddr_bin_1',
                vasp_id: 'vasp_binance',
                blockchain: 'ethereum',
                address: '0x28C6c06298d514Db089934071355E5743bf21d60',
                address_type: 'HOT_WALLET',
                source: 'Binance 14 (Etherscan Verified Label)',
                source_type: 'PUBLIC_DISCLOSURE',
                confidence: 0.999,
                verification_status: 'VERIFIED',
                last_verified_date: '2026-08-15T00:00:00Z',
                is_demo_data: false
            },
            {
                id: 'vaddr_bin_2',
                vasp_id: 'vasp_binance',
                blockchain: 'ethereum',
                address: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
                address_type: 'HOT_WALLET',
                source: 'Binance 15 (Etherscan Verified Label)',
                source_type: 'PUBLIC_DISCLOSURE',
                confidence: 0.999,
                verification_status: 'VERIFIED',
                last_verified_date: '2026-08-15T00:00:00Z',
                is_demo_data: false
            },
            {
                id: 'vaddr_bin_3',
                vasp_id: 'vasp_binance',
                blockchain: 'ethereum',
                address: '0xDFd5293D8e347dFe59E90eFd55b2956a1343963d',
                address_type: 'HOT_WALLET',
                source: 'Binance 16 (Etherscan Verified Label)',
                source_type: 'PUBLIC_DISCLOSURE',
                confidence: 0.999,
                verification_status: 'VERIFIED',
                last_verified_date: '2026-08-15T00:00:00Z',
                is_demo_data: false
            },
            {
                id: 'vaddr_bin_4',
                vasp_id: 'vasp_binance',
                blockchain: 'ethereum',
                address: '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503',
                address_type: 'COLD_RESERVE',
                source: 'Binance Reserve (Public Proof-of-Reserves)',
                source_type: 'PUBLIC_DISCLOSURE',
                confidence: 0.9995,
                verification_status: 'VERIFIED',
                last_verified_date: '2026-08-10T00:00:00Z',
                is_demo_data: false
            },
            {
                id: 'vaddr_bin_sweep',
                vasp_id: 'vasp_binance',
                blockchain: 'ethereum',
                address: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
                address_type: 'DEPOSIT_SWEEPER',
                source: 'Binance Sweeper Hub (Arkham Intelligence)',
                source_type: 'ONCHAIN_HEURISTIC',
                confidence: 0.965,
                verification_status: 'VERIFIED',
                last_verified_date: '2026-08-10T00:00:00Z',
                is_demo_data: false
            },
            // Coinbase
            {
                id: 'vaddr_cb_1',
                vasp_id: 'vasp_coinbase',
                blockchain: 'ethereum',
                address: '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3',
                address_type: 'HOT_WALLET',
                source: 'Coinbase 10 (Etherscan Verified Label)',
                source_type: 'PUBLIC_DISCLOSURE',
                confidence: 0.999,
                verification_status: 'VERIFIED',
                last_verified_date: '2026-08-15T00:00:00Z',
                is_demo_data: false
            },
            {
                id: 'vaddr_cb_2',
                vasp_id: 'vasp_coinbase',
                blockchain: 'ethereum',
                address: '0x503828934E226cdBDC5473293272ffd9e8bFe90e',
                address_type: 'HOT_WALLET',
                source: 'Coinbase 6 (Etherscan Verified Label)',
                source_type: 'PUBLIC_DISCLOSURE',
                confidence: 0.999,
                verification_status: 'VERIFIED',
                last_verified_date: '2026-08-15T00:00:00Z',
                is_demo_data: false
            },
            {
                id: 'vaddr_cb_3',
                vasp_id: 'vasp_coinbase',
                blockchain: 'ethereum',
                address: '0xddFABCdc4D8FfC6d5BEaf154f18B778f892A0740',
                address_type: 'COLD_RESERVE',
                source: 'Coinbase Custody (Etherscan Label)',
                source_type: 'PUBLIC_DISCLOSURE',
                confidence: 0.998,
                verification_status: 'VERIFIED',
                last_verified_date: '2026-08-10T00:00:00Z',
                is_demo_data: false
            },
            // Kraken
            {
                id: 'vaddr_kr_1',
                vasp_id: 'vasp_kraken',
                blockchain: 'ethereum',
                address: '0x2910543Af39aba0Cd09dBb2D50200b3E800A63D2',
                address_type: 'HOT_WALLET',
                source: 'Kraken 4 (Etherscan Verified Label)',
                source_type: 'PUBLIC_DISCLOSURE',
                confidence: 0.999,
                verification_status: 'VERIFIED',
                last_verified_date: '2026-08-15T00:00:00Z',
                is_demo_data: false
            },
            {
                id: 'vaddr_kr_2',
                vasp_id: 'vasp_kraken',
                blockchain: 'ethereum',
                address: '0x0A0C329b353D45e741E6160756821c042eD79A81',
                address_type: 'HOT_WALLET',
                source: 'Kraken 7 (Etherscan Verified Label)',
                source_type: 'PUBLIC_DISCLOSURE',
                confidence: 0.999,
                verification_status: 'VERIFIED',
                last_verified_date: '2026-08-15T00:00:00Z',
                is_demo_data: false
            },
            {
                id: 'vaddr_kr_3',
                vasp_id: 'vasp_kraken',
                blockchain: 'ethereum',
                address: '0x267be1C1D684F78cb4F6a176C4911b741E4Ffdc0',
                address_type: 'COLD_RESERVE',
                source: 'Kraken Cold Storage 1',
                source_type: 'PUBLIC_DISCLOSURE',
                confidence: 0.998,
                verification_status: 'VERIFIED',
                last_verified_date: '2026-08-10T00:00:00Z',
                is_demo_data: false
            },
            // OKX
            {
                id: 'vaddr_okx_1',
                vasp_id: 'vasp_okx',
                blockchain: 'ethereum',
                address: '0x6cC5F688a30D375E561503469f3D030807b57F26',
                address_type: 'HOT_WALLET',
                source: 'OKX Hot Wallet 1',
                source_type: 'PUBLIC_DISCLOSURE',
                confidence: 0.995,
                verification_status: 'VERIFIED',
                last_verified_date: '2026-08-15T00:00:00Z',
                is_demo_data: false
            },
            // Bybit
            {
                id: 'vaddr_by_1',
                vasp_id: 'vasp_bybit',
                blockchain: 'ethereum',
                address: '0xf89d7b9c374f23190cbed04e32d030111e19e01c',
                address_type: 'HOT_WALLET',
                source: 'Bybit Hot Wallet 1',
                source_type: 'PUBLIC_DISCLOSURE',
                confidence: 0.992,
                verification_status: 'VERIFIED',
                last_verified_date: '2026-08-15T00:00:00Z',
                is_demo_data: false
            },
            // Synthetic Demo Clusters (Marked with is_demo_data = true)
            {
                id: 'vaddr_demo_bin_proxy_1',
                vasp_id: 'vasp_binance',
                blockchain: 'ethereum',
                address: '0x9999000000000000000000000000000000000001',
                address_type: 'INTERMEDIARY_PROXY',
                source: 'Simulated Fast-Sweep Node (DEMO)',
                source_type: 'SYNTHETIC_SIMULATION',
                confidence: 0.880,
                verification_status: 'INFERRED',
                last_verified_date: '2026-08-01T00:00:00Z',
                is_demo_data: true
            },
            {
                id: 'vaddr_demo_cb_proxy_1',
                vasp_id: 'vasp_coinbase',
                blockchain: 'ethereum',
                address: '0x9999000000000000000000000000000000000002',
                address_type: 'INTERMEDIARY_PROXY',
                source: 'Simulated Prime OTC Router (DEMO)',
                source_type: 'SYNTHETIC_SIMULATION',
                confidence: 0.850,
                verification_status: 'INFERRED',
                last_verified_date: '2026-08-01T00:00:00Z',
                is_demo_data: true
            },
            {
                id: 'vaddr_demo_kr_proxy_1',
                vasp_id: 'vasp_kraken',
                blockchain: 'ethereum',
                address: '0x9999000000000000000000000000000000000003',
                address_type: 'INTERMEDIARY_PROXY',
                source: 'Simulated Futures Settlement Hub (DEMO)',
                source_type: 'SYNTHETIC_SIMULATION',
                confidence: 0.830,
                verification_status: 'INFERRED',
                last_verified_date: '2026-08-01T00:00:00Z',
                is_demo_data: true
            }
        ];
        for (const a of seedAddresses) {
            this.vaspAddresses.set(a.address.toLowerCase(), a);
        }
    }
    // --- VASP Methods ---
    getVasps() {
        return Array.from(this.vasps.values());
    }
    getVaspById(id) {
        return this.vasps.get(id);
    }
    getVaspAddresses() {
        return Array.from(this.vaspAddresses.values());
    }
    getVaspByAddress(address) {
        const vAddr = this.vaspAddresses.get(address.toLowerCase());
        if (!vAddr)
            return {};
        const vasp = this.vasps.get(vAddr.vasp_id);
        return { vasp, vaspAddress: vAddr };
    }
    // --- Wallet & Transaction Methods ---
    getWallet(address) {
        return this.wallets.get(address.toLowerCase());
    }
    saveWallet(wallet) {
        this.wallets.set(wallet.address.toLowerCase(), wallet);
    }
    getTransactions(address) {
        return this.transactions.get(address.toLowerCase()) || [];
    }
    saveTransactions(address, txs) {
        this.transactions.set(address.toLowerCase(), txs);
    }
    // --- Attribution Cache ---
    getAttribution(address) {
        return this.attributionCache.get(address.toLowerCase());
    }
    saveAttribution(address, results) {
        this.attributionCache.set(address.toLowerCase(), results);
    }
    // --- Investigation Reports ---
    getInvestigations() {
        return Array.from(this.investigations.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    getInvestigationById(id) {
        return this.investigations.get(id);
    }
    getInvestigationByAddress(address) {
        return Array.from(this.investigations.values()).find((inv) => inv.wallet_address.toLowerCase() === address.toLowerCase());
    }
    saveInvestigation(report) {
        this.investigations.set(report.id, report);
    }
    // --- Configurable Weights ---
    getWeights() {
        return { ...this.customWeights };
    }
    setWeights(weights) {
        this.customWeights = { ...this.customWeights, ...weights };
        return this.getWeights();
    }
}
exports.store = new ForensicStore();
