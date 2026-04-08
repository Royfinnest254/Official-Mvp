const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'connex-gateway',
  env: process.env.NODE_ENV || 'production'
});

// Enable the collection of default metrics (CPU, Memory, Event Loop Lag, etc.)
client.collectDefaultMetrics({ register });

// --- TRANSACTION METRICS ---

const transactionCounter = new client.Counter({
  name: 'connex_transactions_total',
  help: 'Total number of transaction coordination requests',
  labelNames: ['institution_a', 'institution_b', 'status', 'event_type']
});

const consensusLatency = new client.Histogram({
  name: 'connex_consensus_latency_seconds',
  help: 'Time taken to reach 2-of-3 quorum consensus',
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
});

const nodeHealthGauge = new client.Gauge({
  name: 'connex_witness_node_status',
  help: 'Real-time status of individual witness nodes (1:Alive, 0:Error)',
  labelNames: ['node_id', 'url']
});

// --- API PERFORMANCE METRICS ---

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5]
});

// Register custom metrics
register.registerMetric(transactionCounter);
register.registerMetric(consensusLatency);
register.registerMetric(nodeHealthGauge);
register.registerMetric(httpRequestDuration);

module.exports = {
  register,
  transactionCounter,
  consensusLatency,
  nodeHealthGauge,
  httpRequestDuration
};
