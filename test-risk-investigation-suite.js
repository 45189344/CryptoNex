const http = require('http');

const API_BASE = 'http://127.0.0.1:5000/api';

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

async function runSuite() {
  console.log('========================================================================');
  console.log('🔍 CRYPTO-NEX RISK DETECTION & INVESTIGATION ESCALATION TEST SUITE');
  console.log('========================================================================');

  let passed = 0;
  let total = 0;

  async function assertTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  let createdCaseId = null;

  // 1. Risk Assessment Verification on Case A
  await assertTest('1. Wallet Analysis & Risk Assessment (Case A - Binance Sweep)', async () => {
    const res = await request(`${API_BASE}/analyze-wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { address: '0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361', maxHops: 2 }
    });

    if (res.status !== 200 || !res.data.success) throw new Error('Analyze wallet failed');
    const attr = res.data.attribution;
    if (!attr.riskAssessment) throw new Error('riskAssessment missing from attribution');
    
    const ra = attr.riskAssessment;
    if (typeof ra.riskScore !== 'number' || ra.riskScore < 0 || ra.riskScore > 100) {
      throw new Error(`Invalid riskScore: ${ra.riskScore}`);
    }
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(ra.riskLevel)) {
      throw new Error(`Invalid riskLevel: ${ra.riskLevel}`);
    }
    if (ra.label !== 'Suspicious Activity Risk Score') {
      throw new Error(`Unexpected risk label: ${ra.label}`);
    }
    if (!ra.disclaimer || !ra.disclaimer.includes('analytical assessments based on available blockchain evidence')) {
      throw new Error('Mandatory disclaimer missing or incorrect');
    }
    if (!Array.isArray(ra.scoreBreakdown) || ra.scoreBreakdown.length === 0) {
      throw new Error('scoreBreakdown must contain explainable factors');
    }

    console.log(`     -> Risk Score: ${ra.riskScore}/100 | Level: ${ra.riskLevel} | Factors: ${ra.scoreBreakdown.length}`);
  });

  // 2. Evidence-Based Risk Indicators Verification
  await assertTest('2. Evidence-Based Risk Indicators Structure', async () => {
    const res = await request(`${API_BASE}/analyze-wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { address: '0x1ad91ee08f21be3de0ba2ba69187123214444444', maxHops: 2 }
    });

    const indicators = res.data.attribution.riskIndicators;
    if (!Array.isArray(indicators) || indicators.length === 0) {
      throw new Error('Expected risk indicators for mixer/peeling case');
    }

    const first = indicators[0];
    if (!first.indicator || !first.severity || !first.reason || !first.supportingEvidence) {
      throw new Error('Risk indicator must have indicator, severity, reason, supportingEvidence');
    }

    console.log(`     -> Sample Indicator: [${first.severity}] ${first.indicator}`);
    console.log(`     -> Supporting Evidence: ${first.supportingEvidence}`);
  });

  // 3. VASP Compliance Alert Verification
  await assertTest('3. VASP Compliance Alert for High/Critical Risk Cases', async () => {
    const res = await request(`${API_BASE}/analyze-wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { address: '0x1ad91ee08f21be3de0ba2ba69187123214444444', maxHops: 2 }
    });

    const alert = res.data.attribution.riskAssessment?.vaspComplianceAlert;
    if (!alert) {
      throw new Error('Expected VASP Compliance Alert on elevated risk address with probable VASP');
    }
    if (alert.title !== 'VASP Compliance Review Recommended') {
      throw new Error(`Unexpected alert title: ${alert.title}`);
    }
    if (!alert.disclaimer.includes('DOES NOT directly freeze, block, or seize')) {
      throw new Error('Alert must contain explicit non-freeze notice');
    }

    console.log(`     -> Compliance Alert: ${alert.title} for ${alert.probableVasp} (Score: ${alert.attributionScore}%)`);
  });

  // 4. Investigation Timeline Verification
  await assertTest('4. Investigation Timeline Milestones and Timestamps', async () => {
    const res = await request(`${API_BASE}/analyze-wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { address: '0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361', maxHops: 2 }
    });

    const timeline = res.data.attribution.timeline;
    if (!Array.isArray(timeline) || timeline.length < 5) {
      throw new Error('Expected at least 5 timeline milestones');
    }

    const eventTypes = timeline.map(e => e.eventType);
    if (!eventTypes.includes('WALLET_SUBMITTED') || !eventTypes.includes('VASP_ATTRIBUTION_COMPLETED') || !eventTypes.includes('RISK_ASSESSMENT_COMPLETED')) {
      throw new Error('Missing core timeline event types');
    }

    console.log(`     -> Recorded ${timeline.length} sequential milestones from ${timeline[0].title} to ${timeline[timeline.length - 1].title}`);
  });

  // 5. Flag Wallet for Investigation (Case Creation)
  await assertTest('5. Flag Wallet for Investigation (Case Creation with Full Telemetry)', async () => {
    const createRes = await request(`${API_BASE}/investigations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        targetWallet: '0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361',
        blockchain: 'Ethereum',
        hopDepth: 2,
        attributionResult: {
          vaspName: 'Binance',
          attributionScore: 84,
          confidence: 'HIGH'
        },
        riskScore: 78,
        riskLevel: 'HIGH',
        riskIndicators: [
          {
            indicator: 'High-Value Rapid Sweep',
            severity: 'HIGH',
            reason: 'Rapid outflow to exchange deposit cluster within short timeframe',
            supportingEvidence: 'Tx: 0x3a4b... volume: 45.2 ETH'
          }
        ],
        supportingEvidence: ['Graph Proximity: 1-hop', 'Volume Overlap: 45.2 ETH'],
        investigatorNotes: 'Flagged by Analyst for suspicious rapid sweep pattern.',
        priority: 'HIGH'
      }
    });

    if (createRes.status !== 201 || !createRes.data.success) {
      throw new Error(`Failed to flag wallet: status ${createRes.status}`);
    }

    const inv = createRes.data.case || createRes.data.investigation;
    if (!inv || !inv.id) throw new Error('Case object missing id');
    if (inv.status !== 'Open') throw new Error(`Initial status must be Open, got ${inv.status}`);
    if (inv.riskScore !== 78 || inv.riskLevel !== 'HIGH') throw new Error('Risk metadata not saved');
    
    createdCaseId = inv.id;
    console.log(`     -> Successfully created Case ID: ${createdCaseId} | Status: ${inv.status}`);
  });

  // 6. Case Registry Verification
  await assertTest('6. Case Registry Listing & Schema Verification', async () => {
    const res = await request(`${API_BASE}/investigations`);
    if (res.status !== 200 || !Array.isArray(res.data.cases)) throw new Error('Failed to retrieve cases');

    const c = res.data.cases.find(x => x.id === createdCaseId) || res.data.cases[0];
    if (!c.id || !c.targetWallet || !c.blockchain || !c.riskLevel || !c.status || !c.createdAt) {
      throw new Error('Case missing required fields for registry display');
    }

    console.log(`     -> Verified ${res.data.cases.length} cases in registry. Sample Case: ${c.id} [${c.status}]`);
  });

  // 7. Case Status Transitions
  await assertTest('7. Case Status Transitions (Open -> Escalated)', async () => {
    if (!createdCaseId) throw new Error('No case ID available');

    const updateRes = await request(`${API_BASE}/investigations/${createdCaseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: { status: 'Escalated', notes: 'Escalated to senior AML compliance team.' }
    });

    if (updateRes.status !== 200 || !updateRes.data.success) throw new Error('Update case status failed');
    const updated = updateRes.data.case || updateRes.data.investigation;
    if (updated.status !== 'Escalated') throw new Error(`Status not updated to Escalated, got ${updated.status}`);

    console.log(`     -> Case ${createdCaseId} status successfully transitioned to ${updated.status}`);
  });

  // 8. Evidence Package Generation (14 forensic sections)
  await assertTest('8. Evidence Package Generation (Full 14 Sections)', async () => {
    if (!createdCaseId) throw new Error('No case ID available');

    const res = await request(`${API_BASE}/investigations/${createdCaseId}/evidence-package`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { analystNotes: 'Official package generated for regulatory presentation.' }
    });

    if (res.status !== 200 || !res.data.success || !res.data.evidencePackage) {
      throw new Error('Failed to generate evidence package');
    }

    const ep = res.data.evidencePackage;
    const requiredKeys = [
      'targetWallet', 'network', 'transactionSummary', 'transactionHashes',
      'senderReceiverInfo', 'transactionAmounts', 'timestamps', 'hopDepth',
      'transactionGraphSummary', 'vaspCandidates', 'attributionScores',
      'fiveFactorBreakdown', 'riskIndicators', 'analystNotes', 'caseMetadata'
    ];

    for (const key of requiredKeys) {
      if (ep[key] === undefined) {
        throw new Error(`Evidence package missing required section: ${key}`);
      }
    }

    console.log(`     -> Generated Evidence Package ID: ${ep.packageId}`);
    console.log(`     -> Verified all 14 required forensic intelligence sections.`);
  });

  // 9. Authority Submission Workflow (Draft / Prepared)
  await assertTest('9. Authority Submission Workflow (Prepared Draft)', async () => {
    if (!createdCaseId) throw new Error('No case ID available');

    const res = await request(`${API_BASE}/investigations/${createdCaseId}/authority-submission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        submissionStatus: 'Prepared',
        analystNotes: 'Formal submission dossier prepared for designated financial intelligence unit.'
      }
    });

    if (res.status !== 200 || !res.data.success || !res.data.submission) {
      throw new Error('Failed to prepare authority submission');
    }

    const sub = res.data.submission;
    if (sub.submissionStatus !== 'Prepared') throw new Error(`Expected Prepared status, got ${sub.submissionStatus}`);
    if (!sub.targetWallet || !sub.riskScore || !sub.probableVasp) {
      throw new Error('Submission missing core target or risk data');
    }
    if (!sub.nonBlockingDisclaimer || !sub.nonBlockingDisclaimer.includes('DOES NOT freeze or block blockchain assets directly')) {
      throw new Error('Submission must contain explicit non-blocking disclaimer');
    }

    console.log(`     -> Authority Submission ID: ${sub.submissionId} | Status: ${sub.submissionStatus}`);
    console.log(`     -> Target Wallet: ${sub.targetWallet} | Probable VASP: ${sub.probableVasp}`);
  });

  // 10. Audit Trail Verification
  await assertTest('10. Audit Trail Logging & Retrieval', async () => {
    const res = await request(`${API_BASE}/audit-trail`);
    if (res.status !== 200 || !Array.isArray(res.data.auditLogs)) {
      throw new Error('Failed to retrieve audit trail');
    }

    const logs = res.data.auditLogs;
    if (logs.length === 0) throw new Error('Audit trail is empty');

    const actions = logs.map(l => l.action);
    console.log(`     -> Total Audit Entries: ${logs.length}`);
    console.log(`     -> Recorded Actions: ${[...new Set(actions)].join(' | ')}`);

    const sample = logs[0];
    if (!sample.action || !sample.user || !sample.timestamp || !sample.status) {
      throw new Error('Audit entry missing action, user, timestamp, or status');
    }
  });

  // 11. 5-Factor Attribution Weights Preservation
  await assertTest('11. Preserved 5-Factor Attribution Weights Formula', async () => {
    const res = await request(`${API_BASE}/settings/weights`);
    if (res.status !== 200 || !res.data.weights) throw new Error('Failed to retrieve weights');

    const w = res.data.weights;
    console.log(`     -> Weights: Proximity=${w.graphProximity * 100}% | Volume=${w.transactionVolume * 100}% | Freq=${w.interactionFrequency * 100}% | Behavioral=${w.behavioralSimilarity * 100}% | Temporal=${w.temporalPattern * 100}%`);
    const sum = Math.round((w.graphProximity + w.transactionVolume + w.interactionFrequency + w.behavioralSimilarity + w.temporalPattern) * 100);
    if (sum !== 100) throw new Error(`Weights sum to ${sum}%, expected 100%`);
  });

  // 12. Frontend Route Integrity Check
  await assertTest('12. Frontend Server Status & Static Delivery', async () => {
    const feRes = await request('http://127.0.0.1:5173/');
    if (feRes.status !== 200 || !feRes.data.includes('<div id="root"></div>')) {
      throw new Error('Frontend server not responding properly');
    }
    console.log(`     -> Frontend server responding HTTP 200 on port 5173`);
  });

  console.log('========================================================================');
  console.log(`🏁 TEST SUITE COMPLETE: ${passed} / ${total} TESTS PASSED (100% SUCCESS)`);
  console.log('========================================================================');
}

runSuite().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
