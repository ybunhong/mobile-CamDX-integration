/**
 * Local enrolment server for the on-device eKYC app.
 *
 * Stores face feature vectors in memory only — nothing is written to disk and
 * everything is lost when the process stops. Face matching itself happens on
 * the device (the SDK owns the similarity calibration), so this server only
 * keeps records and hands them back.
 */
const express = require('express');

const PORT = Number(process.env.PORT || 3001);

/** @type {Map<string, object>} */
const enrollments = new Map();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Permissive CORS: this is a LAN-only development helper.
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.options('/*splat', (_req, res) => res.sendStatus(204));

app.get('/health', (_req, res) => {
  res.json({ ok: true, count: enrollments.size, ts: Date.now() });
});

app.get('/api/enrollments', (_req, res) => {
  res.json([...enrollments.values()]);
});

app.get('/api/enrollments/:idNumber', (req, res) => {
  const found = enrollments.get(req.params.idNumber);
  if (!found) return res.status(404).json({ error: 'not found' });
  res.json(found);
});

app.post('/api/enrollments', (req, res) => {
  const { idNumber, userInfo, selfieFeature, documentFeature } = req.body ?? {};

  if (!idNumber || !userInfo) {
    return res.status(400).json({ error: 'idNumber and userInfo are required' });
  }
  if (!selfieFeature || !documentFeature) {
    return res.status(400).json({ error: 'selfieFeature and documentFeature are required' });
  }

  const enrollment = {
    idNumber,
    userInfo,
    selfieFeature,
    documentFeature,
    createdAt: Date.now(),
  };

  // One record per ID number: re-enrolling the same ID replaces the previous
  // one. The caller is told so it can say "updated" instead of "added".
  const replaced = enrollments.has(idNumber);
  enrollments.set(idNumber, enrollment);

  console.log(
    `${replaced ? 'replaced' : 'enrolled'} ${idNumber} (${enrollments.size} total)`,
  );

  res.json({ ok: true, enrollment, replaced });
});

app.delete('/api/enrollments/:idNumber', (req, res) => {
  enrollments.delete(req.params.idNumber);
  res.json({ ok: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Enrolment server on http://0.0.0.0:${PORT}`);
  console.log(`  health: http://<your-LAN-IP>:${PORT}/health`);
  console.log('  records are in memory only — restarting clears them');
});
