const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data || {});
    const parsedUrl = new URL(url);
    const req = http.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    }).on('error', reject);
  });
}

async function runBenchmarkTestSuite() {
  console.log('========================================================================');
  console.log('🔬 CRYPTO-NEX COMPREHENSIVE BENCHMARK CASE VALIDATION (CASES A-E)');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  // 1. Fetch presets
  const presetsRes = await get('http://127.0.0.1:5000/api/presets');
  assert(presetsRes.status === 200 && presetsRes.data.presets.length >= 5, 'Presets endpoint returned 5 benchmark cases');

  const presets = presetsRes.data.presets;

  // Track results to ensure complete separation
  const caseResults = {};

  for (const p of presets) {
    console.log(`\n--- Evaluating ${p.name || p.id} ---`);
    console.log(`    Target: ${p.address} | Expected: ${p.primaryVaspExpected} ~${p.expectedScore}%`);

    const analysisRes = await post('http://127.0.0.1:5000/api/analyze-wallet', {
      address: p.address,
      caseId: p.id,
      network: p.network || 'ethereum',
      maxHops: p.defaultHopDepth || p.hopsToVasp || 2
    });

    assert(analysisRes.status === 200, `${p.id}: /api/analyze-wallet returned HTTP 200`);
    const d = analysisRes.data;

    // Verify identity metadata
    assert(d.address.toLowerCase() === p.address.toLowerCase(), `${p.id}: Result address matches target query address`);
    assert(d.analysisId && d.analysisId.startsWith('analysis-'), `${p.id}: Generated valid analysisId: ${d.analysisId}`);
    assert(d.caseId === p.id, `${p.id}: Case ID is correctly attached: ${d.caseId}`);

    const topVasp = d.attribution.mostLikelyVasp.vasp.name;
    const score = d.attribution.mostLikelyVasp.score;
    const runnerUp = d.attribution.rankings[1] ? `${d.attribution.rankings[1].vasp.name} (${d.attribution.rankings[1].score}%)` : 'None';
    const riskLevel = d.attribution.riskAssessment.riskLevel;
    const riskScore = d.attribution.riskAssessment.riskScore;

    console.log(`    Calculated: Primary VASP: ${topVasp} (${score}%) | Runner-up: ${runnerUp}`);
    console.log(`    Risk: ${riskLevel} (${riskScore}/100) | Graph Nodes: ${d.graph.nodes.length} | Txs: ${d.transactions.length}`);

    // Specific case verifications:
    if (p.id === 'case-a') {
      assert(topVasp === 'Binance' && score > 75, 'Case A: Attributed to Binance (>75%)');
    } else if (p.id === 'case-b') {
      assert(topVasp === 'Coinbase' && score > 70, 'Case B: Attributed to Coinbase (>70%)');
    } else if (p.id === 'case-c') {
      assert(topVasp === 'Kraken' && topVasp !== 'Binance', 'Case C: Correctly attributed to Kraken, NOT Binance');
      assert(d.attribution.rankings[1] && d.attribution.rankings[1].vasp.name === 'OKX', 'Case C: Runner-up is OKX (Arbitrageur profile)');
    } else if (p.id === 'case-d') {
      assert(topVasp === 'Binance', 'Case D: Plurality attributed to Binance');
      assert(d.graph.nodes.length >= 8, 'Case D: Graph reflects diverse ecosystem (>=8 nodes)');
    } else if (p.id === 'case-e') {
      assert(topVasp === 'Binance', 'Case E: Attributed to Binance endpoint');
      assert(riskLevel === 'CRITICAL' || riskScore >= 75, 'Case E: Elevated risk score due to mixer proximity');
    }

    caseResults[p.id] = {
      address: d.address,
      topVasp,
      score,
      riskScore,
      txCount: d.transactions.length,
      nodeCount: d.graph.nodes.length
    };
  }

  // Cross-case verification: Ensure Case C result is distinct from Case A, B, D, E
  console.log('\n--- Cross-Case Result Isolation Verification ---');
  assert(caseResults['case-c'].topVasp !== caseResults['case-a'].topVasp, 'Case C VASP (Kraken) is distinct from Case A VASP (Binance)');
  assert(caseResults['case-c'].address !== caseResults['case-d'].address, 'Case C address is distinct from Case D');
  assert(caseResults['case-c'].topVasp === 'Kraken', 'Case C unequivocally proves Kraken attribution bug is RESOLVED');

  // Investigation & escalation flow test on Case C
  console.log('\n--- Investigation Escalation Verification for Case C ---');
  const flagRes = await post('http://127.0.0.1:5000/api/investigations', {
    targetWallet: presets.find(p => p.id === 'case-c').address,
    caseTitle: 'Investigation on Kraken Arbitrage Pattern',
    primaryVaspCandidate: 'Kraken',
    attributionScore: caseResults['case-c'].score,
    riskScore: caseResults['case-c'].riskScore,
    riskLevel: 'HIGH',
    status: 'Open'
  });

  assert(flagRes.status === 201 && flagRes.data.case.id, `Flag for Investigation created case: ${flagRes.data?.case?.id}`);
  const caseId = flagRes.data.case.id;

  // Generate Evidence Package
  const evRes = await post(`http://127.0.0.1:5000/api/investigations/${caseId}/evidence-package`);
  assert(evRes.status === 200 && evRes.data.evidencePackage.packageId, `Evidence Package generated: ${evRes.data?.evidencePackage?.packageId}`);

  // Prepare Authority Submission
  const authRes = await post(`http://127.0.0.1:5000/api/investigations/${caseId}/authority-submission`);
  assert(authRes.status === 200 && authRes.data.authoritySubmission.submissionStatus === 'Prepared', 'Authority Submission prepared with status Prepared');
  assert(authRes.data.authoritySubmission.disclaimer.includes('does not possess authority to unilaterally seize'), 'Authority submission disclaimer confirms non-blocking institutional scope');

  // Check Audit Trail
  const auditRes = await get('http://127.0.0.1:5000/api/audit-trail');
  assert(auditRes.status === 200 && auditRes.data.logs.length > 0, `Audit trail contains ${auditRes.data?.logs?.length} logged events`);

  console.log('\n========================================================================');
  console.log(`🏁 BENCHMARK TEST SUITE COMPLETE: ${passed} / ${total} TESTS PASSED`);
  console.log('========================================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runBenchmarkTestSuite().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
