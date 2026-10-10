# 🛡️ CRYPTO-NEX: Blockchain Intelligence for Automated VASP Attribution
> **Smart India Hackathon (SIH 2026) Official Platform**

[![Tech Stack](https://img.shields.io/badge/Stack-React_18_%7C_Node.js_%7C_PostgreSQL_%7C_Neo4j_%7C_Python_FastAPI-06b6d4)](https://github.com)
[![Status](https://img.shields.io/badge/Status-Production_Ready-emerald)](https://github.com)
[![SIH](https://img.shields.io/badge/SIH-2026_Problem_Statement-indigo)](https://github.com)

---

## 🎯 The Problem
An unknown cryptocurrency wallet address does not directly reveal its associated Virtual Asset Service Provider (VASP). Illicit or unhosted funds frequently hop through multiple intermediary wallets before reaching centralized exchange liquidation points, making manual tracking time-consuming and error-prone.

## 💡 The Solution: CRYPTO-NEX
**CRYPTO-NEX** automates on-chain counterparty discovery, reconstructs multi-hop transaction graphs (1 to 3 hops), matches entities against known VASP address clusters, and computes a **probabilistic 5-factor attribution score** with explainable evidence and intelligence dossiers.

---

## 🚀 Key Features

- 🔍 **Automated Multi-Hop Graph Traversal:** 1-Hop, 2-Hop, and 3-Hop BFS counterparty mapping.
- 🎯 **5-Factor Probabilistic Attribution:**
  - `30%` Graph Proximity (Decay model)
  - `25%` Transaction Volume Overlap
  - `20%` Interaction Frequency
  - `15%` Behavioral & Sweeper Similarity
  - `10%` Temporal Settlement Window Pattern
- 📊 **Interactive Graph Workbench:** Visual node-link canvas with radial hop tiers, zoom/pan, and node forensics.
- ⚡ **Explainable AI (XAI) Evidence:** Radar charts, mathematical breakdown matrices, and counterparty match tables.
- ⚠️ **Behavioral Risk Indicators:** Automatic detection of high-volume movement, rapid velocity bursts, peeling chains, and mixer proximity.
- 📋 **Law Enforcement Investigation Dossiers:** Case notes management and printable PDF-ready intelligence reports.
- 🏛️ **VASP Address Registry:** Searchable directory of verified exchange clusters (Binance, Coinbase, Kraken, OKX, Bybit, KuCoin, Uniswap).
- ⚙️ **Configurable Scoring Weights:** Real-time interactive weight sliders with dynamic recalculation.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, Ethers.js, Axios, Helmet, Rate Limiter |
| **Analytics Engine** | Python 3.11, FastAPI, NetworkX, Scikit-Learn, NumPy |
| **Databases** | PostgreSQL (Relational & Case Store), Neo4j (Graph Topology) |
| **Resilience** | Built-in zero-setup in-memory database and graph fallback engine |
| **Deployment** | Docker, Docker Compose, Nginx |

---

## ⚡ Quickstart (Running Locally)

### 1. Install Dependencies
```bash
# Install root orchestrator
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Run the Full Stack
```bash
npm run dev
```
- **Frontend Web UI:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`

### 3. (Optional) Run Python Analytics Microservice
```bash
cd analytics
pip install -r requirements.txt
python main.py
```

### 4. (Optional) Full Docker Compose Launch
```bash
docker-compose up --build -d
```

---

## 🧪 Benchmark Test Presets (One-Click Demo)

| Preset | Target Wallet | Primary Expected Attribution | Hops |
|---|---|---|---|
| **Case A** | `0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361` | **Binance (84.2%)** | 1 Hop (Direct Sweeper) |
| **Case B** | `0x4e83362442b8d1bec281594cea3050c8eb01311c` | **Coinbase (71.8%)** | 2 Hops (Intermediary Layer) |
| **Case C** | `0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE` | **Kraken (58.4%)** | 1 Hop (Arbitrageur) |
| **Case D** | `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` | **Binance / Uniswap (49.5%)** | 1 Hop (High Net Worth) |
| **Case E** | `0x1aD91ee08f21bE3dE0BA2ba6918712321444444` | **Mixer Proximity Alert (62.0%)** | 2 Hops (Peeling Chain) |

---

## ⚖️ Legal & Compliance Statement
- **Probabilistic Attribution:** All outputs represent probabilistic statistical inferences and do **not** constitute definitive proof of wallet ownership or natural person identity.
- **Zero PII:** No personally identifiable information is collected or inferred.
- **Verified vs Demo Separation:** All data is strictly categorized into `VERIFIED_PUBLIC` vs `DEMO_SIMULATION` clusters.
- **Risk Indicators:** Indicators reflect behavioral anomalies for investigative prioritization and do not constitute proof of illicit conduct.
