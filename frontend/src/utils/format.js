// Fiyat formatla: 5000 → 5.000 ₺
export const formatPrice = (price) => {
  if (!price && price !== 0) return '—'
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' ₺'
}
