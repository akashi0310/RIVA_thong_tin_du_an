import { useEffect, useState } from 'react'
import { useKhoiLuongStore } from '../../stores/khoiluongStore'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'

const STATUS_CYCLE = ['□', '⏳', '✓', '✗']
const STATUS_STYLE = {
  '✓': 'bg-green-100 text-green-700 border-green-300',
  '✗': 'bg-red-100 text-red-600 border-red-300',
  '□': 'bg-gray-100 text-gray-500 border-gray-300',
  '⏳': 'bg-yellow-100 text-yellow-700 border-yellow-300',
}
const STATUS_LABEL = {
  '✓': 'Hoàn thành',
  '✗': 'Không TH',
  '□': 'Chưa làm',
  '⏳': 'Chờ duyệt',
}

function isOverdue(t) {
  if (!t.deadline) return false
  if (t.trang_thai === '✓' || t.trang_thai === '✗') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(t.deadline) < today
}

const EMPTY_TASK = {
  ten_cong_viec: '',
  nhom_cap_1: '',
  nhom_cap_2: '',
  du_an: '',
  san_pham: '',
  don_vi: '',
  thuc_hien: '',
  deadline: '',
  ghi_chu: '',
  loai_cong_viec: 'phat_sinh',
  trang_thai: '□',
}

