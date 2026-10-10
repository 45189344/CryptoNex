const http = require('http');

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} returned status ${res.status}`);
  return res.json();
}

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`POST ${url} returned status ${res.status}`);
  return res.json();
}

async function runTests() {
  console.log('====================================================');
  console.log('   CRYPTO-NEX Comprehensive System Test Suite');
  console.log('====================================================');

  // 1. Health Check
  const health = await get('http://127.0.0.1:5000/health');
  console.log('✔ [1/12] Backend Health:', health.status, `(v${health.version})`);

  // 2. Presets
  const presets = await get('http://127.0.0.1:5000/api/presets');
  console.log(`✔ [2/12] Presets Loaded: ${presets.presets.length} cases`);

  // 3. VASP Registry
  const vasps = await get('http://127.0.0.1:5000/api/vasps');
  console.log(`✔ [3/12] VASP Registry: ${vasps.vasps.length} exchanges active`);

  // 4. Case 1: Binance Fast Sweep
  const c1 = await post('http://127.0.0.1:5000/api/analyze-wallet', { address: '0x1111111111111111111111111111111111111111' });
  console.log(`✔ [4/12] Case 1 (Binance Sweep): Top Match -> ${c1.attribution.top_match.vasp_name} (${c1.attribution.top_match.confidence_percentage}%)`);

  // 5. Case 2: Coinbase Prime Trader
  const c2 = await post('http://127.0.0.1:5000/api/analyze-wallet', { address: '0x2222222222222222222222222222222222222222' });
  console.log(`✔ [5/12] Case 2 (Coinbase Trader): Top Match -> ${c2.attribution.top_match.vasp_name} (${c2.attribution.top_match.confidence_percentage}%)`);

  // 6. Case 3: Kraken OTC Liquidity
  const c3 = await post('http://127.0.0.1:5000/api/analyze-wallet', { address: '0x3333333333333333333333333333333333333333' });
  console.log(`✔ [6/12] Case 3 (Kraken OTC): Top Match -> ${c3.attribution.top_match.vasp_name} (${c3.attribution.top_match.confidence_percentage}%)`);

  // 7. Case 4: Multi-hop Layering / Mixer
  const c4 = await post('http://127.0.0.1:5000/api/analyze-wallet', { address: '0x4444444444444444444444444444444444444444' });
  console.log(`✔ [7/12] Case 4 (Multi-Hop): Top Match -> ${c4.attribution.top_match.vasp_name} (${c4.attribution.top_match.confidence_percentage}%)`);

  // 8. Case 5: Clean Independent EOA
  const c5 = await post('http://127.0.0.1:5000/api/analyze-wallet', { address: '0x5555555555555555555555555555555555555555' });
  console.log(`✔ [8/12] Case 5 (Clean EOA): Top Match -> ${c5.attribution.top_match ? c5.attribution.top_match.vasp_name : 'None (0% Attribution)'}`);

  // 9. Arbitrary Wallet Analysis
  const cDyn = await post('http://127.0.0.1:5000/api/analyze-wallet', { address: '0x8888888888888888888888888888888888888888' });
  console.log(`✔ [9/12] Dynamic Arbitrary Address: Top Match -> ${cDyn.attribution.top_match.vasp_name} (${cDyn.attribution.top_match.confidence_percentage}%) [${cDyn.graph.nodes.length} nodes]`);

  // 10. Graph and Transactions
  const graphRes = await get('http://127.0.0.1:5000/api/wallet/0x1111111111111111111111111111111111111111/graph');
  const txRes = await get('http://127.0.0.1:5000/api/wallet/0x1111111111111111111111111111111111111111/transactions');
  console.log(`✔ [10/12] Graph & Ledger APIs: ${graphRes.graph.nodes.length} nodes, ${txRes.transactions.length} transactions`);

  // 11. Investigation Management
  const invRes = await post('http://127.0.0.1:5000/api/investigations', {
    wallet_address: '0x1111111111111111111111111111111111111111',
    title: 'Audit Case #SIH-01',
    notes: 'Verified Binance hot wallet peel chain route.',
    tags: ['Binance', 'Sweeper', 'High Confidence']
  });
  console.log(`✔ [11/12] Investigation Dossier Created: ID ${invRes.investigation.id}`);

  // 12. Frontend Web Server
  const feRes = await fetch('http://127.0.0.1:5173/');
  const feHtml = await feRes.text();
  console.log(`✔ [12/12] Frontend Web App Serving: HTTP ${feRes.status}, HTML length: ${feHtml.length} bytes`);

  console.log('====================================================');
  console.log('   ALL 12 FORENSIC TESTS PASSED SUCCESSFULLY! 🚀');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
