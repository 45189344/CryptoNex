"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const walletController_1 = require("../controllers/walletController");
const vaspController_1 = require("../controllers/vaspController");
const investigationController_1 = require("../controllers/investigationController");
const router = (0, express_1.Router)();
// --- Wallet Analysis & Graph Routes ---
router.post('/analyze-wallet', (req, res) => walletController_1.walletController.analyzeWallet(req, res));
router.get('/wallet/:address', (req, res) => walletController_1.walletController.getWallet(req, res));
router.get('/wallet/:address/transactions', (req, res) => walletController_1.walletController.getTransactions(req, res));
router.get('/wallet/:address/graph', (req, res) => walletController_1.walletController.getGraph(req, res));
router.get('/attribution/:address', (req, res) => walletController_1.walletController.getAttribution(req, res));
router.get('/presets', (req, res) => walletController_1.walletController.getPresets(req, res));
// --- VASP Registry Routes ---
router.get('/vasps', (req, res) => vaspController_1.vaspController.getVasps(req, res));
router.get('/vasps/:id', (req, res) => vaspController_1.vaspController.getVaspById(req, res));
router.get('/vasp-addresses', (req, res) => vaspController_1.vaspController.getVaspAddresses(req, res));
// --- Investigation & Reporting Routes ---
router.get('/investigations', (req, res) => investigationController_1.investigationController.getInvestigations(req, res));
router.get('/investigations/:id', (req, res) => investigationController_1.investigationController.getInvestigation(req, res));
router.post('/investigations', (req, res) => investigationController_1.investigationController.createInvestigation(req, res));
router.put('/investigations/:id', (req, res) => investigationController_1.investigationController.updateInvestigation(req, res));
router.post('/investigations/:id/evidence-package', (req, res) => investigationController_1.investigationController.generateEvidencePackage(req, res));
router.post('/investigations/:id/authority-submission', (req, res) => investigationController_1.investigationController.prepareAuthoritySubmission(req, res));
router.get('/reports/:address', (req, res) => investigationController_1.investigationController.generateReport(req, res));
// --- Audit Trail Routes ---
router.get('/audit-trail', (req, res) => investigationController_1.investigationController.getAuditTrail(req, res));
router.post('/audit-trail', (req, res) => investigationController_1.investigationController.logAuditAction(req, res));
// --- Scoring Config Routes ---
router.get('/settings/weights', (req, res) => investigationController_1.investigationController.getScoringWeights(req, res));
router.post('/settings/weights', (req, res) => investigationController_1.investigationController.updateScoringWeights(req, res));
exports.default = router;
