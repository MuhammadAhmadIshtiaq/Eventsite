const express = require('express');
const client = require('prom-client');

const router = express.Router();

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'nascon-event-backend',
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestsTotal = new client.Counter({
  name: 'nascon_http_requests_total',
  help: 'Total number of HTTP requests made to NASCON backend',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestsTotal);

const registrationsTotal = new client.Counter({
  name: 'nascon_registrations_total',
  help: 'Total number of competition registrations submitted in NASCON',
  labelNames: ['event_category'],
});
register.registerMetric(registrationsTotal);

const activeUsersGauge = new client.Gauge({
  name: 'nascon_active_events_gauge',
  help: 'Number of active competitions available in NASCON',
});
register.registerMetric(activeUsersGauge);

// Middleware to record request metrics
function metricsMiddleware(req, res, next) {
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    httpRequestsTotal.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode,
    });
  });
  next();
}

// /metrics endpoint for Prometheus scraping
router.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex.message);
  }
});

module.exports = {
  router,
  metricsMiddleware,
  registrationsTotal,
  activeUsersGauge,
};

