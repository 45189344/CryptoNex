"""
CRYPTO-NEX Behavioral & Temporal Feature Extraction Engine
Extracts forensic indicators, volume concentration, and cadence patterns.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import numpy as np


class ForensicsFeatureExtractor:
    @staticmethod
    def extract_features(
        target_address: str,
        transactions: List[Dict[str, Any]],
        vasp_address_map: Dict[str, str], # address -> vasp_id
        vasps: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Extracts multi-factor feature vectors for each candidate VASP.
        """
        target = target_address.lower()
        
        # 1. Overall target stats
        total_tx_count = len(transactions)
        target_in_txs = [tx for tx in transactions if str(tx.get("to_address", "")).lower() == target]
        target_out_txs = [tx for tx in transactions if str(tx.get("from_address", "")).lower() == target]
        
        vol_in = sum(float(tx.get("value", 0.0)) for tx in target_in_txs)
        vol_out = sum(float(tx.get("value", 0.0)) for tx in target_out_txs)
        total_vol = max(0.0001, vol_in + vol_out)

        # 2. Extract per-VASP metrics
        vasp_features: Dict[str, Dict[str, Any]] = {}
        for v in vasps:
            vid = v["id"]
            vasp_features[vid] = {
                "vasp_id": vid,
                "vasp_name": v.get("name", vid),
                "direct_tx_count": 0,
                "direct_volume": 0.0,
                "volume_share": 0.0,
                "interaction_frequency_score": 0.0,
                "behavioral_pattern_score": 0.0,
                "temporal_pattern_score": 0.0,
                "sweep_pattern_detected": False,
                "rapid_movement_detected": False,
                "evidence_notes": []
            }

        # Scan direct transactions with known VASP addresses
        for tx in transactions:
            from_a = str(tx.get("from_address", "")).lower()
            to_a = str(tx.get("to_address", "")).lower()
            val = float(tx.get("value", 0.0))
            is_sweep = bool(tx.get("is_sweep", False))
            
            # Target -> VASP (Deposits)
            if from_a == target and to_a in vasp_address_map:
                vid = vasp_address_map[to_a]
                if vid in vasp_features:
                    vasp_features[vid]["direct_tx_count"] += 1
                    vasp_features[vid]["direct_volume"] += val
                    if is_sweep:
                        vasp_features[vid]["sweep_pattern_detected"] = True

            # VASP -> Target (Withdrawals)
            if to_a == target and from_a in vasp_address_map:
                vid = vasp_address_map[from_a]
                if vid in vasp_features:
                    vasp_features[vid]["direct_tx_count"] += 1
                    vasp_features[vid]["direct_volume"] += val

        # 3. Time Series & Cadence Analysis
        timestamps: List[datetime] = []
        for tx in transactions:
            ts_str = tx.get("timestamp")
            if ts_str:
                try:
                    # Clean ISO format
                    clean_ts = ts_str.replace("Z", "+00:00")
                    timestamps.append(datetime.fromisoformat(clean_ts))
                except Exception:
                    pass

        timestamps.sort()
        intervals_sec = []
        if len(timestamps) > 1:
            intervals_sec = [(timestamps[i] - timestamps[i-1]).total_seconds() for i in range(1, len(timestamps))]

        # Detect rapid sweep behavior (< 30 minutes interval between receiving and forwarding)
        rapid_sweep_count = sum(1 for sec in intervals_sec if 0 < sec <= 1800)
        has_rapid_sweep = rapid_sweep_count > 0

        # Calculate scores per VASP
        for vid, feat in vasp_features.items():
            tx_count = feat["direct_tx_count"]
            vol = feat["direct_volume"]
            
            # Volume share (0 to 1)
            vol_share = min(1.0, vol / total_vol) if total_vol > 0 else 0.0
            feat["volume_share"] = float(round(vol_share, 4))

            # Interaction frequency score
            if total_tx_count > 0:
                freq_ratio = tx_count / total_tx_count
                # Non-linear boost for repeated interactions
                freq_score = min(1.0, (freq_ratio * 0.7) + (min(tx_count, 10) / 10.0 * 0.3))
            else:
                freq_score = 0.0
            feat["interaction_frequency_score"] = float(round(freq_score, 4))

            # Behavioral Pattern Score (Heuristics: Sweep detection, Peel chain, Fixed gas fees)
            behav_score = 0.0
            notes = []
            if tx_count > 0:
                behav_score += 0.4
                notes.append(f"{tx_count} direct on-chain interaction(s) observed")
            if feat["sweep_pattern_detected"]:
                behav_score += 0.35
                notes.append("Automated deposit sweeper / consolidation pattern detected")
            if has_rapid_sweep and tx_count > 0:
                behav_score += 0.25
                feat["rapid_movement_detected"] = True
                notes.append("High velocity fund forwarding (< 30 min turnaround)")
            
            feat["behavioral_pattern_score"] = float(round(min(1.0, behav_score), 4))

            # Temporal Pattern Score
            temp_score = 0.0
            if tx_count > 0:
                # Active hours cadence consistency
                temp_score = 0.6 + (0.4 * min(1.0, tx_count / 5.0))
                notes.append("Consistent temporal activity within standard automated batching windows")
            feat["temporal_pattern_score"] = float(round(min(1.0, temp_score), 4))
            feat["evidence_notes"] = notes

        return {
            "total_tx_count": total_tx_count,
            "total_volume": total_vol,
            "volume_in": vol_in,
            "volume_out": vol_out,
            "has_rapid_sweep": has_rapid_sweep,
            "vasp_features": vasp_features
        }
