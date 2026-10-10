# CRYPTO-NEX: Architecture & Technical Design

## 1. System Overview
CRYPTO-NEX is a multi-tier blockchain intelligence platform developed for **Smart India Hackathon 2026**. It solves the problem of attributing unknown cryptocurrency wallet addresses to their most likely associated Virtual Asset Service Providers (VASPs) through automated multi-hop transaction graph reconstruction and probabilistic 5-factor scoring.

```
                    +--------------------------------------------+
                    |           CRYPTO-NEX Web Client            |
                    | (React 18 + Vite + Tailwind + SVG Graph)   |
                    +--------------------------------------------+
                                          │
                                          │ HTTP REST APIs
                                          ▼
                    +--------------------------------------------+
                    |          Node.js Express Backend           |
                    |  * Etherscan / EVM Ingestion Engine        |
                    |  * Multi-Hop BFS Graph Builder             |
                    |  * 5-Factor Attribution Engine             |
                    |  * Case Management & Report Dossiers       |
                    +--------------------------------------------+
                       │                       │               │
       PostgreSQL CRUD │          Cypher Sync  │               │ ML Scoring
                       ▼                       ▼               ▼
           +--------------------+    +-------------------+   +--------------------+
           |  PostgreSQL RDBMS  |    |  Neo4j Graph DB   |   |   Python FastAPI   |
           |  * VASPs & Clusters|    |  * Graph Topology |   |   * NetworkX       |
           |  * Wallets & TXs   |    |  * Hop Paths      |   |   * Scikit-Learn   |
           |  * Case Dossiers   |    |  * Centrality     |   |   * Cosine Sim     |
           +--------------------+    +-------------------+   +--------------------+
```

## 2. Resilient Dual-Mode Execution
CRYPTO-NEX is engineered with enterprise dual-mode architecture:
- **Standalone Local Mode:** Runs out-of-the-box with zero external dependencies using high-performance in-memory relational and graph engines.
- **Enterprise Microservices Mode:** Deploys via Docker Compose with PostgreSQL 15, Neo4j 5.21, Python 3.11 FastAPI, Node.js Backend, and Nginx Frontend.

## 3. Data Flow
1. User provides EVM wallet address.
2. Backend validates address format and fetches transaction history from EVM RPC / Etherscan or high-fidelity deterministic simulation.
3. Graph engine runs multi-hop Breadth-First Search (BFS) up to $N$ hops to discover intermediary relays, counterparty nodes, and VASP cluster endpoints.
4. Attribution engine evaluates the 5-factor scoring matrix against candidate VASP clusters.
5. Probabilistic scores are normalized into percentage rankings (e.g. Binance 84%, Coinbase 10%, Kraken 6%).
6. Frontend renders interactive graph, explainable radar breakdown, and printable intelligence reports.
