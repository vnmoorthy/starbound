import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { runExperiment } from './astra-runner.mjs';
const token = randomBytes(24).toString('hex');
let busy = false,
  progress = null;
const allowed = new Set(['http://127.0.0.1:3000', 'http://localhost:3000']);
function authorized(value) {
  const bytes = Buffer.from(typeof value === 'string' ? value : '');
  const expected = Buffer.from(token);
  return bytes.length === expected.length && timingSafeEqual(bytes, expected);
}
const server = createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin && !allowed.has(origin)) {
    res.writeHead(403);
    res.end('Origin is not allowed.');
    return;
  }
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') {
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, X-StarBound-Token',
    );
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET');
    res.writeHead(204);
    res.end();
    return;
  }
  const send = (status, data) => {
    res.writeHead(status);
    res.end(JSON.stringify(data));
  };
  if (req.url === '/health' && req.method === 'GET') {
    send(200, { status: 'ready', busy, model: 'gpt-6-astra' });
    return;
  }
  if (req.url === '/progress' && req.method === 'GET') {
    if (!authorized(req.headers['x-starbound-token'])) {
      send(401, { error: 'Unauthorized.' });
      return;
    }
    send(200, { busy, progress });
    return;
  }
  if (req.url !== '/run' || req.method !== 'POST') {
    send(404, { error: 'Not found.' });
    return;
  }
  if (!authorized(req.headers['x-starbound-token'])) {
    send(401, { error: 'Open the local lab URL printed by npm run lab.' });
    return;
  }
  if (busy) {
    send(409, { error: 'An experiment is already running. Please wait.' });
    return;
  }
  busy = true;
  try {
    let body = '';
    for await (const b of req) {
      body += b;
      if (body.length > 16000) throw new Error('Request too large.');
    }
    const input = JSON.parse(body);
    progress = null;
    const record = await runExperiment({
      ...input,
      rounds: 3,
      onProgress: (p) => {
        progress = p;
      },
    });
    send(200, record);
  } catch (e) {
    send(400, { error: e.message });
  } finally {
    busy = false;
  }
});
server.requestTimeout = 600000;
server.headersTimeout = 15000;
server.listen(8766, '127.0.0.1', () =>
  console.log(
    `StarBound Astra lab is local only. With npm run dev running, open:\nhttp://127.0.0.1:3000/#lab=${token}\nEach experiment uses your Codex quota. Keep this temporary URL private.`,
  ),
);
