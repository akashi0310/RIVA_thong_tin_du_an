import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNckhStore } from '../../stores/nckhStore'
import { NCKH_TYPES } from '../../utils/constants'
import { StatusBadge } from '../../components/common/Badge'

export default function NCKHDashboard() {
  const { projects, fetchProjects } = useNckhStore()
  useEffect(() => { fetchProjects() }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {NCKH_TYPES.map(type => {
          const items = projects.filter(p => p.loai === type)
          const done = items.filter(p => p.trang_thai === 'Hoàn thành').length
          return (
            <Link key={type} to={`/nckh/${type.toLowerCase()}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-purple-300 transition"
            >
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">{type}</p>
              <p className="text-3xl font-bold text-gray-800">{items.length}</p>
              <p className="text-sm text-gray-500 mt-1">{done} hoàn thành</p>
            </Link>
          )
        })}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-3">Tất cả đề tài ({projects.length})</h3>
        {projects.length === 0 ? (
          <p className="text-gray-400 text-sm">Chưa có đề tài nào. Chọn IENA / IPITEX / SVIFF để thêm.</p>
        ) : (
          <div className="space-y-2">
            {projects.slice(0, 10).map(p => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{p.loai}</span>
                <span className="text-sm text-gray-800 flex-1">{p.ten_de_tai}</span>
                <StatusBadge status={p.trang_thai} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
