#!/usr/bin/env node
/**
 * CRYPTO-NEX Terminal CLI — SIH 2026
 * ─────────────────────────────────────
 * Usage:
 *   node cli.js analyze <address>
 *   node cli.js presets
 *   node cli.js report <address>
 *   node cli.js live <address>
 *   node cli.js help
 */

const http = require('http');
const https = require('https');

const BACKEND_BASE = 'http://localhost:5000/api';
const BLOCKSCOUT = 'https://eth.blockscout.com';
const COINGECKO  = 'https://api.coingecko.com/api/v3';

// ─── Colors & Helpers ────────────────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  blue:   '\x1b[34m',
  magenta:'\x1b[35m',
  white:  '\x1b[97m',
  gray:   '\x1b[90m',
  bgCyan: '\x1b[46m\x1b[30m',
};

const line  = () => console.log(c.gray + '─'.repeat(70) + c.reset);
const dline = () => console.log(c.cyan + '═'.repeat(70) + c.reset);

function bar(pct, width = 30) {
  const filled = Math.round(pct / 100 * width);
  const empty  = width - filled;
  return c.cyan + '█'.repeat(filled) + c.gray + '░'.repeat(empty) + c.reset;
}

function pct(n) {
  return (n * 100).toFixed(1) + '%';
}

// ─── HTTP GET helper ──────────────────────────────────────────────────────────
function get(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: 8000, headers: { 'Accept': 'application/json', 'User-Agent': 'crypto-nex-cli/1.0' } }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid JSON from ' + url)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
  });
}

