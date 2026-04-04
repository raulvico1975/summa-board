import * as XLSX from 'xlsx';

import type { Category } from '@/lib/data';
import type { AggregateResult, AggregateRow } from '@/lib/exports/economic-report';
import { formatCurrencyEU } from '@/lib/normalize';
import { getCategoryDisplayLabel } from '@/lib/ui/display-labels';

export interface DashboardShareWorkbookTexts {
  summarySheetName: string;
  summaryColumns: {
    indicator: string;
    value: string;
  };
  summaryMeta: {
    organization: string;
    period: string;
    generatedAt: string;
  };
  summaryMetrics: {
    income: string;
    expenses: string;
    transfers: string;
    balance: string;
  };
  detailSheets: {
    income: string;
    expenses: string;
    expensesByAxis: string;
    projects: string;
  };
  detailColumns: {
    incomeLabel: string;
    expenseCategoryLabel: string;
    axisLabel: string;
    amount: string;
    percentage: string;
    operations: string;
    projectName: string;
    budget: string;
    imputedExpenses: string;
  };
  fallbacks: {
    uncategorized: string;
  };
}

interface BuildDashboardShareWorkbookParams {
  organizationName: string;
  periodLabel: string;
  generatedAt: Date;
  locale: string;
  incomeAggregates: AggregateResult;
  expenseCategoryAggregates: AggregateResult;
  transferAggregates: AggregateResult;
  expenseAxisAggregates: AggregateResult;
  projectRows: DashboardProjectWorkbookRow[];
  netBalance: number;
  categories?: Category[] | null;
  categoryTranslations?: Record<string, string>;
  texts: DashboardShareWorkbookTexts;
}

interface MaterializedRow {
  label: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface DashboardProjectWorkbookRow {
  name: string;
  budget: number;
  imputedExpenses: number;
}

export function buildDashboardShareWorkbook({
  organizationName,
  periodLabel,
  generatedAt,
  locale,
  incomeAggregates,
  expenseCategoryAggregates,
  transferAggregates,
  expenseAxisAggregates,
  projectRows,
  netBalance,
  categories,
  categoryTranslations,
  texts,
}: BuildDashboardShareWorkbookParams): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  appendSheet(
    workbook,
    buildSummarySheet({
      organizationName,
      periodLabel,
      generatedAt,
      locale,
      incomeTotal: incomeAggregates.total,
      expenseTotal: expenseCategoryAggregates.total,
      transferTotal: transferAggregates.total,
      netBalance,
      texts,
    }),
    texts.summarySheetName,
  );

  appendSheet(
    workbook,
    buildDetailSheet({
      labelColumnTitle: texts.detailColumns.incomeLabel,
      rows: materializeCategoryRows({
        rows: incomeAggregates.complete,
        total: incomeAggregates.total,
        categories,
        categoryTranslations,
        fallbackLabel: texts.fallbacks.uncategorized,
      }),
      texts,
    }),
    texts.detailSheets.income,
  );

  appendSheet(
    workbook,
    buildDetailSheet({
      labelColumnTitle: texts.detailColumns.expenseCategoryLabel,
      rows: materializeCategoryRows({
        rows: expenseCategoryAggregates.complete,
        total: expenseCategoryAggregates.total,
        categories,
        categoryTranslations,
        fallbackLabel: texts.fallbacks.uncategorized,
      }),
      texts,
    }),
    texts.detailSheets.expenses,
  );

  appendSheet(
    workbook,
    buildDetailSheet({
      labelColumnTitle: texts.detailColumns.axisLabel,
      rows: materializeGenericRows({
        rows: expenseAxisAggregates.complete,
        total: expenseAxisAggregates.total,
      }),
      texts,
    }),
    texts.detailSheets.expensesByAxis,
  );

  appendSheet(
    workbook,
    buildProjectSheet({ rows: projectRows, texts }),
    texts.detailSheets.projects,
  );

  return workbook;
}

