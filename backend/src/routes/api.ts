import { Router } from 'express';
import { walletController } from '../controllers/walletController';
import { vaspController } from '../controllers/vaspController';
import { investigationController } from '../controllers/investigationController';

const router = Router();

// --- Wallet Analysis & Graph Routes ---
router.post('/analyze-wallet', (req, res) => walletController.analyzeWallet(req, res));
router.get('/wallet/:address', (req, res) => walletController.getWallet(req, res));
router.get('/wallet/:address/transactions', (req, res) => walletController.getTransactions(req, res));
router.get('/wallet/:address/graph', (req, res) => walletController.getGraph(req, res));
router.get('/attribution/:address', (req, res) => walletController.getAttribution(req, res));
router.get('/presets', (req, res) => walletController.getPresets(req, res));

// --- VASP Registry Routes ---
router.get('/vasps', (req, res) => vaspController.getVasps(req, res));
router.get('/vasps/:id', (req, res) => vaspController.getVaspById(req, res));
router.get('/vasp-addresses', (req, res) => vaspController.getVaspAddresses(req, res));

// --- Investigation & Reporting Routes ---
router.get('/investigations', (req, res) => investigationController.getInvestigations(req, res));
router.get('/investigations/:id', (req, res) => investigationController.getInvestigation(req, res));
router.post('/investigations', (req, res) => investigationController.createInvestigation(req, res));
router.put('/investigations/:id', (req, res) => investigationController.updateInvestigation(req, res));
router.post('/investigations/:id/evidence-package', (req, res) => investigationController.generateEvidencePackage(req, res));
router.post('/investigations/:id/authority-submission', (req, res) => investigationController.prepareAuthoritySubmission(req, res));
router.get('/reports/:address', (req, res) => investigationController.generateReport(req, res));

// --- Audit Trail Routes ---
router.get('/audit-trail', (req, res) => investigationController.getAuditTrail(req, res));
router.post('/audit-trail', (req, res) => investigationController.logAuditAction(req, res));

// --- Scoring Config Routes ---
router.get('/settings/weights', (req, res) => investigationController.getScoringWeights(req, res));
router.post('/settings/weights', (req, res) => investigationController.updateScoringWeights(req, res));

export default router;
