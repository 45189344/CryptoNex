import { VASP, VASPAddress, ScoringWeights, PresetWallet } from '../types';

export const SEED_VASPS: VASP[] = [
  {
    id: 'vasp-binance',
    name: 'Binance',
    type: 'CEX',
    country: 'Global / Cayman Islands',
    website: 'https://www.binance.com',
    riskRating: 'LOW',
    description: 'World largest cryptocurrency exchange by trading volume. Operates centralized orderbooks, hot/cold custody, and automated deposit sweeping engines.',
    isVerified: true,
    totalIdentifiedAddresses: 1420
  },
  {
    id: 'vasp-coinbase',
    name: 'Coinbase',
    type: 'CEX',
    country: 'United States',
    website: 'https://www.coinbase.com',
    riskRating: 'LOW',
    description: 'US-regulated and publicly traded (NASDAQ: COIN) virtual asset service provider. Distinctive institutional hot wallets and prime custody segregation.',
    isVerified: true,
    totalIdentifiedAddresses: 980
  },
  {
    id: 'vasp-kraken',
    name: 'Kraken',
    type: 'CEX',
    country: 'United States',
    website: 'https://www.kraken.com',
    riskRating: 'LOW',
    description: 'Major US-headquartered digital asset exchange established in 2011. Employs multi-sig treasury clusters and automated settlement sweepers.',
    isVerified: true,
    totalIdentifiedAddresses: 540
  },
  {
    id: 'vasp-okx',
    name: 'OKX',
    type: 'CEX',
    country: 'Seychelles',
    website: 'https://www.okx.com',
    riskRating: 'LOW',
    description: 'Global crypto exchange and Web3 infrastructure provider. High-throughput hot wallet clusters across EVM chains.',
    isVerified: true,
    totalIdentifiedAddresses: 620
  },
  {
    id: 'vasp-bybit',
    name: 'Bybit',
    type: 'CEX',
    country: 'United Arab Emirates (Dubai)',
    website: 'https://www.bybit.com',
    riskRating: 'LOW',
    description: 'Cryptocurrency derivatives and spot exchange headquartered in Dubai with extensive international user base.',
    isVerified: true,
    totalIdentifiedAddresses: 410
  },
  {
    id: 'vasp-kucoin',
    name: 'KuCoin',
    type: 'CEX',
    country: 'Seychelles',
    website: 'https://www.kucoin.com',
    riskRating: 'MEDIUM',
    description: 'Global cryptocurrency exchange supporting large altcoin catalog and multi-chain deposit routing.',
    isVerified: true,
    totalIdentifiedAddresses: 380
  },
  {
    id: 'vasp-uniswap',
    name: 'Uniswap Protocol',
    type: 'DEX',
    country: 'Decentralized',
    website: 'https://uniswap.org',
    riskRating: 'LOW',
    description: 'Decentralized automated market maker (AMM) protocol on Ethereum. Non-custodial router and pool smart contracts.',
    isVerified: true,
    totalIdentifiedAddresses: 250
  },
  {
    id: 'vasp-mixer-highrisk',
    name: 'Tornado.Cash (Mixer - Sanctioned Entity)',
    type: 'MIXER_HIGH_RISK',
    country: 'Decentralized / OFAC Sanctioned',
    website: 'https://tornado.cash',
    riskRating: 'SANCTIONED',
    description: 'Privacy pool protocol utilizing zero-knowledge proofs. Subject to international sanctions. Proximity triggers high risk intelligence flags.',
    isVerified: true,
    totalIdentifiedAddresses: 180
  }
];

