export type BlockchainNetwork = 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'bsc';

export type VaspType = 'CEX' | 'DEX' | 'PAYMENT_PROCESSOR' | 'CUSTODIAN' | 'BRIDGE' | 'MIXER_HIGH_RISK';

export type AddressType = 'DEPOSIT_WALLET' | 'HOT_WALLET' | 'COLD_WALLET' | 'SWEEPER' | 'CONTRACT' | 'VAULT';

export type VerificationStatus = 'VERIFIED_PUBLIC' | 'COMMUNITY_REPORTED' | 'HEURISTIC_CLUSTER' | 'DEMO_SIMULATION';

export interface VASP {
  id: string;
  name: string;
  type: VaspType;
  country: string;
  website: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'SANCTIONED';
  description: string;
  isVerified: boolean;
  totalIdentifiedAddresses: number;
}

export interface VASPAddress {
  id: string;
  vaspId: string;
  blockchain: BlockchainNetwork;
  address: string;
  addressType: AddressType;
  source: string;
  sourceType: string;
  confidence: number; // 0.0 - 1.0
  verificationStatus: VerificationStatus;
  lastVerifiedDate: string;
  isDemoData: boolean;
}

export interface Transaction {
  id: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  blockchain: BlockchainNetwork;
  value: number; // in ETH or native unit
  valueUSD?: number;
  token: string;
  timestamp: number; // epoch ms
  blockNumber: number;
  gasPriceGwei?: number;
  isIncoming?: boolean;
}

export interface WalletStatistics {
  totalTransactions: number;
  incomingTransactions: number;
  outgoingTransactions: number;
  totalVolumeETH: number;
  totalVolumeUSD: number;
  uniqueCounterparties: number;
  firstActivity: string;
  lastActivity: string;
  avgTransactionValue: number;
  maxTransactionValue: number;
  activeDaysSpan: number;
  velocityPerHour: number;
}

export interface Wallet {
  id: string;
  address: string;
  blockchain: BlockchainNetwork;
  statistics: WalletStatistics;
  firstActivity: string;
  lastActivity: string;
  lastAnalyzedAt: string;
  tags?: string[];
  riskScore?: number; // 0 - 100
}

export interface GraphNode {
  id: string;
  label: string;
  address: string;
  type: 'TARGET' | 'INTERMEDIARY' | 'VASP_DEPOSIT' | 'VASP_HOT' | 'VASP_COLD' | 'HIGH_RISK_ENTITY';
  hop: number;
  vaspId?: string;
  vaspName?: string;
  totalVolume: number;
  txCount: number;
  isTarget?: boolean;
  isVASP?: boolean;
  isDemoData?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  txCount: number;
  totalValue: number;
  token: string;
  lastTimestamp: number;
  flowDirection: 'IN' | 'OUT' | 'BIDIRECTIONAL';
}

export interface TransactionGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  targetAddress: string;
  totalHops: number;
}

export interface ScoringWeights {
  graphProximity: number;     // default 0.30
  transactionVolume: number;  // default 0.25
  interactionFrequency: number; // default 0.20
  behavioralSimilarity: number; // default 0.15
  temporalPattern: number;    // default 0.10
}

export interface FactorEvidence {
  score: number; // 0.0 - 1.0
  weightedScore: number;
  weight: number;
  metrics: Record<string, any>;
  explanation: string;
}

export interface AttributionEvidence {
  directInteractionsCount: number;
  totalInteractionsCount: number;
  shortestHopDistance: number;
  volumeOverlapETH: number;
  volumeOverlapPercent: number;
  interactionFrequencyScore: number;
  clusterSimilarityScore: number;
  behavioralPatternSummary: string;
  temporalAlignmentWindow: string;
  matchedClusters: Array<{
    clusterAddress: string;
    addressType: AddressType;
    hopDistance: number;
    flowValueETH: number;
    txCount: number;
  }>;
  factors: {
    graphProximity: FactorEvidence;
    transactionVolume: FactorEvidence;
    interactionFrequency: FactorEvidence;
    behavioralSimilarity: FactorEvidence;
    temporalPattern: FactorEvidence;
  };
}

export interface VASPAttributionRank {
  rank: number;
  vasp: VASP;
  score: number; // Percentage (e.g. 84.2%)
  rawScore: number; // 0 - 1
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: AttributionEvidence;
  isDemoAttribution: boolean;
}

export interface RiskIndicator {
  id: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  category: 'VELOCITY' | 'VOLUME' | 'STRUCTURING' | 'MIXER_PROXIMITY' | 'PEELING_CHAIN' | 'DORMANT_ACTIVATION';
  indicator: string;
  reason: string;
  supportingEvidence: string;
  detectedAt?: string;
  metadata?: Record<string, any>;
}

export interface RiskScoreFactor {
  name: string;
  score: number;
  maxScore: number;
  signal: string;
  observedEvidence: string;
}

export interface VaspComplianceAlert {
  title?: string;
  recommended: boolean;
  probableVasp: string;
  attributionScore: number;
  riskLevel: 'HIGH' | 'CRITICAL';
  evidenceStrength: string;
  advisory: string;
  disclaimer?: string;
}

export interface RiskAssessment {
  riskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  label: 'Suspicious Activity Risk Score';
  scoreBreakdown: RiskScoreFactor[];
  vaspComplianceAlert?: VaspComplianceAlert;
  disclaimer: string;
  evaluatedAt: string;
}

