require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const { router: metricsRouter, metricsMiddleware } = require('./routes/metricsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors());
app.use(express.json());

// Track metrics for Prometheus
app.use(metricsMiddleware);

// Expose /metrics for Prometheus monitoring
app.use(metricsRouter);

// Kubernetes Health Probes
app.get('/health', async (req, res) => {
  let dbStatus = 'healthy';
  try {
    await db.query('SELECT 1');
  } catch (err) {
    dbStatus = 'disconnected';
  }

  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'nascon-backend-api',
    database: dbStatus,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', eventRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Start Server only if executed directly (not when imported for tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 NASCON Backend API running on port ${PORT}`);
    console.log(`📊 Prometheus Metrics available at :${PORT}/metrics`);
    console.log(`🩺 Health Probe available at :${PORT}/health`);
    console.log(`=================================================`);
  });
}

module.exports = app;
