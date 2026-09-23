const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const argon2 = require('argon2');

process.env.NODE_ENV = 'test';
process.env.SESSION_TIMEOUT = '3600000';
process.env.FRONTEND_ORIGINS = 'http://localhost:3000';

const db = require('../src/config/database');
const logger = require('../src/config/logger');
logger.silent = true;

const tokens = { Admin: 'a'.repeat(64), Engineer: 'b'.repeat(64), Driver: 'c'.repeat(64), inactive: 'd'.repeat(64) };
let sessions, calls, queries, logs, hash, failDatabase;

// The HTTP app, middleware, services and Argon2 are real. Only SQL/model I/O is doubled.
db.getPool = () => ({ request() {
  const inputs = {};
  return {
    input(name, type, value) { inputs[name] = value; return this; },
    async query(query) {
      queries.push({ query, inputs });
      if (failDatabase) throw new Error('DB password=INTERNAL_SENTINEL; SELECT private_data');
      assert.match(query, /u\.activo\s*=\s*1/);
      const row = sessions[inputs.sessionId];
      return { recordset: row && row.activo ? [row] : [] };
    },
    async execute(procedure) {
      calls.push(procedure);
      if (procedure === 'dbo.sp_cerrar_sesion') { delete sessions[inputs.id_sesion]; return {}; }
      return { recordset: [{ id_usuario: 1, nombre: 'Test', rol: 'Admin', password_hash: hash, secret: 'hidden' }] };
    }
  };
} });

const userModel = require('../src/models/userModel');
const sessionModel = require('../src/models/sessionModel');
const circuitModel = require('../src/models/circuitModel');
const partModel = require('../src/models/partModel');
const carSetupModel = require('../src/models/carSetupModel');
const simulationModel = require('../src/models/simulationModel');
const sponsorModel = require('../src/models/sponsorContributionModel');
const authService = require('../src/services/authService');
const app = require('../src/app');
let server, base;

before(async () => {
  hash = await argon2.hash('ExamplePassword-123!');
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise(resolve => server.close(resolve));
  logger.close();
});

beforeEach(t => {
  calls = []; queries = []; logs = []; failDatabase = false;
  sessions = Object.fromEntries(['Admin', 'Engineer', 'Driver'].map((rol, i) => [tokens[rol], {
    id_usuario: i + 1, nombre: rol, rol, id_equipo: rol === 'Admin' ? 0 : 1, activo: 1
  }]));
  sessions[tokens.inactive] = { id_usuario: 4, rol: 'Admin', activo: 0 };
  for (const method of ['info', 'warn', 'error']) t.mock.method(logger, method, (...args) => logs.push(args));
  t.mock.method(userModel, 'register', async data => {
    calls.push({ register: data });
    return { recordset: [{ id_usuario: 5, ...data }] };
  });
  t.mock.method(userModel, 'getByEmail', async email => {
    if (email === 'missing@example.test') throw new Error('Usuario no encontrado o inactivo.');
    return { recordset: [{ id_usuario: 5, nombre: 'Example', rol: 'Driver', id_equipo: 0, password_hash: hash }] };
  });
  t.mock.method(sessionModel, 'saveSession', async (id, user, minutes) => { calls.push({ session: id, user, minutes }); });
});

