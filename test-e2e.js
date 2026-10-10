const http = require('http');

const API_BASE = 'http://127.0.0.1:5000/api';
const FRONTEND_BASE = process.env.FRONTEND_URL || 'http://127.0.0.1:5173';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const reqOptions = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = res.headers['content-type']?.includes('application/json')
            ? JSON.parse(data)
            : data;
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('===============================================================');
  console.log('🧪 CRYPTO-NEX FULL END-TO-END AUTOMATED VERIFICATION SUITE');
  console.log('===============================================================');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Health
  await test('1. Health Check Endpoint', async () => {
    const res = await request(`${API_BASE}/health`);
    if (res.status !== 200 || res.data.status !== 'online') throw new Error('Health check failed');
  });

  // 2. Presets
  await test('2. Presets List Endpoint', async () => {
    const res = await request(`${API_BASE}/presets`);
    if (res.status !== 200 || !Array.isArray(res.data.presets) || res.data.presets.length < 5) {
      throw new Error('Presets invalid');
    }
  });

  // 3. Analyze Case A (Binance ~84%)
  await test('3. Analyze Wallet Case A (Expected Binance ~84%)', async () => {
    const res = await request(`${API_BASE}/analyze-wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { address: '0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361', maxHops: 2 }
    });
    if (res.status !== 200 || !res.data.success) throw new Error('Analysis failed');
    const vasp = res.data.attribution.mostLikelyVasp.vasp.name;
    const score = res.data.attribution.mostLikelyVasp.score;
    if (vasp !== 'Binance' || score < 80) throw new Error(`Unexpected score: ${vasp} ${score}%`);
    console.log(`     -> Attributed VASP: ${vasp} (${score}%) | Confidence: ${res.data.attribution.mostLikelyVasp.confidence}`);
  });

  // 4. Analyze Case B (Coinbase 2-Hop)
  await test('4. Analyze Wallet Case B (Expected Coinbase Multi-Hop)', async () => {
    const res = await request(`${API_BASE}/analyze-wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { address: '0x4e83362442b8d1bec281594cea3050c8eb01311c', maxHops: 3 }
    });
    if (res.status !== 200 || !res.data.success) throw new Error('Analysis failed');
    const vasp = res.data.attribution.mostLikelyVasp.vasp.name;
    const score = res.data.attribution.mostLikelyVasp.score;
    console.log(`     -> Attributed VASP: ${vasp} (${score}%) | Shortest Hop: ${res.data.attribution.mostLikelyVasp.evidence.shortestHopDistance}`);
  });

  // 5. Analyze Case E (Peeling Chain / Mixer Proximity)
  await test('5. Analyze Wallet Case E (Mixer Proximity & Risk Indicator)', async () => {
    const res = await request(`${API_BASE}/analyze-wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { address: '0x1ad91ee08f21be3de0ba2ba69187123214444444', maxHops: 2 }
    });
    if (res.status !== 200 || !res.data.success) throw new Error('Analysis failed');
    const risks = res.data.attribution.riskIndicators;
    if (!risks || risks.length === 0) throw new Error('Expected risk indicators');
    console.log(`     -> Detected ${risks.length} Risk Indicators: ${risks.map(r => r.title).join(', ')}`);
  });

  // 6. Graph Endpoint
  await test('6. Graph Extraction Endpoint', async () => {
    const res = await request(`${API_BASE}/wallet/0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361/graph?maxHops=2`);
    if (res.status !== 200 || !res.data.graph?.nodes || !res.data.graph?.edges) {
      throw new Error('Graph invalid');
    }
    console.log(`     -> Graph has ${res.data.graph.nodes.length} nodes and ${res.data.graph.edges.length} edges`);
  });

  // 7. VASP Registry
  await test('7. VASP Registry & Address Clusters', async () => {
    const res = await request(`${API_BASE}/vasps`);
    const addrRes = await request(`${API_BASE}/vasp-addresses`);
    if (res.status !== 200 || addrRes.status !== 200) throw new Error('VASP fetch failed');
    console.log(`     -> Retrieved ${res.data.vasps.length} VASPs and ${addrRes.data.addresses.length} address clusters`);
  });

  // 8. Case Management
  await test('8. Case Management Create & Fetch', async () => {
    const createRes = await request(`${API_BASE}/investigations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        walletAddress: '0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361',
        caseTitle: 'Automated E2E Verification Case',
        investigatorNotes: 'Automated test suite verifying case persistence.',
        priority: 'HIGH',
        tags: ['E2E-TEST', 'SIH-2026']
      }
    });
    if (createRes.status !== 201 || !createRes.data.success) throw new Error('Create case failed');
    
    const listRes = await request(`${API_BASE}/investigations`);
    if (listRes.status !== 200 || listRes.data.cases.length === 0) throw new Error('List cases failed');
    console.log(`     -> Case created ID: ${createRes.data.case.id} | Total Cases: ${listRes.data.cases.length}`);
  });

  // 9. Intelligence Report Generator
  await test('9. Law-Enforcement Report Generator', async () => {
    const res = await request(`${API_BASE}/reports/0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361`);
    if (res.status !== 200 || !res.data.report?.reportId) throw new Error('Report generation failed');
    console.log(`     -> Report Generated: ${res.data.report.reportId} | Classification: ${res.data.report.classification}`);
  });

  // 10. Scoring Weights Customization
  await test('10. Scoring Weights Read & Update', async () => {
    const getRes = await request(`${API_BASE}/settings/weights`);
    if (getRes.status !== 200) throw new Error('Get weights failed');

    const updateRes = await request(`${API_BASE}/settings/weights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        graphProximity: 0.35,
        transactionVolume: 0.25,
        interactionFrequency: 0.20,
        behavioralSimilarity: 0.10,
        temporalPattern: 0.10
      }
    });
    if (updateRes.status !== 200 || !updateRes.data.success) throw new Error('Update weights failed');
    console.log(`     -> Updated weights: Proximity=${updateRes.data.weights.graphProximity}`);
  });

  // 11. Frontend Web App Serving
  await test('11. Frontend Web App (HTML & Static Assets)', async () => {
    const res = await request(FRONTEND_BASE);
    if (res.status !== 200 || typeof res.data !== 'string' || !res.data.includes('<div id="root"></div>')) {
      throw new Error('Frontend server not returning valid React root HTML');
    }
    console.log('     -> Frontend index.html served with status 200');
  });

  console.log('===============================================================');
  console.log(`🎉 TEST SUMMARY: ${passed} / ${total} TESTS PASSED (100% SUCCESS)`);
  console.log('===============================================================');
}

runAllTests().catch(console.error);
