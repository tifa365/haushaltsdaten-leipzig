#!/usr/bin/env node
/**
 * Generate static JSON files for the Leipzig budget visualization.
 * Input:  src/data/leipzig-budget-data.json (from scripts/process-leipzig-data.js)
 * Output: public/data/{year}/{summary,treemap,list}.json, public/data/{year}/blocks/*.json,
 *         public/data/meta.json
 * Pure Node.js - no database needed.
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'leipzig-budget-data.json');
const OUTPUT_BASE = path.join(__dirname, '..', 'public', 'data');

function loadProcessedData() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error('✗ ERROR: leipzig-budget-data.json not found');
    console.error('  Run: npm run data:process first');
    return null;
  }
  return JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
}

/** "6110-050 - Steuern, allg. Zuw." → "Steuern, allg. Zuw. (6110-0...)" */
function formatWithShortCode(description, code) {
  const match = description.match(/^[\d-]+\s*-\s*(.+)$/);
  const text = match ? match[1] : description;
  return `${text} (${code.substring(0, 6)}...)`;
}

/** "401110 - Beamtenbezüge" → "Beamtenbezüge (401110...)" */
function formatAccount(accountDescription) {
  const match = accountDescription.match(/^([\d-]+)\s*-\s*(.+)$/);
  if (!match) return accountDescription;
  return `${match[2]} (${match[1].substring(0, 6)}...)`;
}

function createTreemapHierarchy(source, year) {
  const children = [];

  for (const blockId of Object.keys(source.aggregated).sort()) {
    const blockData = source.aggregated[blockId];
    const products = {};

    for (const item of blockData.items) {
      const pc = item.productCode;
      if (!products[pc]) {
        products[pc] = { value: 0, description: item.description, items: [] };
      }
      products[pc].value += item.plan[year];
      products[pc].items.push({
        name: formatAccount(item.accountDescription),
        value: item.plan[year],
        amt: item.amt,
      });
    }

    const productChildren = Object.entries(products).map(([pc, prodData]) => ({
      id: pc,
      name: formatWithShortCode(prodData.description, pc),
      value: prodData.value,
      children: prodData.items.length > 1 ? prodData.items : [],
    }));

    children.push({
      id: blockId,
      name: blockData.name,
      value: blockData.plan[year],
      color: blockData.color,
      children: productChildren,
    });
  }

  const suffix = source.status === 'entwurf' ? ' (Entwurf)' : '';
  return { id: 'root', name: `Leipzig Haushalt ${year}${suffix}`, children };
}

function createSummaryStats(source, year) {
  const total = source.totals[year];
  const sorted = Object.entries(source.aggregated).sort((a, b) => b[1].plan[year] - a[1].plan[year]);

  const blocks = sorted.map(([blockId, b]) => ({
    id: blockId,
    name: b.name,
    shortName: b.name,
    color: b.color,
    value: b.plan[year],
    valueMio: Math.round((b.plan[year] / 1e6) * 10) / 10,
    percentage: Math.round((b.plan[year] / total) * 1000) / 10,
    itemCount: b.itemCount,
  }));

  return {
    year,
    status: source.status,
    label: source.label,
    stand: source.stand,
    total,
    totalMrd: source.totalsMrd[year],
    totalMio: Math.round((total / 1e6) * 10) / 10,
    itemCount: source.itemCount,
    blockCount: Object.keys(source.aggregated).length,
    blocks,
  };
}

function createFlatList(source, year) {
  const flatList = source.items.map((item) => ({
    id: item.productCode,
    title: formatWithShortCode(item.description, item.productCode),
    amount: item.plan[year],
    group: item.policyBlockName,
    groupId: item.policyBlock,
    district: item.amt,
    productCode: item.productCode,
    costType: item.costTypePosition,
  }));
  flatList.sort((a, b) => b.amount - a.amount);
  return flatList;
}

function createBlocksDetail(source, year) {
  const blocksDetail = {};
  for (const [blockId, b] of Object.entries(source.aggregated)) {
    blocksDetail[blockId] = {
      id: blockId,
      name: b.name,
      color: b.color,
      value: b.plan[year],
      valueMio: Math.round((b.plan[year] / 1e6) * 10) / 10,
      itemCount: b.itemCount,
      products: b.items.map((item) => ({
        productCode: item.productCode,
        description: formatWithShortCode(item.description, item.productCode),
        amt: item.amt,
        teilhaushalt: item.teilhaushalt,
        value: item.plan[year],
        costType: item.costTypePosition,
        accountDescription: item.accountDescription,
      })),
    };
  }
  return blocksDetail;
}

function writeJSON(filepath, data) {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  const sizeKB = fs.statSync(filepath).size / 1024;
  console.log(`  ✓ ${path.relative(process.cwd(), filepath).padEnd(60)} (${sizeKB.toFixed(1).padStart(7)} KB)`);
}

function main() {
  console.log('\n' + '='.repeat(80));
  console.log('GENERATING STATIC JSON FILES');
  console.log('='.repeat(80));

  const budgetData = loadProcessedData();
  if (!budgetData) process.exit(1);

  // Remove stale year folders so the output always mirrors the sources
  if (fs.existsSync(OUTPUT_BASE)) {
    for (const entry of fs.readdirSync(OUTPUT_BASE)) {
      if (/^\d{4}$/.test(entry) && !budgetData.metadata.years.includes(parseInt(entry))) {
        fs.rmSync(path.join(OUTPUT_BASE, entry), { recursive: true });
        console.log(`  - removed stale public/data/${entry}`);
      }
    }
  }

  const yearInfo = {};

  for (const source of budgetData.sources) {
    for (const year of source.years) {
      console.log(`\n${source.label}: generating ${year}...`);
      const yearDir = path.join(OUTPUT_BASE, String(year));
      fs.rmSync(yearDir, { recursive: true, force: true });

      writeJSON(path.join(yearDir, 'summary.json'), createSummaryStats(source, year));
      writeJSON(path.join(yearDir, 'treemap.json'), createTreemapHierarchy(source, year));
      writeJSON(path.join(yearDir, 'list.json'), createFlatList(source, year));

      const blocksDetail = createBlocksDetail(source, year);
      for (const [blockId, blockData] of Object.entries(blocksDetail)) {
        const slug = blockData.name.toLowerCase().replace(/ /g, '-').replace(/&/g, 'und');
        writeJSON(path.join(yearDir, 'blocks', `${blockId}-${slug}.json`), blockData);
      }

      yearInfo[year] = {
        status: source.status,
        label: source.label,
        stand: source.stand,
        sourceId: source.id,
        sourceFile: source.file,
        sourceUrl: source.url,
        portalUrl: source.portalUrl,
        total: source.totals[year],
        totalMrd: source.totalsMrd[year],
        itemCount: source.itemCount,
      };
    }
  }

  console.log('\nMeta...');
  writeJSON(path.join(OUTPUT_BASE, 'meta.json'), {
    city: budgetData.metadata.city,
    dataType: budgetData.metadata.dataType,
    years: budgetData.metadata.years,
    defaultYear: budgetData.metadata.defaultYear,
    generated: budgetData.metadata.generated,
    yearInfo,
  });

  console.log('\n' + '='.repeat(80));
  console.log('✓ STATIC JSON GENERATION COMPLETE');
  console.log('='.repeat(80));
  console.log('\nNext steps:');
  console.log('  1. Review generated files in public/data/');
  console.log('  2. Test: npm run dev\n');
}

if (require.main === module) {
  main();
}

module.exports = { createTreemapHierarchy, createSummaryStats, createFlatList, createBlocksDetail };
