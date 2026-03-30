require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const observationRoutes = require('./routes/observations');
const vaultRoutes = require('./routes/vault');
const healthRoutes = require('./routes/health');
const transactionRoutes = require('./routes/transactions');
const eventsRoutes = require('./routes/events'); // [NEW] PRD Gateway Route

const app = express();
const PORT = process.env.PORT || 3000;

// Security and Logging Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for PoC to prevent frontend blocks
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// API Key Authentication Middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
  }
  next();
};

// Public Routes
app.use('/health', healthRoutes);

// Protected Audit Routes
app.use('/observations', authenticate, observationRoutes);
app.use('/vault', authenticate, vaultRoutes);
app.use('/tx', authenticate, transactionRoutes);

// [NEW] PRD v0.1 Endpoints
app.use('/v1/events', eventsRoutes);

// Lightweight Ping for Cron-jobs
app.get('/ping', (req, res) => res.send('pong'));

// Root Route (Premium Welcome message)
app.get('/api/welcome', (req, res) => {
  res.send(`
    <div style="font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
      <h1 style="font-size: 3rem; margin-bottom: 1rem; background: linear-gradient(to right, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">CONNEX MVP</h1>
      <p style="font-size: 1.25rem; color: #94a3b8; max-width: 600px;">The neutral cryptographic evidence layer for cross-border payment coordination.</p>
      <div style="margin-top: 2rem; padding: 1rem 2rem; border: 1px solid #1e293b; border-radius: 0.5rem; background: #1e293b50;">
        <code style="color: #38bdf8;">GET /health</code> <span style="color: #475569; margin: 0 10px;">|</span> <span style="color: #64748b;">API Version 1.0 (March 2026)</span>
      </div>
    </div>
  `);
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'client/dist')));

// [DEBUG] Diagnostic Node Test Route
app.get('/test-nodes', async (req, res) => {
  const axios = require('axios');
  const urls = [process.env.NODE_1_URL, process.env.NODE_2_URL, process.env.NODE_3_URL];
  const results = [];
  
  for (let i = 0; i < urls.length; i++) {
    try {
      if (!urls[i]) {
        results.push({ node: i + 1, status: 'MISSING', url: 'NOT SET' });
        continue;
      }
      const start = Date.now();
      const response = await axios.get(urls[i].replace('/sign', ''), { timeout: 5000 });
      results.push({ node: i + 1, status: 'ALIVE', latency: `${Date.now() - start}ms`, url: urls[i] });
    } catch (err) {
      results.push({ node: i + 1, status: 'ERROR', error: err.message, url: urls[i] || 'NOT SET' });
    }
  }
  res.json({ environment: process.env.NODE_ENV, results });
});

// Deprecated: Placeholder Home Route replaced by React Frontend
// app.get('/', (req, res) => { ... });

// Catch-all route for React Router (must be the last route before app.listen)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CONNEX API is live on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
