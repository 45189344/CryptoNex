import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import apiRouter from './routes/api';
import { db } from './database/db';
import { neo4jService } from './database/neo4j';
import { analyticsClient } from './services/analyticsClient';

const app = express();

// Security & Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rate Limiter
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Health Check Endpoint
const healthHandler = async (_req: Request, res: Response) => {
  const pythonStatus = await analyticsClient.checkHealth();
  res.status(200).json({
    status: 'online',
    system: 'CRYPTO-NEX VASP Attribution Platform',
    version: '1.0.0 (SIH 2026)',
    timestamp: new Date().toISOString(),
    services: {
      relationalDatabase: db.isPostgresConnected ? 'PostgreSQL (Connected)' : 'In-Memory / SQLite Engine (Active)',
      graphDatabase: neo4jService.isConnected ? 'Neo4j (Connected)' : 'In-Memory Graph Engine (Active)',
      pythonAnalytics: pythonStatus ? 'FastAPI ML Engine (Connected)' : 'Native TS Analytics Fallback (Active)',
      demoMode: config.demoMode,
      liveEtherscanConfigured: !!config.etherscanApiKey
    }
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount Main API Routes
app.use('/api', apiRouter);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found on CRYPTO-NEX API' });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

// Start Server
const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 CRYPTO-NEX Backend API Running on port ${config.port}`);
  console.log(`🌐 Health Check: http://localhost:${config.port}/api/health`);
  console.log(`🔒 Mode: ${config.nodeEnv} | Demo Mode: ${config.demoMode}`);
  console.log(`=======================================================`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  server.close(async () => {
    await neo4jService.close();
    console.log('Server closed gracefully.');
  });
});

export default app;
