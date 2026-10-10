import math
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import networkx as nx
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(
    title="CRYPTO-NEX Analytics Engine",
    description="Python NetworkX & Scikit-Learn Microservice for VASP Attribution",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransactionModel(BaseModel):
    id: str
    txHash: str
    fromAddress: str
    toAddress: str
    value: float
    token: Optional[str] = "ETH"
    timestamp: int
    blockNumber: Optional[int] = 0

class AttributionPayload(BaseModel):
    walletAddress: str
    transactions: List[TransactionModel]
    weights: Optional[Dict[str, float]] = None

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "CRYPTO-NEX Python Analytics Engine",
        "algorithms": ["NetworkX DiGraph", "PageRank Centrality", "Cosine Behavioral Similarity", "Temporal Burst Profiling"]
    }

@app.post("/analytics/score-attribution")
def score_attribution(payload: AttributionPayload):
    wallet_addr = payload.walletAddress.lower()
    txs = payload.transactions
    
    if not txs:
        return {"status": "no_transactions", "metrics": {}}

    # 1. Build NetworkX Directed Graph
    G = nx.DiGraph()
    G.add_node(wallet_addr, label="Target")

    total_flow = 0.0
    for tx in txs:
        u = tx.fromAddress.lower()
        v = tx.toAddress.lower()
        val = max(0.0001, tx.value)
        total_flow += val

        if not G.has_edge(u, v):
            G.add_edge(u, v, weight=val, count=1)
        else:
            G[u][v]['weight'] += val
            G[u][v]['count'] += 1

    # 2. Graph Topo Metrics
    pagerank_scores = {}
    betweenness_scores = {}
    try:
        pagerank_scores = nx.pagerank(G, weight='weight', alpha=0.85)
    except Exception:
        pagerank_scores = {node: 1.0 / max(1, len(G.nodes)) for node in G.nodes}

    try:
        betweenness_scores = nx.betweenness_centrality(G, weight='weight')
    except Exception:
        betweenness_scores = {node: 0.0 for node in G.nodes}

    # 3. Behavioral Feature Vector for Scikit-Learn Cosine Similarity
    # Feature 1: Log average value
    # Feature 2: Transaction velocity per day
    # Feature 3: In/Out ratio
    # Feature 4: High hour activity concentration (0-4 UTC)
    in_count = sum(1 for tx in txs if tx.toAddress.lower() == wallet_addr)
    out_count = max(1, len(txs) - in_count)
    in_out_ratio = in_count / out_count

    timestamps = [tx.timestamp for tx in txs]
    min_t, max_t = min(timestamps), max(timestamps)
    span_days = max(1.0, (max_t - min_t) / (86400 * 1000))
    tx_per_day = len(txs) / span_days

    # Hour distribution
    hours = [datetime.fromtimestamp(t / 1000).hour for t in timestamps]
    settlement_hour_count = sum(1 for h in hours if h <= 4 or h >= 22)
    burst_ratio = settlement_hour_count / max(1, len(hours))

    wallet_vector = np.array([[
        math.log1p(total_flow / max(1, len(txs))),
        min(10.0, tx_per_day),
        min(5.0, in_out_ratio),
        burst_ratio
    ]])

    # Benchmark Exchange Deposit Profile Vector
    benchmark_deposit_vector = np.array([[
        math.log1p(2.5),  # typical deposit size
        2.5,              # steady frequency
        0.3,              # heavy outgoing sweep bias
        0.75              # settlement window alignment
    ]])

    similarity = float(cosine_similarity(wallet_vector, benchmark_deposit_vector)[0][0])
    similarity_score = max(0.0, min(1.0, similarity))

    return {
        "status": "success",
        "wallet": wallet_addr,
        "metrics": {
            "node_count": G.number_of_nodes(),
            "edge_count": G.number_of_edges(),
            "pagerank": round(pagerank_scores.get(wallet_addr, 0.0), 4),
            "betweenness_centrality": round(betweenness_scores.get(wallet_addr, 0.0), 4),
            "behavioral_cosine_similarity": round(similarity_score, 4),
            "transactions_per_day": round(tx_per_day, 2),
            "settlement_burst_ratio": round(burst_ratio, 2)
        }
    }

@app.post("/analytics/graph-metrics")
def graph_metrics(payload: AttributionPayload):
    G = nx.Graph()
    for tx in payload.transactions:
        G.add_edge(tx.fromAddress.lower(), tx.toAddress.lower(), weight=tx.value)

    density = nx.density(G) if len(G.nodes) > 1 else 0.0
    components = nx.number_connected_components(G) if len(G.nodes) > 0 else 0

    return {
        "status": "success",
        "density": round(density, 4),
        "connected_components": components
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
