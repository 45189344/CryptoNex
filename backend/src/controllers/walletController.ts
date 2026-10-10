import { Request, Response } from 'express';
import { blockchainService } from '../services/blockchain';
import { graphEngine } from '../services/graphEngine';
import { attributionEngine } from '../services/attributionEngine';
import { db } from '../database/db';
import { DEMO_PRESET_WALLETS } from '../database/seeds';
import { BlockchainNetwork } from '../types';

export class WalletController {
  /**
   * POST /api/analyze-wallet
   * Main entrypoint for full wallet attribution pipeline
   */
  async analyzeWallet(req: Request, res: Response) {
    try {
      const { address, network = 'ethereum', maxHops = 2, customWeights, caseId } = req.body;

      if (!address || typeof address !== 'string') {
        return res.status(400).json({ error: 'Wallet address is required.' });
      }

      if (!blockchainService.isValidAddress(address)) {
        return res.status(400).json({ error: 'Invalid EVM cryptocurrency wallet address format.' });
      }

      const normalized = address.toLowerCase();
      const blockchain = (network as BlockchainNetwork) || 'ethereum';
      const hopDepth = Number(maxHops) || 2;
      const matchingPreset = DEMO_PRESET_WALLETS.find(p => p.address.toLowerCase() === normalized);
      const activeCaseId = caseId || matchingPreset?.id || null;
      const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // 1. Fetch or generate transactions & calculate statistics
      const { wallet, transactions } = await blockchainService.getWalletDetails(normalized, blockchain);
      await db.saveWallet(wallet);
      await db.saveTransactions(normalized, transactions);

      // 2. Build multi-hop transaction graph
      const graph = await graphEngine.buildTransactionGraph(normalized, transactions, hopDepth);

      // 3. Calculate 5-factor probabilistic attribution
      const attribution = await attributionEngine.computeAttribution(
        normalized,
        transactions,
        graph,
        customWeights,
        blockchain
      );

      // Attach verification metadata to attribution object
      attribution.analysisId = analysisId;
      attribution.caseId = activeCaseId;
      attribution.network = blockchain;
      attribution.hopDepth = hopDepth;
      attribution.walletAddress = normalized;

      return res.status(200).json({
        success: true,
        analysisId,
        caseId: activeCaseId,
        network: blockchain,
        hopDepth,
        address: normalized,
        wallet,
        transactions,
        graph,
        attribution
      });
    } catch (err: any) {
      console.error('[WalletController] Error analyzing wallet:', err);
      return res.status(500).json({ error: 'Failed to analyze wallet', details: err.message });
    }
  }

  /**
   * GET /api/wallet/:address
   */
  async getWallet(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const normalized = address.toLowerCase();
      
      let wallet = await db.getWallet(normalized);
      if (!wallet) {
        const details = await blockchainService.getWalletDetails(normalized);
        wallet = details.wallet;
        await db.saveWallet(wallet);
        await db.saveTransactions(normalized, details.transactions);
      }

      return res.status(200).json({ success: true, wallet });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get wallet', details: err.message });
    }
  }

  /**
   * GET /api/wallet/:address/transactions
   */
  async getTransactions(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const normalized = address.toLowerCase();
      let txs = await db.getTransactions(normalized);

      if (txs.length === 0) {
        const details = await blockchainService.getWalletDetails(normalized);
        txs = details.transactions;
        await db.saveTransactions(normalized, txs);
      }

      return res.status(200).json({ success: true, transactions: txs, total: txs.length });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get transactions', details: err.message });
    }
  }

  /**
   * GET /api/wallet/:address/graph
   */
  async getGraph(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const maxHops = parseInt((req.query.maxHops as string) || '2', 10);
      const normalized = address.toLowerCase();

      let txs = await db.getTransactions(normalized);
      if (txs.length === 0) {
        const details = await blockchainService.getWalletDetails(normalized);
        txs = details.transactions;
      }

      const graph = await graphEngine.buildTransactionGraph(normalized, txs, maxHops);
      return res.status(200).json({ success: true, graph });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get graph', details: err.message });
    }
  }

  /**
   * GET /api/attribution/:address
   */
  async getAttribution(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const normalized = address.toLowerCase();

      let attr = await db.getAttribution(normalized);
      if (!attr) {
        const details = await blockchainService.getWalletDetails(normalized);
        const graph = await graphEngine.buildTransactionGraph(normalized, details.transactions, 2);
        attr = await attributionEngine.computeAttribution(normalized, details.transactions, graph);
      }

      return res.status(200).json({ success: true, attribution: attr });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get attribution', details: err.message });
    }
  }

  /**
   * GET /api/presets
   * Return pre-configured test cases for demo
   */
  async getPresets(_req: Request, res: Response) {
    return res.status(200).json({ success: true, presets: DEMO_PRESET_WALLETS });
  }
}

export const walletController = new WalletController();
