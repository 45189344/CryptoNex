// CRYPTO-NEX Neo4j Graph Queries & Schema
// SIH 2026: Blockchain Intelligence for Automated VASP Attribution

// 1. Constraints & Indexes
CREATE CONSTRAINT unique_wallet_addr IF NOT EXISTS FOR (w:Wallet) REQUIRE w.address IS UNIQUE;
CREATE CONSTRAINT unique_vasp_id IF NOT EXISTS FOR (v:Vasp) REQUIRE v.id IS UNIQUE;
CREATE INDEX wallet_blockchain_idx IF NOT EXISTS FOR (w:Wallet) ON (w.blockchain);
CREATE INDEX vasp_code_idx IF NOT EXISTS FOR (v:Vasp) ON (v.code);

// 2. Sample VASP Entity Creation
MERGE (v:Vasp {id: 'vasp_binance'})
ON CREATE SET v.name = 'Binance Global', v.code = 'BINANCE', v.country = 'Malta / Global';

MERGE (v:Vasp {id: 'vasp_coinbase'})
ON CREATE SET v.name = 'Coinbase Inc.', v.code = 'COINBASE', v.country = 'United States';

MERGE (v:Vasp {id: 'vasp_kraken'})
ON CREATE SET v.name = 'Kraken', v.code = 'KRAKEN', v.country = 'United States';

// 3. Link VASP Address Cluster to VASP Entity
MATCH (w:Wallet {address: '0x28c6c06298d514db089934071355e5743bf21d60'})
MATCH (v:Vasp {id: 'vasp_binance'})
MERGE (w)-[:CONTROLLED_BY {confidence: 0.999, address_type: 'HOT_WALLET', is_demo_data: false}]->(v);

// 4. Multi-Hop Path Query from Unknown Target Wallet to any VASP Cluster
// Finds all directed paths up to 3 hops away from target wallet to known VASP cluster nodes
MATCH (target:Wallet {address: $targetAddress})
MATCH (vaspWallet:Wallet)-[:CONTROLLED_BY]->(vasp:Vasp)
MATCH path = (target)-[:SENT*1..3]->(vaspWallet)
WITH vasp, path, length(path) as hops,
     reduce(totalVal = 0, r in relationships(path) | totalVal + r.value) as pathValue
RETURN vasp.name AS vasp_name,
       vasp.id AS vasp_id,
       hops,
       pathValue,
       [n in nodes(path) | n.address] AS address_path,
       [r in relationships(path) | {hash: r.tx_hash, value: r.value, token: r.token}] AS transaction_flow
ORDER BY hops ASC, pathValue DESC
LIMIT 50;

// 5. Counterparty Cluster Expansion (Personalized Subgraph)
MATCH (target:Wallet {address: $targetAddress})
OPTIONAL MATCH (target)-[out:SENT]->(n1:Wallet)
OPTIONAL MATCH (n2:Wallet)-[in:SENT]->(target)
OPTIONAL MATCH (n1)-[out2:SENT]->(n3:Wallet)
OPTIONAL MATCH (n3)-[:CONTROLLED_BY]->(v:Vasp)
RETURN target, collect(distinct out), collect(distinct in), collect(distinct n1), collect(distinct n2), collect(distinct n3), collect(distinct v);
