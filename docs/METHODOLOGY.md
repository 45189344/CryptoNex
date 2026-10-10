# CRYPTO-NEX: Forensic Scoring Methodology
**Automated Multi-Factor Probabilistic VASP Attribution**

## 1. Probabilistic Attribution vs Ownership Proof
Attribution in CRYPTO-NEX produces a probabilistic likelihood distribution reflecting interaction topology and behavioral fingerprints with known VASP clusters. It is **not** definitive proof of legal wallet ownership.

## 2. Multi-Factor Formula

$$\text{Score}_{\text{raw}}(V) = w_{\text{prox}} S_{\text{prox}} + w_{\text{vol}} S_{\text{vol}} + w_{\text{freq}} S_{\text{freq}} + w_{\text{behav}} S_{\text{behav}} + w_{\text{temp}} S_{\text{temp}}$$

Where:
- $\sum w_i = 1.0$ (Default: 30%, 25%, 20%, 15%, 10%)

### Factor 1: Graph Proximity ($S_{\text{prox}}$ - 30%)
Calculates shortest path hop distance to candidate VASP cluster with decay:
$$S_{\text{prox}} = 0.65 \cdot \frac{1}{1 + (\text{hop})^{1.35}} + 0.35 \cdot \text{PPR}(v)$$
Where $\text{PPR}(v)$ is Personalized PageRank rooted at the target wallet.

### Factor 2: Transaction Volume Overlap ($S_{\text{vol}}$ - 25%)
Measures the proportion of total funds moving to/from the VASP cluster:
$$S_{\text{vol}} = \min\left(1.0, \frac{\text{Volume}_{\text{direct}}(V)}{\text{Volume}_{\text{total}}}\right)$$

### Factor 3: Interaction Frequency ($S_{\text{freq}}$ - 20%)
Measures repeated transaction consistency:
$$S_{\text{freq}} = 0.70 \cdot \left(\frac{N_{\text{tx}}(V)}{N_{\text{total}}}\right) + 0.30 \cdot \min\left(1.0, \frac{N_{\text{tx}}(V)}{8}\right)$$

### Factor 4: Behavioral Cluster Pattern ($S_{\text{behav}}$ - 15%)
Heuristic detection of exchange-specific behavior:
- Automated deposit sweeper hub forwarding ($\le 30$ mins turnaround): $+0.35$
- Direct hot wallet interaction: $+0.40$
- Multi-hop peel chain consolidation: $+0.25 / \text{hop}$

### Factor 5: Temporal Cadence ($S_{\text{temp}}$ - 10%)
Measures alignment with automated exchange liquidity sweeps and batching intervals.

## 3. Probability Calibration
Raw scores are normalized into a calibrated percentage distribution:
$$P(V_i) = \frac{(\text{Score}_{\text{raw}}(V_i))^\gamma}{\sum_j (\text{Score}_{\text{raw}}(V_j))^\gamma}$$
With exponent $\gamma = 1.8$ to elevate leading signals while preserving comparative candidates.
