export function generateIncidentCode(kenhPhatSinh, ngay, existingIncidents = []) {
  const d = ngay ? new Date(ngay) : new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  const channelClean = kenhPhatSinh
    ? kenhPhatSinh.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '').toUpperCase()
    : 'KENH'

  const prefix = `${channelClean}_${year}_${month}_${day}`

  const existing = (existingIncidents || [])
    .map(i => i.ma_su_co || i.maSuCo)
    .filter(c => c && c.startsWith(prefix))
    .map(c => {
      const parts = c.split('_')
      const last = parts[parts.length - 1]
      return parseInt(last, 10)
    })
    .filter(n => !isNaN(n))

  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1
  return `${prefix}_${String(next).padStart(3, '0')}`
}

