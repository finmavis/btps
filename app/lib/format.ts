export function formatCurrency(amount: number, locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDisplayDate(isoDate: string, locale = 'en-US') {
  const date = new Date(isoDate + 'T12:00:00');
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
