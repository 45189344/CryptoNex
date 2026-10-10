"""
CRYPTO-NEX Multi-Factor Probabilistic Attribution Scorer
Applies configurable weighting, ensemble calibration, and ranking.
"""

from typing import Dict, List, Any
import numpy as np


class AttributionScorer:
    # Default weights matching problem specification:
    # 30% graph proximity, 25% transaction volume, 20% interaction frequency, 15% behavioral similarity, 10% temporal pattern
    DEFAULT_WEIGHTS = {
        "graph_proximity": 0.30,
        "transaction_volume": 0.25,
        "interaction_frequency": 0.20,
        "behavioral_similarity": 0.15,
        "temporal_pattern": 0.10
    }

    @staticmethod
    def calculate_attribution(
        vasps: List[Dict[str, Any]],
        proximity_data: Dict[str, Dict[str, Any]],
        feature_data: Dict[str, Any],
        custom_weights: Dict[str, float] = None
    ) -> List[Dict[str, Any]]:
        """
        Calculates normalized attribution score per VASP and produces ranked output with evidence.
        """
        weights = custom_weights or AttributionScorer.DEFAULT_WEIGHTS
        
        # Normalize weights to sum to 1.0
        w_sum = sum(weights.values()) or 1.0
        w_prox = weights.get("graph_proximity", 0.30) / w_sum
        w_vol = weights.get("transaction_volume", 0.25) / w_sum
        w_freq = weights.get("interaction_frequency", 0.20) / w_sum
        w_behav = weights.get("behavioral_similarity", 0.15) / w_sum
        w_temp = weights.get("temporal_pattern", 0.10) / w_sum

        vasp_features = feature_data.get("vasp_features", {})
        raw_scores: List[Dict[str, Any]] = []

        for vasp in vasps:
            vid = vasp["id"]
            vname = vasp.get("name", vid)
            vcode = vasp.get("code", vid)
            vcountry = vasp.get("country", "Global")
            
            prox_info = proximity_data.get(vid, {})
            feat_info = vasp_features.get(vid, {})

            prox_score = prox_info.get("proximity_score", 0.0)
            vol_score = feat_info.get("volume_share", 0.0)
            freq_score = feat_info.get("interaction_frequency_score", 0.0)
            behav_score = feat_info.get("behavioral_pattern_score", 0.0)
            temp_score = feat_info.get("temporal_pattern_score", 0.0)

            # Check if there is indirect multi-hop path (e.g. 2 or 3 hops) even if direct tx_count is 0
            min_hops = prox_info.get("min_hops", 999)
            if min_hops < 999 and feat_info.get("direct_tx_count", 0) == 0:
                # Give indirect hop behavioral signal
                behav_score = max(behav_score, 0.35 / (min_hops))
                temp_score = max(temp_score, 0.25 / (min_hops))

            # Composite raw score
            composite = (
                (w_prox * prox_score) +
                (w_vol * vol_score) +
                (w_freq * freq_score) +
                (w_behav * behav_score) +
                (w_temp * temp_score)
            )

            # Compile explainability evidence
            evidence = {
                "factors": {
                    "graph_proximity": {
                        "score": round(prox_score, 4),
                        "weight": round(w_prox, 2),
                        "contribution": round(w_prox * prox_score, 4),
                        "min_hops": min_hops if min_hops < 999 else None,
                        "direct_interaction": prox_info.get("direct_interaction", False),
                        "path_count": prox_info.get("path_count", 0)
                    },
                    "transaction_volume": {
                        "score": round(vol_score, 4),
                        "weight": round(w_vol, 2),
                        "contribution": round(w_vol * vol_score, 4),
                        "volume_eth": round(feat_info.get("direct_volume", 0.0), 4),
                        "volume_share_pct": round(vol_score * 100, 2)
                    },
                    "interaction_frequency": {
                        "score": round(freq_score, 4),
                        "weight": round(w_freq, 2),
                        "contribution": round(w_freq * freq_score, 4),
                        "direct_tx_count": feat_info.get("direct_tx_count", 0)
                    },
                    "behavioral_similarity": {
                        "score": round(behav_score, 4),
                        "weight": round(w_behav, 2),
                        "contribution": round(w_behav * behav_score, 4),
                        "sweep_detected": feat_info.get("sweep_pattern_detected", False),
                        "rapid_forwarding": feat_info.get("rapid_movement_detected", False)
                    },
                    "temporal_pattern": {
                        "score": round(temp_score, 4),
                        "weight": round(w_temp, 2),
                        "contribution": round(w_temp * temp_score, 4)
                    }
                },
                "notes": feat_info.get("evidence_notes", []),
                "paths": prox_info.get("paths", [])
            }

            raw_scores.append({
                "vasp_id": vid,
                "vasp_name": vname,
                "vasp_code": vcode,
                "vasp_country": vcountry,
                "raw_score": float(composite),
                "evidence": evidence
            })

        # Probability Calibration (Softmax with temperature scaling or relative share)
        # If any VASP has score > 0, calibrate distribution
        active_items = [item for item in raw_scores if item["raw_score"] > 0.001]
        
        if active_items:
            # Sort descending by raw score
            active_items.sort(key=lambda x: x["raw_score"], reverse=True)
            
            # Apply softmax or normalized power distribution to emphasize leading candidate
            scores = np.array([x["raw_score"] for x in active_items])
            # Boost contrast slightly with exponent 1.8
            powered = np.power(scores, 1.8)
            norm_probs = powered / np.sum(powered)

            for i, item in enumerate(active_items):
                item["probability"] = float(norm_probs[i])
                item["confidence_pct"] = int(round(norm_probs[i] * 100))
        else:
            # No interaction detected with any known VASP
            for item in raw_scores:
                item["probability"] = 0.0
                item["confidence_pct"] = 0

        # Assemble full list sorted by score
        raw_scores.sort(key=lambda x: x.get("probability", 0.0), reverse=True)

        ranked_results = []
        for rank, item in enumerate(raw_scores, 1):
            ranked_results.append({
                "rank": rank,
                "vasp_id": item["vasp_id"],
                "vasp_name": item["vasp_name"],
                "vasp_code": item["vasp_code"],
                "vasp_country": item["vasp_country"],
                "confidence_score": round(item.get("probability", 0.0), 4),
                "confidence_percentage": item.get("confidence_pct", 0),
                "evidence": item["evidence"],
                "is_top_match": (rank == 1 and item.get("confidence_pct", 0) > 0)
            })

        return ranked_results
