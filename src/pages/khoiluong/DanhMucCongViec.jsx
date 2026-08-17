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
  const [filterDuAn, setFilterDuAn] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [noteValue, setNoteValue] = useState('')
  const [activeTab, setActiveTab] = useState(null)

  useEffect(() => { fetchAll() }, [])

  // Danh sách unique nhóm cấp 1 (giữ thứ tự từ data)
  const allNhom = [...new Set(congViec.map(t => t.nhom_cap_1).filter(Boolean))]
  const allDuAn = [...new Set(congViec.map(t => t.du_an).filter(Boolean))].sort()

  // Tự động chọn tab đầu tiên khi có data
  useEffect(() => {
    if (allNhom.length && activeTab === null) setActiveTab(allNhom[0])
  }, [congViec])

  const filtered = congViec.filter(t => {
    if (search) {
      const q = search.toLowerCase()
      if (![t.ten_cong_viec, t.nhom_cap_2, t.du_an, t.thuc_hien, t.san_pham].some(f => (f || '').toLowerCase().includes(q))) return false
    }
    if (filterDuAn && t.du_an !== filterDuAn) return false
    if (filterStatus && t.trang_thai !== filterStatus) return false
    return true
  })

  const tabItems = activeTab ? filtered.filter(t => t.nhom_cap_1 === activeTab) : []

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
    <div className="space-y-0">
      {/* Tab bar ngang */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-0">
        {allNhom.map(nhom => {
          const allItems = congViec.filter(t => t.nhom_cap_1 === nhom)
          const done = allItems.filter(t => t.trang_thai === '✓').length
          const pct = allItems.length ? Math.round((done / allItems.length) * 100) : 0
          const isActive = activeTab === nhom
          return (
            <button
              key={nhom}
              onClick={() => setActiveTab(nhom)}
              className={`relative px-4 py-2.5 text-sm font-medium rounded-t-lg border border-b-0 transition-colors whitespace-nowrap
                ${isActive
                  ? 'bg-white border-gray-200 text-indigo-700 -mb-px z-10'
                  : 'bg-gray-50 border-transparent text-gray-500 hover:text-indigo-600 hover:bg-gray-100'
                }`}
            >
              <span>{nhom}</span>
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold
                ${pct >= 80 ? 'bg-green-100 text-green-700' : pct >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-indigo-50 text-indigo-500'}`}>
                {pct}%
              </span>
              {/* Đường gạch chân khi active */}
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
            </button>
          )
        })}
      </div>

      {/* Panel nội dung */}
      <div className="bg-white rounded-b-xl rounded-tr-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar lọc trong tab */}
        <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <input
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Tìm kiếm đầu việc..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={filterDuAn}
            onChange={e => setFilterDuAn(e.target.value)}
          >
            <option value="">Tất cả dự án</option>
            {allDuAn.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="□">Chưa xong (□)</option>
            <option value="✓">Hoàn thành (✓)</option>
            <option value="✗">Không thực hiện (✗)</option>
          </select>
          <span className="ml-auto text-sm text-gray-400 self-center">
            {tabItems.length} đầu việc
          </span>
        </div>

        {/* Bảng */}
        {tabItems.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">Không tìm thấy đầu việc nào</div>
        ) : (
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
                {tabItems.map(t => (
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
    </div>
  )
}
