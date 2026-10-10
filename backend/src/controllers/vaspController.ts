import { Request, Response } from 'express';
import { db } from '../database/db';

export class VaspController {
  /**
   * GET /api/vasps
   */
  async getVasps(_req: Request, res: Response) {
    try {
      const vasps = await db.getVasps();
      return res.status(200).json({ success: true, vasps, count: vasps.length });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch VASPs', details: err.message });
    }
  }

  /**
   * GET /api/vasps/:id
   */
  async getVaspById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const vasp = await db.getVaspById(id);
      if (!vasp) {
        return res.status(404).json({ error: 'VASP not found' });
      }

      const allAddresses = await db.getVaspAddresses();
      const addresses = allAddresses.filter(a => a.vaspId === id);

      return res.status(200).json({ success: true, vasp, addresses, totalAddresses: addresses.length });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch VASP details', details: err.message });
    }
  }

  /**
   * GET /api/vasp-addresses
   */
  async getVaspAddresses(req: Request, res: Response) {
    try {
      const { vaspId, type, status } = req.query;
      let addresses = await db.getVaspAddresses();

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
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch VASP addresses', details: err.message });
    }
  }
}

export const vaspController = new VaspController();
