const http = require('http');

async function testWallet(address, caseId) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ address, caseId });
    const req = http.request(
      'http://127.0.0.1:5000/api/analyze-wallet',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      },
      (res) => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(body));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('Testing Cases A through E against backend API:');
  const cases = [
    { name: 'Case A', address: '0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361', expectedVasp: 'Binance' },
    { name: 'Case B', address: '0x4e83362442b8d1bec281594cea3050c8eb01311c', expectedVasp: 'Coinbase' },
    { name: 'Case C', address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', expectedVasp: 'Kraken' },
    { name: 'Case D', address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', expectedVasp: 'Binance' },
    { name: 'Case E', address: '0x1ad91ee08f21be3de0ba2ba69187123214444444', expectedVasp: 'Binance' }
  ];

  for (const c of cases) {
    const res = await testWallet(c.address, c.name.toLowerCase().replace(' ', '-'));
    const topVasp = res.attribution?.mostLikelyVasp?.vasp?.name;
    const score = res.attribution?.mostLikelyVasp?.score;
    const runnerUp = res.attribution?.rankings?.[1] ? `${res.attribution.rankings[1].vasp.name} (${res.attribution.rankings[1].score}%)` : 'none';
    const riskLevel = res.attribution?.riskAssessment?.riskLevel;
    const riskScore = res.attribution?.riskAssessment?.riskScore;
    console.log(`[${c.name}] Target: ${c.address}`);
    console.log(`  Top VASP: ${topVasp} (Score: ${score}%) | Runner-up: ${runnerUp}`);
    console.log(`  Risk: ${riskLevel} (${riskScore}/100) | AnalysisId: ${res.analysisId} | CaseId: ${res.caseId}`);
    console.log(`  Nodes: ${res.graph?.nodes?.length} | Txs: ${res.transactions?.length}`);
    console.log('---');
  }
}

run().catch(console.error);
