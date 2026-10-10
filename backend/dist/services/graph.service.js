"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphService = void 0;
const vasp_service_1 = require("./vasp.service");
class GraphService {
    static buildTransactionGraph(targetAddress, transactions) {
        const target = targetAddress.toLowerCase();
        const nodeMap = new Map();
        const edgeMap = new Map();
        // 1. Target node
        nodeMap.set(target, {
            id: target,
            label: `Target (${target.substring(0, 6)}...${target.substring(target.length - 4)})`,
            address: targetAddress,
            node_type: 'TARGET',
            tx_count: transactions.length,
            volume_in: 0,
            volume_out: 0,
            hop: 0,
            is_demo_data: false
        });
        // 2. Iterate transactions to extract nodes and directed edges
        for (const tx of transactions) {
            const fromLower = tx.from_address.toLowerCase();
            const toLower = tx.to_address.toLowerCase();
            const val = tx.value;
            // Update or create source node
            if (!nodeMap.has(fromLower)) {
                const vaspInfo = vasp_service_1.VaspService.checkAddress(fromLower);
                let nodeType = 'EXTERNAL_PEER';
                if (vaspInfo.isVasp && vaspInfo.vaspAddress) {
                    if (vaspInfo.vaspAddress.address_type === 'COLD_RESERVE')
                        nodeType = 'VASP_COLD';
                    else if (vaspInfo.vaspAddress.address_type === 'DEPOSIT_SWEEPER')
                        nodeType = 'VASP_SWEEPER';
                    else
                        nodeType = 'VASP_HOT';
                }
                else if (tx.hop_level && tx.hop_level > 1) {
                    nodeType = 'INTERMEDIARY';
                }
                const label = vaspInfo.vasp
                    ? `${vaspInfo.vasp.name} (${vaspInfo.vaspAddress?.address_type || 'Cluster'})`
                    : `${fromLower.substring(0, 6)}...${fromLower.substring(fromLower.length - 4)}`;
                nodeMap.set(fromLower, {
                    id: fromLower,
                    label,
                    address: tx.from_address,
                    node_type: nodeType,
                    vasp_id: vaspInfo.vasp?.id,
                    vasp_name: vaspInfo.vasp?.name,
                    tx_count: 0,
                    volume_in: 0,
                    volume_out: 0,
                    hop: tx.hop_level || 1,
                    is_demo_data: vaspInfo.vaspAddress?.is_demo_data || false,
                    verification_status: vaspInfo.vaspAddress?.verification_status
                });
            }
            // Update or create destination node
            if (!nodeMap.has(toLower)) {
                const vaspInfo = vasp_service_1.VaspService.checkAddress(toLower);
                let nodeType = 'EXTERNAL_PEER';
                if (vaspInfo.isVasp && vaspInfo.vaspAddress) {
                    if (vaspInfo.vaspAddress.address_type === 'COLD_RESERVE')
                        nodeType = 'VASP_COLD';
                    else if (vaspInfo.vaspAddress.address_type === 'DEPOSIT_SWEEPER')
                        nodeType = 'VASP_SWEEPER';
                    else
                        nodeType = 'VASP_HOT';
                }
                else if (tx.hop_level && tx.hop_level > 1) {
                    nodeType = 'INTERMEDIARY';
                }
                const label = vaspInfo.vasp
                    ? `${vaspInfo.vasp.name} (${vaspInfo.vaspAddress?.address_type || 'Cluster'})`
                    : `${toLower.substring(0, 6)}...${toLower.substring(toLower.length - 4)}`;
                nodeMap.set(toLower, {
                    id: toLower,
                    label,
                    address: tx.to_address,
                    node_type: nodeType,
                    vasp_id: vaspInfo.vasp?.id,
                    vasp_name: vaspInfo.vasp?.name,
                    tx_count: 0,
                    volume_in: 0,
                    volume_out: 0,
                    hop: (tx.hop_level || 1),
                    is_demo_data: vaspInfo.vaspAddress?.is_demo_data || false,
                    verification_status: vaspInfo.vaspAddress?.verification_status
                });
            }
            // Update volumes
            const srcNode = nodeMap.get(fromLower);
            srcNode.volume_out += val;
            srcNode.tx_count += 1;
            const dstNode = nodeMap.get(toLower);
            dstNode.volume_in += val;
            dstNode.tx_count += 1;
            // Create / merge edge
            const edgeKey = `${fromLower}->${toLower}`;
            if (edgeMap.has(edgeKey)) {
                const existing = edgeMap.get(edgeKey);
                existing.value += val;
                existing.tx_count += 1;
                if (tx.tx_hash && !existing.tx_hashes.includes(tx.tx_hash)) {
                    existing.tx_hashes.push(tx.tx_hash);
                }
                if (tx.is_sweep)
                    existing.is_sweep = true;
            }
            else {
                edgeMap.set(edgeKey, {
                    id: `edge_${fromLower}_${toLower}`,
                    source: fromLower,
                    target: toLower,
                    value: val,
                    token_symbol: tx.token_symbol || 'ETH',
                    tx_count: 1,
                    tx_hashes: tx.tx_hash ? [tx.tx_hash] : [],
                    is_sweep: !!tx.is_sweep
                });
            }
        }
        const nodes = Array.from(nodeMap.values());
        const edges = Array.from(edgeMap.values());
        let maxHops = 1;
        let totalVolumeFlow = 0;
        for (const n of nodes) {
            if (n.hop > maxHops)
                maxHops = n.hop;
        }
        for (const e of edges) {
            totalVolumeFlow += e.value;
        }
        return {
            nodes,
            edges,
            metrics: {
                node_count: nodes.length,
                edge_count: edges.length,
                max_hops: maxHops,
                total_volume_flow: Math.round(totalVolumeFlow * 100) / 100
            }
        };
    }
}
exports.GraphService = GraphService;
