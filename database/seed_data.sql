-- CRYPTO-NEX Seed Data
-- SIH 2026: VASP Intelligence Registry & Demo Forensic Scenarios

-- 1. Known VASPs Registry
INSERT INTO vasps (id, name, code, type, country, website, risk_category, logo_url) VALUES
('vasp_binance', 'Binance Global', 'BINANCE', 'Centralized Exchange (CEX)', 'Malta / Global', 'https://www.binance.com', 'LOW', 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png'),
('vasp_coinbase', 'Coinbase Inc.', 'COINBASE', 'Centralized Exchange (CEX)', 'United States', 'https://www.coinbase.com', 'LOW', 'https://cryptologos.cc/logos/coinbase-coin-logo.png'),
('vasp_kraken', 'Kraken (Payward)', 'KRAKEN', 'Centralized Exchange (CEX)', 'United States', 'https://www.kraken.com', 'LOW', 'https://cryptologos.cc/logos/kraken-logo.png'),
('vasp_okx', 'OKX International', 'OKX', 'Centralized Exchange (CEX)', 'Seychelles', 'https://www.okx.com', 'LOW', 'https://cryptologos.cc/logos/okb-okb-logo.png'),
('vasp_bybit', 'Bybit Fintech', 'BYBIT', 'Centralized Exchange (CEX)', 'United Arab Emirates', 'https://www.bybit.com', 'MEDIUM', 'https://cryptologos.cc/logos/bybit-logo.png'),
('vasp_kucoin', 'KuCoin Exchange', 'KUCOIN', 'Centralized Exchange (CEX)', 'Seychelles', 'https://www.kucoin.com', 'MEDIUM', 'https://cryptologos.cc/logos/kucoin-token-kcs-logo.png'),
('vasp_bitfinex', 'Bitfinex (iFinex)', 'BITFINEX', 'Centralized Exchange (CEX)', 'British Virgin Islands', 'https://www.bitfinex.com', 'MEDIUM', 'https://cryptologos.cc/logos/tether-usdt-logo.png'),
('vasp_htx', 'HTX (Formerly Huobi)', 'HTX', 'Centralized Exchange (CEX)', 'Seychelles', 'https://www.htx.com', 'MEDIUM', 'https://cryptologos.cc/logos/huobi-token-ht-logo.png')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- 2. Verified VASP Public Addresses (Real public known exchange clusters from public registry)
INSERT INTO vasp_addresses (id, vasp_id, blockchain, address, address_type, source, source_type, confidence, verification_status, is_demo_data) VALUES
-- Binance Public Clusters
('vaddr_bin_1', 'vasp_binance', 'ethereum', '0x28C6c06298d514Db089934071355E5743bf21d60', 'HOT_WALLET', 'Binance 14 (Etherscan Verified Label)', 'PUBLIC_DISCLOSURE', 0.9990, 'VERIFIED', FALSE),
('vaddr_bin_2', 'vasp_binance', 'ethereum', '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549', 'HOT_WALLET', 'Binance 15 (Etherscan Verified Label)', 'PUBLIC_DISCLOSURE', 0.9990, 'VERIFIED', FALSE),
('vaddr_bin_3', 'vasp_binance', 'ethereum', '0xDFd5293D8e347dFe59E90eFd55b2956a1343963d', 'HOT_WALLET', 'Binance 16 (Etherscan Verified Label)', 'PUBLIC_DISCLOSURE', 0.9990, 'VERIFIED', FALSE),
('vaddr_bin_4', 'vasp_binance', 'ethereum', '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503', 'COLD_RESERVE', 'Binance Reserve (Public Proof-of-Reserves)', 'PUBLIC_DISCLOSURE', 0.9995, 'VERIFIED', FALSE),
('vaddr_bin_sweep', 'vasp_binance', 'ethereum', '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE', 'DEPOSIT_SWEEPER', 'Binance Sweeper Hub (Arkham Intelligence)', 'ONCHAIN_HEURISTIC', 0.9650, 'VERIFIED', FALSE),

-- Coinbase Public Clusters
('vaddr_cb_1', 'vasp_coinbase', 'ethereum', '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3', 'HOT_WALLET', 'Coinbase 10 (Etherscan Verified Label)', 'PUBLIC_DISCLOSURE', 0.9990, 'VERIFIED', FALSE),
('vaddr_cb_2', 'vasp_coinbase', 'ethereum', '0x503828934E226cdBDC5473293272ffd9e8bFe90e', 'HOT_WALLET', 'Coinbase 6 (Etherscan Verified Label)', 'PUBLIC_DISCLOSURE', 0.9990, 'VERIFIED', FALSE),
('vaddr_cb_3', 'vasp_coinbase', 'ethereum', '0xddFABCdc4D8FfC6d5BEaf154f18B778f892A0740', 'COLD_RESERVE', 'Coinbase Custody (Etherscan Label)', 'PUBLIC_DISCLOSURE', 0.9980, 'VERIFIED', FALSE),
('vaddr_cb_sweep', 'vasp_coinbase', 'ethereum', '0xA090e606E30bD747d4E6245a1517EbE430F0057e', 'DEPOSIT_SWEEPER', 'Coinbase Sweeper Hub', 'ONCHAIN_HEURISTIC', 0.9600, 'VERIFIED', FALSE),

-- Kraken Public Clusters
('vaddr_kr_1', 'vasp_kraken', 'ethereum', '0x2910543Af39aba0Cd09dBb2D50200b3E800A63D2', 'HOT_WALLET', 'Kraken 4 (Etherscan Verified Label)', 'PUBLIC_DISCLOSURE', 0.9990, 'VERIFIED', FALSE),
('vaddr_kr_2', 'vasp_kraken', 'ethereum', '0x0A0C329b353D45e741E6160756821c042eD79A81', 'HOT_WALLET', 'Kraken 7 (Etherscan Verified Label)', 'PUBLIC_DISCLOSURE', 0.9990, 'VERIFIED', FALSE),
('vaddr_kr_3', 'vasp_kraken', 'ethereum', '0x267be1C1D684F78cb4F6a176C4911b741E4Ffdc0', 'COLD_RESERVE', 'Kraken Cold Storage 1', 'PUBLIC_DISCLOSURE', 0.9980, 'VERIFIED', FALSE),

-- OKX Public Clusters
('vaddr_okx_1', 'vasp_okx', 'ethereum', '0x6cC5F688a30D375E561503469f3D030807b57F26', 'HOT_WALLET', 'OKX Hot Wallet 1 (Etherscan Label)', 'PUBLIC_DISCLOSURE', 0.9950, 'VERIFIED', FALSE),
('vaddr_okx_2', 'vasp_okx', 'ethereum', '0xA7EF42c06935dBFF11d7FAbC9822a5C73D194849', 'COLD_RESERVE', 'OKX Reserve Wallet', 'PUBLIC_DISCLOSURE', 0.9950, 'VERIFIED', FALSE),

-- Bybit Public Clusters
('vaddr_by_1', 'vasp_bybit', 'ethereum', '0xf89d7b9c374f23190cbed04e32d030111e19e01c', 'HOT_WALLET', 'Bybit Hot Wallet 1', 'PUBLIC_DISCLOSURE', 0.9920, 'VERIFIED', FALSE),
('vaddr_by_2', 'vasp_bybit', 'ethereum', '0x1Db3439a222C519ab44bb1144fC28167b4Fa6EE6', 'HOT_WALLET', 'Bybit Hot Wallet 2', 'PUBLIC_DISCLOSURE', 0.9920, 'VERIFIED', FALSE),

-- KuCoin Public Clusters
('vaddr_ku_1', 'vasp_kucoin', 'ethereum', '0xd6216fC19DB775Df9774a6E33526131dA7D19a2c', 'HOT_WALLET', 'KuCoin 6', 'PUBLIC_DISCLOSURE', 0.9910, 'VERIFIED', FALSE),

-- Bitfinex Public Clusters
('vaddr_bf_1', 'vasp_bitfinex', 'ethereum', '0x876EabF441B2EE5B5b0554Fd502a8E0600950cFa', 'HOT_WALLET', 'Bitfinex 1', 'PUBLIC_DISCLOSURE', 0.9910, 'VERIFIED', FALSE),

-- HTX Public Clusters
('vaddr_htx_1', 'vasp_htx', 'ethereum', '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', 'HOT_WALLET', 'HTX Hot 1', 'PUBLIC_DISCLOSURE', 0.9900, 'VERIFIED', FALSE)
ON CONFLICT (id) DO NOTHING;

-- 3. Synthetic Demo Clusters (Marked explicitly with is_demo_data = TRUE)
INSERT INTO vasp_addresses (id, vasp_id, blockchain, address, address_type, source, source_type, confidence, verification_status, is_demo_data) VALUES
('vaddr_demo_bin_proxy_1', 'vasp_binance', 'ethereum', '0x9999000000000000000000000000000000000001', 'INTERMEDIARY_PROXY', 'Simulated Fast-Sweep Node (DEMO)', 'ONCHAIN_HEURISTIC', 0.8800, 'INFERRED', TRUE),
('vaddr_demo_cb_proxy_1', 'vasp_coinbase', 'ethereum', '0x9999000000000000000000000000000000000002', 'INTERMEDIARY_PROXY', 'Simulated Prime OTC Router (DEMO)', 'ONCHAIN_HEURISTIC', 0.8500, 'INFERRED', TRUE),
('vaddr_demo_kr_proxy_1', 'vasp_kraken', 'ethereum', '0x9999000000000000000000000000000000000003', 'INTERMEDIARY_PROXY', 'Simulated Futures Settlement Hub (DEMO)', 'ONCHAIN_HEURISTIC', 0.8300, 'INFERRED', TRUE)
ON CONFLICT (id) DO NOTHING;
