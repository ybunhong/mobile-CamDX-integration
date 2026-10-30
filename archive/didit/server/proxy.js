require('dotenv').config();
const express = require('express');
const cors = require('cors');

const DIDIT_API_KEY = process.env.DIDIT_API_KEY;
const DIDIT_BASE_URL = process.env.DIDIT_BASE_URL || 'https://verification.didit.me';
const PORT = process.env.PORT || 3001;

// Free KYC workflow ID from Didit documentation
const WORKFLOW_ID = '75626849-71d0-4709-b705-c67394fef357';

if (!DIDIT_API_KEY) {
  console.error('DIDIT_API_KEY missing in .env');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Health check — hit this from the phone's browser to confirm reachability
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Create a Didit verification session
app.post('/api/create-session', async (req, res) => {
  try {
    const { vendorData } = req.body;

    const response = await fetch(`${DIDIT_BASE_URL}/v3/session/`, {
      method: 'POST',
      headers: {
        'x-api-key': DIDIT_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: WORKFLOW_ID,
        vendor_data: vendorData || 'mobile-user',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Didit session creation error', response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const session = await response.json();
    // Return only what the client needs
    res.json({
      url: session.url,
      session_id: session.session_id,
      session_token: session.session_token,
    });
  } catch (e) {
    console.error('session creation exception', e);
    res.status(500).json({ error: String(e) });
  }
});

// Get session decision/status
app.get('/api/session/:sessionId/decision', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const response = await fetch(`${DIDIT_BASE_URL}/v3/session/${sessionId}/decision/`, {
      method: 'GET',
      headers: {
        'x-api-key': DIDIT_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Didit decision fetch error', response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const decision = await response.json();
    res.json(decision);
  } catch (e) {
    console.error('decision fetch exception', e);
    res.status(500).json({ error: String(e) });
  }
});

// Bind to 0.0.0.0 so emulator/device can reach it
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Didit proxy on http://0.0.0.0:${PORT}`);
  console.log(`  health: http://<your-LAN-IP>:${PORT}/health`);
  console.log(`  session creation: POST http://<your-LAN-IP>:${PORT}/api/create-session`);
});
