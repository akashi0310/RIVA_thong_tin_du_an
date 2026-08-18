import { useEffect, useState } from 'react'
import { useKhoiLuongStore } from '../../stores/khoiluongStore'

const STATUS_STYLE = {
  '✓': 'bg-green-100 text-green-700',
  '✗': 'bg-red-100 text-red-600',
  '□': 'bg-gray-100 text-gray-500',
  '⏳': 'bg-yellow-100 text-yellow-700',
}
const STATUS_LABEL = {
  '✓': 'Hoàn thành',
  '✗': 'Không TH',
  '□': 'Chưa làm',
  '⏳': 'Chờ duyệt',
}

function isOverdue(t) {
  if (!t.deadline) return false
  if (t.trang_thai === '✓' || t.trang_thai === '✗') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(t.deadline) < today
}

export default function NhanVienView() {
  const { congViec, loading, fetchAll } = useKhoiLuongStore()
  const [selectedBoPhan, setSelectedBoPhan] = useState('')
  const [expandedGroup, setExpandedGroup] = useState({})

  useEffect(() => { fetchAll() }, [])

  // Build { boPhan → [tasks] }
  // "Marketing/Design" → tạo entry cho cả "Marketing" và "Design"
  const byBoPhan = {}
  for (const t of congViec) {
    const names = (t.thuc_hien || '').split(/[\/,]/).map(s => s.trim()).filter(Boolean)
    for (const name of names) {
      if (!byBoPhan[name]) byBoPhan[name] = []
      byBoPhan[name].push(t)
    }
  }

  const allBoPhan = Object.keys(byBoPhan).sort((a, b) => a.localeCompare(b, 'vi'))

  const displayList = selectedBoPhan
    ? (byBoPhan[selectedBoPhan] ? { [selectedBoPhan]: byBoPhan[selectedBoPhan] } : {})
    : byBoPhan

  const toggleGroup = (nhom) => setExpandedGroup(p => ({ ...p, [nhom]: !p[nhom] }))

  if (loading) return <div className="text-gray-400 py-8 text-center">Đang tải dữ liệu...</div>

  return (
    <div className="space-y-4">
      {/* Header + bộ lọc */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Phân công theo Bộ phận
          <span className="ml-2 text-xs font-normal text-gray-400">
            — dựa theo cột "Người thực hiện/đơn vị" trong danh mục công việc
          </span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedBoPhan('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              !selectedBoPhan ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
            }`}
          >
            Tất cả
          </button>
          {allBoPhan.map(bp => {
            const tasks = byBoPhan[bp]
            const overdue = tasks.filter(isOverdue).length
            return (
              <button
                key={bp}
                onClick={() => setSelectedBoPhan(selectedBoPhan === bp ? '' : bp)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1.5 ${
                  selectedBoPhan === bp
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {bp}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  selectedBoPhan === bp ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tasks.length}
                </span>
                {overdue > 0 && <span className="w-2 h-2 rounded-full bg-red-400 inline-block" title="Có việc quá hạn" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Danh sách bộ phận */}
      {Object.entries(displayList)
        .sort(([a], [b]) => a.localeCompare(b, 'vi'))
        .map(([boPhan, tasks]) => {
          const done = tasks.filter(t => t.trang_thai === '✓').length
          const choDuyet = tasks.filter(t => t.trang_thai === '⏳').length
          const quaHan = tasks.filter(isOverdue).length
          const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0

          // Nhóm task theo nhóm cấp 1
          const byNhom = {}
          for (const t of tasks) {
            const nhom = t.nhom_cap_1 || 'Khác'
            if (!byNhom[nhom]) byNhom[nhom] = []
            byNhom[nhom].push(t)
          }

          return (
            <div key={boPhan} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header bộ phận */}
              <button
                onClick={() => toggleGroup(boPhan)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center">
                    {boPhan.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{boPhan}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{tasks.length} công việc được phân công</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Badges */}
                  <div className="flex gap-1.5">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">✓ {done}</span>
                    {choDuyet > 0 && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">⏳ {choDuyet}</span>}
                    {quaHan > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">⚠️ {quaHan}</span>}
                  </div>
                  {/* Progress */}
                  <div className="flex items-center gap-2 w-28">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold w-8 text-right ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {pct}%
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm ml-1">{expandedGroup[boPhan] ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Task list (expandable) — nhóm theo nhóm cấp 1 */}
              {expandedGroup[boPhan] && (
                <div className="border-t border-gray-100">
                  {Object.entries(byNhom).map(([nhom, nhomTasks]) => (
                    <div key={nhom}>
                      {/* Sub-header nhóm cấp 1 */}
                      <div className="px-5 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{nhom}</span>
                        <span className="text-xs text-gray-400">{nhomTasks.length} việc</span>
                      </div>

                      {/* Tasks */}
                      {nhomTasks.map(t => {
                        const od = isOverdue(t)
                        return (
                          <div
                            key={t.id}
                            className={`px-5 py-3 flex items-start justify-between gap-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors
                              ${od ? 'bg-red-50/30' : ''} ${t.trang_thai === '✓' ? 'opacity-60' : ''}`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm text-gray-800 font-medium">{t.ten_cong_viec}</p>
                                {t.loai_cong_viec === 'phat_sinh' && (
                                  <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Phát sinh</span>
                                )}
                                {od && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">⚠️ Quá hạn</span>}
                              </div>
                              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                {t.du_an && <span className="text-xs text-indigo-500">{t.du_an}</span>}
                                {t.nhom_cap_2 && <span className="text-xs text-gray-400">{t.nhom_cap_2}</span>}
                                {t.san_pham && <span className="text-xs text-gray-400">📦 {t.san_pham}</span>}
                                {t.deadline && (
                                  <span className={`text-xs ${od ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                    Deadline: {new Date(t.deadline + 'T00:00:00').toLocaleDateString('vi-VN')}
                                  </span>
                                )}
                                {/* Hiện bộ phận phối hợp nếu task giao cho nhiều bộ phận */}
                                {t.thuc_hien && t.thuc_hien !== boPhan && (
                                  <span className="text-xs text-gray-300">Phối hợp: {t.thuc_hien}</span>
                                )}
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${STATUS_STYLE[t.trang_thai] || STATUS_STYLE['□']}`}>
                              {STATUS_LABEL[t.trang_thai] || 'Chưa làm'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

      {Object.keys(displayList).length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
          Không có dữ liệu phân công
        </div>
      )}
    </div>
  )
}
