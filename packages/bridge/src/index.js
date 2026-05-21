#!/usr/bin/env node
// MadMapper OSC bridge: relays WebSocket <-> UDP OSC and serves the built PWA.
//
// Browsers cannot speak raw UDP, so this companion process bridges the PWA
// (over WebSocket) to MadMapper (over UDP OSC). It also serves the static PWA
// build so a phone can just open http://<laptop-ip>:<port>.
//
// Config via environment variables:
//   HTTP_PORT      HTTP + WebSocket port for the PWA/clients   (default 8080)
//   MADMAPPER_HOST MadMapper host                              (default 127.0.0.1)
//   OSC_OUT_PORT   MadMapper OSC input port (we send here)     (default 8000)
//   OSC_IN_PORT    MadMapper OSC feedback port (we listen)     (default 9000)

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { WebSocketServer } from 'ws';
import sirv from 'sirv';
import osc from 'osc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HTTP_PORT = Number(process.env.HTTP_PORT ?? 8080);
const MADMAPPER_HOST = process.env.MADMAPPER_HOST ?? '127.0.0.1';
const OSC_OUT_PORT = Number(process.env.OSC_OUT_PORT ?? 8000);
const OSC_IN_PORT = Number(process.env.OSC_IN_PORT ?? 9000);

// --- Static PWA server -----------------------------------------------------
const distDir = path.resolve(__dirname, '../../app/dist');
const hasBuild = existsSync(path.join(distDir, 'index.html'));
const serveStatic = hasBuild
  ? sirv(distDir, { single: true, dev: false })
  : null;

const server = http.createServer((req, res) => {
  if (serveStatic) {
    serveStatic(req, res, () => {
      res.statusCode = 404;
      res.end('Not found');
    });
  } else {
    res.statusCode = 200;
    res.setHeader('content-type', 'text/plain');
    res.end(
      'mad-osc bridge running.\n' +
        'No PWA build found yet (run `npm run build`).\n' +
        'In development, open the Vite dev server instead.\n'
    );
  }
});

// --- UDP OSC <-> MadMapper --------------------------------------------------
const udp = new osc.UDPPort({
  localAddress: '0.0.0.0',
  localPort: OSC_IN_PORT, // listen for MadMapper feedback
  remoteAddress: MADMAPPER_HOST,
  remotePort: OSC_OUT_PORT, // send to MadMapper input
  metadata: true,
});

udp.on('error', (err) => console.error('[osc] error:', err.message));
udp.on('ready', () => {
  console.log(
    `[osc] sending to ${MADMAPPER_HOST}:${OSC_OUT_PORT}, listening on :${OSC_IN_PORT}`
  );
});

// --- WebSocket bridge -------------------------------------------------------
const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Set();

function broadcast(obj) {
  const data = JSON.stringify(obj);
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) ws.send(data);
  }
}

// Feedback from MadMapper -> all connected PWA clients.
udp.on('message', (oscMsg, _timeTag, info) => {
  broadcast({ type: 'osc', address: oscMsg.address, args: oscMsg.args, info });
});

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[ws] client connected (${clients.size} total)`);
  ws.send(
    JSON.stringify({
      type: 'hello',
      target: { host: MADMAPPER_HOST, port: OSC_OUT_PORT },
      feedbackPort: OSC_IN_PORT,
    })
  );

  ws.on('message', (raw) => {
    let parsed;
    try {
      parsed = JSON.parse(raw.toString());
    } catch {
      return; // ignore non-JSON
    }
    if (parsed.type === 'osc' && typeof parsed.address === 'string') {
      try {
        udp.send({ address: parsed.address, args: parsed.args ?? [] });
      } catch (err) {
        console.error('[osc] send failed:', err.message);
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[ws] client disconnected (${clients.size} total)`);
  });
});

udp.open();
server.listen(HTTP_PORT, () => {
  console.log(`[http] PWA + WebSocket on http://localhost:${HTTP_PORT}  (ws: /ws)`);
  if (!hasBuild) console.log('[http] (serving placeholder until PWA is built)');
});
