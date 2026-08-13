import { PRIORITY_LEVELS } from '../../utils/constants'

export function PriorityBadge({ priority }) {
  const p = PRIORITY_LEVELS[priority]
  if (!p) return <span className="text-gray-400 text-xs">—</span>
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${p.bg} ${p.text}`}>
      {p.emoji} {p.label}
    </span>
  )
}

const statusColors = {
  'Tiếp nhận': 'bg-blue-100 text-blue-700',
  'Đang xử lý': 'bg-yellow-100 text-yellow-700',
  'Chờ phản hồi': 'bg-purple-100 text-purple-700',
  'Hoàn thành': 'bg-green-100 text-green-700',
  'Đã hủy': 'bg-gray-100 text-gray-500',
  'Chưa bắt đầu': 'bg-gray-100 text-gray-600',
  'Đang thực hiện': 'bg-blue-100 text-blue-700',
  'Tạm dừng': 'bg-orange-100 text-orange-700',
}

export function StatusBadge({ status }) {
  const color = statusColors[status] || 'bg-gray-100 text-gray-600'
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{status || '—'}</span>
}
