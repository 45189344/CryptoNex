-- CRYPTO-NEX Database Schema
-- SIH 2026: Blockchain Intelligence for Automated VASP Attribution

CREATE TABLE IF NOT EXISTS vasps (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    type VARCHAR(64) NOT NULL DEFAULT 'Centralized Exchange (CEX)',
    country VARCHAR(64) NOT NULL,
    website VARCHAR(255),
    risk_category VARCHAR(32) DEFAULT 'LOW',
    logo_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vasp_addresses (
    id VARCHAR(64) PRIMARY KEY,
    vasp_id VARCHAR(64) NOT NULL REFERENCES vasps(id) ON DELETE CASCADE,
    blockchain VARCHAR(32) NOT NULL DEFAULT 'ethereum',
    address VARCHAR(64) NOT NULL,
    address_type VARCHAR(64) NOT NULL, -- 'HOT_WALLET', 'COLD_RESERVE', 'DEPOSIT_SWEEPER', 'INTERMEDIARY_PROXY', 'OTC_DESK'
    source VARCHAR(128) NOT NULL, -- e.g. 'Etherscan Verified Label', 'Arkham Intelligence', 'Public Disclosure'
    source_type VARCHAR(64) NOT NULL, -- 'PUBLIC_DISCLOSURE', 'ONCHAIN_HEURISTIC', 'LEGAL_REGISTRY'
    confidence DECIMAL(5, 4) NOT NULL DEFAULT 0.9500,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'VERIFIED', -- 'VERIFIED', 'INFERRED', 'COMMUNITY'
    last_verified_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_demo_data BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_vasp_addr_chain UNIQUE (blockchain, address)
);

CREATE TABLE IF NOT EXISTS wallets (
    id VARCHAR(64) PRIMARY KEY,
    address VARCHAR(64) NOT NULL UNIQUE,
    blockchain VARCHAR(32) NOT NULL DEFAULT 'ethereum',
    balance_eth DECIMAL(24, 8) DEFAULT 0,
    tx_count INTEGER DEFAULT 0,
    total_volume_in DECIMAL(24, 8) DEFAULT 0,
    total_volume_out DECIMAL(24, 8) DEFAULT 0,
    first_activity TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE,
    last_analyzed_at TIMESTAMP WITH TIME ZONE,
    is_contract BOOLEAN DEFAULT FALSE,
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    tx_hash VARCHAR(128) NOT NULL,
    from_address VARCHAR(64) NOT NULL,
    to_address VARCHAR(64) NOT NULL,
    blockchain VARCHAR(32) NOT NULL DEFAULT 'ethereum',
    value DECIMAL(24, 8) NOT NULL DEFAULT 0,
    token_symbol VARCHAR(16) NOT NULL DEFAULT 'ETH',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    block_number BIGINT,
    gas_price_gwei DECIMAL(12, 4),
    is_sweep BOOLEAN DEFAULT FALSE,
    hop_level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attribution_results (
    id VARCHAR(64) PRIMARY KEY,
    wallet_address VARCHAR(64) NOT NULL,
    vasp_id VARCHAR(64) NOT NULL REFERENCES vasps(id) ON DELETE CASCADE,
    score DECIMAL(5, 4) NOT NULL,
    rank INTEGER NOT NULL,
    evidence_json JSONB NOT NULL,
    model_version VARCHAR(32) NOT NULL DEFAULT 'v1.4.0-ensemble',
    weights_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS investigations (
    id VARCHAR(64) PRIMARY KEY,
    wallet_address VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    investigator_notes TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(32) DEFAULT 'ACTIVE', -- 'ACTIVE', 'FLAGGED', 'CLOSED', 'ARCHIVED'
    report_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-speed blockchain forensics queries
CREATE INDEX IF NOT EXISTS idx_vasp_addresses_addr ON vasp_addresses (LOWER(address));
CREATE INDEX IF NOT EXISTS idx_vasp_addresses_vasp ON vasp_addresses (vasp_id);
CREATE INDEX IF NOT EXISTS idx_wallets_addr ON wallets (LOWER(address));
CREATE INDEX IF NOT EXISTS idx_transactions_from ON transactions (LOWER(from_address));
CREATE INDEX IF NOT EXISTS idx_transactions_to ON transactions (LOWER(to_address));
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions (tx_hash);
CREATE INDEX IF NOT EXISTS idx_attribution_wallet ON attribution_results (LOWER(wallet_address));
CREATE INDEX IF NOT EXISTS idx_investigations_wallet ON investigations (LOWER(wallet_address));
