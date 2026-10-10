-- =========================================================
-- CRYPTO-NEX: Relational Database Schema (PostgreSQL)
-- Blockchain Intelligence for Automated VASP Attribution
-- =========================================================

CREATE TABLE IF NOT EXISTS vasps (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    type VARCHAR(32) NOT NULL, -- CEX, DEX, CUSTODIAN, PAYMENT_PROCESSOR, BRIDGE, MIXER_HIGH_RISK
    country VARCHAR(64) DEFAULT 'Global',
    website VARCHAR(256),
    risk_rating VARCHAR(32) DEFAULT 'LOW',
    description TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vasp_addresses (
    id VARCHAR(64) PRIMARY KEY,
    vasp_id VARCHAR(64) REFERENCES vasps(id) ON DELETE CASCADE,
    blockchain VARCHAR(32) NOT NULL DEFAULT 'ethereum',
    address VARCHAR(128) NOT NULL,
    address_type VARCHAR(64) NOT NULL, -- DEPOSIT_WALLET, HOT_WALLET, COLD_WALLET, SWEEPER, CONTRACT
    source VARCHAR(128) NOT NULL,
    source_type VARCHAR(64) NOT NULL, -- PUBLIC_REGISTRY, ONCHAIN_LABEL, HEURISTIC, SIMULATION
    confidence NUMERIC(4, 3) DEFAULT 0.950,
    verification_status VARCHAR(64) DEFAULT 'VERIFIED_PUBLIC',
    last_verified_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blockchain, address)
);

CREATE TABLE IF NOT EXISTS wallets (
    id VARCHAR(64) PRIMARY KEY,
    address VARCHAR(128) NOT NULL UNIQUE,
    blockchain VARCHAR(32) NOT NULL DEFAULT 'ethereum',
    total_transactions INT DEFAULT 0,
    total_volume_eth NUMERIC(18, 6) DEFAULT 0,
    unique_counterparties INT DEFAULT 0,
    first_activity TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE,
    last_analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    risk_score INT DEFAULT 0,
    statistics_json JSONB
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    tx_hash VARCHAR(128) NOT NULL,
    from_address VARCHAR(128) NOT NULL,
    to_address VARCHAR(128) NOT NULL,
    blockchain VARCHAR(32) NOT NULL DEFAULT 'ethereum',
    value NUMERIC(24, 8) NOT NULL DEFAULT 0,
    token VARCHAR(32) DEFAULT 'ETH',
    timestamp BIGINT NOT NULL,
    block_number BIGINT DEFAULT 0,
    gas_price_gwei NUMERIC(12, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tx_hash, from_address, to_address)
);

CREATE TABLE IF NOT EXISTS attribution_results (
    id VARCHAR(64) PRIMARY KEY,
    wallet_address VARCHAR(128) NOT NULL,
    vasp_id VARCHAR(64) REFERENCES vasps(id),
    score NUMERIC(5, 2) NOT NULL, -- Percentage e.g. 84.50
    rank INT NOT NULL,
    evidence_json JSONB NOT NULL,
    model_version VARCHAR(32) DEFAULT 'v1.0-5factor',
    scoring_weights_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS investigations (
    id VARCHAR(64) PRIMARY KEY,
    wallet_address VARCHAR(128) NOT NULL,
    case_title VARCHAR(256) NOT NULL,
    investigator_notes TEXT,
    status VARCHAR(32) DEFAULT 'OPEN', -- OPEN, IN_REVIEW, COMPLETED, ARCHIVED
    priority VARCHAR(32) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
    tags TEXT[],
    report_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scoring_weights (
    id VARCHAR(64) PRIMARY KEY,
    graph_proximity NUMERIC(4, 3) DEFAULT 0.300,
    transaction_volume NUMERIC(4, 3) DEFAULT 0.250,
    interaction_frequency NUMERIC(4, 3) DEFAULT 0.200,
    behavioral_similarity NUMERIC(4, 3) DEFAULT 0.150,
    temporal_pattern NUMERIC(4, 3) DEFAULT 0.100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vasp_addresses_address ON vasp_addresses(address);
CREATE INDEX IF NOT EXISTS idx_vasp_addresses_vasp_id ON vasp_addresses(vasp_id);
CREATE INDEX IF NOT EXISTS idx_tx_from_address ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_tx_to_address ON transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_attribution_wallet ON attribution_results(wallet_address);
CREATE INDEX IF NOT EXISTS idx_investigations_wallet ON investigations(wallet_address);
