#!/usr/bin/env node
/**
 * Download the Leipzig Ergebnishaushalt Excel files declared in
 * scripts/data-sources.js into daten/ (gitignored). Existing files are kept;
 * pass --force to re-download.
 */

const fs = require('fs');
const path = require('path');
const { SOURCES } = require('./data-sources');

const DATEN_DIR = path.join(__dirname, '..', 'daten');
const force = process.argv.includes('--force');

async function download(source) {
  const target = path.join(DATEN_DIR, source.file);
  if (fs.existsSync(target) && !force) {
    console.log(`  = ${source.file} already present (use --force to re-download)`);
    return;
  }
  console.log(`  ↓ ${source.file}\n    ${source.url}`);
  const res = await fetch(source.url);
  if (!res.ok) {
    throw new Error(`Download failed for ${source.id}: HTTP ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(target, buffer);
  console.log(`  ✓ ${source.file} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  fs.mkdirSync(DATEN_DIR, { recursive: true });
  console.log(`Downloading Leipzig budget data into ${path.relative(process.cwd(), DATEN_DIR)}/`);
  for (const source of SOURCES) {
    await download(source);
  }
}

main().catch((err) => {
  console.error('✗', err.message);
  process.exit(1);
});
