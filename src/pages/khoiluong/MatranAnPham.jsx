import { useEffect, useState } from 'react'
import { useKhoiLuongStore } from '../../stores/khoiluongStore'
import toast from 'react-hot-toast'

const STATUS_CYCLE = ['□', '✓', '✗']
const STATUS_STYLE = {
  '✓': 'bg-green-100 text-green-700 border-green-300',
  '✗': 'bg-red-100 text-red-600 border-red-300',
  '□': 'bg-gray-100 text-gray-500 border-gray-300',
}

export default function MatranAnPham() {
  const { marketing, loading, fetchAll, updateMarketing } = useKhoiLuongStore()
  const [searchDauRa, setSearchDauRa] = useState('')
  const [filterNhom, setFilterNhom] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [noteValue, setNoteValue] = useState('')

  useEffect(() => { fetchAll() }, [])

  const allDauRa = [...new Set(marketing.map(m => m.dau_ra).filter(Boolean))]
  const allNhom = [...new Set(marketing.map(m => m.nhom_san_pham).filter(Boolean))]

  const filtered = marketing.filter(m => {
    if (searchDauRa && !m.dau_ra?.toLowerCase().includes(searchDauRa.toLowerCase())) return false
    if (filterNhom && m.nhom_san_pham !== filterNhom) return false
    return true
  })

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

  if (loading) return <div className="text-gray-400 py-8 text-center">Đang tải dữ liệu...</div>

  if (marketing.length === 0)
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
        Chưa có dữ liệu Ma trận Ấn phẩm. Hãy chạy script nhập dữ liệu từ Excel.
      </div>
    )

  const done = marketing.filter(m => m.trang_thai === '✓').length

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Tìm đầu ra (Brochure, Video...)"
          value={searchDauRa}
          onChange={e => setSearchDauRa(e.target.value)}
        />
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={filterNhom}
          onChange={e => setFilterNhom(e.target.value)}
        >
          <option value="">Tất cả nhóm sản phẩm</option>
          {allNhom.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        {(searchDauRa || filterNhom) && (
          <button
            className="text-xs text-gray-400 hover:text-indigo-600 underline"
            onClick={() => { setSearchDauRa(''); setFilterNhom('') }}
          >
            Xóa bộ lọc
          </button>
        )}
        <span className="ml-auto text-sm text-gray-400">
          {filtered.length} / {marketing.length} mục &nbsp;·&nbsp; Hoàn thành: {done}
        </span>
      </div>

      {/* Bảng */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">Không có dữ liệu</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-400 uppercase border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left w-32">Nhóm sản phẩm</th>
                  <th className="px-4 py-2 text-left w-44">Đối tượng</th>
                  <th className="px-4 py-2 text-left">Đầu ra bắt buộc</th>
                  <th className="px-4 py-2 text-left w-32">KPI sản lượng</th>
                  <th className="px-4 py-2 text-left w-48">KPI chất lượng</th>
                  <th className="px-4 py-2 text-left w-28">Phụ trách</th>
                  <th className="px-4 py-2 text-left w-28">Phối hợp</th>
                  <th className="px-4 py-2 text-center w-20">Trạng thái</th>
                  <th className="px-4 py-2 text-left w-36">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(m => (
                  <tr key={m.id} className={`hover:bg-gray-50 ${m.trang_thai === '✓' ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium">{m.nhom_san_pham}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{m.doi_tuong}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{m.dau_ra}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 font-medium">{m.kpi_san_luong}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{m.kpi_chat_luong}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{m.nguoi_phu_trach}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{m.nguoi_phoi_hop}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleStatus(m)}
                        className={`px-2 py-1 rounded-lg border text-xs font-medium transition-colors ${STATUS_STYLE[m.trang_thai] || STATUS_STYLE['□']}`}
                        title="Click để đổi trạng thái"
                      >
                        {m.trang_thai || '□'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {editingNote === m.id ? (
                        <div className="flex gap-1">
                          <input
                            className="border border-indigo-200 rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                            value={noteValue}
                            onChange={e => setNoteValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveNote(m); if (e.key === 'Escape') setEditingNote(null) }}
                            autoFocus
                          />
                          <button onClick={() => saveNote(m)} className="text-indigo-600 text-xs hover:underline">Lưu</button>
                          <button onClick={() => setEditingNote(null)} className="text-gray-400 text-xs hover:underline">Hủy</button>
                        </div>
                      ) : (
                        <span
                          className="text-xs text-gray-500 cursor-pointer hover:text-indigo-600 block truncate max-w-[130px]"
                          onClick={() => { setEditingNote(m.id); setNoteValue(m.ghi_chu || '') }}
                          title={m.ghi_chu || 'Click để thêm ghi chú'}
                        >
                          {m.ghi_chu || <span className="text-gray-300 italic">Thêm ghi chú...</span>}
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
    </div>
  )
}
