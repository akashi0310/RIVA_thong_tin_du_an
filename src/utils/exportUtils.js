export function exportToCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) return
  const headers = Object.keys(data[0])
  const rows = data.map(row => headers.map(h => {
    const val = row[h] ?? ''
    const str = String(val).replace(/"/g, '""')
    return str.includes(',') || str.includes('\n') ? `"${str}"` : str
  }).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
