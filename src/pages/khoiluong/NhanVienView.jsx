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
  const [filterViTri, setFilterViTri] = useState('')
  const [filterNhanVien, setFilterNhanVien] = useState('')
  const [expanded, setExpanded] = useState({}) // key: `${viTri}__${name}`

  useEffect(() => { fetchAll() }, [])

  // Build: { viTri → { name → [tasks] } }
  const byViTri = {}
  for (const t of congViec) {
    const viTri = t.nhom_cap_1 || 'Chung'
    if (!byViTri[viTri]) byViTri[viTri] = {}
    const names = (t.thuc_hien || '').split(/[,/]/).map(s => s.trim()).filter(Boolean)
    for (const name of names) {
      if (!byViTri[viTri][name]) byViTri[viTri][name] = []
      byViTri[viTri][name].push(t)
    }
  }

  const allViTri = Object.keys(byViTri).sort()
  const allNhanVien = [...new Set(
    congViec.flatMap(t => (t.thuc_hien || '').split(/[,/]/).map(s => s.trim()).filter(Boolean))
  )].sort()

  const toggleExpand = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  if (loading) return <div className="text-gray-400 py-8 text-center">Đang tải dữ liệu...</div>

  // Filter
  const visibleViTri = allViTri.filter(vt => {
    if (filterViTri && vt !== filterViTri) return false
    if (filterNhanVien) {
      const members = Object.keys(byViTri[vt])
      return members.some(n => n.toUpperCase() === filterNhanVien.toUpperCase())
    }
    return true
  })

  // Tổng quan toàn bộ
  const totalTasks = congViec.length
  const totalDone = congViec.filter(t => t.trang_thai === '✓').length
  const totalOverdue = congViec.filter(isOverdue).length

  return (
    <div className="space-y-4">
      {/* Tổng quan */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase font-medium">Tổng công việc</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{totalTasks}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase font-medium">Hoàn thành</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{totalDone}</p>
          <p className="text-xs text-gray-400 mt-0.5">{totalTasks ? Math.round(totalDone / totalTasks * 100) : 0}%</p>
        </div>
        <div className={`bg-white rounded-xl border shadow-sm p-4 ${totalOverdue > 0 ? 'border-red-200' : 'border-gray-100'}`}>
          <p className={`text-xs uppercase font-medium ${totalOverdue > 0 ? 'text-red-400' : 'text-gray-500'}`}>Quá hạn</p>
          <p className={`text-3xl font-bold mt-1 ${totalOverdue > 0 ? 'text-red-600' : 'text-gray-300'}`}>{totalOverdue}</p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap gap-3 items-center">
        <select
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={filterViTri}
          onChange={e => setFilterViTri(e.target.value)}
        >
          <option value="">Tất cả vị trí</option>
          {allViTri.map(vt => <option key={vt} value={vt}>{vt}</option>)}
        </select>
        <select
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={filterNhanVien}
          onChange={e => setFilterNhanVien(e.target.value)}
        >
          <option value="">Tất cả nhân viên</option>
          {allNhanVien.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        {(filterViTri || filterNhanVien) && (
          <button
            onClick={() => { setFilterViTri(''); setFilterNhanVien('') }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Xóa lọc
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">{visibleViTri.length} vị trí</span>
      </div>

      {/* Danh sách theo vị trí */}
      {visibleViTri.map(viTri => {
        const members = Object.entries(byViTri[viTri])
          .filter(([name]) => !filterNhanVien || name.toUpperCase() === filterNhanVien.toUpperCase())
          .sort(([a], [b]) => a.localeCompare(b, 'vi'))

        const totalInGroup = members.reduce((s, [, tasks]) => s + tasks.length, 0)
        const doneInGroup = members.reduce((s, [, tasks]) => s + tasks.filter(t => t.trang_thai === '✓').length, 0)
        const pct = totalInGroup ? Math.round(doneInGroup / totalInGroup * 100) : 0
        const hasOverdue = members.some(([, tasks]) => tasks.some(isOverdue))

        return (
          <div key={viTri} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header vị trí */}
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-800">{viTri}</h2>
                {hasOverdue && <span className="text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded">⚠️ Có việc quá hạn</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{members.length} nhân viên · {totalInGroup} việc</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  pct >= 80 ? 'bg-green-100 text-green-700' : pct >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
                }`}>{pct}%</span>
              </div>
            </div>

            {/* Danh sách nhân viên trong vị trí */}
            <div className="divide-y divide-gray-50">
              {members.map(([name, tasks]) => {
                const key = `${viTri}__${name}`
                const isOpen = expanded[key]
                const done = tasks.filter(t => t.trang_thai === '✓').length
                const pending = tasks.filter(t => t.trang_thai === '⏳').length
                const overdue = tasks.filter(isOverdue).length
                const pctMember = tasks.length ? Math.round(done / tasks.length * 100) : 0

                return (
                  <div key={key}>
                    {/* Dòng nhân viên — click để mở/đóng task */}
                    <button
                      onClick={() => toggleExpand(key)}
                      className="w-full px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold flex items-center justify-center shrink-0">
                        {name.charAt(0).toUpperCase()}
                      </div>

                      {/* Tên */}
                      <div className="w-32 shrink-0">
                        <p className="text-sm font-medium text-gray-800">{name}</p>
                        <p className="text-xs text-gray-400">{tasks.length} công việc</p>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">✓ {done}</span>
                        {pending > 0 && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">⏳ {pending}</span>}
                        {overdue > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">⚠️ {overdue}</span>}
                      </div>

                      {/* Progress bar */}
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${pctMember >= 80 ? 'bg-green-500' : pctMember >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${pctMember}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{pctMember}%</span>
                      </div>

                      <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                    </button>

                    {/* Task list (expandable) */}
                    {isOpen && (
                      <div className="bg-gray-50/50 border-t border-gray-100">
                        {tasks.map(t => {
                          const od = isOverdue(t)
                          return (
                            <div
                              key={t.id}
                              className={`px-14 py-2.5 flex items-start justify-between gap-3 border-b border-gray-100 last:border-0
                                ${od ? 'bg-red-50/40' : ''} ${t.trang_thai === '✓' ? 'opacity-60' : ''}`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm text-gray-700">{t.ten_cong_viec}</p>
                                  {t.loai_cong_viec === 'phat_sinh' && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Phát sinh</span>
                                  )}
                                  {od && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">⚠️ Quá hạn</span>}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  {t.nhom_cap_2 && <span className="text-xs text-gray-400">{t.nhom_cap_2}</span>}
                                  {t.san_pham && <span className="text-xs text-indigo-400">📦 {t.san_pham}</span>}
                                  {t.deadline && (
                                    <span className={`text-xs ${od ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                      Deadline: {new Date(t.deadline + 'T00:00:00').toLocaleDateString('vi-VN')}
                                    </span>
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
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {visibleViTri.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
          Không có dữ liệu cho bộ lọc này
        </div>
      )}
    </div>
  )
}
