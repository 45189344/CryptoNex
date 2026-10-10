import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Wallet, Transaction, TransactionGraph, AttributionResult, 
  PresetWallet, ScoringWeights, BlockchainNetwork, GraphNode,
  InvestigationCase, EvidencePackage, AuthoritySubmission, TimelineEvent 
} from '../types';
import { apiClient } from '../api/client';

export type ActiveTab = 
  | 'dashboard' 
  | 'analyze' 
  | 'overview' 
  | 'transactions' 
  | 'graph' 
  | 'attribution' 
  | 'evidence' 
  | 'risk-alerts'
  | 'investigations' 
  | 'audit-trail'
  | 'vasp-registry' 
  | 'settings';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  targetAddress: string;
  setTargetAddress: (addr: string) => void;
  selectedNetwork: BlockchainNetwork;
  setSelectedNetwork: (net: BlockchainNetwork) => void;
  maxHops: number;
  setMaxHops: (hops: number) => void;
  
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  selectedCaseDescription: string | null;
  selectedPreset: PresetWallet | null;

  // Analysis Data
  wallet: Wallet | null;
  transactions: Transaction[];
  graph: TransactionGraph | null;
  attribution: AttributionResult | null;
  presets: PresetWallet[];
  weights: ScoringWeights;
  
  // Loading & State
  isAnalyzing: boolean;
  analysisStep: number;
  analysisError: string | null;
  
  // Actions
  runAnalysis: (
    address?: string, 
    hops?: number, 
    caseId?: string | null, 
    networkOverride?: BlockchainNetwork
  ) => Promise<void>;
  loadPreset: (preset: PresetWallet) => void;
  clearAnalysis: () => void;
  updateWeights: (newWeights: Partial<ScoringWeights>) => Promise<void>;
  
  // Flagging for Investigation
  flagWalletForInvestigation: (customNotes?: string) => Promise<InvestigationCase | null>;
  isFlagging: boolean;
  flagSuccessMessage: string | null;
  clearFlagSuccessMessage: () => void;

  // Evidence Package Modal
  isEvidenceModalOpen: boolean;
  setIsEvidenceModalOpen: (open: boolean) => void;
  activeEvidencePackage: EvidencePackage | null;
  setActiveEvidencePackage: (pkg: EvidencePackage | null) => void;
  openEvidencePackage: (caseItem?: InvestigationCase | string) => Promise<void>;

  // Authority Submission Modal
  isAuthorityModalOpen: boolean;
  setIsAuthorityModalOpen: (open: boolean) => void;
  activeAuthoritySubmission: AuthoritySubmission | null;
  setActiveAuthoritySubmission: (sub: AuthoritySubmission | null) => void;
  openAuthoritySubmission: (caseItem?: InvestigationCase | string) => Promise<void>;

  // Timeline
  timeline: TimelineEvent[];
  
  // Selected Graph Node for Modal Inspection
  inspectedNode: GraphNode | null;
  setInspectedNode: (node: GraphNode | null) => void;
  
  // Report Modal
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
}