async function request(path, { method = 'GET', role, token, body, headers = {} } = {}) {
  const response = await fetch(base + path, {
    method,
    headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(role || token ? { Cookie: `sessionId=${token || tokens[role]}` } : {}), ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const text = await response.text();
  return { status: response.status, headers: response.headers, text, data: text ? JSON.parse(text) : null };
}

const signup = { nombre: 'Example User', email: 'example@example.test', password: 'ExamplePassword-123!' };

test('public registration refuses privileged roles and team selection before writing', async () => {
  for (const extra of [{ rol: 'Admin' }, { rol: 'Engineer' }, { rol: 'admin' }, { id_equipo: 2 }]) {
    const res = await request('/api/auth/register', { method: 'POST', body: { ...signup, ...extra } });
    assert.equal(res.status, 403);
  }
  assert.equal(calls.length, 0);
});

test('public registration hashes the password and creates only an unassigned Driver', async () => {
  const res = await request('/api/auth/register', { method: 'POST', body: signup });
  assert.equal(res.status, 201);
  const row = calls[0].register;
  assert.equal(row.rol, 'Driver'); assert.equal(row.id_equipo, 0);
  assert.ok(await argon2.verify(row.password_hash, signup.password));
  assert.equal(row.password, undefined);
  assert.doesNotMatch(res.text, /password|\$argon2/);
});

test('registration validates input server-side without reaching SQL', async () => {
  for (const body of [{}, { ...signup, password: 'short' }, { ...signup, email: ['bad'] }, { ...signup, nombre: 'x'.repeat(121) }]) {
    assert.equal((await request('/api/auth/register', { method: 'POST', body })).status, 400);
  }
  assert.equal(calls.length, 0);
});

test('only Admin can create management accounts, with a real team for engineers', async () => {
  for (const role of [undefined, 'Driver', 'Engineer']) {
    const res = await request('/api/users/accounts', { method: 'POST', role, body: { ...signup, rol: 'Admin' } });
    assert.equal(res.status, role ? 403 : 401);
  }
  assert.equal(calls.length, 0);
  assert.equal((await request('/api/users/accounts', { method: 'POST', role: 'Admin', body: { ...signup, rol: 'Engineer' } })).status, 400);
  const res = await request('/api/users/accounts', { method: 'POST', role: 'Admin', body: { ...signup, rol: 'Engineer', id_equipo: 2 } });
  assert.equal(res.status, 201); assert.equal(calls[0].register.id_equipo, 2);
  assert.doesNotMatch(res.text, /password|\$argon2/);
});

test('service-level account creation also rejects non-admin actors', async () => {
  await assert.rejects(authService.createAccount(signup, { rol: 'Engineer' }), { status: 403 });
  assert.equal(calls.length, 0);
});

test('login never serializes a password hash and keeps session lifetime consistent', async () => {
  const res = await request('/api/auth/login', { method: 'POST', body: { email: signup.email, password: signup.password } });
  assert.equal(res.status, 200);
  assert.doesNotMatch(res.text, /password|\$argon2/);
  assert.match(res.headers.get('set-cookie'), /HttpOnly/);
  assert.match(res.headers.get('set-cookie'), /SameSite=Lax/);
  assert.match(res.headers.get('set-cookie'), /Max-Age=3600/);
  assert.equal(calls[0].minutes, 60);
  assert.doesNotMatch(JSON.stringify(logs), new RegExp(calls[0].session));
});

test('unknown user and incorrect password receive the same authentication error', async () => {
  const missing = await request('/api/auth/login', { method: 'POST', body: { email: 'missing@example.test', password: signup.password } });
  const incorrect = await request('/api/auth/login', { method: 'POST', body: { email: signup.email, password: 'incorrect' } });
  assert.equal(missing.status, 401); assert.equal(incorrect.status, 401);
  assert.deepEqual(missing.data, incorrect.data); assert.equal(calls.length, 0);
});

test('inactive, expired and malformed sessions fail closed', async () => {
  for (const token of [tokens.inactive, 'e'.repeat(64), 'malformed']) {
    assert.equal((await request('/api/auth/check-auth', { token })).status, 401);
  }
  assert.ok(queries.every(({ query }) => /u\.activo\s*=\s*1/.test(query) && query.includes('s.expira > SYSUTCDATETIME()')));
});

test('profile/check responses allowlist user fields even if SQL returns secrets', async () => {
  sessions[tokens.Admin].password_hash = hash;
  for (const path of ['/api/auth/check-auth', '/api/auth/profile']) {
    const res = await request(path, { role: 'Admin' });
    assert.equal(res.status, 200); assert.doesNotMatch(res.text, /password|secret|\$argon2/);
  }
});

test('logout invalidates the session without logging its identifier', async () => {
  assert.equal((await request('/api/auth/logout', { method: 'POST', role: 'Admin' })).status, 200);
  assert.equal((await request('/api/auth/check-auth', { role: 'Admin' })).status, 401);
  assert.doesNotMatch(JSON.stringify(logs), new RegExp(tokens.Admin));
});

test('sensitive user/circuit writes reject Driver and Engineer before model access', async t => {
  for (const method of ['assignTeam', 'updateDriverSkill', 'createDriverProfile']) t.mock.method(userModel, method, async () => { calls.push(method); return { rowsAffected: [1] }; });
  for (const method of ['createCircuit', 'deleteCircuit']) t.mock.method(circuitModel, method, async () => { calls.push(method); return { recordset: [{}] }; });
  const endpoints = [['PUT', '/api/users/2/assign-team', { id_equipo: 2 }], ['PATCH', '/api/users/drivers/2/skill', { habilidad: 90 }], ['POST', '/api/users/drivers', { nombre: 'Driver' }], ['POST', '/api/circuits', { nombre: 'Circuit' }], ['DELETE', '/api/circuits/2', undefined]];
  for (const [method, path, body] of endpoints) {
    for (const role of ['Engineer', 'Driver']) assert.equal((await request(path, { method, role, body })).status, 403);
  }
  assert.equal(calls.length, 0);
  for (const [method, path, body] of endpoints) assert.ok([200, 201].includes((await request(path, { method, role: 'Admin', body })).status));
  assert.equal(calls.length, endpoints.length);
});

test('purchase rejects drivers and other teams while preserving own-team Engineer access', async t => {
  t.mock.method(partModel, 'buyPart', async () => { calls.push('buy'); return { recordset: [{ ok: true }] }; });
  const body = { id_equipo: 1, id_pieza: 1, cantidad: 1 };
  assert.equal((await request('/api/parts/buy', { method: 'POST', role: 'Driver', body })).status, 403);
  assert.equal((await request('/api/parts/buy', { method: 'POST', role: 'Engineer', body: { ...body, id_equipo: 2 } })).status, 403);
  assert.equal(calls.length, 0);
  assert.equal((await request('/api/parts/buy', { method: 'POST', role: 'Engineer', body })).status, 200);
});

test('car ownership is checked before get-or-create setup can mutate data', async t => {
  t.mock.method(carSetupModel, 'getCarTeam', async () => ({ recordset: [{ id_equipo: 2 }] }));
  t.mock.method(carSetupModel, 'getOrCreateCurrentSetup', async () => { calls.push('create'); });
  t.mock.method(carSetupModel, 'getCarSetupSummary', async () => ({ recordsets: [[{ id_carro: 2 }], []] }));
  assert.equal((await request('/api/car-setup/car/2', { role: 'Engineer' })).status, 403);
  assert.equal(calls.length, 0);
  assert.equal((await request('/api/car-setup/car/2', { role: 'Admin' })).status, 200);
  assert.deepEqual(calls, ['create']);
});

test('simulation results and piece snapshots stay within the viewer team', async t => {
  t.mock.method(simulationModel, 'getSimulationResults', async () => ({ recordset: [{ id_equipo: 1, id_carro: 10 }, { id_equipo: 2, id_carro: 20 }] }));
  t.mock.method(simulationModel, 'getConductorByUser', async () => ({ recordset: [{ id_equipo: 1 }] }));
  t.mock.method(simulationModel, 'getSimulationHeader', async () => ({ recordset: [{ id_simulacion: 1 }] }));
  t.mock.method(simulationModel, 'getSimulationPiecesSnapshot', async () => ({ recordset: [{ id_carro: 10, part_id: 1 }, { id_carro: 20, part_id: 2 }] }));
  for (const role of ['Engineer', 'Driver']) {
    const detail = await request('/api/simulations/1', { role });
    assert.equal(detail.status, 200);
    assert.deepEqual(detail.data.resultados, [{ id_equipo: 1, id_carro: 10 }]);
    assert.deepEqual(Object.keys(detail.data.setup_snapshot), ['10']);
    assert.equal((await request('/api/simulations/1/results', { role })).data.length, 1);
  }
  assert.equal((await request('/api/simulations/1/results', { role: 'Admin' })).data.length, 2);
});

test('unassigned users cannot view simulations or eligible-car data', async t => {
  sessions[tokens.Engineer].id_equipo = 0;
  t.mock.method(simulationModel, 'getSimulationResults', async () => ({ recordset: [{ id_equipo: 1, id_carro: 10 }] }));
  assert.equal((await request('/api/simulations/1/results', { role: 'Engineer' })).status, 403);
  assert.equal((await request('/api/simulations/eligible-cars', { role: 'Driver' })).status, 403);
});

test('driver listings filter other teams and never include hashes', async t => {
  t.mock.method(userModel, 'getAllDrivers', async () => ({ recordset: [{ id_driver: 1, id_equipo: 1, password_hash: hash }, { id_driver: 2, id_equipo: 2 }] }));
  const res = await request('/api/users/drivers', { role: 'Engineer' });
  assert.deepEqual(res.data, [{ id_driver: 1, id_equipo: 1 }]);
  assert.equal((await request('/api/users/drivers', { role: 'Driver' })).status, 403);
});

test('internal SQL errors do not escape through responses or logs', async t => {
  t.mock.method(sponsorModel, 'createSponsor', async () => { throw new Error('DB password=INTERNAL_SENTINEL; SELECT private_data'); });
  const res = await request('/api/sponsors', { method: 'POST', role: 'Admin', body: { nombre: 'Example' } });
  assert.equal(res.status, 500);
  assert.doesNotMatch(res.text + JSON.stringify(logs), /INTERNAL_SENTINEL|private_data/);
  failDatabase = true;
  assert.equal((await request('/api/auth/check-auth', { role: 'Admin' })).status, 500);
  assert.doesNotMatch(JSON.stringify(logs), /INTERNAL_SENTINEL|private_data/);
});

test('request logs omit query strings and authentication request bodies', async () => {
  await request('/api/health?token=QUERY_SENTINEL');
  await request('/api/auth/login', { method: 'POST', body: { email: signup.email, password: 'BODY_SENTINEL' } });
  assert.doesNotMatch(JSON.stringify(logs), /QUERY_SENTINEL|BODY_SENTINEL/);
});

test('CORS checks both preflight and state-changing requests against exact origins', async () => {
  const allowed = await request('/api/auth/register', { method: 'OPTIONS', headers: { Origin: 'http://localhost:3000', 'Access-Control-Request-Method': 'POST' } });
  assert.equal(allowed.status, 204); assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  for (const method of ['OPTIONS', 'POST']) {
    const res = await request('/api/auth/register', { method, body: method === 'POST' ? signup : undefined, headers: { Origin: 'http://192.168.1.99:3000' } });
    assert.equal(res.status, 403);
  }
  assert.equal(calls.length, 0);
});

test('malformed JSON receives a safe client error', async () => {
  const res = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"password":"SENTINEL"' });
  assert.equal(res.status, 400); assert.doesNotMatch(await res.text(), /SENTINEL|SyntaxError/);
});
