"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const api_1 = __importDefault(require("./routes/api"));
const db_1 = require("./database/db");
const neo4j_1 = require("./database/neo4j");
const analyticsClient_1 = require("./services/analyticsClient");
const app = (0, express_1.default)();
// Security & Middlewares
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, morgan_1.default)('dev'));
// Rate Limiter
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimitWindowMs,
    max: config_1.config.rateLimitMaxRequests,
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);
// Health Check Endpoint
const healthHandler = async (_req, res) => {
    const pythonStatus = await analyticsClient_1.analyticsClient.checkHealth();
    res.status(200).json({
        status: 'online',
        system: 'CRYPTO-NEX VASP Attribution Platform',
        version: '1.0.0 (SIH 2026)',
        timestamp: new Date().toISOString(),
        services: {
            relationalDatabase: db_1.db.isPostgresConnected ? 'PostgreSQL (Connected)' : 'In-Memory / SQLite Engine (Active)',
            graphDatabase: neo4j_1.neo4jService.isConnected ? 'Neo4j (Connected)' : 'In-Memory Graph Engine (Active)',
            pythonAnalytics: pythonStatus ? 'FastAPI ML Engine (Connected)' : 'Native TS Analytics Fallback (Active)',
            demoMode: config_1.config.demoMode,
            liveEtherscanConfigured: !!config_1.config.etherscanApiKey
        }
    });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);
// Mount Main API Routes
app.use('/api', api_1.default);
// 404 Handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found on CRYPTO-NEX API' });
});
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error('[Server Error]', err);
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred.'
    });
});
// Start Server
const server = app.listen(config_1.config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 CRYPTO-NEX Backend API Running on port ${config_1.config.port}`);
    console.log(`🌐 Health Check: http://localhost:${config_1.config.port}/api/health`);
    console.log(`🔒 Mode: ${config_1.config.nodeEnv} | Demo Mode: ${config_1.config.demoMode}`);
    console.log(`=======================================================`);
});
// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Closing HTTP server...');
    server.close(async () => {
        await neo4j_1.neo4jService.close();
        console.log('Server closed gracefully.');
    });
});
exports.default = app;
