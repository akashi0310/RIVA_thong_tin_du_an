import { useEffect, useState } from 'react'
import { useKhoiLuongStore } from '../../stores/khoiluongStore'
import toast from 'react-hot-toast'

function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0
  const color = pct >= 90 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold w-9 text-right ${pct >= 90 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
        {pct}%
      </span>
    </div>
  )
}

const GROUP_COLORS = [
  'border-l-indigo-400',
  'border-l-emerald-400',
  'border-l-amber-400',
  'border-l-rose-400',
  'border-l-sky-400',
  'border-l-violet-400',
  'border-l-orange-400',
  'border-l-teal-400',
]

const NGUON_DU_LIEU_INFO = {
  'CRM':        { label: 'CRM', desc: 'Hệ thống quản lý khách hàng (CRM)' },
  'CRM/Task':   { label: 'CRM/Task', desc: 'Kết hợp dữ liệu CRM và danh sách task nội bộ' },
  'Campaign':   { label: 'Campaign', desc: 'Dữ liệu chiến dịch Marketing' },
  'Content':    { label: 'Content', desc: 'Hệ thống quản lý nội dung (bài đăng, bài viết...)' },
  'Class':      { label: 'Class', desc: 'Hệ thống quản lý lớp học & đào tạo' },
  'Attendance': { label: 'Attendance', desc: 'Dữ liệu chấm công, điểm danh học viên' },
  'Project':    { label: 'Project', desc: 'Hệ thống quản lý dự án' },
  'Visa':       { label: 'Visa', desc: 'Hồ sơ và tiến độ xử lý visa' },
  'System':     { label: 'System', desc: 'Hệ thống kỹ thuật nội bộ (sprint, deploy...)' },
  'Ticket':     { label: 'Ticket', desc: 'Hệ thống theo dõi sự cố & bug (helpdesk ticket)' },
  'Task':       { label: 'Task', desc: 'Danh sách công việc trên hệ thống này' },
  'Report':     { label: 'Report', desc: 'Báo cáo định kỳ nội bộ' },
}

