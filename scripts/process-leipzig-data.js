#!/usr/bin/env node
/**
 * Process the Leipzig Ergebnishaushalt Excel files (one per Doppelhaushalt)
 * into a single intermediate JSON: src/data/leipzig-budget-data.json
 *
 * Pure Node.js implementation - no Python needed.
 * Sources and their column layouts are declared in scripts/data-sources.js.
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { SOURCES, ALL_YEARS, DEFAULT_YEAR } = require('./data-sources');

// Mapping table: Product code prefix (Produktbereich) → Policy block
const MAPPING = {
  '11': 'A', '12': 'A',
  '21': 'B', '22': 'B', '23': 'B', '24': 'B', '25': 'B', '26': 'B', '27': 'B', '28': 'B', '29': 'B',
  '31': 'C', '33': 'C', '34': 'C', '35': 'C', '36': 'C',
  '41': 'D', '42': 'E',
  '51': 'F', '52': 'F',
  '53': 'G', '54': 'H',
  '55': 'I', '56': 'I',
  '57': 'J', '61': 'K'
};

const BLOCK_NAMES = {
  'A': 'Verwaltung & Sicherheit',
  'B': 'Bildung & Kultur',
  'C': 'Soziales & Jugend',
  'D': 'Gesundheit',
  'E': 'Sport & Bäder',
  'F': 'Stadtentwicklung & Wohnen',
  'G': 'Ver- & Entsorgung',
  'H': 'Verkehr & Mobilität',
  'I': 'Umwelt & Grün',
  'J': 'Wirtschaft & Tourismus',
  'K': 'Finanzwirtschaft'
};

const BLOCK_COLORS = {
  'A': '#4A5F7D', // 1. Darker Slate Blue
  'B': '#5D8F87', // 2. Soft Teal
  'C': '#9BA050', // 3. Brighter Olive
  'D': '#A78B6A', // 4. Taupe
  'E': '#9D7A90', // 5. Lighter Plum
  'F': '#6C6C73', // 6. Steel Gray
  'G': '#B7A45A', // 7. Mustard
  'H': '#B07A5A', // 8. Clay
  'I': '#6F5D75', // 9. Smoky Violet
  'J': '#5E7048', // 10. Darker Moss
  'K': '#6A80A0'  // 11. Lighter Blue-Gray
};

const DATEN_DIR = path.join(__dirname, '..', 'daten');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'leipzig-budget-data.json');

const fmtMio = (n) =>
  (n / 1e6).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function processSource(source) {
  const filepath = path.join(DATEN_DIR, source.file);
  console.log('\n' + '='.repeat(80));
  console.log(`${source.label} (${source.status}) — ${path.relative(process.cwd(), filepath)}`);
  console.log('='.repeat(80) + '\n');

  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filepath}\n  Run: npm run data:download`);
  }

  const workbook = XLSX.readFile(filepath);
  if (!workbook.Sheets[source.sheet]) {
    throw new Error(
      `Sheet '${source.sheet}' not found in ${source.file}. Available: ${workbook.SheetNames.join(', ')}`
    );
  }
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[source.sheet]);
  const col = source.columns;

  const items = [];
  const unmappedPrefixes = new Set();
  let skippedNotExpense = 0;
  let skippedEmptyEbene = 0;
  let skippedNotPR = 0;
  let skippedNoPC = 0;
  let skippedUnmapped = 0;

  for (const row of data) {
    // RULE 1: Only ordinary expenses ("2 ordentliche Aufwendungen")
    const ebene = col.ebene(row);
    if (!ebene) {
      // Kostenart without mapping (see sheet "fehlende Zuordnung_Kostenart" in 2027/28)
      skippedEmptyEbene++;
      continue;
    }
    if (!ebene.includes('2 ordentliche Aufwendungen')) {
      skippedNotExpense++;
      continue;
    }

    // RULE 2: Only PR rows (product-level, not object-level) to avoid double counting
    const objektart = col.objektart(row);
    if (objektart !== 'PR') {
      skippedNotPR++;
      continue;
    }

    // RULE 3: Product code → policy block via its 2-digit prefix
    const pc = col.productCode(row);
    if (!pc || pc === 'undefined' || pc.length < 2) {
      skippedNoPC++;
      continue;
    }
    const prefix = pc.substring(0, 2);
    const policyBlock = MAPPING[prefix];
    if (!policyBlock) {
      unmappedPrefixes.add(prefix);
      skippedUnmapped++;
      continue;
    }

    const plan = {};
    for (const year of source.years) {
      plan[year] = parseFloat(col.plan(row, year) || 0) || 0;
    }

    items.push({
      productCode: pc,
      description: col.productDescription(row),
      amt: col.amt(row),
      teilhaushalt: col.teilhaushalt(row),
      costTypeEbene: ebene,
      costTypePosition: col.position(row),
      accountDescription: col.accountDescription(row),
      objektart,
      prefix,
      policyBlock,
      policyBlockName: BLOCK_NAMES[policyBlock],
      plan,
    });
  }

  // Audit report
  const pad = (n) => n.toLocaleString('de-DE').padStart(10);
  console.log('PROCESSING AUDIT REPORT');
  console.log('-'.repeat(80));
  console.log(`Total rows processed:            ${pad(data.length)}`);
  console.log(`Budget items extracted:          ${pad(items.length)}`);
  console.log(`Skipped (empty Ebene/unmapped Kostenart): ${pad(skippedEmptyEbene)}`);
  console.log(`Skipped (not 'ordentl. Aufw.'):  ${pad(skippedNotExpense)}`);
  console.log(`Skipped (not PR - avoid dbl):    ${pad(skippedNotPR)}`);
  console.log(`Skipped (no product code):       ${pad(skippedNoPC)}`);
  console.log(`Skipped (unmapped prefix):       ${pad(skippedUnmapped)}`);
  if (skippedEmptyEbene > 0) {
    console.log(`\n⚠️  ${skippedEmptyEbene} rows have no Kostenart mapping (Ebene empty) and were excluded.`);
    console.log('    Check the sheet "fehlende Zuordnung_Kostenart" in the source file.');
  }
  if (unmappedPrefixes.size > 0) {
    console.log(`\n⚠️  WARNING: Unmapped product prefixes: ${Array.from(unmappedPrefixes).sort().join(', ')}`);
  } else {
    console.log('\n✓ All product codes successfully mapped');
  }

  return {
    items,
    validation: {
      rowsTotal: data.length,
      skippedEmptyEbene,
      skippedNotExpense,
      skippedNotPR,
      skippedNoPC,
      skippedUnmapped,
      unmappedPrefixes: Array.from(unmappedPrefixes).sort(),
    },
  };
}

function aggregateByPolicy(items, years) {
  const blocks = {};
  for (const item of items) {
    const block = item.policyBlock;
    if (!blocks[block]) {
      blocks[block] = {
        block,
        name: item.policyBlockName,
        color: BLOCK_COLORS[block],
        plan: Object.fromEntries(years.map((y) => [y, 0])),
        itemCount: 0,
        items: [],
      };
    }
    for (const year of years) blocks[block].plan[year] += item.plan[year];
    blocks[block].itemCount++;
    blocks[block].items.push(item);
  }
  return blocks;
}

function validateTotals(aggregated, totals, years) {
  console.log('\nVALIDATION CHECK');
  console.log('-'.repeat(80));
  let allValid = true;
  for (const year of years) {
    const sumBlocks = Object.values(aggregated).reduce((s, b) => s + b.plan[year], 0);
    const valid = Math.abs(totals[year] - sumBlocks) < 0.01 && totals[year] > 0;
    allValid = allValid && valid;
    console.log(valid ? '✓' : '✗', `${year} totals${valid ? ' match' : ' MISMATCH'}: ${fmtMio(totals[year])} Mio €`);
  }
  return allValid;
}

function printSummary(aggregated, totals, years) {
  const firstYear = years[0];
  console.log(`\nPOLICY BLOCK SUMMARY - PLAN ${firstYear}`);
  console.log('-'.repeat(80));
  const sorted = Object.entries(aggregated).sort((a, b) => b[1].plan[firstYear] - a[1].plan[firstYear]);
  for (const [blockId, d] of sorted) {
    const pct = ((d.plan[firstYear] / totals[firstYear]) * 100).toFixed(1);
    console.log(`${blockId} - ${d.name.padEnd(40)}: ${fmtMio(d.plan[firstYear]).padStart(10)} Mio € (${pct.padStart(5)}%) [${String(d.itemCount).padStart(4)} items]`);
  }
  console.log('-'.repeat(80));
  for (const year of years) {
    console.log(`TOTAL ${year}`.padEnd(44) + `: ${fmtMio(totals[year]).padStart(10)} Mio € (${(totals[year] / 1e9).toFixed(3)} Mrd €)`);
  }
}

function main() {
  const processedSources = [];
  let allValid = true;

  for (const source of SOURCES) {
    const { items, validation } = processSource(source);
    if (items.length === 0) {
      console.error(`✗ ERROR: No items processed for ${source.id}! Check file structure.`);
      process.exit(1);
    }

    const aggregated = aggregateByPolicy(items, source.years);
    const totals = {};
    for (const year of source.years) {
      totals[year] = items.reduce((s, it) => s + it.plan[year], 0);
    }

    const valid = validateTotals(aggregated, totals, source.years);
    allValid = allValid && valid;
    printSummary(aggregated, totals, source.years);

    processedSources.push({
      id: source.id,
      label: source.label,
      status: source.status,
      stand: source.stand,
      years: source.years,
      file: source.file,
      url: source.url,
      portalUrl: source.portalUrl,
      totals,
      totalsMrd: Object.fromEntries(
        source.years.map((y) => [y, parseFloat((totals[y] / 1e9).toFixed(3))])
      ),
      itemCount: items.length,
      validation: { ...validation, totalsMatch: valid, allPrefixesMapped: validation.unmappedPrefixes.length === 0 },
      aggregated,
      items,
    });
  }

  if (!allValid) {
    console.error('\n✗ VALIDATION FAILED - Do not use this data!');
    process.exit(1);
  }

  const output = {
    metadata: {
      city: 'Leipzig',
      dataType: 'Ergebnishaushalt',
      generated: new Date().toISOString(),
      years: ALL_YEARS,
      defaultYear: DEFAULT_YEAR,
      sources: processedSources.map(({ aggregated, items, ...meta }) => meta),
    },
    sources: processedSources,
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

  console.log('\n' + '='.repeat(80));
  console.log(`✓ Output saved to: ${path.relative(process.cwd(), OUTPUT_FILE)}`);
  console.log(`✓ Years: ${ALL_YEARS.join(', ')} (default ${DEFAULT_YEAR})\n`);
}

if (require.main === module) {
  main();
}

module.exports = { processSource, aggregateByPolicy, MAPPING, BLOCK_NAMES, BLOCK_COLORS };
