const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildDatabaseConfig } = require('../src/config/database');
const { corsOptions } = require('../src/config/cors');
const { publicUser } = require('../src/security/userResponse');
const { sessionTimeoutMs } = require('../src/security/authPolicy');

test('session lifetime cannot differ between SQL minute precision and cookie milliseconds', () => {
  assert.equal(sessionTimeoutMs({ SESSION_TIMEOUT: '120000' }), 120000);
  for (const value of ['90001', '0', '86460000', 'invalid']) {
    assert.throws(() => sessionTimeoutMs({ SESSION_TIMEOUT: value }), /whole number of minutes/);
  }
});

test('database credentials are required and example placeholders cannot start the server', () => {
  for (const env of [{}, { DB_USER: 'local' }, { DB_USER: 'YOUR_LOCAL_DB_USER', DB_PASSWORD: 'YOUR_LOCAL_DB_PASSWORD' }]) {
    assert.throws(() => buildDatabaseConfig(env), /must be supplied/);
  }
});

test('database configuration defaults to verified TLS and rejects insecure production overrides', () => {
  const env = { DB_USER: 'test-user', DB_PASSWORD: 'test-only-value' };
  assert.deepEqual(buildDatabaseConfig(env).options, { encrypt: true, trustServerCertificate: false });
  for (const override of [{ DB_ENCRYPT: 'false' }, { DB_TRUST_SERVER_CERTIFICATE: 'true' }]) {
    assert.throws(() => buildDatabaseConfig({ ...env, NODE_ENV: 'production', ...override }), /verified TLS/);
  }
  assert.throws(() => buildDatabaseConfig({ ...env, DB_ENCRYPT: 'typo' }), /true or false/);
});

test('production requires explicit HTTPS origins', () => {
  assert.throws(() => corsOptions({ NODE_ENV: 'production' }), /FRONTEND_ORIGINS/);
  assert.throws(() => corsOptions({ NODE_ENV: 'production', FRONTEND_ORIGINS: 'http://example.test' }), /Invalid/);
  assert.doesNotThrow(() => corsOptions({ NODE_ENV: 'production', FRONTEND_ORIGINS: 'https://example.test' }));
});

test('user serialization is an allowlist, not a password-field blacklist', () => {
  assert.deepEqual(publicUser({ id_usuario: 1, rol: 'Driver', password_hash: 'test', sessionId: 'test', futureSecret: 'test' }), { id_usuario: 1, rol: 'Driver' });
});
