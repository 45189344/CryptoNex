import { Pool } from 'pg';
import { config } from '../config';
import { 
  VASP, VASPAddress, Wallet, Transaction, AttributionResult, 
  InvestigationCase, ScoringWeights, AuditLogEntry 
} from '../types';
import { SEED_VASPS, SEED_VASP_ADDRESSES, DEFAULT_SCORING_WEIGHTS } from './seeds';

class DatabaseService {
  private pgPool: Pool | null = null;
  public isPostgresConnected = false;

  // In-Memory Fallback Store (Ensures 100% instant zero-dependency out-of-the-box operation)
  private memoryVasps: Map<string, VASP> = new Map();
  private memoryAddresses: Map<string, VASPAddress> = new Map(); // address -> VASPAddress
  private memoryWallets: Map<string, Wallet> = new Map(); // address -> Wallet
  private memoryTransactions: Map<string, Transaction[]> = new Map(); // address -> Transaction[]
  private memoryAttributions: Map<string, AttributionResult> = new Map(); // address -> AttributionResult
  private memoryInvestigations: Map<string, InvestigationCase> = new Map(); // id -> InvestigationCase
  private memoryAuditLogs: AuditLogEntry[] = [];
  private activeWeights: ScoringWeights = { ...DEFAULT_SCORING_WEIGHTS };

  constructor() {
    this.initMemoryStore();
    if (config.database.enabled) {
      this.initPostgres();
    }
  }

