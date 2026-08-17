import { useEffect, useState } from 'react'
import { useKhoiLuongStore } from '../../stores/khoiluongStore'
import toast from 'react-hot-toast'

function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0
  const color = pct >= 90 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold w-10 text-right ${pct >= 90 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
        {pct}%
      </span>
    </div>
  )
}

export default function KPINhanVien() {
  const { kpi, loading, fetchAll, updateKPI } = useKhoiLuongStore()
  const [editing, setEditing] = useState(null)
  const [editVal, setEditVal] = useState('')

  useEffect(() => { fetchAll() }, [])

  const startEdit = (k) => {
    setEditing(k.id)
    setEditVal(String(k.thuc_te ?? ''))
  }

  const saveEdit = async (k) => {
    const val = parseFloat(editVal)
    if (isNaN(val)) { toast.error('Giá trị không hợp lệ'); return }
    const { error } = await updateKPI(k.id, { thuc_te: val })
    if (error) toast.error('Không thể cập nhật KPI')
    else { toast.success('Đã cập nhật KPI'); setEditing(null) }
  }

  if (loading) return <div className="text-gray-400 py-8 text-center">Đang tải dữ liệu...</div>

  if (kpi.length === 0)
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
        Chưa có dữ liệu KPI. Hãy chạy script nhập dữ liệu từ Excel.
      </div>
    )

  const totalTarget = kpi.reduce((s, k) => s + (k.muc_tieu || 0), 0)
  const totalActual = kpi.reduce((s, k) => s + (k.thuc_te || 0), 0)
  const overallPct = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0

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
          <p className="text-3xl font-bold text-green-600 mt-1">
            {kpi.filter(k => k.muc_tieu > 0 && (k.thuc_te || 0) >= k.muc_tieu).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase font-medium">Tỷ lệ tổng thể</p>
          <p className={`text-3xl font-bold mt-1 ${overallPct >= 80 ? 'text-green-600' : overallPct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
            {overallPct}%
          </p>
        </div>
      </div>

      {/* Bảng KPI */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Danh sách chỉ số KPI</h2>
          <p className="text-xs text-gray-400 mt-0.5">Click vào giá trị "Thực tế" để chỉnh sửa</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Tên chỉ số KPI</th>
                <th className="px-4 py-3 text-center w-24">Đơn vị</th>
                <th className="px-4 py-3 text-center w-24">Mục tiêu</th>
                <th className="px-4 py-3 text-center w-28">Thực tế</th>
                <th className="px-4 py-3 text-left">Tiến độ</th>
                <th className="px-4 py-3 text-left w-40">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {kpi.map(k => (
                <tr key={k.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{k.ten_kpi}</td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">{k.don_vi}</td>
                  <td className="px-4 py-3 text-center text-gray-700 font-medium">{k.muc_tieu ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {editing === k.id ? (
                      <div className="flex items-center gap-1 justify-center">
                        <input
                          type="number"
                          className="border border-indigo-300 rounded px-2 py-0.5 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(k); if (e.key === 'Escape') setEditing(null) }}
                          autoFocus
                        />
                        <button onClick={() => saveEdit(k)} className="text-indigo-600 text-xs hover:underline">✓</button>
                        <button onClick={() => setEditing(null)} className="text-gray-400 text-xs hover:underline">✗</button>
                      </div>
                    ) : (
                      <button
                        className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                        onClick={() => startEdit(k)}
                        title="Click để chỉnh sửa"
                      >
                        {k.thuc_te ?? <span className="text-gray-300 italic text-xs">Nhập...</span>}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 w-48">
                    {k.muc_tieu > 0
                      ? <ProgressBar value={k.thuc_te || 0} max={k.muc_tieu} />
                      : <span className="text-xs text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{k.ghi_chu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
