import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const size = 256;
const rgba = Buffer.alloc(size * size * 4);

function blend(x, y, color, alpha = 1) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const offset = (y * size + x) * 4;
  const a = Math.max(0, Math.min(1, alpha));
  for (let channel = 0; channel < 3; channel += 1) rgba[offset + channel] = Math.round(rgba[offset + channel] * (1 - a) + color[channel] * a);
  rgba[offset + 3] = 255;
}

function disc(cx, cy, radius, color) {
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const distance = Math.hypot(x - cx, y - cy);
      if (distance <= radius + 1) blend(x, y, color, Math.min(1, radius + 1 - distance));
    }
  }
}

function line(x1, y1, x2, y2, width, color) {
  const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1));
  for (let i = 0; i <= steps; i += 1) disc(x1 + (x2 - x1) * i / steps, y1 + (y2 - y1) * i / steps, width / 2, color);
}

for (let y = 0; y < size; y += 1) {
  for (let x = 0; x < size; x += 1) {
    const radius = 48;
    const inside = x >= radius || y >= radius || Math.hypot(x - radius, y - radius) <= radius;
    const insideTopRight = x < size - radius || y >= radius || Math.hypot(x - (size - radius), y - radius) <= radius;
    const insideBottomLeft = x >= radius || y < size - radius || Math.hypot(x - radius, y - (size - radius)) <= radius;
    const insideBottomRight = x < size - radius || y < size - radius || Math.hypot(x - (size - radius), y - (size - radius)) <= radius;
    if (inside && insideTopRight && insideBottomLeft && insideBottomRight) {
      const t = (x + y) / (size * 2);
      blend(x, y, [Math.round(8 + 12 * t), Math.round(22 + 24 * t), Math.round(36 + 34 * t)]);
    }
  }
}

const orange = [255, 153, 0];
line(52, 140, 52, 112, 12, orange); line(52, 112, 69, 91, 12, orange); line(69, 91, 91, 88, 12, orange);
line(91, 88, 108, 56, 12, orange); line(108, 56, 146, 53, 12, orange); line(146, 53, 170, 80, 12, orange);
line(170, 80, 194, 89, 12, orange); line(194, 89, 207, 111, 12, orange); line(207, 111, 202, 138, 12, orange); line(202, 138, 51, 140, 12, orange);
line(55, 181, 201, 181, 8, [103, 183, 255]);
disc(73, 181, 13, orange); disc(128, 181, 13, [103, 183, 255]); disc(183, 181, 13, [61, 220, 132]);

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const output = Buffer.alloc(data.length + 12);
  output.writeUInt32BE(data.length, 0); name.copy(output, 4); data.copy(output, 8);
  output.writeUInt32BE(crc32(Buffer.concat([name, data])), data.length + 8);
  return output;
}

const raw = Buffer.alloc((size * 4 + 1) * size);
for (let y = 0; y < size; y += 1) {
  const row = y * (size * 4 + 1);
  raw[row] = 0;
  rgba.copy(raw, row + 1, y * size * 4, (y + 1) * size * 4);
}
const header = Buffer.alloc(13); header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 6;
const png = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
const icoHeader = Buffer.from([0,0,1,0,1,0,0,0,0,0,1,0,32,0]);
const icoEntry = Buffer.alloc(8); icoEntry.writeUInt32LE(png.length, 0); icoEntry.writeUInt32LE(22, 4);

fs.mkdirSync(path.join(root, 'build'), { recursive: true });
fs.writeFileSync(path.join(root, 'assets', 'icon.png'), png);
fs.writeFileSync(path.join(root, 'build', 'icon.ico'), Buffer.concat([icoHeader, icoEntry, png]));
console.log('Iconos generados: assets/icon.png y build/icon.ico');
