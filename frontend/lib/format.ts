export function formatCurrency(value?: number | null) {
  if (value === undefined || value === null) return 'Unknown';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactNumber(value?: number | null) {
  if (value === undefined || value === null) return 'Unknown';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value?: number | null, options?: { signed?: boolean }) {
  if (value === undefined || value === null) return 'Unknown';
  const sign = options?.signed && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatScore(value?: number | null) {
  if (value === undefined || value === null) return '0.000';
  return value.toFixed(3);
}

export function formatDateTime(value: string | number) {
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
