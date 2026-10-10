# VASP Attribution Methodology & Mathematical Model

## 1. Probabilistic Attribution Formulation
CRYPTO-NEX computes a multi-factor score for each candidate VASP $V \in \mathcal{V}$:

$$\text{Score}(V) = w_1 \cdot P(V) + w_2 \cdot \text{Vol}(V) + w_3 \cdot F(V) + w_4 \cdot B(V) + w_5 \cdot T(V)$$

Where:
$$\sum_{i=1}^5 w_i = 1.0 \quad (w_1=0.30, w_2=0.25, w_3=0.20, w_4=0.15, w_5=0.10)$$

---

## 2. The 5 Attribution Factors

### Factor 1: Graph Proximity $P(V)$ (30%)
Calculated by evaluating the shortest topological hop distance $d(W, V)$ between the subject wallet $W$ and any address belonging to VASP cluster $V$:
$$P(V) = \begin{cases} 
1.00 & \text{if } d(W, V) = 1 \text{ (Direct 1-Hop Interaction)} \\
0.55 & \text{if } d(W, V) = 2 \text{ (2-Hop Intermediary Relay)} \\
0.25 & \text{if } d(W, V) = 3 \text{ (3-Hop Extended Chain)} \\
0.05 & \text{if } d(W, V) > 3 \text{ or unreachable}
\end{cases}$$

### Factor 2: Transaction Volume Overlap $\text{Vol}(V)$ (25%)
The ratio of total transaction volume channeled directly or transitively to/from cluster $V$ relative to the analyzed wallet's total volume:
$$\text{Vol}(V) = \min\left(1.0, \frac{\sum_{t \in \mathcal{T}_V} \text{Value}(t)}{\sum_{t \in \mathcal{T}} \text{Value}(t)} \cdot 1.15\right)$$

### Factor 3: Interaction Frequency $F(V)$ (20%)
Log-scaled cardinality of transactions interacting with cluster $V$:
$$F(V) = \min\left(1.0, \frac{\log_{10}(|\mathcal{T}_V| + 1)}{\log_{10}(15)}\right)$$

### Factor 4: Behavioral Similarity $B(V)$ (15%)
Cosine similarity vector comparing deposit sweep cadence, ticket size distributions, and smart contract interaction payload profiles with known exchange deposit wallet archetypes.

### Factor 5: Temporal Pattern $T(V)$ (10%)
Correlation with automated exchange batch sweep windows (e.g. UTC 00:00 - 04:00 batch settlement cycles).

---

## 3. Probability Normalization & Ranking
Raw scores $S(V)$ are normalized using an exponential softmax-like power scaling ($\gamma = 2.2$) to produce clean percentage attributions:

$$\Pr(V) = \frac{S(V)^\gamma}{\sum_{V' \in \mathcal{V}} S(V')^\gamma} \times 100\%$$

*Example output:* **Binance 84.2%**, **Coinbase 10.1%**, **Kraken 5.7%**.

---

## 4. Legal & Compliance Guardrails
1. **Probabilistic Attribution Only:** The output represents statistical correlation, not definitive proof of wallet ownership.
2. **Zero PII:** The platform does not track natural persons or store personally identifiable information.
3. **Verified vs Demo Separation:** Known public exchange clusters are explicitly tagged as `VERIFIED_PUBLIC` while synthetic benchmark clusters are marked as `DEMO_SIMULATION`.