function buildSummarySheet({
  organizationName,
  periodLabel,
  generatedAt,
  locale,
  incomeTotal,
  expenseTotal,
  transferTotal,
  netBalance,
  texts,
}: {
  organizationName: string;
  periodLabel: string;
  generatedAt: Date;
  locale: string;
  incomeTotal: number;
  expenseTotal: number;
  transferTotal: number;
  netBalance: number;
  texts: DashboardShareWorkbookTexts;
}): XLSX.WorkSheet {
  const rows = [
    [texts.summaryMeta.organization, organizationName],
    [texts.summaryMeta.period, periodLabel],
    [texts.summaryMeta.generatedAt, formatExportDateTime(generatedAt, locale)],
    [],
    [texts.summaryColumns.indicator, texts.summaryColumns.value],
    [texts.summaryMetrics.income, formatCurrencyEU(incomeTotal)],
    [texts.summaryMetrics.expenses, formatCurrencyEU(expenseTotal)],
    [texts.summaryMetrics.transfers, formatCurrencyEU(transferTotal)],
    [texts.summaryMetrics.balance, formatCurrencyEU(netBalance)],
  ];

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet['!cols'] = [{ wch: 28 }, { wch: 24 }];

  return sheet;
}

function appendSheet(workbook: XLSX.WorkBook, sheet: XLSX.WorkSheet, requestedName: string) {
  XLSX.utils.book_append_sheet(workbook, sheet, safeSheetName(requestedName));
}

function buildDetailSheet({
  labelColumnTitle,
  rows,
  texts,
}: {
  labelColumnTitle: string;
  rows: MaterializedRow[];
  texts: DashboardShareWorkbookTexts;
}): XLSX.WorkSheet {
  const data = [
    [
      labelColumnTitle,
      texts.detailColumns.amount,
      texts.detailColumns.percentage,
      texts.detailColumns.operations,
    ],
    ...rows.map((row) => [
      row.label,
      formatCurrencyEU(row.amount),
      formatPercentage(row.percentage),
      row.count,
    ]),
  ];

  const sheet = XLSX.utils.aoa_to_sheet(data);
  sheet['!cols'] = [
    { wch: 34 },
    { wch: 16 },
    { wch: 16 },
    { wch: 12 },
  ];
  sheet['!autofilter'] = {
    ref: XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: Math.max(data.length - 1, 0), c: data[0].length - 1 },
    }),
  };

  return sheet;
}

function buildProjectSheet({
  rows,
  texts,
}: {
  rows: DashboardProjectWorkbookRow[];
  texts: DashboardShareWorkbookTexts;
}): XLSX.WorkSheet {
  const data = [
    [
      texts.detailColumns.projectName,
      texts.detailColumns.budget,
      texts.detailColumns.imputedExpenses,
    ],
    ...rows.map((row) => [
      row.name,
      formatCurrencyEU(row.budget),
      formatCurrencyEU(row.imputedExpenses),
    ]),
  ];

  const sheet = XLSX.utils.aoa_to_sheet(data);
  sheet['!cols'] = [{ wch: 34 }, { wch: 16 }, { wch: 20 }];
  sheet['!autofilter'] = {
    ref: XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: Math.max(data.length - 1, 0), c: data[0].length - 1 },
    }),
  };

  return sheet;
}

function materializeCategoryRows({
  rows,
  total,
  categories,
  categoryTranslations,
  fallbackLabel,
}: {
  rows: AggregateRow[];
  total: number;
  categories?: Category[] | null;
  categoryTranslations?: Record<string, string>;
  fallbackLabel: string;
}): MaterializedRow[] {
  const byLabel = new Map<string, { amount: number; count: number }>();

  rows.forEach((row) => {
    const label = getCategoryDisplayLabel(row.id, {
      categoryName: row.name,
      categories: categories ?? undefined,
      categoryTranslations: categoryTranslations ?? {},
      unknownCategoryLabel: fallbackLabel,
    });
    const entry = byLabel.get(label);
    if (entry) {
      entry.amount += row.amount;
      entry.count += row.count;
      return;
    }
    byLabel.set(label, { amount: row.amount, count: row.count });
  });

  return Array.from(byLabel.entries())
    .map(([label, values]) => ({
      label,
      amount: values.amount,
      count: values.count,
      percentage: total > 0 ? (values.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function materializeGenericRows({
  rows,
  total,
}: {
  rows: AggregateRow[];
  total: number;
}): MaterializedRow[] {
  return rows.map((row) => ({
    label: row.name,
    amount: row.amount,
    percentage: total > 0 ? (row.amount / total) * 100 : 0,
    count: row.count,
  }));
}

function formatExportDateTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function safeSheetName(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 31) return trimmed;
  return trimmed.slice(0, 31);
}
