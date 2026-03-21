// src/shared/utils/number.ts

// Simple currency formatter; can be customized per locale.
export function formatCurrency(
  value: number | null | undefined,
  currencySymbol: string = '₹',
): string {
  if (value == null || Number.isNaN(Number(value))) return `${currencySymbol}0`;
  const amount = Number(value).toFixed(2);
  return `${currencySymbol}${amount}`;
}

export function parseNumber(input?: string | null): number | null {
  if (!input) return null;
  const n = Number(input);
  if (Number.isNaN(n)) return null;
  return n;
}

export function formatNumber(
  value: number | null | undefined,
  decimals: number = 2,
): string {
  if (value == null || Number.isNaN(Number(value))) return '0';
  return Number(value).toFixed(decimals);
}