export const SEED_VASP_ADDRESSES: VASPAddress[] = [
  // --- BINANCE (Public Verified) ---
  {
    id: 'addr-bin-1',
    vaspId: 'vasp-binance',
    blockchain: 'ethereum',
    address: '0x28c6c06298d514db089934071355e5743bf21d60',
    addressType: 'HOT_WALLET',
    source: 'Etherscan / Public Label (Binance 14)',
    sourceType: 'PUBLIC_REGISTRY',
    confidence: 0.999,
    verificationStatus: 'VERIFIED_PUBLIC',
    lastVerifiedDate: '2026-08-15T00:00:00Z',
    isDemoData: false
  },
  {
    id: 'addr-bin-2',
    vaspId: 'vasp-binance',
    blockchain: 'ethereum',
    address: '0x21a31ee1afc51d94c2efccaa2092ad1028285549',
    addressType: 'HOT_WALLET',
    source: 'Etherscan / Public Label (Binance 15)',
    sourceType: 'PUBLIC_REGISTRY',
    confidence: 0.999,
    verificationStatus: 'VERIFIED_PUBLIC',
    lastVerifiedDate: '2026-08-15T00:00:00Z',
    isDemoData: false
  },
  {
    id: 'addr-bin-3',
    vaspId: 'vasp-binance',
    blockchain: 'ethereum',
    address: '0xdfd5293d8e347dfee59e53b24f800efab988696c',
    addressType: 'HOT_WALLET',
    source: 'Etherscan / Public Label (Binance 16)',
    sourceType: 'PUBLIC_REGISTRY',
    confidence: 0.999,
    verificationStatus: 'VERIFIED_PUBLIC',
    lastVerifiedDate: '2026-08-15T00:00:00Z',
    isDemoData: false
  },
  {
    id: 'addr-bin-4',
    vaspId: 'vasp-binance',
    blockchain: 'ethereum',
    address: '0xf977814e90da44bfa03b6295a0616a897441acec',
    addressType: 'HOT_WALLET',
    source: 'Etherscan / Public Label (Binance 8)',
    sourceType: 'PUBLIC_REGISTRY',
    confidence: 0.995,
    verificationStatus: 'VERIFIED_PUBLIC',
    lastVerifiedDate: '2026-08-10T00:00:00Z',
    isDemoData: false
  },
  {
    id: 'addr-bin-sim-1',
    vaspId: 'vasp-binance',
    blockchain: 'ethereum',
    address: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be',
    addressType: 'DEPOSIT_WALLET',
    source: 'Synthetically Tagged Cluster (Deposit Sweeper)',
    sourceType: 'HEURISTIC_CLUSTER',
    confidence: 0.940,
    verificationStatus: 'DEMO_SIMULATION',
    lastVerifiedDate: '2026-09-01T00:00:00Z',
    isDemoData: true
  },

  // --- COINBASE (Public Verified) ---
  {
    id: 'addr-cb-1',
    vaspId: 'vasp-coinbase',
    blockchain: 'ethereum',
    address: '0x71660c4005ba85c37ccec55d0c4493e66fe775d3',
    addressType: 'HOT_WALLET',
    source: 'Etherscan / Public Label (Coinbase 2)',
    sourceType: 'PUBLIC_REGISTRY',
    confidence: 0.999,
    verificationStatus: 'VERIFIED_PUBLIC',
    lastVerifiedDate: '2026-08-12T00:00:00Z',
    isDemoData: false
  },
  {
    id: 'addr-cb-2',
    vaspId: 'vasp-coinbase',
    blockchain: 'ethereum',
    address: '0x503828976d22510aad0201ac7ec88293211d23da',
    addressType: 'HOT_WALLET',
    source: 'Etherscan / Public Label (Coinbase 4)',
    sourceType: 'PUBLIC_REGISTRY',
    confidence: 0.999,
    verificationStatus: 'VERIFIED_PUBLIC',
    lastVerifiedDate: '2026-08-12T00:00:00Z',
    isDemoData: false
  },
  {
    id: 'addr-cb-3',
    vaspId: 'vasp-coinbase',
    blockchain: 'ethereum',
    address: '0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740',
    addressType: 'HOT_WALLET',
    source: 'Etherscan / Public Label (Coinbase 1)',
    sourceType: 'PUBLIC_REGISTRY',
    confidence: 0.998,
    verificationStatus: 'VERIFIED_PUBLIC',
    lastVerifiedDate: '2026-08-12T00:00:00Z',
    isDemoData: false
  },

  // --- KRAKEN (Public Verified) ---
  {
    id: 'addr-kr-1',
    vaspId: 'vasp-kraken',
    blockchain: 'ethereum',
    address: '0x2910543af39aba0cd09dbb2d50200b3e800a63d2',
    addressType: 'HOT_WALLET',
    source: 'Etherscan / Public Label (Kraken 1)',
    sourceType: 'PUBLIC_REGISTRY',
    confidence: 0.999,
    verificationStatus: 'VERIFIED_PUBLIC',
    lastVerifiedDate: '2026-08-14T00:00:00Z',
    isDemoData: false
  },
  {
    id: 'addr-kr-2',
    vaspId: 'vasp-kraken',
    blockchain: 'ethereum',
    address: '0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13',
    addressType: 'HOT_WALLET',
    source: 'Etherscan / Public Label (Kraken 4)',
    sourceType: 'PUBLIC_REGISTRY',
    confidence: 0.997,
    verificationStatus: 'VERIFIED_PUBLIC',
    lastVerifiedDate: '2026-08-14T00:00:00Z',
    isDemoData: false
  },

  // --- OKX (Public Verified) ---
  {
    id: 'addr-okx-1',
    vaspId: 'vasp-okx',
    blockchain: 'ethereum',
    address: '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b',
    addressType: 'HOT_WALLET',
    source: 'Etherscan / Public Label (OKX 1)',
    sourceType: 'PUBLIC_REGISTRY',
    confidence: 0.998,
    verificationStatus: 'VERIFIED_PUBLIC',
    lastVerifiedDate: '2026-08-10T00:00:00Z',
    isDemoData: false
  },
  {
    id: 'addr-okx-2',
    vaspId: 'vasp-okx',
    blockchain: 'ethereum',
    address: '0xa7efae728d2936e78bda97dc267687568dd593f3',
    addressType: 'HOT_WALLET',
    source: 'Etherscan / Public Label (OKX 2)',
    sourceType: 'PUBLIC_REGISTRY',
    confidence: 0.995,
    verificationStatus: 'VERIFIED_PUBLIC',
    lastVerifiedDate: '2026-08-10T00:00:00Z',
    isDemoData: false
  },

  // --- BYBIT (Public Verified) ---
  {
    id: 'addr-byb-1',
    vaspId: 'vasp-bybit',
    blockchain: 'ethereum',
    address: '0xf89d7b9c22efe36813233a010d8a59f13e735160',
    addressType: 'HOT_WALLET',
    source: 'Etherscan / Public Label (Bybit 1)',
    sourceType: 'PUBLIC_REGISTRY',
    confidence: 0.996,
    verificationStatus: 'VERIFIED_PUBLIC',
    lastVerifiedDate: '2026-08-05T00:00:00Z',
    isDemoData: false
  },

  // --- KUCOIN (Public Verified) ---
  {
    id: 'addr-kuc-1',
    vaspId: 'vasp-kucoin',
    blockchain: 'ethereum',
    address: '0xd6216fc19db775df9774a6e33526131da7d19a2c',
    addressType: 'HOT_WALLET',
    source: 'Etherscan / Public Label (KuCoin 6)',
    sourceType: 'PUBLIC_REGISTRY',
    confidence: 0.995,
    verificationStatus: 'VERIFIED_PUBLIC',
    lastVerifiedDate: '2026-08-01T00:00:00Z',
    isDemoData: false
  },

  // --- UNISWAP (Router Contract) ---
  {
    id: 'addr-uni-1',
    vaspId: 'vasp-uniswap',
    blockchain: 'ethereum',
    address: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
    addressType: 'CONTRACT',
    source: 'Etherscan / Verified Contract (Uniswap Universal Router)',
    sourceType: 'PUBLIC_REGISTRY',
    confidence: 1.000,
    verificationStatus: 'VERIFIED_PUBLIC',
    lastVerifiedDate: '2026-08-20T00:00:00Z',
    isDemoData: false
  },

  // --- TORNADO CASH (Mixer Sanctioned) ---
  {
    id: 'addr-mix-1',
    vaspId: 'vasp-mixer-highrisk',
    blockchain: 'ethereum',
    address: '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b',
    addressType: 'CONTRACT',
    source: 'OFAC SDN List / Tornado Cash 0.1 ETH',
    sourceType: 'PUBLIC_REGISTRY',
    confidence: 1.000,
    verificationStatus: 'VERIFIED_PUBLIC',
    lastVerifiedDate: '2026-08-20T00:00:00Z',
    isDemoData: false
  }
];

