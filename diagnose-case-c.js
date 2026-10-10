const http = require('http');

async function testCase(address) {
  const postData = JSON.stringify({ address });
  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/analyze-wallet',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('Testing Case C (0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE)...');
  const resC = await testCase('0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE');
  console.log('Case C Analyzed Address:', resC.address);
  console.log('Case C Top VASP:', resC.attribution.mostLikelyVasp.vasp.name);
  console.log('Case C Score:', resC.attribution.mostLikelyVasp.score);
  console.log('Case C Top 3 Rankings:', resC.attribution.rankings.slice(0, 3).map(r => `${r.vasp.name}: ${r.score}%`));
  console.log('Case C Transactions Count:', resC.transactions.length);
  console.log('Case C First 3 TX counterparties:', resC.transactions.slice(0, 3).map(t => ({ from: t.fromAddress, to: t.toAddress, value: t.value })));
}

run().catch(console.error);
