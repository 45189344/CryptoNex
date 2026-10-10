"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vaspController = exports.VaspController = void 0;
const db_1 = require("../database/db");
class VaspController {
    /**
     * GET /api/vasps
     */
    async getVasps(_req, res) {
        try {
            const vasps = await db_1.db.getVasps();
            return res.status(200).json({ success: true, vasps, count: vasps.length });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to fetch VASPs', details: err.message });
        }
    }
    /**
     * GET /api/vasps/:id
     */
    async getVaspById(req, res) {
        try {
            const { id } = req.params;
            const vasp = await db_1.db.getVaspById(id);
            if (!vasp) {
                return res.status(404).json({ error: 'VASP not found' });
            }
            const allAddresses = await db_1.db.getVaspAddresses();
            const addresses = allAddresses.filter(a => a.vaspId === id);
            return res.status(200).json({ success: true, vasp, addresses, totalAddresses: addresses.length });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to fetch VASP details', details: err.message });
        }
    }
    /**
     * GET /api/vasp-addresses
     */
    async getVaspAddresses(req, res) {
        try {
            const { vaspId, type, status } = req.query;
            let addresses = await db_1.db.getVaspAddresses();
            if (vaspId) {
                addresses = addresses.filter(a => a.vaspId === vaspId);
            }
            if (type) {
                addresses = addresses.filter(a => a.addressType === type);
            }
            if (status) {
                addresses = addresses.filter(a => a.verificationStatus === status);
            }
            return res.status(200).json({ success: true, addresses, count: addresses.length });
        }
        catch (err) {
            return res.status(500).json({ error: 'Failed to fetch VASP addresses', details: err.message });
        }
    }
}
exports.VaspController = VaspController;
exports.vaspController = new VaspController();
