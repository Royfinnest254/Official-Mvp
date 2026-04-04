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
  crossOriginResourcePolicy: false // Disable CORP to allow Vercel frontend to fetch
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
app.use('/v1/events', authenticate, eventsRoutes);

// Lightweight Ping for Cron-jobs
app.get('/ping', (req, res) => res.send('pong'));

// Root Route (Institutional Welcome)
app.get('/api/welcome', (req, res) => {
  res.send(`
    <div style="font-family: 'Inter', sans-serif; background: #f8fafc; color: #0f172a; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
      <h1 style="font-size: 3rem; font-weight: 800; margin-bottom: 1rem; color: #0f172a;">CONNEX MVP</h1>
      <p style="font-size: 1.25rem; color: #475569; max-width: 600px; font-weight: 500;">Forensic coordination and evidence layer for institutional settlement.</p>
      <div style="margin-top: 2rem; padding: 1.5rem 3rem; border: 1px solid #e2e8f0; border-radius: 1rem; background: #ffffff; shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        <code style="color: #2563eb; font-weight: 800;">GET /health</code> <span style="color: #cbd5e1; margin: 0 15px;">|</span> <span style="color: #64748b; font-weight: 600;">PRD STABLE 1.0.4</span>
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

// Catch-all route for React Router (must be the last route before app.listen)
app.get('/*path', (req, res) => {
  // If React isn't built, fallback to API welcome
  if (!require('fs').existsSync(path.join(__dirname, 'client/dist/index.html'))) {
    return res.send(`
      <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
        <h1>CONNEX Gateway</h1>
        <p>Backend is ONLINE and Healthy. (React Frontend is running on Vercel)</p>
        <a href="/test-nodes">Run Diagnostics</a>
      </div>
    `);
  }
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CONNEX API is live on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
