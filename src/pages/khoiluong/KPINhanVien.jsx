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

export default function KPINhanVien() {
  const { kpi, loading, fetchAll, updateKPI } = useKhoiLuongStore()
  const [editing, setEditing] = useState(null) // { id, field }
  const [editVal, setEditVal] = useState('')

  useEffect(() => { fetchAll() }, [])

  const startEdit = (k, field) => {
    setEditing({ id: k.id, field })
    setEditVal(String(k[field] ?? ''))
  }

  const saveEdit = async (k) => {
    const val = parseFloat(editVal)
    if (isNaN(val)) { toast.error('Giá trị không hợp lệ'); return }
    const { error } = await updateKPI(k.id, { [editing.field]: val })
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
                {/* Sub-group header */}
                <div className="px-5 py-1.5 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{subGroup}</span>
                </div>

                {/* KPI rows */}
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-50">
                    {items.map(k => (
                      <tr key={k.id} className="hover:bg-gray-50/50">
                        {/* Tên chỉ số */}
                        <td className="px-5 py-3 font-medium text-gray-800 w-56">{k.ten_kpi}</td>

                        {/* Nguồn dữ liệu */}
                        <td className="px-3 py-3 w-28">
                          {k.nguon_du_lieu && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{k.nguon_du_lieu}</span>
                          )}
                        </td>

                        {/* Mục tiêu */}
                        <td className="px-3 py-3 w-36">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">MT:</span>
                            <span className="text-sm font-semibold text-gray-700">
                              {k.muc_tieu_text || (k.muc_tieu != null ? k.muc_tieu : '—')}
                            </span>
                          </div>
                        </td>

                        {/* Thực tế — editable */}
                        <td className="px-3 py-3 w-36">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">TT:</span>
                            {editing?.id === k.id && editing?.field === 'thuc_te' ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  className="border border-indigo-300 rounded px-2 py-0.5 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                  value={editVal}
                                  onChange={e => setEditVal(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(k); if (e.key === 'Escape') cancelEdit() }}
                                  autoFocus
                                />
                                <button onClick={() => saveEdit(k)} className="text-indigo-600 text-xs">✓</button>
                                <button onClick={cancelEdit} className="text-gray-400 text-xs">✗</button>
                              </div>
                            ) : (
                              <button
                                className={`text-sm font-semibold hover:underline cursor-pointer ${k.thuc_te != null ? 'text-indigo-600' : 'text-gray-300 italic text-xs font-normal'}`}
                                onClick={() => startEdit(k, 'thuc_te')}
                                title="Click để nhập thực tế"
                              >
                                {k.thuc_te ?? 'Nhập...'}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Progress bar — chỉ hiện khi có mục tiêu số */}
                        <td className="px-3 py-3">
                          {k.muc_tieu != null && k.muc_tieu > 0 ? (
                            <ProgressBar value={k.thuc_te || 0} max={k.muc_tieu} />
                          ) : (
                            <span className="text-xs text-gray-300 italic">Chỉ tiêu định tính</span>
                          )}
                        </td>

                        {/* Ghi chú */}
                        <td className="px-3 py-3 text-xs text-gray-400 w-36">{k.ghi_chu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