export const DEMO_PRESET_WALLETS: PresetWallet[] = [
  {
    id: 'case-a',
    address: '0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361',
    walletAddress: '0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361',
    name: 'Case A: High-Confidence Binance Flow (84% Attribution Example)',
    description: 'Unknown wallet with direct high-frequency settlement into Binance hot wallet clusters and deposit sweepers. Exhibits deposit consolidation characteristics.',
    primaryVaspExpected: 'Binance',
    expectedVasp: 'Binance',
    expectedScore: 84.2,
    hopsToVasp: 1,
    defaultHopDepth: 1,
    network: 'ethereum',
    behaviorTag: 'HIGH_FREQUENCY_CONSOLIDATION'
  },
  {
    id: 'case-b',
    address: '0x4e83362442b8d1bec281594cea3050c8eb01311c',
    walletAddress: '0x4e83362442b8d1bec281594cea3050c8eb01311c',
    name: 'Case B: Multi-Hop Coinbase Feeder (2 Hops)',
    description: 'Wallet routing large volume through two intermediary non-custodial layer wallets before reaching Coinbase Prime settlement.',
    primaryVaspExpected: 'Coinbase',
    expectedVasp: 'Coinbase',
    expectedScore: 71.8,
    hopsToVasp: 2,
    defaultHopDepth: 2,
    network: 'ethereum',
    behaviorTag: 'MULTI_HOP_FEEDER'
  },
  {
    id: 'case-c',
    address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    walletAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    name: 'Case C: Kraken & OKX Arbitrageur Profile',
    description: 'High transaction frequency with shared flows between Kraken and OKX hot wallets, demonstrating multi-VASP arbitrage behavior.',
    primaryVaspExpected: 'Kraken',
    expectedVasp: 'Kraken',
    expectedScore: 58.4,
    hopsToVasp: 1,
    defaultHopDepth: 1,
    network: 'ethereum',
    behaviorTag: 'ARBITRAGE_CROSS_VASP'
  },
  {
    id: 'case-d',
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    name: 'Case D: Mixed Ecosystem High-Net-Worth Wallet',
    description: 'Multi-year active wallet interacting with Uniswap, Binance, and Coinbase with complex counterparty graph.',
    primaryVaspExpected: 'Binance',
    expectedVasp: 'Binance',
    expectedScore: 49.5,
    hopsToVasp: 1,
    defaultHopDepth: 1,
    network: 'ethereum',
    behaviorTag: 'MIXED_ECOSYSTEM_DIVERSIFIED'
  },
  {
    id: 'case-e',
    address: '0x1ad91ee08f21be3de0ba2ba69187123214444444',
    walletAddress: '0x1ad91ee08f21be3de0ba2ba69187123214444444',
    name: 'Case E: Suspicious Peeling Chain & Mixer Proximity',
    description: 'Rapid movement of funds through sequential intermediary wallets with 1-hop distance to Tornado Cash mixer pool.',
    primaryVaspExpected: 'Binance',
    expectedVasp: 'Binance',
    expectedScore: 62.0,
    hopsToVasp: 2,
    defaultHopDepth: 2,
    network: 'ethereum',
    behaviorTag: 'PEELING_CHAIN_MIXER_PROXIMITY'
  }
];

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  graphProximity: 0.30,
  transactionVolume: 0.25,
  interactionFrequency: 0.20,
  behavioralSimilarity: 0.15,
  temporalPattern: 0.10
};
