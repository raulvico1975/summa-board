#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { getBlockVideoPreset } from './video-block-standards.mjs';

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'output', 'playwright');
const TARGET_DIR = path.join(ROOT, 'public', 'visuals', 'web', 'features');
const TMP_DIR = path.join(ROOT, 'tmp', 'home-feature-assets');
const BLOCK_VIDEO_PRESET = getBlockVideoPreset();
const EXPORT_FRAME = BLOCK_VIDEO_PRESET.exportDimensions;

const TARGETS = [
  {
    output: 'block1_import_extractes.webp',
    source: 'bank-reconciliation-demo/import-account-dialog.png',
    layout: 'dialog',
  },
  {
    output: 'block1_classificacio_auto.webp',
    source: 'bank-reconciliation-demo/after-ai-categorization.png',
    layout: 'desktop',
  },
  {
    output: 'block1_assignacio_contactes.webp',
    source: 'bank-reconciliation-demo/reconciliation-result.png',
    layout: 'desktop',
  },
  {
    output: 'block1_multi_compte.webp',
    source: 'bank-reconciliation-demo/after-account-continue.png',
    layout: 'dialog',
  },
  {
    output: 'block2_fitxa_donant.webp',
    source: 'donations-control-demo/donations-control-detail.png',
    layout: 'desktop',
  },
  {
    output: 'block2_importacio_massiva.webp',
    source: 'home-extra-screens/donors-import-modal.png',
    layout: 'dialog',
  },
  {
    output: 'block2_historic_donant.webp',
    source: 'donations-control-demo/donations-control-search.png',
    layout: 'desktop',
  },
  {
    output: 'block2_estats_donants.webp',
    source: 'donations-control-demo/donations-control-start.png',
    layout: 'desktop',
  },
  {
    output: 'block3_divisor_remeses.webp',
    source: 'member-remittance-split-demo/split-result.png',
    layout: 'dialog',
  },
  {
    output: 'block3_devolucions.webp',
    source: 'returns-resolution-demo/returns-dialog.png',
    layout: 'dialog',
  },
  {
    output: 'block3_remeses_sepa.webp',
    source: 'home-extra-screens/sepa-collection-page.png',
    layout: 'desktop',
  },
  {
    output: 'block3_stripe.webp',
    source: 'home-extra-screens/movements-stripe.png',
    layout: 'desktop',
  },
  {
    output: 'block4_model182.webp',
    source: 'model-182-demo/model-182-report.png',
    layout: 'desktop',
  },
  {
    output: 'block4_model347.webp',
    source: 'model-347-demo/model-347-report.png',
    layout: 'desktop',
  },
  {
    output: 'block4_certificats.webp',
    source: 'donation-certificates-demo/certificates-start.png',
    layout: 'desktop',
  },
  {
    output: 'block4_excel_gestoria.webp',
    source: 'model-347-demo/model-347-start.png',
    layout: 'desktop',
  },
  {
    output: 'block5_pressupost_partides.webp',
    source: 'home-extra-screens/project-budget.png',
    layout: 'desktop',
  },
  {
    output: 'block5_assignacio_despeses.webp',
    source: 'home-extra-screens/project-expenses.png',
    layout: 'desktop',
  },
  {
    output: 'block5_captura_terreny.webp',
    source: 'home-extra-screens/quick-expense-mobile.png',
    layout: 'mobile',
  },
  {
    output: 'block5_export_financador.webp',
    source: 'home-extra-screens/project-export-dialog.png',
    layout: 'dialog',
  },
  {
    output: 'block6_dashboard.webp',
    source: 'member-remittance-demo/dashboard.png',
    layout: 'desktop',
  },
  {
    output: 'block6_alertes.webp',
    source: 'returns-resolution-demo/returns-start.png',
    layout: 'desktop',
  },
  {
    output: 'block6_informe_junta.webp',
    source: 'home-extra-screens/closing-bundle-dialog.png',
    layout: 'dialog',
  },
  {
    output: 'block6_exportacio_dades.webp',
    source: 'model-347-demo/model-347-dialog.png',
    layout: 'dialog',
  },
];

const LAYOUTS = {
  desktop: { mode: 'cover' },
  dialog: { mode: 'cover' },
  mobile: { mode: 'contain', width: 1220, height: EXPORT_FRAME.height },
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resetDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  ensureDir(dirPath);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: 'pipe',
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `${command} ha fallat`);
  }
}

function buildMagickArgs(inputPath, tempPath, layout) {
  const frame = `${EXPORT_FRAME.width}x${EXPORT_FRAME.height}`;
  const layoutConfig = LAYOUTS[layout];

  if (layoutConfig.mode === 'contain') {
    return [
      '-size',
      frame,
      'canvas:none',
      '(',
      inputPath,
      '-resize',
      `${layoutConfig.width}x${layoutConfig.height}`,
      ')',
      '-gravity',
      'center',
      '-composite',
      tempPath,
    ];
  }

  return [
    inputPath,
    '-resize',
    `${frame}^`,
    '-gravity',
    'center',
    '-extent',
    frame,
    tempPath,
  ];
}

function main() {
  ensureDir(TARGET_DIR);
  resetDir(TMP_DIR);

  for (const target of TARGETS) {
    const sourcePath = path.join(SOURCE_DIR, target.source);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`No existeix la captura font: ${sourcePath}`);
    }

    const tempPngPath = path.join(TMP_DIR, target.output.replace(/\.webp$/, '.png'));
    const outputPath = path.join(TARGET_DIR, target.output);

    run('magick', buildMagickArgs(sourcePath, tempPngPath, target.layout));
    run('cwebp', ['-quiet', '-q', '85', tempPngPath, '-o', outputPath]);
  }
}

main();