const defaultWeights: ScoringWeights = {
  graphProximity: 0.30,
  transactionVolume: 0.25,
  interactionFrequency: 0.20,
  behavioralSimilarity: 0.15,
  temporalPattern: 0.10,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [targetAddress, setTargetAddress] = useState<string>('0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361');
  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork>('ethereum');
  const [maxHops, setMaxHops] = useState<number>(2);

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>('case-a');
  const [selectedCaseDescription, setSelectedCaseDescription] = useState<string | null>(
    'Case A: High-Confidence Binance Flow (84% Attribution Example)'
  );

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [graph, setGraph] = useState<TransactionGraph | null>(null);
  const [attribution, setAttribution] = useState<AttributionResult | null>(null);
  const [presets, setPresets] = useState<PresetWallet[]>([]);
  const [weights, setWeights] = useState<ScoringWeights>(defaultWeights);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [isFlagging, setIsFlagging] = useState<boolean>(false);
  const [flagSuccessMessage, setFlagSuccessMessage] = useState<string | null>(null);

  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState<boolean>(false);
  const [activeEvidencePackage, setActiveEvidencePackage] = useState<EvidencePackage | null>(null);

  const [isAuthorityModalOpen, setIsAuthorityModalOpen] = useState<boolean>(false);
  const [activeAuthoritySubmission, setActiveAuthoritySubmission] = useState<AuthoritySubmission | null>(null);

  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  const [inspectedNode, setInspectedNode] = useState<GraphNode | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Request sequencing and abort references to prevent race conditions
  const seqRef = React.useRef<number>(0);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Initial fetch of presets & weights
  useEffect(() => {
    apiClient.getPresets()
      .then(res => {
        setPresets(res);
        const match = res.find(p => p.id === 'case-a' || p.address.toLowerCase() === targetAddress.toLowerCase());
        if (match) {
          setSelectedCaseId(match.id);
          setSelectedCaseDescription(match.description);
        }
      })
      .catch(() => {});

    apiClient.getScoringWeights()
      .then(res => setWeights(res))
      .catch(() => {});

    // Auto-run initial demo address
    runAnalysis('0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361', 2, 'case-a', 'ethereum');
  }, []);

  const clearAnalysis = () => {
    setAttribution(null);
    setWallet(null);
    setGraph(null);
    setTransactions([]);
    setAnalysisError(null);
    setTimeline([]);
  };

  const selectedPreset: PresetWallet | null = React.useMemo(() => {
    if (selectedCaseId) {
      const found = presets.find(p => p.id === selectedCaseId);
      if (found) return found;
    }
    return presets.find(p => p.address.toLowerCase() === targetAddress.toLowerCase()) || null;
  }, [presets, selectedCaseId, targetAddress]);

  const runAnalysis = async (
    addressToAnalyze?: string, 
    hopsCount?: number,
    caseIdParam?: string | null,
    networkOverride?: BlockchainNetwork,
    forcedSeq?: number
  ) => {
    const addr = (addressToAnalyze || targetAddress).trim().toLowerCase();
    const hops = hopsCount || maxHops;
    const network = networkOverride || selectedNetwork;

    if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      setAnalysisError('Please enter a valid 42-character EVM hexadecimal address (0x...)');
      return;
    }

    // Cancel any previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Sequence tracking to discard any responses from superseded executions
    const currentSeq = forcedSeq !== undefined ? forcedSeq : ++seqRef.current;

    // Reset old result state immediately upon starting new analysis
    setAttribution(null);
    setWallet(null);
    setGraph(null);
    setTransactions([]);
    setAnalysisError(null);
    setIsAnalyzing(true);
    setAnalysisStep(1); // Step 1: Validating Address & Ingesting On-Chain TXs

    // Synchronize active case state
    const matchedPreset = presets.find(p => p.address.toLowerCase() === addr);
    const activeCaseId = caseIdParam !== undefined ? caseIdParam : (matchedPreset?.id || null);
    if (matchedPreset) {
      setSelectedCaseId(matchedPreset.id);
      setSelectedCaseDescription(matchedPreset.description);
    } else if (caseIdParam === null) {
      setSelectedCaseId(null);
      setSelectedCaseDescription(null);
    }

    try {
      await new Promise(r => setTimeout(r, 200));
      if (currentSeq !== seqRef.current) return;
      setAnalysisStep(2); // Step 2: Mapping Counterparties & Building Graph

      await new Promise(r => setTimeout(r, 250));
      if (currentSeq !== seqRef.current) return;
      setAnalysisStep(3); // Step 3: Cluster Matching & Evaluating Candidates

      const result = await apiClient.analyzeWallet(
        addr, 
        network, 
        hops, 
        weights, 
        activeCaseId, 
        abortController.signal
      );

      // Verify sequence is still active
      if (currentSeq !== seqRef.current) {
        console.warn(`[AppContext] Discarding response from stale sequence #${currentSeq}`);
        return;
      }

      // PHASE 3 VALIDATION: Strictly verify result parameters match the current query
      if (result.address.toLowerCase() !== addr.toLowerCase()) {
        console.warn(`[AppContext] Discarding mismatched wallet result. Got ${result.address}, expected ${addr}`);
        return;
      }

      await new Promise(r => setTimeout(r, 200));
      if (currentSeq !== seqRef.current) return;
      setAnalysisStep(4); // Step 4: Computing 5-Factor Attribution & Confidence

      setWallet(result.wallet);
      setTransactions(result.transactions);
      setGraph(result.graph);
      setAttribution(result.attribution);
      setTargetAddress(addr);
      if (result.attribution.timeline) {
        setTimeline(result.attribution.timeline);
      }

      // Log in audit trail asynchronously
      apiClient.logAuditAction({
        action: 'Wallet analyzed',
        targetWallet: addr,
        caseId: activeCaseId || undefined,
        status: 'SUCCESS',
        details: `Deep analysis completed across ${hops} hops. Top VASP: ${result.attribution.mostLikelyVasp.vasp.name} (${result.attribution.mostLikelyVasp.score}%).`
      }).catch(() => {});

      await new Promise(r => setTimeout(r, 150));
      if (currentSeq === seqRef.current) {
        setAnalysisStep(5); // Complete
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        // Ignored aborted requests
        return;
      }
      if (currentSeq === seqRef.current) {
        console.error('Analysis error:', err);
        setAnalysisError(err.response?.data?.error || err.message || 'Analysis failed. Please try again.');
      }
    } finally {
      if (currentSeq === seqRef.current) {
        setIsAnalyzing(false);
      }
    }
  };

  const loadPreset = (preset: PresetWallet) => {
    // 1. Abort any previous pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 2. Increment sequence to instantly invalidate prior async operations
    const newSeq = ++seqRef.current;

    // 3. Update target case metadata
    const presetHops = preset.defaultHopDepth || preset.hopsToVasp || 2;
    const presetNetwork = (preset.network as BlockchainNetwork) || 'ethereum';
    setSelectedCaseId(preset.id);
    setSelectedCaseDescription(preset.description);
    setTargetAddress(preset.address);
    setSelectedNetwork(presetNetwork);
    setMaxHops(presetHops);

    // 4. Immediately clear previous analysis state
    clearAnalysis();

    // 5. Run fresh analysis
    runAnalysis(preset.address, presetHops, preset.id, presetNetwork, newSeq);
    setActiveTab('overview');
  };

  const updateWeights = async (newWeights: Partial<ScoringWeights>) => {
    try {
      const updated = await apiClient.updateScoringWeights(newWeights);
      setWeights(updated);
      // Re-run attribution for current address if loaded
      if (wallet) {
        const res = await apiClient.analyzeWallet(wallet.address, selectedNetwork, maxHops, updated);
        setAttribution(res.attribution);
      }
    } catch (err: any) {
      console.error('Failed to update weights:', err);
    }
  };

  const flagWalletForInvestigation = async (customNotes?: string): Promise<InvestigationCase | null> => {
    if (!wallet || !attribution) return null;
    setIsFlagging(true);
    try {
      const primaryVasp = attribution.mostLikelyVasp.vasp.name;
      const attrScore = attribution.mostLikelyVasp.score;
      const riskScore = attribution.riskAssessment?.riskScore || 50;
      const riskLevel = attribution.riskAssessment?.riskLevel || 'MEDIUM';

      const payload = {
        walletAddress: wallet.address,
        network: selectedNetwork,
        blockchain: wallet.blockchain,
        hopDepth: maxHops,
        caseTitle: `Case Ref: ${wallet.address.slice(0, 10)}... (VASP: ${primaryVasp})`,
        investigatorNotes: customNotes || `Flagged from wallet analysis workspace. Primary VASP candidate: ${primaryVasp} (${attrScore}%). Suspicious activity risk score: ${riskScore}/100.`,
        priority: (riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM') as 'HIGH' | 'MEDIUM',
        tags: [primaryVasp, `${riskLevel}-Risk`, selectedNetwork.toUpperCase()],
        primaryVaspCandidate: primaryVasp,
        attributionScore: attrScore,
        riskScore,
        riskLevel,
        riskIndicators: attribution.riskIndicators,
        supportingEvidence: {
          factors: attribution.mostLikelyVasp.evidence.factors,
          volumeOverlapETH: attribution.mostLikelyVasp.evidence.volumeOverlapETH,
          shortestHop: attribution.mostLikelyVasp.evidence.shortestHopDistance,
          directInteractions: attribution.mostLikelyVasp.evidence.directInteractionsCount
        },
        status: 'Open' as const
      };

      const newCase = await apiClient.createInvestigation(payload);
      
      setFlagSuccessMessage('Wallet flagged for investigation.');
      setTimeout(() => setFlagSuccessMessage(null), 4000);

      // Add timeline event to local state
      const now = new Date().toISOString();
      setTimeline(prev => [
        ...prev,
        {
          id: `tl-flag-${Date.now()}`,
          eventType: 'WALLET_FLAGGED',
          title: 'Wallet Flagged for Investigation',
          description: `Case ${newCase.id} registered with status "Open".`,
          timestamp: now,
          metadata: { caseId: newCase.id }
        }
      ]);

      return newCase;
    } catch (err) {
      console.error('Failed to flag wallet:', err);
      return null;
    } finally {
      setIsFlagging(false);
    }
  };

  const openEvidencePackage = async (caseItemOrTarget?: InvestigationCase | string) => {
    try {
      let caseId = '';
      if (typeof caseItemOrTarget === 'object' && caseItemOrTarget?.id) {
        caseId = caseItemOrTarget.id;
      } else if (typeof caseItemOrTarget === 'string' && caseItemOrTarget.startsWith('CASE-')) {
        caseId = caseItemOrTarget;
      }

      // If no case ID is available, ensure a case exists or create one
      if (!caseId) {
        const flagged = await flagWalletForInvestigation();
        if (flagged) {
          caseId = flagged.id;
        }
      }

      if (caseId) {
        const pkg = await apiClient.generateEvidencePackage(caseId);
        setActiveEvidencePackage(pkg);
        setIsEvidenceModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to open evidence package:', err);
    }
  };

  const openAuthoritySubmission = async (caseItemOrTarget?: InvestigationCase | string) => {
    try {
      let caseId = '';
      if (typeof caseItemOrTarget === 'object' && caseItemOrTarget?.id) {
        caseId = caseItemOrTarget.id;
      } else if (typeof caseItemOrTarget === 'string' && caseItemOrTarget.startsWith('CASE-')) {
        caseId = caseItemOrTarget;
      }

      if (!caseId) {
        const flagged = await flagWalletForInvestigation();
        if (flagged) {
          caseId = flagged.id;
        }
      }

      if (caseId) {
        const submission = await apiClient.prepareAuthoritySubmission(caseId);
        setActiveAuthoritySubmission(submission);
        setIsAuthorityModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to prepare authority submission:', err);
    }
  };

  const clearFlagSuccessMessage = () => setFlagSuccessMessage(null);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        targetAddress,
        setTargetAddress,
        selectedNetwork,
        setSelectedNetwork,
        maxHops,
        setMaxHops,
        selectedCaseId,
        setSelectedCaseId,
        selectedCaseDescription,
        selectedPreset,
        wallet,
        transactions,
        graph,
        attribution,
        presets,
        weights,
        isAnalyzing,
        analysisStep,
        analysisError,
        runAnalysis,
        loadPreset,
        clearAnalysis,
        updateWeights,
        flagWalletForInvestigation,
        isFlagging,
        flagSuccessMessage,
        clearFlagSuccessMessage,
        isEvidenceModalOpen,
        setIsEvidenceModalOpen,
        activeEvidencePackage,
        setActiveEvidencePackage,
        openEvidencePackage,
        isAuthorityModalOpen,
        setIsAuthorityModalOpen,
        activeAuthoritySubmission,
        setActiveAuthoritySubmission,
        openAuthoritySubmission,
        timeline,
        inspectedNode,
        setInspectedNode,
        isReportModalOpen,
        setIsReportModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