  private initMemoryStore() {
    console.log('[Database] Initializing In-Memory Relational Engine & Seeds...');
    for (const vasp of SEED_VASPS) {
      this.memoryVasps.set(vasp.id, vasp);
    }
    for (const addr of SEED_VASP_ADDRESSES) {
      this.memoryAddresses.set(addr.address.toLowerCase(), addr);
    }

    // Seed realistic investigation cases across lifecycles
    const seedCases: InvestigationCase[] = [
      {
        id: 'CASE-2026-NEX-0104',
        walletAddress: '0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361',
        network: 'ethereum',
        blockchain: 'ethereum',
        caseTitle: 'High-Velocity Binance Sweeper Ingestion',
        investigatorNotes: 'Automated 1-hop deposit sweep channel identified. Rapid consolidation into verified hot wallet.',
        status: 'Open',
        priority: 'HIGH',
        tags: ['Binance', 'Deposit-Sweep', 'Rapid-Consolidation'],
        primaryVaspCandidate: 'Binance',
        attributionScore: 84.2,
        riskScore: 72,
        riskLevel: 'HIGH',
        hopDepth: 2,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'CASE-2026-NEX-0098',
        walletAddress: '0x1ad91ee08f21be3de0ba2ba69187123214444444',
        network: 'ethereum',
        blockchain: 'ethereum',
        caseTitle: 'Tornado Cash Privacy Mixer Multi-Hop Layering',
        investigatorNotes: 'Topological connection to sanctioned privacy mixer. Multiple peel-chain relays prior to terminal Kraken cash-out.',
        status: 'Escalated',
        priority: 'HIGH',
        tags: ['Mixer-Proximity', 'Sanctions-Alert', 'Kraken-Terminal'],
        primaryVaspCandidate: 'Kraken',
        attributionScore: 56.4,
        riskScore: 88,
        riskLevel: 'CRITICAL',
        hopDepth: 3,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: 'CASE-2026-NEX-0082',
        walletAddress: '0x4e83362442b8d1bec281594cea3050c8eb01311c',
        network: 'ethereum',
        blockchain: 'ethereum',
        caseTitle: 'Institutional Multi-Hop Coinbase Flow',
        investigatorNotes: 'Two-hop intermediary path terminating in Coinbase Prime custody cluster.',
        status: 'Under Review',
        priority: 'MEDIUM',
        tags: ['Coinbase-Prime', 'Multi-Hop', 'Institutional'],
        primaryVaspCandidate: 'Coinbase',
        attributionScore: 79.1,
        riskScore: 48,
        riskLevel: 'MEDIUM',
        hopDepth: 2,
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: 'CASE-2026-NEX-0051',
        walletAddress: '0x3333333333333333333333333333333333333333',
        network: 'ethereum',
        blockchain: 'ethereum',
        caseTitle: 'Kraken OTC Liquidity Settlement Desk',
        investigatorNotes: 'High volume bilateral settlement channel. Dossier verified and prepared for institutional compliance dispatch.',
        status: 'Submitted',
        priority: 'HIGH',
        tags: ['Kraken', 'OTC', 'Authority-Submitted'],
        primaryVaspCandidate: 'Kraken',
        attributionScore: 81.5,
        riskScore: 65,
        riskLevel: 'HIGH',
        hopDepth: 2,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ];

    for (const c of seedCases) {
      this.memoryInvestigations.set(c.id, c);
    }

    // Seed initial Audit Trail entries
    this.memoryAuditLogs = [
      {
        id: 'audit-001',
        action: 'Submission prepared',
        caseId: 'CASE-2026-NEX-0051',
        targetWallet: '0x3333333333333333333333333333333333333333',
        analyst: 'Analyst-LE-402',
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
        status: 'SUCCESS',
        details: 'Authority submission draft compiled and marked as Prepared for institutional compliance.'
      },
      {
        id: 'audit-002',
        action: 'Evidence generated',
        caseId: 'CASE-2026-NEX-0098',
        targetWallet: '0x1ad91ee08f21be3de0ba2ba69187123214444444',
        analyst: 'Forensic-Agent-09',
        timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
        status: 'SUCCESS',
        details: 'Compiled forensic evidence package with 14 telemetry sections including mixer proximity links.'
      },
      {
        id: 'audit-003',
        action: 'Wallet flagged',
        caseId: 'CASE-2026-NEX-0098',
        targetWallet: '0x1ad91ee08f21be3de0ba2ba69187123214444444',
        analyst: 'Forensic-Agent-09',
        timestamp: new Date(Date.now() - 86400000 * 4 - 3600000).toISOString(),
        status: 'RECORDED',
        details: 'Wallet flagged for investigation with Critical risk score (88/100).'
      },
      {
        id: 'audit-004',
        action: 'Case created',
        caseId: 'CASE-2026-NEX-0104',
        targetWallet: '0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361',
        analyst: 'Investigator-HQ-12',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'OPEN',
        details: 'Opened new case dossier for Binance sweeper pattern investigation.'
      },
      {
        id: 'audit-005',
        action: 'Wallet analyzed',
        targetWallet: '0x71c8413158b44ff3263df3bc8d5fa3f05d5d8361',
        analyst: 'System Automated Pipeline',
        timestamp: new Date(Date.now() - 86400000 * 2 - 1800000).toISOString(),
        status: 'SUCCESS',
        details: 'Multi-hop BFS graph and 5-factor VASP attribution calculation completed.'
      }
    ];

    console.log(`[Database] Loaded ${this.memoryVasps.size} VASPs, ${this.memoryAddresses.size} address clusters, ${this.memoryInvestigations.size} cases, and ${this.memoryAuditLogs.length} audit logs.`);
  }

  private async initPostgres() {
    try {
      this.pgPool = new Pool({
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.name,
        connectionTimeoutMillis: 3000,
      });

      const client = await this.pgPool.connect();
      this.isPostgresConnected = true;
      client.release();
      console.log('[Database] Connected successfully to PostgreSQL database.');
      await this.syncSeedsToPostgres();
    } catch (err: any) {
      console.warn(`[Database] PostgreSQL connection failed (${err.message}). Using In-Memory Store.`);
      this.isPostgresConnected = false;
    }
  }

  private async syncSeedsToPostgres() {
    if (!this.pgPool || !this.isPostgresConnected) return;
    try {
      for (const vasp of SEED_VASPS) {
        await this.pgPool.query(
          `INSERT INTO vasps (id, name, type, country, website, risk_rating, description, is_verified)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET name = $2, type = $3, risk_rating = $6`,
          [vasp.id, vasp.name, vasp.type, vasp.country, vasp.website, vasp.riskRating, vasp.description, vasp.isVerified]
        );
      }
      for (const addr of SEED_VASP_ADDRESSES) {
        await this.pgPool.query(
          `INSERT INTO vasp_addresses (id, vasp_id, blockchain, address, address_type, source, source_type, confidence, verification_status, last_verified_date, is_demo_data)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (blockchain, address) DO NOTHING`,
          [addr.id, addr.vaspId, addr.blockchain, addr.address.toLowerCase(), addr.addressType, addr.source, addr.sourceType, addr.confidence, addr.verificationStatus, addr.lastVerifiedDate, addr.isDemoData]
        );
      }
    } catch (err: any) {
      console.error('[Database] Seed sync to Postgres failed:', err.message);
    }
  }

  // --- VASP Queries ---
  async getVasps(): Promise<VASP[]> {
    return Array.from(this.memoryVasps.values());
  }

  async getVaspById(id: string): Promise<VASP | undefined> {
    return this.memoryVasps.get(id);
  }

  async getVaspAddresses(): Promise<VASPAddress[]> {
    return Array.from(this.memoryAddresses.values());
  }

  async getVaspByAddress(address: string): Promise<{ vasp: VASP; vaspAddress: VASPAddress } | null> {
    const normalized = address.toLowerCase();
    const vaspAddr = this.memoryAddresses.get(normalized);
    if (!vaspAddr) return null;
    const vasp = this.memoryVasps.get(vaspAddr.vaspId);
    if (!vasp) return null;
    return { vasp, vaspAddress: vaspAddr };
  }

  // --- Wallet Queries ---
  async getWallet(address: string): Promise<Wallet | null> {
    return this.memoryWallets.get(address.toLowerCase()) || null;
  }

  async saveWallet(wallet: Wallet): Promise<void> {
    this.memoryWallets.set(wallet.address.toLowerCase(), wallet);
  }

  // --- Transaction Queries ---
  async getTransactions(address: string): Promise<Transaction[]> {
    return this.memoryTransactions.get(address.toLowerCase()) || [];
  }

  async saveTransactions(address: string, txs: Transaction[]): Promise<void> {
    this.memoryTransactions.set(address.toLowerCase(), txs);
  }

  // --- Attribution Queries ---
  async getAttribution(address: string): Promise<AttributionResult | null> {
    return this.memoryAttributions.get(address.toLowerCase()) || null;
  }

  async saveAttribution(result: AttributionResult): Promise<void> {
    this.memoryAttributions.set(result.walletAddress.toLowerCase(), result);
  }

  // --- Investigation Cases ---
  async getInvestigations(): Promise<InvestigationCase[]> {
    return Array.from(this.memoryInvestigations.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getInvestigation(id: string): Promise<InvestigationCase | null> {
    return this.memoryInvestigations.get(id) || null;
  }

  async saveInvestigation(investigation: InvestigationCase): Promise<void> {
    this.memoryInvestigations.set(investigation.id, investigation);
  }

  async updateInvestigation(id: string, updates: Partial<InvestigationCase>): Promise<InvestigationCase | null> {
    const existing = this.memoryInvestigations.get(id);
    if (!existing) return null;
    const updated: InvestigationCase = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.memoryInvestigations.set(id, updated);
    return updated;
  }

  // --- Audit Logs ---
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    return [...this.memoryAuditLogs]
      .map(e => ({
        ...e,
        user: e.user || e.analyst || 'Analyst',
        analyst: e.analyst || e.user || 'Analyst'
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async saveAuditLog(entry: AuditLogEntry): Promise<AuditLogEntry> {
    const enriched = {
      ...entry,
      user: entry.user || entry.analyst || 'Analyst',
      analyst: entry.analyst || entry.user || 'Analyst'
    };
    this.memoryAuditLogs.unshift(enriched);
    return enriched;
  }

  // --- Scoring Weights ---
  getScoringWeights(): ScoringWeights {
    return { ...this.activeWeights };
  }

  setScoringWeights(weights: Partial<ScoringWeights>): ScoringWeights {
    this.activeWeights = {
      ...this.activeWeights,
      ...weights
    };
    return { ...this.activeWeights };
  }
}

export const db = new DatabaseService();
