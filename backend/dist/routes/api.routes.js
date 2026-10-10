"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forensic_controller_1 = require("../controllers/forensic.controller");
const router = (0, express_1.Router)();
// Wallet Analysis & Details
router.post('/analyze-wallet', forensic_controller_1.ForensicController.analyzeWallet);
router.get('/wallet/:address', forensic_controller_1.ForensicController.getWallet);
router.get('/wallet/:address/transactions', forensic_controller_1.ForensicController.getWalletTransactions);
router.get('/wallet/:address/graph', forensic_controller_1.ForensicController.getWalletGraph);
router.get('/wallet/:address/vasps', forensic_controller_1.ForensicController.getWalletVasps);
router.get('/attribution/:address', forensic_controller_1.ForensicController.getAttribution);
// VASP Registry
router.get('/vasps', forensic_controller_1.ForensicController.getAllVasps);
router.get('/vasp-addresses', forensic_controller_1.ForensicController.getAllVaspAddresses);
// Investigations & Reports
router.get('/investigations', forensic_controller_1.ForensicController.getInvestigations);
router.get('/investigations/:id', forensic_controller_1.ForensicController.getInvestigationById);
router.post('/investigations', forensic_controller_1.ForensicController.saveInvestigation);
// Configuration & Presets
router.get('/config/weights', forensic_controller_1.ForensicController.getWeights);
router.post('/config/weights', forensic_controller_1.ForensicController.updateWeights);
router.get('/presets', forensic_controller_1.ForensicController.getPresetScenarios);
exports.default = router;