export default function DanhMucCongViec() {
  const { congViec, loading, fetchAll, updateCongViec, addCongViec } = useKhoiLuongStore()

  const [search, setSearch] = useState('')
  const [filterDuAn, setFilterDuAn] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterLoai, setFilterLoai] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [noteValue, setNoteValue] = useState('')
  const [editingDeadline, setEditingDeadline] = useState(null)
  const [deadlineValue, setDeadlineValue] = useState('')
  const [activeTab, setActiveTab] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTask, setNewTask] = useState(EMPTY_TASK)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const allNhom = [...new Set(congViec.map(t => t.nhom_cap_1).filter(Boolean))]
  const allDuAn = [...new Set(congViec.map(t => t.du_an).filter(Boolean))].sort()

  useEffect(() => {
    if (allNhom.length && activeTab === null) setActiveTab(allNhom[0])
  }, [congViec])

  const filtered = congViec.filter(t => {
    if (search) {
      const q = search.toLowerCase()
      if (![t.ten_cong_viec, t.nhom_cap_2, t.du_an, t.thuc_hien, t.san_pham].some(f => (f || '').toLowerCase().includes(q))) return false
    }
    if (filterDuAn && t.du_an !== filterDuAn) return false
    if (filterStatus === 'qua_han') { if (!isOverdue(t)) return false }
    else if (filterStatus && t.trang_thai !== filterStatus) return false
    if (filterLoai === 'phat_sinh' && t.loai_cong_viec !== 'phat_sinh') return false
    return true
  })

  const tabItems = activeTab ? filtered.filter(t => t.nhom_cap_1 === activeTab) : []

  const toggleStatus = async (task) => {
    const cur = STATUS_CYCLE.indexOf(task.trang_thai)
    const next = STATUS_CYCLE[(cur === -1 ? 0 : cur + 1) % STATUS_CYCLE.length]
    const { error } = await updateCongViec(task.id, { trang_thai: next })
    if (error) toast.error('Không thể cập nhật trạng thái')
  }

  const saveNote = async (task) => {
    const { error } = await updateCongViec(task.id, { ghi_chu: noteValue })
    if (error) toast.error('Không thể lưu ghi chú')
    else { toast.success('Đã lưu ghi chú'); setEditingNote(null) }
  }

  const saveDeadline = async (task) => {
    const { error } = await updateCongViec(task.id, { deadline: deadlineValue || null })
    if (error) toast.error('Không thể lưu deadline')
    else { toast.success('Đã lưu deadline'); setEditingDeadline(null) }
  }

  const handleAddTask = async () => {
    if (!newTask.ten_cong_viec.trim()) { toast.error('Vui lòng nhập tên công việc'); return }
    setSaving(true)
    const { error } = await addCongViec(newTask)
    setSaving(false)
    if (error) toast.error('Không thể tạo task: ' + error.message)
    else {
      toast.success('Đã tạo task phát sinh')
      setShowAddModal(false)
      setNewTask(EMPTY_TASK)
    }
  }

  const closeAddModal = () => { setShowAddModal(false); setNewTask(EMPTY_TASK) }

  if (loading) return <div className="text-gray-400 py-8 text-center">Đang tải dữ liệu...</div>

  return (
    <div className="space-y-0">
      {/* Tab bar ngang */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-0">
        {allNhom.map(nhom => {
          const allItems = congViec.filter(t => t.nhom_cap_1 === nhom)
          const done = allItems.filter(t => t.trang_thai === '✓').length
          const pct = allItems.length ? Math.round((done / allItems.length) * 100) : 0
          const hasOverdue = allItems.some(isOverdue)
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
              {hasOverdue && (
                <span className="ml-1 inline-block w-2 h-2 rounded-full bg-red-500 align-middle" title="Có việc quá hạn" />
              )}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold
                ${pct >= 80 ? 'bg-green-100 text-green-700' : pct >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-indigo-50 text-indigo-500'}`}>
                {pct}%
              </span>
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
            </button>
          )
        })}
      </div>

      {/* Panel nội dung */}
      <div className="bg-white rounded-b-xl rounded-tr-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
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
            <option value="□">Chưa làm (□)</option>
            <option value="⏳">Chờ duyệt (⏳)</option>
            <option value="✓">Hoàn thành (✓)</option>
            <option value="✗">Không thực hiện (✗)</option>
            <option value="qua_han">⚠️ Quá hạn</option>
          </select>
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={filterLoai}
            onChange={e => setFilterLoai(e.target.value)}
          >
            <option value="">Tất cả loại</option>
            <option value="phat_sinh">Phát sinh</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Thêm phát sinh
          </button>
          <span className="ml-auto text-sm text-gray-400 self-center">{tabItems.length} đầu việc</span>
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
                  <th className="px-3 py-2 text-left w-32">Nhóm việc</th>
                  <th className="px-3 py-2 text-left">Đầu việc cần quản lý</th>
                  <th className="px-3 py-2 text-left w-28">Output</th>
                  <th className="px-3 py-2 text-left w-20">Đơn vị</th>
                  <th className="px-3 py-2 text-left w-28">Người TH</th>
                  <th className="px-3 py-2 text-center w-28">Deadline</th>
                  <th className="px-3 py-2 text-center w-32">Trạng thái</th>
                  <th className="px-3 py-2 text-left w-36">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tabItems.map(t => {
                  const overdue = isOverdue(t)
                  const nextStatus = STATUS_LABEL[STATUS_CYCLE[(STATUS_CYCLE.indexOf(t.trang_thai) + 1) % STATUS_CYCLE.length]]
                  return (
                    <tr key={t.id} className={`hover:bg-gray-50 transition-colors ${overdue ? 'bg-red-50/40' : ''} ${t.trang_thai === '✓' ? 'opacity-60' : ''}`}>
                      <td className="px-3 py-3 text-gray-400 text-xs">{t.stt}</td>
                      <td className="px-3 py-3">
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium">{t.du_an}</span>
                      </td>
                      <td className="px-3 py-3 text-gray-500 text-xs">{t.nhom_cap_2}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-gray-800">{t.ten_cong_viec}</span>
                          {t.loai_cong_viec === 'phat_sinh' && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">Phát sinh</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-500 text-xs">{t.san_pham}</td>
                      <td className="px-3 py-3 text-gray-400 text-xs">{t.don_vi}</td>
                      <td className="px-3 py-3 text-gray-600 text-xs">{t.thuc_hien}</td>

                      {/* Deadline */}
                      <td className="px-3 py-3 text-center">
                        {editingDeadline === t.id ? (
                          <div className="flex flex-col gap-1 items-center">
                            <input
                              type="date"
                              className="border border-indigo-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300 w-28"
                              value={deadlineValue}
                              onChange={e => setDeadlineValue(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') saveDeadline(t); if (e.key === 'Escape') setEditingDeadline(null) }}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button onClick={() => saveDeadline(t)} className="text-indigo-600 text-xs hover:underline">Lưu</button>
                              <button onClick={() => setEditingDeadline(null)} className="text-gray-400 text-xs hover:underline">Hủy</button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingDeadline(t.id); setDeadlineValue(t.deadline || '') }}
                            className={`text-xs block w-full text-center hover:text-indigo-600 transition-colors ${
                              overdue ? 'text-red-600 font-semibold' : t.deadline ? 'text-gray-600' : 'text-gray-300 italic'
                            }`}
                            title="Click để đặt deadline"
                          >
                            {t.deadline ? new Date(t.deadline + 'T00:00:00').toLocaleDateString('vi-VN') : 'Chưa đặt'}
                          </button>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-3 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => toggleStatus(t)}
                            className={`px-2 py-1 rounded-lg border text-xs font-medium transition-colors w-full ${STATUS_STYLE[t.trang_thai] || STATUS_STYLE['□']}`}
                            title={`Click → ${nextStatus}`}
                          >
                            {STATUS_LABEL[t.trang_thai] || 'Chưa làm'}
                          </button>
                          {overdue && (
                            <span className="text-xs text-red-500 font-medium">⚠️ Quá hạn</span>
                          )}
                        </div>
                      </td>

                      {/* Ghi chú */}
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
                            className="text-xs text-gray-500 cursor-pointer hover:text-indigo-600 block truncate max-w-[130px]"
                            onClick={() => { setEditingNote(t.id); setNoteValue(t.ghi_chu || '') }}
                            title={t.ghi_chu || 'Click để thêm ghi chú'}
                          >
                            {t.ghi_chu || <span className="text-gray-300 italic">Thêm ghi chú...</span>}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal thêm task phát sinh */}
      <Modal isOpen={showAddModal} onClose={closeAddModal} title="Thêm Task Phát Sinh" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên công việc <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Nhập tên đầu việc phát sinh..."
              value={newTask.ten_cong_viec}
              onChange={e => setNewTask(p => ({ ...p, ten_cong_viec: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm cấp 1</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={newTask.nhom_cap_1}
                onChange={e => setNewTask(p => ({ ...p, nhom_cap_1: e.target.value }))}
              >
                <option value="">Chọn nhóm...</option>
                {allNhom.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dự án</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={newTask.du_an}
                onChange={e => setNewTask(p => ({ ...p, du_an: e.target.value }))}
              >
                <option value="">Chọn dự án...</option>
                {allDuAn.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Người thực hiện</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="VD: An, Bình"
                value={newTask.thuc_hien}
                onChange={e => setNewTask(p => ({ ...p, thuc_hien: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={newTask.deadline}
                onChange={e => setNewTask(p => ({ ...p, deadline: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Output / Sản phẩm</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="VD: Báo cáo, file..."
                value={newTask.san_pham}
                onChange={e => setNewTask(p => ({ ...p, san_pham: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm cấp 2</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Nhóm việc cụ thể..."
                value={newTask.nhom_cap_2}
                onChange={e => setNewTask(p => ({ ...p, nhom_cap_2: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú / Lý do phát sinh</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              rows={2}
              placeholder="Mô tả lý do task này phát sinh..."
              value={newTask.ghi_chu}
              onChange={e => setNewTask(p => ({ ...p, ghi_chu: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={closeAddModal}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleAddTask}
              disabled={saving}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {saving ? 'Đang lưu...' : 'Tạo task phát sinh'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
