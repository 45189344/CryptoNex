// Neo4j Initialization Cypher for CRYPTO-NEX
CREATE CONSTRAINT IF NOT EXISTS FOR (w:Wallet) REQUIRE w.address IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (v:VASPAddress) REQUIRE v.address IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (e:VASP) REQUIRE e.id IS UNIQUE;

// Seed Known VASP Hubs
MERGE (bin:VASP {id: 'vasp-binance', name: 'Binance', type: 'CEX', country: 'Global'});
MERGE (cb:VASP {id: 'vasp-coinbase', name: 'Coinbase', type: 'CEX', country: 'United States'});
MERGE (krk:VASP {id: 'vasp-kraken', name: 'Kraken', type: 'CEX', country: 'United States'});
MERGE (okx:VASP {id: 'vasp-okx', name: 'OKX', type: 'CEX', country: 'Seychelles'});
MERGE (uni:VASP {id: 'vasp-uniswap', name: 'Uniswap Protocol', type: 'DEX', country: 'Decentralized'});
MERGE (mix:VASP {id: 'vasp-mixer-highrisk', name: 'Tornado.Cash', type: 'MIXER_HIGH_RISK', country: 'Sanctioned'});
