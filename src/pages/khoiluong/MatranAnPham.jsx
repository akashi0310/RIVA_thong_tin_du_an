import { useEffect, useState } from 'react'
import { useKhoiLuongStore } from '../../stores/khoiluongStore'
import toast from 'react-hot-toast'

const STATUS_STYLE = {
  '✓': 'bg-green-100 text-green-700 border-green-300',
  '✗': 'bg-red-100 text-red-600 border-red-300',
  '□': 'bg-gray-100 text-gray-500 border-gray-300',
}
const STATUS_CYCLE = ['□', '✓', '✗']

function isOverdueDate(d) {
  if (!d) return false
  return new Date(d) < new Date(new Date().toDateString())
}

export default function MatranAnPham() {
  const { marketing, loading, fetchAll, updateMarketing } = useKhoiLuongStore()
  const [filterPerson, setFilterPerson] = useState('')

  useEffect(() => { fetchAll() }, [])

  const allPersons = [...new Set(marketing.map(m => m.nguoi_phu_trach).filter(Boolean))].sort()

  const filtered = marketing.filter(m => {
    if (filterPerson && m.nguoi_phu_trach !== filterPerson) return false
    return true
  })

  const toggleStatus = async (item) => {
    const cur = STATUS_CYCLE.indexOf(item.trang_thai)
    const next = STATUS_CYCLE[(cur + 1) % STATUS_CYCLE.length]
    const { error } = await updateMarketing(item.id, { trang_thai: next })
    if (error) toast.error('Không thể cập nhật trạng thái')
  }

  const done = marketing.filter(m => m.trang_thai === '✓').length
  const total = marketing.length

  if (loading) return <div className="text-gray-400 py-8 text-center">Đang tải dữ liệu...</div>

  if (marketing.length === 0)
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
        Chưa có dữ liệu Ma trận Ấn phẩm. Hãy chạy script nhập dữ liệu từ Excel.
      </div>
    )

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex gap-4">
          <div>
            <p className="text-xs text-gray-500">Tổng ấn phẩm</p>
            <p className="text-2xl font-bold text-gray-800">{total}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Hoàn thành</p>
            <p className="text-2xl font-bold text-green-600">{done}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Còn lại</p>
            <p className="text-2xl font-bold text-yellow-600">{total - done}</p>
          </div>
        </div>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={filterPerson}
          onChange={e => setFilterPerson(e.target.value)}
        >
          <option value="">Tất cả phụ trách</option>
          {allPersons.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <span className="text-sm text-gray-400">{filtered.length} / {total} ấn phẩm</span>
      </div>

      {/* Progress bar tổng */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Tiến độ tổng thể</span>
          <span>{total > 0 ? Math.round(done / total * 100) : 0}%</span>
        </div>
        <div className="bg-gray-100 rounded-full h-3">
          <div
            className="bg-indigo-500 h-3 rounded-full transition-all"
            style={{ width: `${total > 0 ? Math.round(done / total * 100) : 0}%` }}
          />
        </div>
      </div>

      {/* Bảng */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-3 py-3 text-left w-10">STT</th>
                <th className="px-3 py-3 text-left">Hạng mục</th>
                <th className="px-3 py-3 text-left">Sản phẩm</th>
                <th className="px-3 py-3 text-left w-28">Phụ trách</th>
                <th className="px-3 py-3 text-left w-24">Deadline</th>
                <th className="px-3 py-3 text-center w-24">Trạng thái</th>
                <th className="px-3 py-3 text-left w-36">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(m => (
                <tr key={m.id} className={`hover:bg-gray-50 ${m.trang_thai === '✓' ? 'opacity-60' : ''}`}>
                  <td className="px-3 py-3 text-gray-400">{m.stt}</td>
                  <td className="px-3 py-3 font-medium text-gray-800">{m.hang_muc}</td>
                  <td className="px-3 py-3 text-gray-700">{m.san_pham}</td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{m.nguoi_phu_trach}</td>
                  <td className={`px-3 py-3 text-xs ${isOverdueDate(m.deadline) && m.trang_thai !== '✓' ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                    {m.deadline || '—'}
                    {isOverdueDate(m.deadline) && m.trang_thai !== '✓' && ' ⚠️'}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => toggleStatus(m)}
                      className={`px-2 py-1 rounded-lg border text-xs font-medium transition-colors ${STATUS_STYLE[m.trang_thai] || STATUS_STYLE['□']}`}
                    >
                      {m.trang_thai || '□'}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">{m.ghi_chu}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
