import { useEffect, useState } from 'react'
import { useKhoiLuongStore } from '../../stores/khoiluongStore'
import toast from 'react-hot-toast'

const STATUS_CYCLE = ['□', '✓', '✗']
const STATUS_STYLE = {
  '✓': 'bg-green-100 text-green-700 border-green-300',
  '✗': 'bg-red-100 text-red-600 border-red-300',
  '□': 'bg-gray-50 text-gray-400 border-gray-200',
}

export default function MatranAnPham() {
  const { marketing, loading, fetchAll, updateMarketing } = useKhoiLuongStore()
  const [editingNote, setEditingNote] = useState(null)
  const [noteValue, setNoteValue] = useState('')
  const [expandedCell, setExpandedCell] = useState(null) // "dau_ra__nhom"

  useEffect(() => { fetchAll() }, [])

  // Danh sách hàng (Đầu ra) và cột (Nhóm sản phẩm) — giữ thứ tự từ data
  const allDauRa = [...new Set(marketing.map(m => m.dau_ra).filter(Boolean))]
  const allNhom = [...new Set(marketing.map(m => m.nhom_san_pham).filter(Boolean))]

  // Lookup nhanh: dau_ra → nhom → record
  const lookup = {}
  for (const m of marketing) {
    if (!lookup[m.dau_ra]) lookup[m.dau_ra] = {}
    lookup[m.dau_ra][m.nhom_san_pham] = m
  }

  const toggleStatus = async (item) => {
    const cur = STATUS_CYCLE.indexOf(item.trang_thai)
    const next = STATUS_CYCLE[(cur + 1) % STATUS_CYCLE.length]
    const { error } = await updateMarketing(item.id, { trang_thai: next })
    if (error) toast.error('Không thể cập nhật trạng thái')
  }

  const saveNote = async (item) => {
    const { error } = await updateMarketing(item.id, { ghi_chu: noteValue })
    if (error) toast.error('Không thể lưu ghi chú')
    else { toast.success('Đã lưu ghi chú'); setEditingNote(null) }
  }

  const cellKey = (dau_ra, nhom) => `${dau_ra}__${nhom}`

  if (loading) return <div className="text-gray-400 py-8 text-center">Đang tải dữ liệu...</div>

  if (marketing.length === 0)
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
        Chưa có dữ liệu Ma trận Ấn phẩm. Hãy chạy script nhập dữ liệu từ Excel.
      </div>
    )

  const done = marketing.filter(m => m.trang_thai === '✓').length
  const total = marketing.length

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-2 flex gap-5 text-sm">
          <span className="text-gray-500">Tổng: <strong className="text-gray-800">{total}</strong></span>
          <span className="text-gray-500">Hoàn thành: <strong className="text-green-600">{done}</strong></span>
          <span className="text-gray-500">Còn lại: <strong className="text-yellow-600">{total - done}</strong></span>
        </div>
        <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-xs">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${total > 0 ? Math.round(done / total * 100) : 0}%` }}
          />
        </div>
        <span className="text-sm text-gray-400">{total > 0 ? Math.round(done / total * 100) : 0}%</span>
      </div>

      {/* Ma trận */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-indigo-50">
                <th className="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase border-b border-r border-indigo-100 w-44 sticky left-0 bg-indigo-50 z-10">
                  Đầu ra bắt buộc
                </th>
                {allNhom.map(nhom => (
                  <th key={nhom} className="px-3 py-3 text-center text-xs font-bold text-indigo-700 uppercase border-b border-r border-indigo-100 min-w-[160px]">
                    {nhom}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allDauRa.map((dau_ra, rowIdx) => (
                <tr key={dau_ra} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  {/* Cột Đầu ra — sticky */}
                  <td className={`px-4 py-3 font-semibold text-gray-800 text-xs border-b border-r border-gray-100 sticky left-0 z-10 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    {dau_ra}
                  </td>

                  {/* Các ô giao nhau */}
                  {allNhom.map(nhom => {
                    const item = lookup[dau_ra]?.[nhom]
                    const key = cellKey(dau_ra, nhom)
                    const isExpanded = expandedCell === key

                    if (!item) {
                      return (
                        <td key={nhom} className="px-3 py-3 text-center border-b border-r border-gray-100 text-gray-200 text-lg">
                          —
                        </td>
                      )
                    }

                    return (
                      <td
                        key={nhom}
                        className="px-3 py-2 border-b border-r border-gray-100 align-top cursor-pointer"
                        onClick={() => setExpandedCell(isExpanded ? null : key)}
                      >
                        {/* Compact view */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 justify-between">
                            <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium truncate max-w-[90px]">
                              {item.nguoi_phu_trach}
                            </span>
                            <button
                              onClick={e => { e.stopPropagation(); toggleStatus(item) }}
                              className={`px-1.5 py-0.5 rounded border text-xs font-medium transition-colors flex-shrink-0 ${STATUS_STYLE[item.trang_thai] || STATUS_STYLE['□']}`}
                            >
                              {item.trang_thai || '□'}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 font-medium">{item.kpi_san_luong}</p>

                          {/* Expanded: hiện thêm chi tiết */}
                          {isExpanded && (
                            <div className="mt-2 pt-2 border-t border-gray-100 space-y-1.5 text-xs" onClick={e => e.stopPropagation()}>
                              <div>
                                <span className="text-gray-400">Đơn vị KPI: </span>
                                <span className="text-gray-600">{item.don_vi_kpi}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Chất lượng: </span>
                                <span className="text-gray-600">{item.kpi_chat_luong}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Phối hợp: </span>
                                <span className="text-gray-600">{item.nguoi_phoi_hop}</span>
                              </div>
                              {/* Ghi chú */}
                              {editingNote === item.id ? (
                                <div className="flex gap-1 pt-1">
                                  <input
                                    className="border border-indigo-200 rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                                    value={noteValue}
                                    onChange={e => setNoteValue(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') saveNote(item); if (e.key === 'Escape') setEditingNote(null) }}
                                    autoFocus
                                  />
                                  <button onClick={() => saveNote(item)} className="text-indigo-600 text-xs hover:underline">Lưu</button>
                                  <button onClick={() => setEditingNote(null)} className="text-gray-400 text-xs hover:underline">Hủy</button>
                                </div>
                              ) : (
                                <div
                                  className="text-gray-400 italic cursor-pointer hover:text-indigo-500 pt-0.5"
                                  onClick={() => { setEditingNote(item.id); setNoteValue(item.ghi_chu || '') }}
                                >
                                  {item.ghi_chu || 'Thêm ghi chú...'}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-300 px-4 py-2 border-t border-gray-50">Click vào ô để xem chi tiết KPI</p>
      </div>
    </div>
  )
}
