"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.CONFIG = {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY || '',
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY || '',
    ANALYTICS_SERVICE_URL: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8000',
    DATABASE_URL: process.env.DATABASE_URL || '',
    NEO4J_URI: process.env.NEO4J_URI || 'bolt://localhost:7687',
    NEO4J_USER: process.env.NEO4J_USER || 'neo4j',
    NEO4J_PASSWORD: process.env.NEO4J_PASSWORD || 'password',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    DEFAULT_WEIGHTS: {
        graph_proximity: 0.30,
        transaction_volume: 0.25,
        interaction_frequency: 0.20,
        behavioral_similarity: 0.15,
        temporal_pattern: 0.10,
    }
};
