CRYPTO-NEX

Blockchain Intelligence for Automated VASP Attribution

An explainable blockchain analytics platform for multi-hop wallet investigation, Virtual Asset Service Provider (VASP) attribution, transaction graph analysis, and risk assessment.

""SIH 2026" (https://img.shields.io/badge/Smart%20India%20Hackathon-2026-4338CA)" (https://www.sih.gov.in/)
""React" (https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react&logoColor=black)" (https://react.dev/)
""Node.js" (https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs&logoColor=white)" (https://nodejs.org/)
""Python" (https://img.shields.io/badge/Analytics-Python%203.11-3776AB?logo=python&logoColor=white)" (https://www.python.org/)
""PostgreSQL" (https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)" (https://www.postgresql.org/)
""Neo4j" (https://img.shields.io/badge/Graph%20Database-Neo4j-008CC1?logo=neo4j&logoColor=white)" (https://neo4j.com/)
""License" (https://img.shields.io/badge/License-To%20Be%20Determined-lightgrey)" (#license)

---

Overview

Cryptocurrency transactions are publicly recorded on blockchains, but wallet addresses do not inherently reveal the identity of their owners or their relationships with centralized exchanges and other Virtual Asset Service Providers.

Funds may pass through multiple intermediary wallets before interacting with a known service provider. Manually tracing these transaction paths can be time-consuming, complex, and difficult to reproduce consistently.

CRYPTO-NEX is designed to automate this investigative workflow by combining blockchain transaction analysis, multi-hop graph traversal, known VASP address clusters, behavioral indicators, and explainable probabilistic scoring.

The platform helps investigators explore potential wallet-to-VASP relationships, examine supporting evidence, prioritize suspicious transaction patterns, and generate structured intelligence reports.

Problem Statement

Develop a blockchain intelligence system that can attribute unknown cryptocurrency wallets to the nearest potential Virtual Asset Service Providers using transaction graph analysis, known entity clusters, behavioral signals, and explainable probabilistic inference.

The system focuses on:

- Discovering transaction counterparties across one to three hops.
- Identifying possible connections to known VASP address clusters.
- Quantifying attribution confidence through a configurable scoring model.
- Highlighting behavioral anomalies and transaction flow patterns.
- Presenting traceable evidence for further investigation.

Core Features

1. Multi-Hop Transaction Graph Analysis

- Breadth-first search (BFS) for one-hop, two-hop, and three-hop traversal.
- Counterparty discovery and transaction-path reconstruction.
- Graph-based exploration of wallet relationships.
- Identification of intermediary wallets and potential service-provider connections.
- Interactive graph visualization with zoom, pan, and node inspection.

2. Five-Factor Probabilistic Attribution

CRYPTO-NEX uses a weighted scoring model to estimate the strength of a potential relationship between a target wallet and a known VASP.

Attribution factor| Default weight
Graph proximity| 30%
Transaction volume overlap| 25%
Interaction frequency| 20%
Behavioral and sweeper similarity| 15%
Temporal settlement patterns| 10%
Total| 100%

The initial scoring model is intended to provide an interpretable ranking of candidate entities rather than a definitive determination of wallet ownership.

The configurable weights allow analysts to evaluate how different assumptions affect the resulting rankings.

3. Interactive Graph Workbench

The graph workbench provides an investigative view of transaction relationships.

- Wallet and entity nodes.
- Transaction relationship edges.
- Hop-based graph organization.
- Node selection and forensic details.
- Transaction path exploration.
- Visual identification of intermediary connections.

4. Explainable Analytics

The platform is designed to expose the reasoning behind each attribution result.

- Factor-level score breakdowns.
- Comparative candidate attribution tables.
- Radar charts for scoring dimensions.
- Supporting transaction-path evidence.
- Configurable weights and recalculated rankings.

5. Behavioral Risk Indicators

The analytics engine can identify transaction patterns that warrant further investigation, including:

- High-volume fund movements.
- Rapid transaction velocity.
- Potential peeling-chain structures.
- Repeated wallet interactions.
- Proximity to known mixer-related entities, where supported by reliable data.

These indicators are investigative signals and must not be interpreted as proof of illegal activity.

6. VASP Address Registry

The registry is designed to organize known wallet clusters and their associated entities.

Supported example entities include:

- Binance
- Coinbase
- Kraken
- OKX
- Bybit
- KuCoin
- Uniswap

Entity labels must be backed by reliable sources, with confidence and provenance recorded where available. Centralized exchanges and decentralized protocols should be classified separately rather than treated as equivalent service providers.

7. Investigation Case Management

- Case creation and management.
- Investigator notes and observations.
- Attribution evidence summaries.
- Transaction graph findings.
- Printable, PDF-ready intelligence reports.

8. Configurable Scoring Engine

- Interactive attribution-weight controls.
- Dynamic score recalculation.
- Candidate ranking comparisons.
- Explicit weight normalization.
- Transparent factor-level calculations.

9. Resilient Development and Demo Mode

The application supports a development-oriented fallback architecture intended to make demonstrations easier to run.

- In-memory data fallback.
- Simulated graph data when explicitly enabled.
- Separation between demonstration data and verified public data.
- Local development without requiring every infrastructure component.

Fallback operation does not imply production-grade persistence or production data accuracy.

---

System Architecture

CRYPTO-NEX uses a modular architecture that separates the user interface, API layer, analytics engine, and persistence systems.

                  CRYPTO-NEX PLATFORM
                          |
             +------------+------------+
             |                         |
       React Frontend             User Interface
       TypeScript / Vite          Graph Workbench
             |
             v
       Node.js API Layer
       Express / TypeScript
             |
       +-----+----------------+
       |                      |
       v                      v
 Blockchain Data         Python Analytics
 Ethers.js / Axios       FastAPI / NetworkX
       |                      |
       +----------+-----------+
                  |
          +-------+-------+
          |               |
          v               v
      PostgreSQL         Neo4j
      Case Records       Transaction Graph
      Relational Data    Graph Relationships

The architecture is intended to support independent development and testing of the frontend, backend, and analytics components.

Actual data sources, database integrations, and fallback behavior depend on the application's implementation and configuration.

Technology Stack

Layer| Technologies
Frontend| React 18, Vite, TypeScript, Tailwind CSS
Visualization| Recharts, Lucide Icons, interactive graph components
API backend| Node.js, Express, TypeScript
Blockchain integration| Ethers.js, Axios
Analytics service| Python 3.11, FastAPI, NetworkX
Numerical analysis| NumPy, scikit-learn
Relational database| PostgreSQL
Graph database| Neo4j
API security| Helmet, rate limiting, input validation
Deployment| Docker, Docker Compose, Nginx

Repository Structure

The following is the intended high-level structure. Adjust directory names to match the actual repository.

CRYPTO-NEX/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── App.tsx
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── index.ts
│   └── package.json
│
├── analytics/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── database/
│   ├── migrations/
│   └── ...
│
├── docker-compose.yml
├── package.json
├── .env.example
├── .gitignore
└── README.md

Getting Started

Prerequisites

Install the following tools before starting:

- Node.js and npm.
- Python 3.11 or a compatible supported version.
- PostgreSQL, if relational persistence is enabled.
- Neo4j, if graph database integration is enabled.
- Docker and Docker Compose, if using containerized deployment.

1. Clone the Repository

git clone https://github.com/45189344/CryptoNex.git
cd CryptoNex

2. Install Dependencies

Install the root project dependencies:

npm install

Install the backend dependencies:

cd backend
npm install
cd ..

Install the frontend dependencies:

cd frontend
npm install
cd ..

3. Configure Environment Variables

Create a local environment file using the provided template:

cp .env.example .env

On Windows Command Prompt, you can use:

copy .env.example .env

Configure the database connection strings, blockchain RPC endpoints, API ports, and other settings required by your implementation.

Example configuration keys:

NODE_ENV=development
PORT=5000

DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/cryptonex

NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=CHANGE_ME

BLOCKCHAIN_RPC_URL=

These are illustrative configuration keys, not a guarantee that every key matches the current source code. Check the application's configuration files before using them.

Never commit real credentials, API keys, private keys, or production connection strings.

4. Start the Application

From the repository root:

npm run dev

This command assumes the root "package.json" defines a development script that starts the required services.

If the root script does not start every service, use the individual service scripts documented in the corresponding package files.

Expected local endpoints, if configured accordingly:

Service| URL
Frontend| http://localhost:3000
Backend API| http://localhost:5000/api
API health check| http://localhost:5000/api/health
Python analytics| http://localhost:8000

5. Start the Analytics Service

If the Python analytics service is separate, open another terminal:

cd analytics
pip install -r requirements.txt
python main.py

Confirm the configured host and port in "main.py". For FastAPI applications, Uvicorn can also be used when supported by the project:

uvicorn main:app --reload --host 127.0.0.1 --port 8000

6. Run with Docker

If Docker Compose is configured for all required services:

docker compose up --build -d

Check service status:

docker compose ps

View logs:

docker compose logs -f

Stop the containers:

docker compose down

---

Benchmark and Demonstration Scenarios

CRYPTO-NEX supports scenario-based demonstrations for validating graph traversal, scoring, and reporting workflows.

The following are proposed demonstration presets. Treat the attribution labels and percentages as simulated expected outputs unless independently validated against reliable on-chain evidence.

Scenario| Target wallet| Demonstration objective| Hop depth
Case A| "0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361"| Direct counterparty or sweeper relationship| 1
Case B| "0x4e83362442b8d1bec281594cea3050c8eb01311c"| Intermediary transaction-path analysis| 2
Case C| "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE"| Multi-entity candidate comparison| 1
Case D| "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"| High-value wallet relationship exploration| 1
Case E| "0x1aD91ee08f21bE3dE0BA2ba6918712321444444"| Peeling-chain and mixer-proximity analysis| 2

Important: These scenarios are not independent proof of the stated VASP relationships. The expected labels and confidence percentages should only be presented as verified results after the underlying transaction data, entity labels, and scoring calculations have been validated.

Data Integrity and Attribution Methodology

CRYPTO-NEX distinguishes between observed blockchain facts and analytical interpretations.

Evidence categories

- Verified public data: Information supported by reproducible public blockchain records or documented entity-label sources.
- Demo simulation: Synthetic or predefined data used for demonstrations and interface testing.
- Analytical inference: A model-derived estimate based on graph proximity, transaction activity, behavioral features, or temporal patterns.

Each attribution should ideally retain:

- Target wallet and candidate entity.
- Network and block range.
- Transaction hashes and relevant timestamps.
- Observed transaction paths.
- Source and provenance of entity labels.
- Individual scoring-factor contributions.
- Scoring-model version and configured weights.
- Data retrieval timestamp and limitations.

Scoring interpretation

A weighted attribution score represents the relative strength of evidence under the configured model. It should not automatically be described as a statistically calibrated probability.

For a probability interpretation, the scoring model must be calibrated and evaluated against an appropriate, independently labelled validation dataset. Missing evidence, incomplete blockchain coverage, and uncertain entity labels should also be reflected in the result.

Security Considerations

The project is designed with the following security practices in mind:

- Validate and sanitize API inputs.
- Apply rate limits to exposed endpoints.
- Use secure HTTP headers.
- Store secrets in environment variables or a dedicated secrets manager.
- Restrict database access and use least-privilege credentials.
- Use parameterized database queries.
- Enforce request timeouts and appropriate error handling.
- Separate demo datasets from verified production data.
- Avoid storing unnecessary personal information.
- Record relevant changes to investigation cases and scoring configurations.

These practices must be implemented and tested in the actual deployment before the application can be considered production-ready.

Testing and Validation

Recommended validation areas include:

1. Unit tests for graph traversal and scoring calculations.
2. Integration tests for API routes and database operations.
3. Graph tests covering cycles, duplicate edges, and missing nodes.
4. Weight normalization and boundary-condition tests.
5. Validation of attribution results against labelled test data.
6. API input validation and rate-limiting tests.
7. Tests for demo and verified-data separation.
8. Report-generation and case-persistence tests.
9. Docker deployment and service-health checks.

Example test commands depend on the scripts configured in the project:

npm test

For the Python analytics service:

pytest

Add or adjust test scripts according to the actual project configuration.

Responsible Use and Legal Disclaimer

CRYPTO-NEX is an investigative decision-support tool.

- Probabilistic attribution: Results indicate potential relationships and do not establish definitive wallet ownership or identify a natural person.
- No automatic allegation: Behavioral risk indicators do not prove fraud, money laundering, sanctions evasion, or other illegal activity.
- Data provenance: Entity labels should be traceable to documented sources, with their verification status clearly indicated.
- Privacy: The system is designed to minimize personal data collection. Public blockchain visibility does not eliminate privacy or legal obligations.
- Human review: Investigative decisions should be supported by independent verification, relevant legal procedures, and qualified human review.
- Demonstration integrity: Simulated data and model-generated scores must be explicitly identified and must not be represented as confirmed real-world findings.

This project does not provide legal advice and does not replace formal blockchain forensic procedures.

Project Roadmap

Potential future improvements include:

- [ ] Expand multi-chain transaction data support.
- [ ] Integrate additional documented VASP address sources.
- [ ] Add provenance tracking and entity-label confidence.
- [ ] Improve transaction-path filtering and graph performance.
- [ ] Calibrate attribution scores against labelled datasets.
- [ ] Add reproducible investigation exports and audit history.
- [ ] Expand automated API, analytics, and deployment testing.
- [ ] Improve monitoring, observability, and production deployment security.

Contributing

Contributions that improve graph analysis, scoring transparency, data integrity, security, testing, and documentation are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Commit with a clear message.
5. Open a pull request describing the changes and their impact.

License

A license has not yet been specified. Until a license is added to the repository, permissions to reuse, modify, and redistribute the code should not be assumed.

Acknowledgements

Developed as a blockchain intelligence project aligned with the Smart India Hackathon (SIH) 2026 problem area.

CRYPTO-NEX — Trace transaction relationships. Explain attribution. Support evidence-based investigations.