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
  const [activeTab, setActiveTab] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [noteValue, setNoteValue] = useState('')

  useEffect(() => { fetchAll() }, [])

  // Tab theo Đầu ra bắt buộc (giữ thứ tự từ data)
  const allDauRa = [...new Set(marketing.map(m => m.dau_ra).filter(Boolean))]

  useEffect(() => {
    if (allDauRa.length && activeTab === null) setActiveTab(allDauRa[0])
  }, [marketing])

  // Các row trong tab hiện tại
  const tabItems = marketing.filter(m => m.dau_ra === activeTab)

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

  return (
    <div className="space-y-0">
      {/* Tab ngang theo Đầu ra bắt buộc */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {allDauRa.map(dauRa => {
          const items = marketing.filter(m => m.dau_ra === dauRa)
          const done = items.filter(m => m.trang_thai === '✓').length
          const isActive = activeTab === dauRa
          return (
            <button
              key={dauRa}
              onClick={() => setActiveTab(dauRa)}
              className={`relative px-4 py-2.5 text-sm font-medium rounded-t-lg border border-b-0 transition-colors whitespace-nowrap
                ${isActive
                  ? 'bg-white border-gray-200 text-indigo-700 -mb-px z-10'
                  : 'bg-gray-50 border-transparent text-gray-500 hover:text-indigo-600 hover:bg-gray-100'
                }`}
            >
              {dauRa}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-semibold
                ${done === items.length && items.length > 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-indigo-50 text-indigo-400'
                }`}>
                {done}/{items.length}
              </span>
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
            </button>
          )
        })}
      </div>

      {/* Panel nội dung */}
      <div className="bg-white rounded-b-xl rounded-tr-xl border border-gray-200 shadow-sm overflow-hidden">
        {tabItems.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">Không có dữ liệu</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-400 uppercase border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left w-32">Nhóm sản phẩm</th>
                  <th className="px-4 py-2 text-left">Đối tượng</th>
                  <th className="px-4 py-2 text-left w-20">Đơn vị KPI</th>
                  <th className="px-4 py-2 text-left w-32">KPI sản lượng</th>
                  <th className="px-4 py-2 text-left w-48">KPI chất lượng</th>
                  <th className="px-4 py-2 text-left w-28">Phụ trách</th>
                  <th className="px-4 py-2 text-left w-28">Phối hợp</th>
                  <th className="px-4 py-2 text-center w-20">Trạng thái</th>
                  <th className="px-4 py-2 text-left w-36">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tabItems.map(m => (
                  <tr key={m.id} className={`hover:bg-gray-50 ${m.trang_thai === '✓' ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium">{m.nhom_san_pham}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 text-xs">{m.doi_tuong}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{m.don_vi_kpi}</td>
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
