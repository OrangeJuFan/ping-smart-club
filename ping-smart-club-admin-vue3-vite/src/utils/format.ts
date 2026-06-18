export function currency(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0,
  }).format(value);
}

export function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function includesText(haystack: unknown, keyword: string): boolean {
  if (!keyword.trim()) return true;
  return String(haystack ?? '').toLowerCase().includes(keyword.trim().toLowerCase());
}

export function pickText<T extends Record<string, unknown>>(
  row: T,
  fields: Array<keyof T>,
  keyword: string,
): boolean {
  return fields.some((field) => includesText(row[field], keyword));
}
