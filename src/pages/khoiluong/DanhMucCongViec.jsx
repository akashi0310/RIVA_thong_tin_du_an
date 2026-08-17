import { useEffect, useState } from 'react'
import { useKhoiLuongStore } from '../../stores/khoiluongStore'
import toast from 'react-hot-toast'

const STATUS_CYCLE = ['□', '✓', '✗']
const STATUS_STYLE = {
  '✓': 'bg-green-100 text-green-700 border-green-300',
  '✗': 'bg-red-100 text-red-600 border-red-300',
  '□': 'bg-gray-100 text-gray-500 border-gray-300',
}

export default function DanhMucCongViec() {
  const { congViec, loading, fetchAll, updateCongViec } = useKhoiLuongStore()

  const [search, setSearch] = useState('')
  const [filterNhom, setFilterNhom] = useState('')
  const [filterDuAn, setFilterDuAn] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [noteValue, setNoteValue] = useState('')
  const [collapsedGroups, setCollapsedGroups] = useState(new Set())

  useEffect(() => { fetchAll() }, [])

  // Danh sách unique cho filter (giữ thứ tự từ data)
  const allNhom = [...new Set(congViec.map(t => t.nhom_cap_1).filter(Boolean))]
  const allDuAn = [...new Set(congViec.map(t => t.du_an).filter(Boolean))].sort()

  const filtered = congViec.filter(t => {
    if (search) {
      const q = search.toLowerCase()
      if (![t.ten_cong_viec, t.nhom_cap_2, t.du_an, t.thuc_hien, t.san_pham].some(f => (f || '').toLowerCase().includes(q))) return false
    }
    if (filterNhom && t.nhom_cap_1 !== filterNhom) return false
    if (filterDuAn && t.du_an !== filterDuAn) return false
    if (filterStatus && t.trang_thai !== filterStatus) return false
    return true
  })

  // Nhóm theo nhom_cap_1 (giữ thứ tự từ data gốc)
  const grouped = allNhom.reduce((acc, nhom) => {
    const items = filtered.filter(t => t.nhom_cap_1 === nhom)
    if (items.length) acc[nhom] = items
    return acc
  }, {})

  const toggleGroup = (nhom) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      next.has(nhom) ? next.delete(nhom) : next.add(nhom)
      return next
    })
  }

  const toggleStatus = async (task) => {
    const cur = STATUS_CYCLE.indexOf(task.trang_thai)
    const next = STATUS_CYCLE[(cur + 1) % STATUS_CYCLE.length]
    const { error } = await updateCongViec(task.id, { trang_thai: next })
    if (error) toast.error('Không thể cập nhật trạng thái')
  }

  const saveNote = async (task) => {
    const { error } = await updateCongViec(task.id, { ghi_chu: noteValue })
    if (error) toast.error('Không thể lưu ghi chú')
    else { toast.success('Đã lưu ghi chú'); setEditingNote(null) }
  }

  if (loading) return <div className="text-gray-400 py-8 text-center">Đang tải dữ liệu...</div>

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <input
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Tìm kiếm đầu việc..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={filterNhom}
          onChange={e => { setFilterNhom(e.target.value); setFilterDuAn('') }}
        >
          <option value="">Tất cả nhóm</option>
          {allNhom.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={filterDuAn}
          onChange={e => setFilterDuAn(e.target.value)}
        >
          <option value="">Tất cả dự án</option>
          {allDuAn.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="□">Chưa xong (□)</option>
          <option value="✓">Hoàn thành (✓)</option>
          <option value="✗">Không thực hiện (✗)</option>
        </select>
        <span className="ml-auto text-sm text-gray-400 self-center">{filtered.length} / {congViec.length} đầu việc</span>
      </div>

      {/* Không có kết quả */}
      {Object.keys(grouped).length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
          Không tìm thấy đầu việc nào
        </div>
      )}

      {/* Nhóm theo Nhóm công việc cấp 1 */}
      {Object.entries(grouped).map(([nhom, items]) => {
        const done = items.filter(t => t.trang_thai === '✓').length
        const pct = items.length ? Math.round((done / items.length) * 100) : 0
        const isCollapsed = collapsedGroups.has(nhom)

        return (
          <div key={nhom} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header nhóm */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 border-b border-indigo-100 hover:bg-indigo-100 transition-colors text-left"
              onClick={() => toggleGroup(nhom)}
            >
              <span className="text-indigo-400 text-xs w-3">{isCollapsed ? '▶' : '▼'}</span>
              <span className="font-bold text-indigo-800 text-sm flex-1">{nhom}</span>
              <span className="text-xs text-indigo-400">{items.length} đầu việc</span>
              <div className="w-24 h-2 bg-indigo-100 rounded-full mx-2">
                <div
                  className={`h-2 rounded-full transition-all ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-indigo-400'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-indigo-600 font-semibold w-8 text-right">{pct}%</span>
            </button>

            {/* Bảng tasks */}
            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left w-10">STT</th>
                      <th className="px-3 py-2 text-left w-24">Dự án</th>
                      <th className="px-3 py-2 text-left w-36">Nhóm việc</th>
                      <th className="px-3 py-2 text-left">Đầu việc cần quản lý</th>
                      <th className="px-3 py-2 text-left w-28">Output</th>
                      <th className="px-3 py-2 text-left w-24">Đơn vị đo</th>
                      <th className="px-3 py-2 text-left w-32">Người thực hiện</th>
                      <th className="px-3 py-2 text-center w-24">Trạng thái</th>
                      <th className="px-3 py-2 text-left w-40">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map(t => (
                      <tr key={t.id} className={`hover:bg-gray-50 ${t.trang_thai === '✓' ? 'opacity-60' : ''}`}>
                        <td className="px-3 py-3 text-gray-400 text-xs">{t.stt}</td>
                        <td className="px-3 py-3">
                          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium">{t.du_an}</span>
                        </td>
                        <td className="px-3 py-3 text-gray-500 text-xs">{t.nhom_cap_2}</td>
                        <td className="px-3 py-3 font-medium text-gray-800">{t.ten_cong_viec}</td>
                        <td className="px-3 py-3 text-gray-500 text-xs">{t.san_pham}</td>
                        <td className="px-3 py-3 text-gray-400 text-xs">{t.don_vi}</td>
                        <td className="px-3 py-3 text-gray-600 text-xs">{t.thuc_hien}</td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => toggleStatus(t)}
                            className={`px-2 py-1 rounded-lg border text-xs font-medium transition-colors ${STATUS_STYLE[t.trang_thai] || STATUS_STYLE['□']}`}
                            title="Click để đổi trạng thái"
                          >
                            {t.trang_thai || '□'}
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          {editingNote === t.id ? (
                            <div className="flex gap-1">
                              <input
                                className="border border-indigo-200 rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                                value={noteValue}
                                onChange={e => setNoteValue(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') saveNote(t); if (e.key === 'Escape') setEditingNote(null) }}
                                autoFocus
                              />
                              <button onClick={() => saveNote(t)} className="text-indigo-600 text-xs hover:underline">Lưu</button>
                              <button onClick={() => setEditingNote(null)} className="text-gray-400 text-xs hover:underline">Hủy</button>
                            </div>
                          ) : (
                            <span
                              className="text-xs text-gray-500 cursor-pointer hover:text-indigo-600 block truncate max-w-[140px]"
                              onClick={() => { setEditingNote(t.id); setNoteValue(t.ghi_chu || '') }}
                              title={t.ghi_chu || 'Click để thêm ghi chú'}
                            >
                              {t.ghi_chu || <span className="text-gray-300 italic">Thêm ghi chú...</span>}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
