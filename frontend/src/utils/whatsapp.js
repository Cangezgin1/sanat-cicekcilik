export function buildWhatsAppMessage({ productName, quantity, price, district, totalPrice, isOtherDistrict }) {
  const formatP = (p) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(p) + ' ₺'
  
  if (isOtherDistrict) {
    return `Merhaba! Sipariş vermek istiyorum.

🌸 Ürün: ${productName}
📦 Adet: ${quantity}
📍 Teslimat: ${district}

Bu ilçeye teslimat fiyatı hakkında bilgi alabilir miyim?`
  }

  return `Merhaba! Sipariş vermek istiyorum.

🌸 Ürün: ${productName}
📦 Adet: ${quantity}
💰 Birim Fiyat: ${formatP(price)}
📍 Teslimat: ${district}
💳 Toplam: ${formatP(totalPrice)}`
}

export function isWorkingHours(start, end) {
  const now = new Date()
  const cur = now.getHours() * 60 + now.getMinutes()
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const s = sh * 60 + sm
  const e = eh * 60 + em
  if (e < s) return cur >= s || cur <= e
  return cur >= s && cur <= e
}
