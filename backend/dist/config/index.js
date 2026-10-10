"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    // API Keys (strictly from environment, never hardcoded)
    etherscanApiKey: process.env.ETHERSCAN_API_KEY || '',
    alchemyApiKey: process.env.ALCHEMY_API_KEY || '',
    // Python Analytics Microservice URL
    analyticsServiceUrl: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8000',
    // PostgreSQL Database
    database: {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        user: process.env.POSTGRES_USER || 'cryptonex',
        password: process.env.POSTGRES_PASSWORD || 'cryptonex_secret',
        name: process.env.POSTGRES_DB || 'cryptonex_db',
        enabled: process.env.ENABLE_POSTGRES === 'true',
    },
    // Neo4j Graph Database
    neo4j: {
        uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
        user: process.env.NEO4J_USER || 'neo4j',
        password: process.env.NEO4J_PASSWORD || 'cryptonex_graph',
        enabled: process.env.ENABLE_NEO4J === 'true',
    },
    // Attribution Scoring Default Weights
    defaultWeights: {
        graphProximity: 0.30,
        transactionVolume: 0.25,
        interactionFrequency: 0.20,
        behavioralSimilarity: 0.15,
        temporalPattern: 0.10,
    },
    // Rate Limiting
    rateLimitWindowMs: 15 * 60 * 1000, // 15 mins
    rateLimitMaxRequests: 200,
    // Demo Mode
    demoMode: process.env.DEMO_MODE !== 'false', // Default true for safe offline presentation
};
