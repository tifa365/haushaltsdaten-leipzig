// Whole euros: the budget amounts are in the millions, cents add only noise
const currencyFormatter = new Intl.NumberFormat('DE-DE', {
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export const formatCurrency = (num: number): string =>
  currencyFormatter.format(num)
