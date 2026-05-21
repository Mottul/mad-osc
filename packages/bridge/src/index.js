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
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { WebSocketServer } from 'ws';
import sirv from 'sirv';
import osc from 'osc';
import qrcode from 'qrcode-terminal';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HTTP_PORT = Number(process.env.HTTP_PORT ?? 8080);
const MADMAPPER_HOST = process.env.MADMAPPER_HOST ?? '127.0.0.1';
const OSC_OUT_PORT = Number(process.env.OSC_OUT_PORT ?? 8000);
const OSC_IN_PORT = Number(process.env.OSC_IN_PORT ?? 9000);

// First non-internal IPv4 address, so phones on the same Wi-Fi can reach us.
function lanIp() {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const ni of ifaces ?? []) {
      if (ni.family === 'IPv4' && !ni.internal) return ni.address;
    }
  }
  return 'localhost';
}

const LAN_URL = `http://${lanIp()}:${HTTP_PORT}`;

// --- Shared layout storage (so all devices see the same layouts) -----------
const DATA_DIR = process.env.DATA_DIR ?? path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'layouts.json');
/** @type {Map<string, any>} id -> layout */
const layouts = new Map();

function loadLayouts() {
  try {
    const arr = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    if (Array.isArray(arr)) for (const l of arr) if (l?.id) layouts.set(l.id, l);
    console.log(`[layouts] loaded ${layouts.size} from ${DATA_FILE}`);
  } catch {
    /* no file yet */
  }
}

let saveTimer = null;
function persistLayouts() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      mkdirSync(DATA_DIR, { recursive: true });
      writeFileSync(DATA_FILE, JSON.stringify([...layouts.values()], null, 2));
    } catch (err) {
      console.error('[layouts] save failed:', err.message);
    }
  }, 200);
}

loadLayouts();

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

function broadcast(obj, except) {
  const data = JSON.stringify(obj);
  for (const ws of clients) {
    if (ws !== except && ws.readyState === ws.OPEN) ws.send(data);
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
      lanUrl: LAN_URL,
    })
  );
  // Send the current shared layouts so this device adopts them.
  ws.send(JSON.stringify({ type: 'layouts:snapshot', layouts: [...layouts.values()] }));

  ws.on('message', (raw) => {
    let parsed;
    try {
      parsed = JSON.parse(raw.toString());
    } catch {
      return; // ignore non-JSON
    }
    switch (parsed.type) {
      case 'osc':
        if (typeof parsed.address === 'string') {
          try {
            udp.send({ address: parsed.address, args: parsed.args ?? [] });
          } catch (err) {
            console.error('[osc] send failed:', err.message);
          }
        }
        break;
      case 'layouts:save':
        if (parsed.layout?.id) {
          layouts.set(parsed.layout.id, parsed.layout);
          persistLayouts();
          broadcast({ type: 'layouts:update', layout: parsed.layout }, ws);
        }
        break;
      case 'layouts:delete':
        if (parsed.id && layouts.delete(parsed.id)) {
          persistLayouts();
          broadcast({ type: 'layouts:remove', id: parsed.id }, ws);
        }
        break;
      case 'layouts:get':
        ws.send(JSON.stringify({ type: 'layouts:snapshot', layouts: [...layouts.values()] }));
        break;
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[ws] client disconnected (${clients.size} total)`);
  });
});

udp.open();
server.listen(HTTP_PORT, () => {
  console.log('');
  console.log('  mad-osc bridge is running.');
  console.log(`  Laptop : http://localhost:${HTTP_PORT}`);
  console.log(`  Phone  : ${LAN_URL}   (scan the QR below)`);
  console.log('');
  qrcode.generate(LAN_URL, { small: true });
  console.log('');
  if (!hasBuild) console.log('  (no PWA build yet — run `npm run build`; in dev use the Vite URL)');
});
