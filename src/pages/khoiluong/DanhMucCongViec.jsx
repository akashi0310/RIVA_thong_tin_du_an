import { useEffect, useState } from 'react'
import { useKhoiLuongStore } from '../../stores/khoiluongStore'
import toast from 'react-hot-toast'

const STATUS_CYCLE = ['□', '✓', '✗']
const STATUS_STYLE = {
  '✓': 'bg-green-100 text-green-700 border-green-300',
  '✗': 'bg-red-100 text-red-600 border-red-300',
  '□': 'bg-gray-100 text-gray-500 border-gray-300',
}

function isOverdueDate(d) {
  if (!d) return false
  return new Date(d) < new Date(new Date().toDateString())
}
function isDueSoon(d) {
  if (!d) return false
  const diff = (new Date(d) - new Date(new Date().toDateString())) / 86400000
  return diff >= 0 && diff <= 3
}

export default function DanhMucCongViec() {
  const { congViec, loading, fetchAll, updateCongViec } = useKhoiLuongStore()

  const [search, setSearch] = useState('')
  const [filterPerson, setFilterPerson] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [noteValue, setNoteValue] = useState('')

  useEffect(() => { fetchAll() }, [])

  // Danh sách unique cho filter
  const allPersons = [...new Set(
    congViec.flatMap(t =>
      [...(t.dieu_hanh || ''), ...(t.thuc_hien || '')].join(',').split(',').map(s => s.trim()).filter(Boolean)
    )
  )].sort()
  const allCats = [...new Set(congViec.map(t => t.danh_muc).filter(Boolean))].sort()

  const filtered = congViec.filter(t => {
    if (search && !`${t.ten_cong_viec} ${t.dieu_hanh} ${t.thuc_hien} ${t.san_pham}`.toLowerCase().includes(search.toLowerCase())) return false
    if (filterPerson && !`${t.dieu_hanh},${t.dieu_phoi},${t.thuc_hien}`.includes(filterPerson)) return false
    if (filterStatus && t.trang_thai !== filterStatus) return false
    if (filterCat && t.danh_muc !== filterCat) return false
    return true
  })

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

  const deadlineClass = (d, status) => {
    if (status === '✓') return 'text-gray-400'
    if (isOverdueDate(d)) return 'text-red-600 font-semibold'
    if (isDueSoon(d)) return 'text-yellow-600 font-semibold'
    return 'text-gray-600'
  }

  if (loading) return <div className="text-gray-400 py-8 text-center">Đang tải dữ liệu...</div>

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <input
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Tìm kiếm công việc..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={filterPerson}
          onChange={e => setFilterPerson(e.target.value)}
        >
          <option value="">Tất cả nhân viên</option>
          {allPersons.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="□">Chưa xong (□)</option>
          <option value="✓">Hoàn thành (✓)</option>
          <option value="✗">Hủy / Không thực hiện (✗)</option>
        </select>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 max-w-xs"
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="ml-auto text-sm text-gray-400 self-center">{filtered.length} / {congViec.length} công việc</span>
      </div>

      {/* Bảng */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0">
              <tr>
                <th className="px-3 py-3 text-left w-10">STT</th>
                <th className="px-3 py-3 text-left">Tên công việc</th>
                <th className="px-3 py-3 text-left w-24">Điều hành</th>
                <th className="px-3 py-3 text-left w-32">Thực hiện</th>
                <th className="px-3 py-3 text-left w-28">Sản phẩm</th>
                <th className="px-3 py-3 text-left w-24">Deadline</th>
                <th className="px-3 py-3 text-center w-24">Trạng thái</th>
                <th className="px-3 py-3 text-left w-40">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(t => (
                <tr key={t.id} className={`hover:bg-gray-50 ${t.trang_thai === '✓' ? 'opacity-60' : ''}`}>
                  <td className="px-3 py-3 text-gray-400">{t.stt}</td>
                  <td className="px-3 py-3 font-medium text-gray-800 max-w-xs">
                    <div>{t.ten_cong_viec}</div>
                    {t.danh_muc && <div className="text-xs text-gray-400 mt-0.5">{t.danh_muc}</div>}
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{t.dieu_hanh}</td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{t.thuc_hien}</td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{t.san_pham}</td>
                  <td className={`px-3 py-3 text-xs ${deadlineClass(t.deadline, t.trang_thai)}`}>
                    {t.deadline || '—'}
                    {isOverdueDate(t.deadline) && t.trang_thai !== '✓' && <span className="ml-1">⚠️</span>}
                  </td>
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">Không tìm thấy công việc nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
