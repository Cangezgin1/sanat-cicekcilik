export function buildWhatsAppMessage({ productName, quantity, price, district, totalPrice }) {
  const msg = `Merhaba! Sipariş vermek istiyorum 🌸

🌺 *Ürün:* ${productName}
🔢 *Adet:* ${quantity}
📍 *İlçe:* ${district}
💰 *Toplam Tutar:* ${totalPrice.toLocaleString('tr-TR')} ₺

Siparişimi onaylayabilir misiniz?`
  return msg
}

export function openWhatsApp(phoneNumber, message) {
  const phone = phoneNumber.replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  const url = `https://wa.me/${phone}?text=${encoded}`
  window.open(url, '_blank')
}

export function isWorkingHours(startTime, endTime) {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  return currentMinutes >= sh * 60 + sm && currentMinutes <= eh * 60 + em
}
