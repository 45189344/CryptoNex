# CRYPTO-NEX: REST API Specification

### Base URL: `http://localhost:5000/api`

---

### 1. Analyze Wallet
- **Endpoint**: `POST /analyze-wallet`
- **Body**:
  ```json
  {
    "address": "0x1111111111111111111111111111111111111111",
    "weights": {
      "graph_proximity": 0.30,
      "transaction_volume": 0.25,
      "interaction_frequency": 0.20,
      "behavioral_similarity": 0.15,
      "temporal_pattern": 0.10
    }
  }
  ```
- **Response**: Returns wallet metadata, transactions, graph nodes/edges, ranked VASP attribution with confidence percentages, and explainability evidence.

---

### 2. Get Wallet Details
- **Endpoint**: `GET /wallet/:address`
- **Response**: Summary metrics (total transactions, volume in/out, first/last seen).

---

### 3. Get Wallet Graph
- **Endpoint**: `GET /wallet/:address/graph`
- **Response**: React Flow / D3 nodes and directed edges with cluster mappings.

---

### 4. Get VASP Attribution
- **Endpoint**: `GET /attribution/:address`
- **Response**: Ranked VASP distribution with 5-factor breakdown and forensic notes.

---

### 5. Get VASP Registry
- **Endpoint**: `GET /vasps`
- **Response**: List of registered VASPs with countries, types, and logos.

---

### 6. Investigations
- **Endpoint**: `GET /investigations` (list all case dossiers)
- **Endpoint**: `POST /investigations` (save investigator notes and tags)

---

### 7. Configure Scoring Weights
- **Endpoint**: `GET /config/weights`
- **Endpoint**: `POST /config/weights`
