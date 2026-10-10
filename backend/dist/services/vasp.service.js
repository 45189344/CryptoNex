"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaspService = void 0;
const store_1 = require("../db/store");
class VaspService {
    static getAllVasps() {
        return store_1.store.getVasps();
    }
    static getVaspById(id) {
        return store_1.store.getVaspById(id);
    }
    static getAllVaspAddresses() {
        return store_1.store.getVaspAddresses();
    }
    static checkAddress(address) {
        const res = store_1.store.getVaspByAddress(address);
        return {
            isVasp: !!res.vasp,
            vasp: res.vasp,
            vaspAddress: res.vaspAddress
        };
    }
}
exports.VaspService = VaspService;