function post(url, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const opts = new URL(url);
    const options = {
      hostname: opts.hostname,
      port: opts.port || 5000,
      path: opts.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid JSON')); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ─── BANNER ──────────────────────────────────────────────────────────────────
function banner() {
  console.log('');
  dline();
  console.log(c.bold + c.cyan + '  ██████╗██████╗ ██╗   ██╗██████╗ ████████╗ ██████╗       ███╗   ██╗███████╗██╗  ██╗' + c.reset);
  console.log(c.cyan +           ' ██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝██╔═══██╗      ████╗  ██║██╔════╝╚██╗██╔╝' + c.reset);
  console.log(c.bold + c.white + ' ██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║   ██║   ██║      ██╔██╗ ██║█████╗   ╚███╔╝ ' + c.reset);
  console.log(c.gray +           ' ██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║   ██║   ██║      ██║╚██╗██║██╔══╝   ██╔██╗ ' + c.reset);
  console.log(c.cyan +           ' ╚██████╗██║  ██║   ██║   ██║        ██║   ╚██████╔╝      ██║ ╚████║███████╗██╔╝ ██╗' + c.reset);
  console.log(c.gray +           '  ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝        ╚═╝    ╚═════╝       ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝' + c.reset);
  console.log('');
  console.log(c.bold + '  Blockchain Intelligence for Automated VASP Attribution' + c.reset + c.gray + '  |  SIH 2026' + c.reset);
  dline();
  console.log('');
}

// ─── CMD: help ────────────────────────────────────────────────────────────────
function cmdHelp() {
  banner();
  console.log(c.bold + '  COMMANDS:' + c.reset);
  console.log('');
  console.log(c.cyan + '  analyze  ' + c.reset + '<address>   Run full forensic VASP attribution on a wallet');
  console.log(c.cyan + '  presets  ' + c.reset + '            List all real-data and benchmark test cases');
  console.log(c.cyan + '  report   ' + c.reset + '<address>   Generate a printable investigation dossier');
  console.log(c.cyan + '  live     ' + c.reset + '<address>   Fetch real-time on-chain data (Blockscout)');
  console.log(c.cyan + '  help     ' + c.reset + '            Show this help screen');
  console.log('');
  console.log(c.bold + '  EXAMPLES:' + c.reset);
  console.log('');
  console.log(c.gray + '  # Analyze Vitalik\'s wallet (real mainnet record):');
  console.log(c.white + '  node cli.js analyze 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' + c.reset);
  console.log('');
  console.log(c.gray + '  # Analyze Binance deposit sweeper (real mainnet record):');
  console.log(c.white + '  node cli.js analyze 0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE' + c.reset);
  console.log('');
  console.log(c.gray + '  # Analyze any arbitrary address:');
  console.log(c.white + '  node cli.js analyze 0x742d35Cc6634C0532925a3b844Bc454e4438f44e' + c.reset);
  console.log('');
  console.log(c.gray + '  # See all forensic case presets:');
  console.log(c.white + '  node cli.js presets' + c.reset);
  console.log('');
}

// ─── CMD: presets ─────────────────────────────────────────────────────────────
async function cmdPresets() {
  banner();
  console.log(c.bold + '  FORENSIC CASE PRESETS' + c.reset);
  line();

  let presets;
  try {
    const res = await get(`${BACKEND_BASE}/presets`);
    presets = res.presets;
  } catch (e) {
    console.error(c.red + '  ✗ Could not connect to backend (is it running on :5000?)' + c.reset);
    process.exit(1);
  }

  for (const p of presets) {
    const tag = p.is_real_data
      ? c.green  + ' 🟢 REAL MAINNET'  + c.reset
      : c.yellow + ' 🟡 BENCHMARK DEMO' + c.reset;

    console.log('');
    console.log(c.bold + c.white + `  ${p.name}` + c.reset + tag);
    console.log(c.gray + `  Address:  ` + c.cyan + p.address + c.reset);
    console.log(c.gray + `  Expected: ` + c.white + p.expected_top_vasp + c.reset);
    console.log(c.gray + `  Tags:     ` + p.tags.map(t => c.blue + t + c.reset).join(', '));
    console.log(c.dim  + `  ${p.description}` + c.reset);
  }

  console.log('');
  line();
  console.log(c.gray + `  Total: ${presets.length} case presets` + c.reset);
  console.log('');
}

// ─── CMD: live ────────────────────────────────────────────────────────────────
async function cmdLive(address) {
  banner();
  console.log(c.bold + '  LIVE BLOCKSCOUT ON-CHAIN LOOKUP' + c.reset);
  console.log(c.gray + `  Address: ${address}` + c.reset);
  line();

  try {
    // Fetch from Blockscout
    const [addrInfo, ethPrice] = await Promise.allSettled([
      get(`${BLOCKSCOUT}/api/v2/addresses/${address}`),
      get(`${COINGECKO}/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true`)
    ]);

    if (addrInfo.status === 'fulfilled') {
      const d = addrInfo.value;
      const balEth = (parseFloat(d.coin_balance ?? '0') / 1e18).toFixed(6);
      let ethUsd = 3200;
      if (ethPrice.status === 'fulfilled') ethUsd = ethPrice.value?.ethereum?.usd ?? 3200;
      const balUsd = (parseFloat(balEth) * ethUsd).toFixed(2);

      console.log('');
      console.log(c.bold + '  ADDRESS PROFILE (Source: Blockscout Ethereum Mainnet)' + c.reset);
      console.log('');
      console.log(`  ${c.gray}Balance:       ${c.white}${balEth} ETH${c.gray}  (≈ $${balUsd} USD)${c.reset}`);
      console.log(`  ${c.gray}Transactions:  ${c.white}${parseInt(d.transactions_count ?? 0).toLocaleString()}${c.reset}`);
      console.log(`  ${c.gray}Token Txs:     ${c.white}${parseInt(d.token_transfers_count ?? 0).toLocaleString()}${c.reset}`);
      console.log(`  ${c.gray}Type:          ${c.white}${d.is_contract ? '📄 Smart Contract' : '👤 EOA Wallet'}${c.reset}`);
      if (d.is_verified) console.log(`  ${c.gray}Verified:      ${c.green}✓ Source code verified${c.reset}`);
      if (d.name) console.log(`  ${c.gray}Label:         ${c.yellow}🏷  ${d.name}${c.reset}`);

      // Fetch recent txs
      try {
        const txRes = await get(`${BLOCKSCOUT}/api/v2/addresses/${address}/transactions?filter=to%20%7C%20from&limit=5`);
        const txs = txRes.items ?? [];
        if (txs.length > 0) {
          console.log('');
          console.log(c.bold + '  RECENT TRANSACTIONS (Live from Blockscout):' + c.reset);
          line();
          for (const tx of txs) {
            const isOut = (tx.from?.hash ?? '').toLowerCase() === address.toLowerCase();
            const val = (parseFloat(tx.value ?? '0') / 1e18).toFixed(6);
            const dir = isOut ? c.red + '↑ OUT' : c.green + '↓ IN ';
            const hash = tx.hash.substring(0, 20) + '...';
            const ts = new Date(tx.timestamp).toLocaleString();
            console.log(`  ${dir} ${c.reset}${c.gray}${hash}${c.reset}  ${isOut ? c.red : c.green}${val} ETH${c.reset}  ${c.gray}${ts}${c.reset}`);
          }
        }
      } catch {}

      console.log('');
      console.log(c.gray + `  🔗 View on Blockscout: https://eth.blockscout.com/address/${address}` + c.reset);
    } else {
      console.log(c.yellow + '  ⚠ Blockscout API unavailable. Try again later or check your internet connection.' + c.reset);
    }
  } catch (e) {
    console.error(c.red + '  ✗ Error: ' + e.message + c.reset);
  }

  console.log('');
}

// ─── CMD: analyze ─────────────────────────────────────────────────────────────
async function cmdAnalyze(address) {
  banner();
  console.log(c.bold + '  FORENSIC WALLET ANALYSIS' + c.reset);
  console.log(c.gray + `  Target: ${address}` + c.reset);
  line();

  let result;
  try {
    console.log(c.cyan + '  ⟳ Connecting to CRYPTO-NEX backend...' + c.reset);
    result = await post(`${BACKEND_BASE}/analyze-wallet`, { address });
    console.log(c.green + '  ✓ Analysis complete\n' + c.reset);
  } catch (e) {
    console.error(c.red + `  ✗ Backend error: ${e.message}` + c.reset);
    console.error(c.gray + '  Hint: Make sure the backend is running → node cli.js is meant to run alongside start_all.bat' + c.reset);
    process.exit(1);
  }

  const { wallet, attribution, transactions, is_demo_data, data_source } = result;

  // Data source badge
  const dsBadge = {
    LIVE_MAINNET_EXPLORER:  c.green  + ' 🟢 REAL · LIVE MAINNET EXPLORER'   + c.reset,
    LIVE_MAINNET_RPC:       c.green  + ' 🟢 REAL · ETHEREUM MAINNET RPC'    + c.reset,
    REAL_HISTORICAL_RECORD: c.blue   + ' 🔵 REAL · VERIFIED ON-CHAIN RECORD' + c.reset,
    BENCHMARK_DEMO:         c.yellow + ' 🟡 SIMULATED · BENCHMARK DEMO'      + c.reset,
  }[data_source] ?? c.gray + ' ⚪ UNKNOWN';

  console.log(c.bold + '  DATA SOURCE:' + c.reset + dsBadge);
  console.log('');

  // Wallet Overview
  console.log(c.bold + '  WALLET OVERVIEW' + c.reset);
  line();
  console.log(`  ${c.gray}Address:    ${c.cyan}${wallet.address}${c.reset}`);
  console.log(`  ${c.gray}Balance:    ${c.white}${wallet.balance_eth.toFixed(6)} ETH${c.reset}`);
  console.log(`  ${c.gray}Tx Count:   ${c.white}${wallet.tx_count}${c.reset}`);
  console.log(`  ${c.gray}Vol In:     ${c.green}+${wallet.total_volume_in.toFixed(4)} ETH${c.reset}`);
  console.log(`  ${c.gray}Vol Out:    ${c.red}-${wallet.total_volume_out.toFixed(4)} ETH${c.reset}`);
  console.log(`  ${c.gray}First Seen: ${c.white}${new Date(wallet.first_activity).toLocaleString()}${c.reset}`);
  console.log(`  ${c.gray}Last Seen:  ${c.white}${new Date(wallet.last_activity).toLocaleString()}${c.reset}`);
  console.log(`  ${c.gray}Type:       ${c.white}${wallet.is_contract ? 'Smart Contract' : 'EOA Wallet'}${c.reset}`);

  // VASP Attribution Results
  console.log('');
  console.log(c.bold + '  VASP ATTRIBUTION RESULTS' + c.reset);
  dline();

  const ranked = attribution.ranked_vasps || [];
  if (ranked.length === 0) {
    console.log(c.gray + '  No VASPs identified.' + c.reset);
  } else {
    const topMatch = attribution.top_match || ranked[0];
    console.log('');
    console.log(c.bold + c.green + `  🏆 TOP MATCH: ${topMatch.vasp_name}` + c.reset);
    console.log(c.bold + c.white + `     Confidence: ${pct(topMatch.confidence_score)}` + c.reset);
    console.log('');
    line();

    for (let i = 0; i < Math.min(ranked.length, 6); i++) {
      const v = ranked[i];
      const score = (v.confidence_score * 100).toFixed(1);
      const medal = ['🥇', '🥈', '🥉', '  4.', '  5.', '  6.'][i] || `  ${i+1}.`;
      console.log('');
      console.log(`  ${medal} ${c.bold}${v.vasp_name}${c.reset}  ${c.gray}(${v.vasp_id})${c.reset}`);
      console.log(`     ${bar(parseFloat(score))} ${c.bold}${score}%${c.reset}`);

      // Evidence breakdown
      const ev = v.evidence_factors || {};
      const factors = [
        ['Graph Proximity',       ev.graph_proximity],
        ['Transaction Volume',    ev.transaction_volume],
        ['Interaction Frequency', ev.interaction_frequency],
        ['Behavioral Similarity', ev.behavioral_similarity],
        ['Temporal Pattern',      ev.temporal_pattern],
      ];

      for (const [name, val] of factors) {
        if (val !== undefined) {
          const s = (val * 100).toFixed(0);
          console.log(`     ${c.gray}${name.padEnd(24)} ${bar(parseFloat(s), 16)} ${s}%${c.reset}`);
        }
      }
    }
  }

  // Transaction Summary
  console.log('');
  console.log(c.bold + '  TRANSACTION TRAIL' + c.reset);
  line();

  const txLimit = Math.min(transactions.length, 8);
  for (let i = 0; i < txLimit; i++) {
    const tx = transactions[i];
    const isOut = tx.from_address.toLowerCase() === address.toLowerCase();
    const dir = isOut ? c.red + '↑ OUT' : c.green + '↓ IN ';
    const hash = tx.tx_hash.substring(0, 18) + '...' + tx.tx_hash.slice(-6);
    const peer = isOut ? tx.to_address : tx.from_address;
    const peerShort = peer.substring(0, 8) + '...' + peer.slice(-6);
    console.log(`  ${dir}${c.reset}  ${c.gray}${hash}${c.reset}  ${isOut ? c.red : c.green}${tx.value.toFixed(4)} ${tx.token_symbol}${c.reset}  ${c.gray}→ ${peerShort}${c.reset}`);
  }
  if (transactions.length > txLimit) {
    console.log(c.gray + `  ... and ${transactions.length - txLimit} more transactions` + c.reset);
  }

  // Graph Metrics
  const metrics = result.graph?.metrics;
  if (metrics) {
    console.log('');
    console.log(c.bold + '  GRAPH TOPOLOGY' + c.reset);
    line();
    console.log(`  ${c.gray}Nodes:         ${c.white}${result.graph.nodes?.length ?? 0}${c.reset}`);
    console.log(`  ${c.gray}Edges:         ${c.white}${result.graph.edges?.length ?? 0}${c.reset}`);
    console.log(`  ${c.gray}Max Hops:      ${c.white}${metrics.max_hops}${c.reset}`);
    console.log(`  ${c.gray}Density:       ${c.white}${(metrics.density || 0).toFixed(4)}${c.reset}`);
    console.log(`  ${c.gray}Unique Peers:  ${c.white}${metrics.unique_counterparties}${c.reset}`);
    console.log(`  ${c.gray}VASP Nodes:    ${c.white}${metrics.vasp_nodes_found}${c.reset}`);
  }

  console.log('');
  dline();
  console.log(c.gray + `  Engine: ${attribution.is_python_engine ? 'Python NetworkX + ML' : 'Native Forensics Heuristic'}` + c.reset);
  console.log(c.gray + `  Investigation ID: ${result.investigation_id ?? 'N/A'}` + c.reset);
  console.log(c.gray + `  Web UI: http://localhost:5173` + c.reset);
  console.log('');
}

// ─── CMD: report ──────────────────────────────────────────────────────────────
async function cmdReport(address) {
  banner();
  console.log(c.bold + '  INVESTIGATION DOSSIER REPORT' + c.reset);
  line();

  let result;
  try {
    result = await post(`${BACKEND_BASE}/analyze-wallet`, { address });
  } catch (e) {
    console.error(c.red + '  ✗ Backend error: ' + e.message + c.reset);
    process.exit(1);
  }

  const { wallet, attribution, transactions, data_source } = result;
  const top = attribution.top_match || attribution.ranked_vasps[0];
  const now = new Date().toISOString();

  console.log('');
  console.log(c.bold + '╔══════════════════════════════════════════════════════════════════════╗' + c.reset);
  console.log(c.bold + '║            CRYPTO-NEX FORENSIC INVESTIGATION REPORT                  ║' + c.reset);
  console.log(c.bold + '║                         SIH 2026 SUBMISSION                          ║' + c.reset);
  console.log(c.bold + '╚══════════════════════════════════════════════════════════════════════╝' + c.reset);
  console.log('');
  console.log(`  Report Generated : ${now}`);
  console.log(`  Target Wallet    : ${wallet.address}`);
  console.log(`  Blockchain       : Ethereum Mainnet`);
  console.log(`  Data Source      : ${data_source}`);
  console.log(`  Analysis Engine  : ${attribution.is_python_engine ? 'Python NetworkX + ML Ensemble' : 'Native Forensics Heuristic'}`);
  console.log('');
  line();
  console.log(c.bold + '  SECTION 1: WALLET METRICS' + c.reset);
  line();
  console.log(`  Balance               : ${wallet.balance_eth.toFixed(6)} ETH`);
  console.log(`  Total Transactions    : ${wallet.tx_count}`);
  console.log(`  Total Volume Inflow   : ${wallet.total_volume_in.toFixed(4)} ETH`);
  console.log(`  Total Volume Outflow  : ${wallet.total_volume_out.toFixed(4)} ETH`);
  console.log(`  First Activity        : ${wallet.first_activity}`);
  console.log(`  Last Activity         : ${wallet.last_activity}`);
  console.log(`  Is Contract           : ${wallet.is_contract}`);
  console.log('');
  line();
  console.log(c.bold + '  SECTION 2: VASP ATTRIBUTION' + c.reset);
  line();
  if (top) {
    console.log(`  PRIMARY VASP         : ${top.vasp_name}`);
    console.log(`  CONFIDENCE SCORE     : ${pct(top.confidence_score)}`);
    console.log('');
    console.log('  FULL RANKED LIST:');
    for (const v of attribution.ranked_vasps) {
      console.log(`    ${v.vasp_name.padEnd(28)} ${pct(v.confidence_score)}`);
    }
  }
  console.log('');
  line();
  console.log(c.bold + '  SECTION 3: EVIDENCE FACTORS' + c.reset);
  line();
  if (top?.evidence_factors) {
    const ev = top.evidence_factors;
    console.log(`  Graph Proximity       : ${pct(ev.graph_proximity ?? 0)}`);
    console.log(`  Transaction Volume    : ${pct(ev.transaction_volume ?? 0)}`);
    console.log(`  Interaction Frequency : ${pct(ev.interaction_frequency ?? 0)}`);
    console.log(`  Behavioral Similarity : ${pct(ev.behavioral_similarity ?? 0)}`);
    console.log(`  Temporal Pattern      : ${pct(ev.temporal_pattern ?? 0)}`);
  }
  console.log('');
  line();
  console.log(c.bold + '  SECTION 4: TRANSACTION TRAIL (all)' + c.reset);
  line();
  for (const tx of transactions) {
    const isOut = tx.from_address.toLowerCase() === address.toLowerCase();
    const dir = isOut ? 'OUT' : 'IN ';
    const peer = isOut ? tx.to_address : tx.from_address;
    console.log(`  [${dir}] Hash: ${tx.tx_hash}`);
    console.log(`        Peer: ${peer}`);
    console.log(`        Amt : ${tx.value} ${tx.token_symbol}  Block: ${tx.block_number}  ${tx.timestamp}`);
    console.log('');
  }
  line();
  console.log(c.bold + '  END OF REPORT — CRYPTO-NEX SIH 2026' + c.reset);
  console.log('');
}

// ─── Main Dispatch ────────────────────────────────────────────────────────────
async function main() {
  const [,, cmd, arg] = process.argv;

  switch ((cmd || '').toLowerCase()) {
    case 'analyze':
      if (!arg) { console.error(c.red + '  ✗ Usage: node cli.js analyze <address>' + c.reset); process.exit(1); }
      await cmdAnalyze(arg);
      break;
    case 'presets':
      await cmdPresets();
      break;
    case 'report':
      if (!arg) { console.error(c.red + '  ✗ Usage: node cli.js report <address>' + c.reset); process.exit(1); }
      await cmdReport(arg);
      break;
    case 'live':
      if (!arg) { console.error(c.red + '  ✗ Usage: node cli.js live <address>' + c.reset); process.exit(1); }
      await cmdLive(arg);
      break;
    default:
      cmdHelp();
  }
}

main().catch(e => {
  console.error(c.red + '\n  ✗ Fatal: ' + e.message + c.reset);
  process.exit(1);
});
