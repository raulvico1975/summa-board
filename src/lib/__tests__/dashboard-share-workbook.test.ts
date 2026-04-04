import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';

import { buildDashboardShareWorkbook, type DashboardShareWorkbookTexts } from '../exports/dashboard-share-workbook';
import type { Category } from '../data';

const baseTexts: DashboardShareWorkbookTexts = {
  summarySheetName: 'Resum executiu',
  summaryColumns: {
    indicator: 'Concepte',
    value: 'Valor',
  },
  summaryMeta: {
    organization: 'Entitat',
    period: 'Periode',
    generatedAt: 'Data d exportacio',
  },
  summaryMetrics: {
    income: 'Ingressos totals',
    expenses: 'Despeses operatives',
    transfers: 'Transferencies a contraparts',
    balance: 'Balanc operatiu',
  },
  detailSheets: {
    income: 'Ingressos',
    expenses: 'Despeses',
    expensesByAxis: "Despeses per Eix d'actuació",
    projects: 'Projectes',
  },
  detailColumns: {
    incomeLabel: 'Categoria d ingres',
    expenseCategoryLabel: 'Categoria de despesa',
    axisLabel: "Eix d'actuacio",
    amount: 'Import',
    percentage: '% sobre el total',
    operations: 'Moviments',
    projectName: 'Nom del projecte',
    budget: 'Pressupost',
    imputedExpenses: 'Despeses imputades',
  },
  fallbacks: {
    uncategorized: 'Sense categoria',
  },
};

describe('buildDashboardShareWorkbook', () => {
  it('construeix els fulls finals amb ingressos unificats i categories humanitzades', () => {
    const categories: Category[] = [
      {
        id: 'ABCDEFGHIJKLMNOPQRST',
        name: 'subsidies',
        type: 'income',
      },
      {
        id: 'expense-category-1',
        name: 'officeSupplies',
        type: 'expense',
      },
    ];

    const workbook = buildDashboardShareWorkbook({
      organizationName: 'Fundacio Exemple',
      periodLabel: 'Q1 2026',
      generatedAt: new Date('2026-04-04T09:30:00.000Z'),
      locale: 'ca-ES',
      categories,
      categoryTranslations: {
        subsidies: 'Subvencions',
        officeSupplies: 'Material d oficina',
      },
      incomeAggregates: {
        aggregated: [],
        complete: [
          { id: 'ABCDEFGHIJKLMNOPQRST', name: 'ABCDEFGHIJKLMNOPQRST', amount: 1200, percentage: 100, count: 3 },
        ],
        total: 1200,
      },
      expenseCategoryAggregates: {
        aggregated: [],
        complete: [
          { id: 'expense-category-1', name: 'officeSupplies', amount: 640, percentage: 100, count: 2 },
        ],
        total: 640,
      },
      transferAggregates: { aggregated: [], complete: [], total: 0 },
      expenseAxisAggregates: { aggregated: [], complete: [], total: 0 },
      projectRows: [],
      netBalance: 560,
      texts: baseTexts,
    });

    assert.deepEqual(workbook.SheetNames, [
      'Resum executiu',
      'Ingressos',
      'Despeses',
      "Despeses per Eix d'actuació",
      'Projectes',
    ]);

    const incomeRows = XLSX.utils.sheet_to_json<(string | number)[]>(
      workbook.Sheets[baseTexts.detailSheets.income],
      { header: 1, raw: false },
    );
    const expenseRows = XLSX.utils.sheet_to_json<(string | number)[]>(
      workbook.Sheets[baseTexts.detailSheets.expenses],
      { header: 1, raw: false },
    );

    assert.deepEqual(incomeRows[0], ['Categoria d ingres', 'Import', '% sobre el total', 'Moviments']);
    assert.equal(incomeRows[1]?.[0], 'Subvencions');
    assert.equal(incomeRows[1]?.[1], '1.200,00 €');
    assert.equal(expenseRows[1]?.[0], 'Material d oficina');
    assert.equal(expenseRows[1]?.[1], '640,00 €');
  });

  it('mostra eixos amb imports a zero i projectes amb pressupost i despeses imputades', () => {
    const workbook = buildDashboardShareWorkbook({
      organizationName: 'Associacio Exemple',
      periodLabel: 'Març 2026',
      generatedAt: new Date('2026-04-04T09:30:00.000Z'),
      locale: 'ca-ES',
      categories: [],
      categoryTranslations: {},
      incomeAggregates: { aggregated: [], complete: [], total: 0 },
      expenseCategoryAggregates: { aggregated: [], complete: [], total: 0 },
      transferAggregates: { aggregated: [], complete: [], total: 0 },
      expenseAxisAggregates: {
        aggregated: [],
        complete: [
          { id: 'axis-1', name: 'Infancia', amount: 0, percentage: 0, count: 0 },
        ],
        total: 0,
      },
      projectRows: [
        { name: 'Projecte Sahel', budget: 25000, imputedExpenses: 4300 },
      ],
      netBalance: 0,
      texts: baseTexts,
    });

    const axisRows = XLSX.utils.sheet_to_json<(string | number)[]>(
      workbook.Sheets[baseTexts.detailSheets.expensesByAxis],
      { header: 1, raw: false },
    );
    const projectRows = XLSX.utils.sheet_to_json<(string | number)[]>(
      workbook.Sheets[baseTexts.detailSheets.projects],
      { header: 1, raw: false },
    );

    assert.deepEqual(axisRows[0], ["Eix d'actuacio", 'Import', '% sobre el total', 'Moviments']);
    assert.equal(axisRows[1]?.[0], 'Infancia');
    assert.equal(axisRows[1]?.[1], '0,00 €');
    assert.equal(projectRows[0]?.[0], 'Nom del projecte');
    assert.equal(projectRows[1]?.[0], 'Projecte Sahel');
    assert.equal(projectRows[1]?.[1], '25.000,00 €');
    assert.equal(projectRows[1]?.[2], '4.300,00 €');
  });
});