export interface TimelineEvent {
  id: string;
  eventType: 
    | 'WALLET_SUBMITTED' 
    | 'BLOCKCHAIN_PROCESSED' 
    | 'GRAPH_GENERATED' 
    | 'MULTI_HOP_COMPLETED' 
    | 'VASP_ATTRIBUTION_COMPLETED' 
    | 'RISK_ASSESSMENT_COMPLETED' 
    | 'WALLET_FLAGGED' 
    | 'EVIDENCE_PACKAGE_GENERATED' 
    | 'SUBMISSION_PREPARED'
    | 'CASE_STATUS_UPDATED';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface EvidencePackage {
  packageId: string;
  targetWallet: string;
  blockchain: BlockchainNetwork;
  network?: string;
  transactionSummary: WalletStatistics;
  transactionHashes: Array<{
    txHash: string;
    fromAddress: string;
    toAddress: string;
    value: number;
    token: string;
    timestamp: number;
    blockNumber: number;
  }>;
  senderReceiverInfo: {
    totalIncoming: number;
    totalOutgoing: number;
    uniqueCounterparties: number;
  };
  transactionAmounts?: number[];
  timestamps?: number[];
  hopDepth: number;
  transactionGraphSummary: {
    totalNodes: number;
    totalEdges: number;
    intermediaryCount: number;
    vaspNodeCount: number;
  };
  vaspAttributionCandidates: Array<{
    rank: number;
    vaspName: string;
    vaspType: VaspType;
    score: number;
    confidence: string;
    shortestHop: number;
    volumeOverlapETH: number;
  }>;
  vaspCandidates?: Array<{
    rank: number;
    vaspName: string;
    vaspType: VaspType;
    score: number;
    confidence: string;
    shortestHop: number;
    volumeOverlapETH: number;
  }>;
  attributionScores: {
    primaryVasp: string;
    score: number;
    confidence: string;
  };
  fiveFactorEvidenceBreakdown: {
    graphProximity: FactorEvidence;
    transactionVolume: FactorEvidence;
    interactionFrequency: FactorEvidence;
    behavioralSimilarity: FactorEvidence;
    temporalPattern: FactorEvidence;
  };
  fiveFactorBreakdown?: {
    graphProximity: FactorEvidence;
    transactionVolume: FactorEvidence;
    interactionFrequency: FactorEvidence;
    behavioralSimilarity: FactorEvidence;
    temporalPattern: FactorEvidence;
  };
  riskIndicators: RiskIndicator[];
  analystNotes: string;
  caseMetadata: {
    caseId?: string;
    generatedAt: string;
    classification: string;
    status?: string;
  };
}

export interface AuthoritySubmission {
  submissionId: string;
  caseId: string;
  targetWallet: string;
  blockchain: BlockchainNetwork;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  probableVasp: string;
  attributionScore: number;
  supportingTransactions: Array<{
    txHash: string;
    fromAddress: string;
    toAddress: string;
    value: number;
    token: string;
    timestamp: number;
  }>;
  graphEvidence: {
    totalNodes: number;
    totalEdges: number;
    shortestHop: number;
    matchedClusterCount: number;
  };
  riskIndicators: RiskIndicator[];
  analystNotes: string;
  submissionStatus: 'Draft' | 'Prepared';
  preparedAt?: string;
  preparedBy?: string;
  disclaimer: string;
  nonBlockingDisclaimer?: string;
}

export interface PresetWallet {
  id: string;
  address: string;
  walletAddress?: string;
  name: string;
  description: string;
  primaryVaspExpected: string;
  expectedVasp?: string;
  expectedScore: number;
  hopsToVasp: number;
  defaultHopDepth?: number;
  network?: BlockchainNetwork;
  behaviorTag?: string;
}

export interface AttributionResult {
  id: string;
  analysisId?: string;
  caseId?: string | null;
  walletAddress: string;
  blockchain: BlockchainNetwork;
  network?: string;
  hopDepth?: number;
  mostLikelyVasp: VASPAttributionRank;
  top_match?: {
    vasp_name: string;
    confidence_percentage: number;
    vasp_id?: string;
  };
  rankings: VASPAttributionRank[];
  riskIndicators: RiskIndicator[];
  riskAssessment?: RiskAssessment;
  timeline?: TimelineEvent[];
  modelVersion: string;
  scoringWeights: ScoringWeights;
  calculatedAt: string;
  disclaimer: string;
}

export type CaseStatus = 'Open' | 'Under Review' | 'Escalated' | 'Submitted' | 'Resolved' | 'OPEN' | 'IN_REVIEW' | 'COMPLETED' | 'ARCHIVED';

export interface InvestigationCase {
  id: string;
  walletAddress: string;
  targetWallet?: string;
  blockchain?: BlockchainNetwork;
  network?: string;
  caseTitle: string;
  investigatorNotes: string;
  status: CaseStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  tags: string[];
  primaryVaspCandidate?: string;
  attributionScore?: number;
  riskScore?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  hopDepth?: number;
  riskIndicators?: RiskIndicator[];
  supportingEvidence?: Record<string, any>;
  evidencePackage?: EvidencePackage;
  authoritySubmission?: AuthoritySubmission;
  timeline?: TimelineEvent[];
  reportJson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  caseId?: string;
  targetWallet?: string;
  analyst: string;
  user?: string;
  timestamp: string;
  status: string;
  details?: string;
}