export default function KPINhanVien() {
  const { kpi, loading, fetchAll, updateKPI } = useKhoiLuongStore()
  const [editing, setEditing] = useState(null) // { id, field }
  const [editVal, setEditVal] = useState('')
  const [showLegend, setShowLegend] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const startEdit = (k) => {
    setEditing({ id: k.id })
    setEditVal(k.thuc_te_text ?? (k.thuc_te != null ? String(k.thuc_te) : ''))
  }

  const saveEdit = async (k) => {
    const num = parseFloat(editVal)
    const updates = isNaN(num)
      ? { thuc_te: null, thuc_te_text: editVal.trim() }
      : { thuc_te: num, thuc_te_text: String(num) }
    const { error } = await updateKPI(k.id, updates)
    if (error) toast.error('Không thể cập nhật KPI')
    else { toast.success('Đã cập nhật'); setEditing(null) }
  }

  const cancelEdit = () => setEditing(null)

  if (loading) return <div className="text-gray-400 py-8 text-center">Đang tải dữ liệu...</div>

  if (kpi.length === 0)
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
        Chưa có dữ liệu KPI. Hãy chạy script nhập dữ liệu từ Excel.
      </div>
    )

  // Nhóm theo nhan_su_nhom → nhom_kpi
  const byGroup = {}
  for (const k of kpi) {
    const g = k.nhan_su_nhom || 'Chung'
    const sub = k.nhom_kpi || 'Khác'
    if (!byGroup[g]) byGroup[g] = {}
    if (!byGroup[g][sub]) byGroup[g][sub] = []
    byGroup[g][sub].push(k)
  }
  const groups = Object.keys(byGroup)

  // Tổng quan
  const numericKpis = kpi.filter(k => k.muc_tieu != null && k.muc_tieu > 0)
  const achieved = numericKpis.filter(k => (k.thuc_te || 0) >= k.muc_tieu).length

  // Các nguồn dữ liệu thực tế có trong data
  const usedSources = [...new Set(kpi.map(k => k.nguon_du_lieu).filter(Boolean))]

  return (
    <div className="space-y-4">
      {/* Tổng quan */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase font-medium">Tổng chỉ số KPI</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{kpi.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase font-medium">KPI đạt mục tiêu</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{achieved}</p>
          <p className="text-xs text-gray-400 mt-0.5">/ {numericKpis.length} chỉ số có số liệu</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase font-medium">Nhóm nhân sự</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{groups.length}</p>
        </div>
      </div>

      {/* Legend nguồn dữ liệu */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          onClick={() => setShowLegend(v => !v)}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">📖 Nguồn dữ liệu là gì?</span>
            <div className="flex gap-1.5 flex-wrap">
              {usedSources.map(s => (
                <span key={s} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">{s}</span>
              ))}
            </div>
          </div>
          <span className="text-gray-400 text-sm">{showLegend ? '▲' : '▼'}</span>
        </button>
        {showLegend && (
          <div className="border-t border-gray-100 px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {usedSources.map(s => {
              const info = NGUON_DU_LIEU_INFO[s]
              return (
                <div key={s} className="flex items-start gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono shrink-0 mt-0.5">{s}</span>
                  <span className="text-xs text-gray-500">{info?.desc ?? s}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* KPI theo nhóm */}
      {groups.map((group, gi) => {
        const subGroups = byGroup[group]
        const allInGroup = Object.values(subGroups).flat()
        const numInGroup = allInGroup.filter(k => k.muc_tieu != null && k.muc_tieu > 0)
        const doneInGroup = numInGroup.filter(k => (k.thuc_te || 0) >= k.muc_tieu).length
        const pctGroup = numInGroup.length ? Math.round((doneInGroup / numInGroup.length) * 100) : null
        const borderColor = GROUP_COLORS[gi % GROUP_COLORS.length]

        return (
          <div key={group} className={`bg-white rounded-xl border border-gray-100 border-l-4 ${borderColor} shadow-sm overflow-hidden`}>
            {/* Group header */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="font-semibold text-gray-800">{group}</h2>
              {pctGroup !== null && (
                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                  pctGroup >= 90 ? 'bg-green-100 text-green-700' :
                  pctGroup >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-600'
                }`}>
                  {pctGroup}%
                </span>
              )}
            </div>

            {/* Sub-groups */}
            {Object.entries(subGroups).map(([subGroup, items]) => (
              <div key={subGroup}>
                {/* Sub-group header với column labels */}
                <div className="px-5 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide w-48">{subGroup}</span>
                  <span className="text-xs text-gray-400 w-24 ml-2">Nguồn DL</span>
                  <span className="text-xs text-gray-400 w-36">Mục tiêu</span>
                  <span className="text-xs text-gray-400 w-40">Thực tế</span>
                  <span className="text-xs text-gray-400 flex-1">Tiến độ</span>
                </div>

                {/* KPI rows */}
                <div className="divide-y divide-gray-50">
                  {items.map(k => {
                    const isEditing = editing?.id === k.id
                    const thucTeDisplay = k.thuc_te_text ?? (k.thuc_te != null ? String(k.thuc_te) : null)

                    return (
                      <div key={k.id} className="px-5 py-3 flex items-center hover:bg-gray-50/50 transition-colors">
                        {/* Tên chỉ số */}
                        <div className="w-48 font-medium text-gray-800 text-sm">{k.ten_kpi}</div>

                        {/* Nguồn dữ liệu */}
                        <div className="w-24 ml-2">
                          {k.nguon_du_lieu && (
                            <span
                              className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono cursor-help"
                              title={NGUON_DU_LIEU_INFO[k.nguon_du_lieu]?.desc ?? k.nguon_du_lieu}
                            >
                              {k.nguon_du_lieu}
                            </span>
                          )}
                        </div>

                        {/* Mục tiêu */}
                        <div className="w-36">
                          <div className="text-sm font-semibold text-gray-700">
                            {k.muc_tieu_text || (k.muc_tieu != null ? k.muc_tieu : '—')}
                          </div>
                          <div className="text-xs text-gray-400">Mục tiêu</div>
                        </div>

                        {/* Thực tế — editable */}
                        <div className="w-40">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                className="border border-indigo-300 rounded px-2 py-1 text-sm w-24 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                placeholder="Số hoặc chữ..."
                                value={editVal}
                                onChange={e => setEditVal(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') saveEdit(k); if (e.key === 'Escape') cancelEdit() }}
                                autoFocus
                              />
                              <button onClick={() => saveEdit(k)} className="text-indigo-600 text-xs hover:underline">Lưu</button>
                              <button onClick={cancelEdit} className="text-gray-400 text-xs hover:underline">Hủy</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(k)}
                              className="text-left group"
                              title="Click để nhập thực tế"
                            >
                              <div className={`text-sm font-semibold ${thucTeDisplay ? 'text-indigo-600' : 'text-gray-300'} group-hover:underline`}>
                                {thucTeDisplay ?? 'Nhập thực tế...'}
                              </div>
                              <div className="text-xs text-gray-400">Thực tế</div>
                            </button>
                          )}
                        </div>

                        {/* Tiến độ */}
                        <div className="flex-1">
                          {k.muc_tieu != null && k.muc_tieu > 0 ? (
                            <ProgressBar value={k.thuc_te || 0} max={k.muc_tieu} />
                          ) : (
                            <span className="text-xs text-gray-300 italic">Chỉ tiêu định tính</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
