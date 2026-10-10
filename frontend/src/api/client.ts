import axios from 'axios';
import { 
  AttributionResult, TransactionGraph, Transaction, 
  Wallet, VASP, VASPAddress, InvestigationCase, 
  PresetWallet, ScoringWeights, EvidencePackage, 
  AuthoritySubmission, AuditLogEntry 
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient = {
  // Wallet Analysis
  async analyzeWallet(
    address: string, 
    network = 'ethereum', 
    maxHops = 2, 
    customWeights?: Partial<ScoringWeights>,
    caseId?: string | null,
    signal?: AbortSignal
  ): Promise<{ 
    success: boolean;
    analysisId?: string;
    caseId?: string | null;
    network?: string;
    hopDepth?: number;
    address: string;
    wallet: Wallet; 
    transactions: Transaction[]; 
    graph: TransactionGraph; 
    attribution: AttributionResult 
  }> {
    const res = await api.post(
      '/analyze-wallet', 
      { address, network, maxHops, customWeights, caseId },
      { signal }
    );
    return res.data;
  },

  async getWallet(address: string): Promise<Wallet> {
    const res = await api.get(`/wallet/${address}`);
    return res.data.wallet;
  },

  async getTransactions(address: string): Promise<Transaction[]> {
    const res = await api.get(`/wallet/${address}/transactions`);
    return res.data.transactions;
  },

  async getGraph(address: string, maxHops = 2): Promise<TransactionGraph> {
    const res = await api.get(`/wallet/${address}/graph?maxHops=${maxHops}`);
    return res.data.graph;
  },

  async getAttribution(address: string): Promise<AttributionResult> {
    const res = await api.get(`/attribution/${address}`);
    return res.data.attribution;
  },

  async getPresets(): Promise<PresetWallet[]> {
    const res = await api.get('/presets');
    return res.data.presets;
  },

  // VASP Registry
  async getVasps(): Promise<VASP[]> {
    const res = await api.get('/vasps');
    return res.data.vasps;
  },

  async getVaspAddresses(vaspId?: string): Promise<VASPAddress[]> {
    const res = await api.get(`/vasp-addresses${vaspId ? `?vaspId=${vaspId}` : ''}`);
    return res.data.addresses;
  },

  // Investigations & Case Management
  async getInvestigations(): Promise<InvestigationCase[]> {
    const res = await api.get('/investigations');
    return res.data.cases;
  },

  async getInvestigation(id: string): Promise<InvestigationCase> {
    const res = await api.get(`/investigations/${id}`);
    return res.data.case;
  },

  async createInvestigation(payload: Partial<InvestigationCase> & {
    walletAddress: string;
    caseTitle: string;
    investigatorNotes?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    tags?: string[];
  }): Promise<InvestigationCase> {
    const res = await api.post('/investigations', payload);
    return res.data.case;
  },

  async updateInvestigation(id: string, updates: Partial<InvestigationCase>): Promise<InvestigationCase> {
    const res = await api.put(`/investigations/${id}`, updates);
    return res.data.case;
  },

  async generateEvidencePackage(caseId: string): Promise<EvidencePackage> {
    const res = await api.post(`/investigations/${caseId}/evidence-package`);
    return res.data.evidencePackage;
  },

  async prepareAuthoritySubmission(caseId: string, payload?: { analystNotes?: string; markPrepared?: boolean }): Promise<AuthoritySubmission> {
    const res = await api.post(`/investigations/${caseId}/authority-submission`, payload || {});
    return res.data.authoritySubmission;
  },

  // Audit Trail
  async getAuditTrail(): Promise<AuditLogEntry[]> {
    const res = await api.get('/audit-trail');
    return res.data.logs;
  },

  async logAuditAction(entry: {
    action: string;
    caseId?: string;
    targetWallet?: string;
    analyst?: string;
    status?: string;
    details?: string;
  }): Promise<AuditLogEntry> {
    const res = await api.post('/audit-trail', entry);
    return res.data.log;
  },

  async getReport(address: string): Promise<any> {
    const res = await api.get(`/reports/${address}`);
    return res.data.report;
  },

  // Settings & Scoring Weights
  async getScoringWeights(): Promise<ScoringWeights> {
    const res = await api.get('/settings/weights');
    return res.data.weights;
  },

  async updateScoringWeights(weights: Partial<ScoringWeights>): Promise<ScoringWeights> {
    const res = await api.post('/settings/weights', weights);
    return res.data.weights;
  },

  // Health
  async getHealth(): Promise<any> {
    const res = await api.get('/health');
    return res.data;
  },
};
