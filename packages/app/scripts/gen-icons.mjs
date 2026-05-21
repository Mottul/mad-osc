// Generates simple brand PNG icons (no external deps) for the PWA manifest.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../public');

const BG = [17, 20, 26, 255];
const ACCENT = [61, 220, 151, 255];
const ACCENT2 = [45, 156, 219, 255];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function png(size) {
  const px = (x, y, c) => {
    const o = y * (size * 4 + 1) + 1 + x * 4;
    raw[o] = c[0];
    raw[o + 1] = c[1];
    raw[o + 2] = c[2];
    raw[o + 3] = c[3];
  };
  const raw = Buffer.alloc(size * (size * 4 + 1));
  // fill background (filter byte per row defaults to 0)
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) px(x, y, BG);

  const u = size / 512; // scale from the 512 design grid
  const rect = (rx, ry, rw, rh, c) => {
    for (let y = Math.round(ry * u); y < Math.round((ry + rh) * u); y++)
      for (let x = Math.round(rx * u); x < Math.round((rx + rw) * u); x++)
        if (x >= 0 && y >= 0 && x < size && y < size) px(x, y, c);
  };
  // two faders + a header bar, matching the favicon vibe
  rect(112, 120, 40, 240, ACCENT2);
  rect(112, 240, 40, 120, ACCENT);
  rect(252, 120, 148, 40, [38, 45, 56, 255]);
  rect(252, 120, 74, 40, ACCENT2);
  rect(252, 280, 120, 80, ACCENT);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [192, 512]) {
  writeFileSync(path.join(outDir, `icon-${size}.png`), png(size));
  console.log(`wrote icon-${size}.png`);
}
