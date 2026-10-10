"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.neo4jService = void 0;
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
const config_1 = require("../config");
class Neo4jService {
    driver = null;
    isConnected = false;
    constructor() {
        if (config_1.config.neo4j.enabled) {
            this.initNeo4j();
        }
    }
    async initNeo4j() {
        try {
            this.driver = neo4j_driver_1.default.driver(config_1.config.neo4j.uri, neo4j_driver_1.default.auth.basic(config_1.config.neo4j.user, config_1.config.neo4j.password), { connectionTimeout: 3000 });
            await this.driver.verifyConnectivity();
            this.isConnected = true;
            console.log('[Neo4j] Connected successfully to Neo4j Graph Database.');
            await this.initSchema();
        }
        catch (err) {
            console.warn(`[Neo4j] Connection failed (${err.message}). Using In-Memory Graph Engine.`);
            this.isConnected = false;
        }
    }
    async initSchema() {
        if (!this.driver || !this.isConnected)
            return;
        const session = this.driver.session();
        try {
            await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (w:Wallet) REQUIRE w.address IS UNIQUE');
            await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (v:VASPAddress) REQUIRE v.address IS UNIQUE');
            console.log('[Neo4j] Constraints verified.');
        }
        catch (err) {
            console.error('[Neo4j] Schema init error:', err.message);
        }
        finally {
            await session.close();
        }
    }
    async syncGraph(graph) {
        if (!this.driver || !this.isConnected)
            return;
        const session = this.driver.session();
        try {
            // Upsert nodes
            for (const node of graph.nodes) {
                if (node.isVASP) {
                    await session.run(`MERGE (v:VASPAddress {address: $address})
             SET v.label = $label, v.vaspId = $vaspId, v.vaspName = $vaspName, v.type = $type`, {
                        address: node.address.toLowerCase(),
                        label: node.label,
                        vaspId: node.vaspId || '',
                        vaspName: node.vaspName || '',
                        type: node.type
                    });
                }
                else {
                    await session.run(`MERGE (w:Wallet {address: $address})
             SET w.label = $label, w.type = $type, w.isTarget = $isTarget`, {
                        address: node.address.toLowerCase(),
                        label: node.label,
                        type: node.type,
                        isTarget: !!node.isTarget
                    });
                }
            }
            // Upsert edges
            for (const edge of graph.edges) {
                await session.run(`MATCH (a {address: $source}), (b {address: $target})
           MERGE (a)-[r:TRANSFERRED {id: $id}]->(b)
           SET r.totalValue = $totalValue, r.txCount = $txCount, r.token = $token`, {
                    id: edge.id,
                    source: edge.source.toLowerCase(),
                    target: edge.target.toLowerCase(),
                    totalValue: edge.totalValue,
                    txCount: edge.txCount,
                    token: edge.token
                });
            }
        }
        catch (err) {
            console.error('[Neo4j] Error syncing graph:', err.message);
        }
        finally {
            await session.close();
        }
    }
    async findPathsToVasp(targetAddress, maxHops = 3) {
        if (!this.driver || !this.isConnected)
            return [];
        const session = this.driver.session();
        try {
            const result = await session.run(`MATCH path = (start {address: $address})-[r:TRANSFERRED*1..${maxHops}]-(vasp:VASPAddress)
         RETURN path, length(path) as hops, vasp.vaspName as vaspName, vasp.vaspId as vaspId
         LIMIT 50`, { address: targetAddress.toLowerCase() });
            return result.records.map(record => ({
                hops: record.get('hops').toNumber(),
                vaspName: record.get('vaspName'),
                vaspId: record.get('vaspId'),
            }));
        }
        catch (err) {
            console.error('[Neo4j] Error querying paths:', err.message);
            return [];
        }
        finally {
            await session.close();
        }
    }
    async close() {
        if (this.driver) {
            await this.driver.close();
        }
    }
}
exports.neo4jService = new Neo4jService();
