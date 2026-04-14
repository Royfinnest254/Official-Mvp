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
const eventsRoutes = require('./routes/events');
const rpcRoutes = require('./routes/rpc');
const app = express();
const PORT = process.env.PORT || 3000;

// Security and Logging Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for PoC to prevent frontend blocks
  crossOriginResourcePolicy: false // Disable CORP to allow Vercel frontend to fetch
}));
app.use(cors({
  origin: '*', // Prototype-friendly (use specific domain in production)
  allowedHeaders: ['Content-Type', 'x-api-key']
}));
app.use(morgan('dev'));
app.use(express.json());

// --- Metrics Middleware ---
app.use((req, res, next) => {
  const { httpRequestDuration } = require('./lib/metrics');
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe(
      { 
        method: req.method, 
        route: req.route ? req.route.path : req.path, 
        status_code: res.statusCode 
      }, 
      duration
    );
  });
  next();
});

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

// Grafana Dashboard RPC endpoints — protected by API key.
// Configure Grafana Infinity data source to send `x-api-key` header.
app.use('/rpc', authenticate, rpcRoutes);

// Lightweight Ping for Cron-jobs
app.get('/ping', (req, res) => res.send('pong'));

// Prometheus Metrics Endpoint — protected by API key.
// Configure your Prometheus scrape job to send the Authorization header.
app.get('/metrics', authenticate, async (req, res) => {
  const { register } = require('./lib/metrics');
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Root Route (Institutional Welcome)
app.get('/', (req, res) => {
  res.send(`
    <style>
      body { font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; }
      .card { background: #1e293b; border: 1px solid #334155; padding: 3rem; border-radius: 1.5rem; text-align: center; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
      h1 { font-size: 2.5rem; margin-bottom: 0.5rem; letter-spacing: -0.025em; font-weight: 800; }
      p { color: #94a3b8; line-height: 1.6; margin-bottom: 2rem; }
      .status { display: inline-flex; align-items: center; background: #064e3b; color: #34d399; padding: 0.5rem 1rem; border-radius: 9999px; font-weight: 600; font-size: 0.875rem; }
      .dot { height: 8px; width: 8px; background: #34d399; border-radius: 50%; margin-right: 8px; animation: pulse 2s infinite; }
      .links { border-top: 1px solid #334155; margin-top: 2rem; padding-top: 2rem; display: flex; gap: 1rem; justify-content: center; }
      a { color: #38bdf8; text-decoration: none; font-weight: 500; font-size: 0.9rem; transition: color 0.2s; }
      a:hover { color: #7dd3fc; }
      @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
    </style>
    <div class="card">
      <div class="status"><span class="dot"></span> GATEWAY ACTIVE</div>
      <h1>CONNEX CORE</h1>
      <p>Forensic coordination and evidence layer for institutional settlement. API is functioning at nominal capacity.</p>
      <div class="links">
        <a href="/health">Health Check</a>
        <a href="/metrics">Prometheus Metrics</a>
        <a href="/test-nodes">Node Diagnostics</a>
      </div>
    </div>
  `);
});

// [DEBUG] Diagnostic Node Test Route
app.get('/test-nodes', async (req, res) => {
  const axios = require('axios');
  const { nodeHealthGauge } = require('./lib/metrics');
  const urls = [process.env.NODE_1_URL, process.env.NODE_2_URL, process.env.NODE_3_URL];
  const results = [];
  
  for (let i = 0; i < urls.length; i++) {
    try {
      if (!urls[i]) {
        results.push({ node: i + 1, status: 'MISSING', url: 'NOT SET' });
        nodeHealthGauge.set({ node_id: `Node ${i+1}`, url: 'MISSING' }, 0);
        continue;
      }
      const start = Date.now();
      const response = await axios.get(urls[i].replace('/sign', ''), { timeout: 5000 });
      results.push({ node: i + 1, status: 'ALIVE', latency: `${Date.now() - start}ms`, url: urls[i] });
      nodeHealthGauge.set({ node_id: `Node ${i+1}`, url: urls[i] }, 1);
    } catch (err) {
      results.push({ node: i + 1, status: 'ERROR', error: err.message, url: urls[i] || 'NOT SET' });
      nodeHealthGauge.set({ node_id: `Node ${i+1}`, url: urls[i] || 'NOT SET' }, 0);
    }
  }
  res.json({ environment: process.env.NODE_ENV, results });
});

// Legacy paths redirected to root or handled as 404
app.get('/api/welcome', (req, res) => res.redirect('/'));


app.listen(PORT, '0.0.0.0', () => {
  console.log(`CONNEX API is live on port ${PORT}`);
  
  // Verify cryptographic seam on startup
  const { validateDaisyChainLink } = require('./lib/db');
  validateDaisyChainLink().then(res => {
    if (res.status === 'LINKED' && res.valid) {
      console.log('✅ Blockchain Integrity: Global chain linkage verified.');
    } else if (res.status === 'LINKED' && !res.valid) {
      console.error('❌ Blockchain Integrity Alert: Seam mismatch between projects!');
    } else {
      console.log('ℹ️  Blockchain Integrity: Running in standalone mode.');
    }
  });
});
