# CRYPTO-NEX: REST API Specification

Base URL: `http://localhost:5000/api`

## Endpoints

### 1. Wallet Analysis
- **`POST /api/analyze-wallet`**
  - **Body:** `{ "address": "0x...", "network": "ethereum", "maxHops": 2, "customWeights": {...} }`
  - **Returns:** `{ success: true, wallet, transactions, graph, attribution }`

- **`GET /api/wallet/:address`**
  - **Returns:** `{ success: true, wallet }`

- **`GET /api/wallet/:address/transactions`**
  - **Returns:** `{ success: true, transactions: [...], total: N }`

- **`GET /api/wallet/:address/graph?maxHops=2`**
  - **Returns:** `{ success: true, graph: { nodes, edges, targetAddress } }`

- **`GET /api/attribution/:address`**
  - **Returns:** `{ success: true, attribution: { mostLikelyVasp, rankings, evidence, riskIndicators } }`

- **`GET /api/presets`**
  - **Returns:** List of benchmark sample cases for one-click demo.

### 2. VASP Registry
- **`GET /api/vasps`**
  - **Returns:** List of known VASPs (Binance, Coinbase, Kraken, OKX, Bybit, KuCoin, Uniswap, etc.)
- **`GET /api/vasps/:id`**
  - **Returns:** Detailed VASP metadata and mapped address clusters.
- **`GET /api/vasp-addresses?vaspId=...&type=...`**
  - **Returns:** Filterable address cluster records with confidence ratings.

### 3. Case Management & Reports
- **`GET /api/investigations`**
  - **Returns:** All active and historical investigation cases.
- **`POST /api/investigations`**
  - **Body:** `{ "walletAddress": "0x...", "caseTitle": "...", "investigatorNotes": "...", "priority": "HIGH", "tags": [...] }`
- **`GET /api/reports/:address`**
  - **Returns:** Formatted law-enforcement investigation dossier.

### 4. Settings & Scoring Weights
- **`GET /api/settings/weights`**
  - **Returns:** Current active 5-factor scoring weights.
- **`POST /api/settings/weights`**
  - **Body:** `{ "graphProximity": 0.30, "transactionVolume": 0.25, "interactionFrequency": 0.20, "behavioralSimilarity": 0.15, "temporalPattern": 0.10 }`

### 5. System Health
- **`GET /api/health`**
  - **Returns:** Status of PostgreSQL, Neo4j, Python ML engine, and demo mode.
