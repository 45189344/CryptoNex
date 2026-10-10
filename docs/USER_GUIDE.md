# CRYPTO-NEX: User & Forensic Investigator Guide

## 1. Getting Started
1. Open the dashboard at `http://localhost:5173`.
2. Enter an Ethereum address or click on one of the **SIH Preset Test Cases**:
   - **Case 1: Binance Fast Deposit Sweeper** (`0x1111...`) $\to$ ~84% Binance
   - **Case 2: Coinbase Prime Trader Hop** (`0x2222...`) $\to$ ~81% Coinbase
   - **Case 3: Kraken OTC Liquidity Rebalancer** (`0x3333...`) $\to$ ~88% Kraken
   - **Case 4: Multi-Hop Obfuscated Trail** (`0x4444...`) $\to$ ~65% OKX
   - **Case 5: Clean Independent EOA** (`0x5555...`) $\to$ 0% Attribution

## 2. Exploring Forensic Modules
- **Overview**: High-level wallet statistics, balance, and risk indicator cards.
- **Transaction Graph**: Interactive zoom/pan/minimap graph showing the target wallet, intermediary wallets, and VASP clusters.
- **VASP Attribution**: Confidence distribution and 5-factor radar chart.
- **Weight Simulator**: Click "Scoring Weights" in the navbar to test different weight combinations (e.g. increase Proximity to 45%).
- **Export Dossier**: Click "Export Dossier" in the navbar or dossier tab to add investigator notes and print/save a PDF report.
