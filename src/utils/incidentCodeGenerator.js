export function generateIncidentCode(nhomSuCo, existingIncidents) {
  const year = new Date().getFullYear()
  const prefix = `${nhomSuCo || 'KT'}-${year}-`
  const existing = existingIncidents
    .map(i => i.maSuCo)
    .filter(c => c && c.startsWith(prefix))
    .map(c => parseInt(c.replace(prefix, ''), 10))
    .filter(n => !isNaN(n))
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1
  return `${prefix}${String(next).padStart(3, '0')}`
}
