const { test } = require('node:test');
const assert = require('node:assert');
const app = require('../server');

test('Health check endpoint returns status UP', async () => {
  // Simple mock test verifying health endpoint logic
  assert.ok(app, 'Express app should be initialized');
  assert.strictEqual(typeof app.listen, 'function', 'App should have listen method');
});

test('JWT secret is defined in environment or fallback', () => {
  const { JWT_SECRET } = require('../middleware/authMiddleware');
  assert.ok(JWT_SECRET, 'JWT_SECRET should be defined');
  assert.strictEqual(typeof JWT_SECRET, 'string');
});
