"""
CRYPTO-NEX Graph Forensics Engine
Performs NetworkX multi-hop path analysis, personalized PageRank,
and shortest path decay calculations to attribute unknown wallets to VASP clusters.
"""

from typing import Dict, List, Any, Optional, Set
import networkx as nx
import numpy as np


class ForensicsGraphEngine:
    def __init__(self):
        self.graph = nx.DiGraph()

    def build_graph(self, transactions: List[Dict[str, Any]]) -> nx.DiGraph:
        """
        Builds a directed weighted graph from transaction list.
        """
        self.graph.clear()
        for tx in transactions:
            from_addr = str(tx.get("from_address", "")).lower()
            to_addr = str(tx.get("to_address", "")).lower()
            val = float(tx.get("value", 0.0))
            token = tx.get("token_symbol", "ETH")
            ts = tx.get("timestamp", "")
            tx_hash = tx.get("tx_hash", "")
            
            if not from_addr or not to_addr:
                continue

            # Ensure nodes exist
            if not self.graph.has_node(from_addr):
                self.graph.add_node(from_addr, tx_count=0, volume_out=0.0, volume_in=0.0)
            if not self.graph.has_node(to_addr):
                self.graph.add_node(to_addr, tx_count=0, volume_out=0.0, volume_in=0.0)

            # Update node statistics
            self.graph.nodes[from_addr]["tx_count"] += 1
            self.graph.nodes[from_addr]["volume_out"] += val
            self.graph.nodes[to_addr]["tx_count"] += 1
            self.graph.nodes[to_addr]["volume_in"] += val

            # Update or create edge
            if self.graph.has_edge(from_addr, to_addr):
                self.graph[from_addr][to_addr]["weight"] += val
                self.graph[from_addr][to_addr]["tx_count"] += 1
                self.graph[from_addr][to_addr]["transactions"].append({
                    "hash": tx_hash,
                    "value": val,
                    "token": token,
                    "timestamp": ts
                })
            else:
                self.graph.add_edge(
                    from_addr,
                    to_addr,
                    weight=val,
                    tx_count=1,
                    transactions=[{
                        "hash": tx_hash,
                        "value": val,
                        "token": token,
                        "timestamp": ts
                    }]
                )
        return self.graph

    def compute_vasp_proximity(
        self,
        target_address: str,
        vasp_address_map: Dict[str, str], # address -> vasp_id
        max_hops: int = 4
    ) -> Dict[str, Dict[str, Any]]:
        """
        Computes shortest path distances and hop decay scores from target_address
        to any address associated with a VASP.
        
        Score formula per VASP:
        Proximity = sum_paths( (1 / (1 + hop_distance))^1.5 * (path_volume / total_volume) )
        """
        target = target_address.lower()
        if not self.graph.has_node(target):
            return {}

        results: Dict[str, Dict[str, Any]] = {}
        total_target_volume = max(
            0.0001,
            self.graph.nodes[target].get("volume_out", 0.0) + self.graph.nodes[target].get("volume_in", 0.0)
        )

        # Compute Personalized PageRank seeded at target address
        try:
            ppr = nx.pagerank(
                self.graph,
                alpha=0.85,
                personalization={target: 1.0},
                weight="weight",
                max_iter=100
            )
        except Exception:
            ppr = {n: 0.0 for n in self.graph.nodes}

        for vasp_addr, vasp_id in vasp_address_map.items():
            vasp_addr_clean = vasp_addr.lower()
            if not self.graph.has_node(vasp_addr_clean):
                continue

            if vasp_id not in results:
                results[vasp_id] = {
                    "vasp_id": vasp_id,
                    "min_hops": 999,
                    "path_count": 0,
                    "total_flow_to_vasp": 0.0,
                    "total_flow_from_vasp": 0.0,
                    "direct_interaction": False,
                    "paths": [],
                    "pagerank_score": 0.0,
                    "proximity_score": 0.0
                }

            results[vasp_id]["pagerank_score"] += float(ppr.get(vasp_addr_clean, 0.0))

            # Forward paths (target -> vasp)
            if nx.has_path(self.graph, target, vasp_addr_clean):
                try:
                    all_paths = list(nx.all_simple_paths(self.graph, target, vasp_addr_clean, cutoff=max_hops))
                    for path in all_paths[:5]: # Take top 5 shortest
                        hops = len(path) - 1
                        if hops < results[vasp_id]["min_hops"]:
                            results[vasp_id]["min_hops"] = hops
                        
                        if hops == 1:
                            results[vasp_id]["direct_interaction"] = True

                        # Compute flow along path
                        edge_vals = [self.graph[path[i]][path[i+1]]["weight"] for i in range(len(path)-1)]
                        bottleneck_val = min(edge_vals) if edge_vals else 0.0

                        results[vasp_id]["path_count"] += 1
                        results[vasp_id]["total_flow_to_vasp"] += bottleneck_val
                        results[vasp_id]["paths"].append({
                            "type": "OUTGOING_TO_VASP",
                            "hops": hops,
                            "path": path,
                            "flow_value": bottleneck_val
                        })
                except Exception:
                    pass

            # Reverse paths (vasp -> target) e.g. withdrawals
            if nx.has_path(self.graph, vasp_addr_clean, target):
                try:
                    rev_paths = list(nx.all_simple_paths(self.graph, vasp_addr_clean, target, cutoff=max_hops))
                    for path in rev_paths[:5]:
                        hops = len(path) - 1
                        if hops < results[vasp_id]["min_hops"]:
                            results[vasp_id]["min_hops"] = hops
                        if hops == 1:
                            results[vasp_id]["direct_interaction"] = True

                        edge_vals = [self.graph[path[i]][path[i+1]]["weight"] for i in range(len(path)-1)]
                        bottleneck_val = min(edge_vals) if edge_vals else 0.0

                        results[vasp_id]["path_count"] += 1
                        results[vasp_id]["total_flow_from_vasp"] += bottleneck_val
                        results[vasp_id]["paths"].append({
                            "type": "INCOMING_FROM_VASP",
                            "hops": hops,
                            "path": path,
                            "flow_value": bottleneck_val
                        })
                except Exception:
                    pass

        # Calculate final proximity score normalized 0.0 to 1.0
        for vasp_id, data in results.items():
            if data["min_hops"] == 999:
                continue
            
            hop = data["min_hops"]
            decay_factor = 1.0 / (1.0 + (hop ** 1.35))
            vol_ratio = min(1.0, (data["total_flow_to_vasp"] + data["total_flow_from_vasp"]) / total_target_volume)
            
            # Combine decay factor, volume ratio, and PageRank
            proximity = (0.55 * decay_factor) + (0.30 * vol_ratio) + (0.15 * min(1.0, data["pagerank_score"] * 15.0))
            data["proximity_score"] = float(round(min(1.0, max(0.0, proximity)), 4))

        return results

    def extract_graph_metrics(self, target_address: str) -> Dict[str, Any]:
        """
        Calculates centralities, density, and clustering coefficients for the target wallet ego-network.
        """
        target = target_address.lower()
        if not self.graph.has_node(target):
            return {
                "node_count": 0,
                "edge_count": 0,
                "target_in_degree": 0,
                "target_out_degree": 0,
                "density": 0.0,
                "reciprocity": 0.0
            }

        # Subgraph of 2-hop ego network
        neighbors = set([target])
        for n in self.graph.successors(target):
            neighbors.add(n)
            for nn in self.graph.successors(n):
                neighbors.add(nn)
        for n in self.graph.predecessors(target):
            neighbors.add(n)
            for nn in self.graph.predecessors(n):
                neighbors.add(nn)

        subg = self.graph.subgraph(neighbors)

        return {
            "node_count": int(subg.number_of_nodes()),
            "edge_count": int(subg.number_of_edges()),
            "target_in_degree": int(self.graph.in_degree(target)),
            "target_out_degree": int(self.graph.out_degree(target)),
            "density": float(round(nx.density(subg), 4)),
            "reciprocity": float(round(nx.reciprocity(subg), 4)) if subg.number_of_edges() > 0 else 0.0
        }
