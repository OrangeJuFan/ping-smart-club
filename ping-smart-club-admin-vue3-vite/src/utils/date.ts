export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '-';

  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  const hh = `${date.getHours()}`.padStart(2, '0');
  const mm = `${date.getMinutes()}`.padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

export function formatDate(value: string | Date): string {
  return formatDateTime(value).slice(0, 10);
}

export function formatTime(value: string | Date): string {
  return formatDateTime(value).slice(11);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(base.getDate() + days);
  return next;
}

export function sameDate(a: string | Date, b: string | Date): boolean {
  return formatDate(a) === formatDate(b);
}
