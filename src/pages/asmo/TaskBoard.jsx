import { useEffect, useState } from 'react'
import { useAsmoStore } from '../../stores/asmoStore'
import { useAuth } from '../../hooks/useAuth'
import { TASK_GROUPS, TASK_STATUSES, TEAM_MEMBERS } from '../../utils/constants'
import { StatusBadge, PriorityBadge } from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const emptyTask = { nhom: 'SALE & LEAD', ten_cong_viec: '', mo_ta: '', nguoi_phu_trach: '', trang_thai: 'Chưa bắt đầu', priority: 'P3', deadline: '', ti_le_hoan_thanh: 0, ghi_chu: '' }

export default function TaskBoard() {
  const { tasks, fetchTasks, addTask, updateTask, deleteTask } = useAsmoStore()
  const { isManager } = useAuth()
  const [view, setView] = useState('table')
  const [filterGroup, setFilterGroup] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterMember, setFilterMember] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [form, setForm] = useState(emptyTask)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchTasks() }, [])

  const filtered = tasks.filter(t => {
    if (filterGroup && t.nhom !== filterGroup) return false
    if (filterStatus && t.trang_thai !== filterStatus) return false
    if (filterMember && t.nguoi_phu_trach !== filterMember) return false
    return true
  })

  const openCreate = () => { setEditTask(null); setForm(emptyTask); setShowForm(true) }
  const openEdit = (t) => { setEditTask(t); setForm({ ...emptyTask, ...t }); setShowForm(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error } = editTask ? await updateTask(editTask.id, form) : await addTask(form)
    setSaving(false)
    if (error) { toast.error('Lưu thất bại'); return }
    toast.success(editTask ? 'Đã cập nhật' : 'Đã tạo công việc')
    setShowForm(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await deleteTask(deleteTarget)
    setDeleting(false)
    setDeleteTarget(null)
    if (error) toast.error('Xóa thất bại')
    else toast.success('Đã xóa công việc')
  }

  const handleStatusChange = async (task, newStatus) => {
    const { error } = await updateTask(task.id, { trang_thai: newStatus })
    if (error) toast.error('Cập nhật thất bại')
  }

  const groupedByStatus = TASK_STATUSES.reduce((acc, s) => {
    acc[s] = filtered.filter(t => t.trang_thai === s)
    return acc
  }, {})

  const groupedByNhom = TASK_GROUPS.reduce((acc, g) => {
    const grpTasks = filtered.filter(t => t.nhom === g)
    if (grpTasks.length > 0) acc[g] = grpTasks
    return acc
  }, {})

  const F = ({ label, children }) => (
    <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>
  )
  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const memberNames = TEAM_MEMBERS.map(m => m.ten)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => setView('table')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600'}`}>📋 Bảng</button>
          <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${view === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600'}`}>🗂️ Kanban</button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: filterGroup, onChange: setFilterGroup, options: TASK_GROUPS, placeholder: 'Nhóm' },
            { value: filterStatus, onChange: setFilterStatus, options: TASK_STATUSES, placeholder: 'Trạng thái' },
            { value: filterMember, onChange: setFilterMember, options: memberNames, placeholder: 'Người phụ trách' },
          ].map((f, i) => (
            <select key={i} value={f.value} onChange={e => f.onChange(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
              <option value="">{f.placeholder}</option>
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
          {isManager && <button onClick={openCreate} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition">+ Thêm</button>}
        </div>
      </div>

      {view === 'table' && (
        <div className="space-y-4">
          {Object.entries(groupedByNhom).map(([nhom, grpTasks]) => {
            const pct = Math.round((grpTasks.filter(t => t.trang_thai === 'Hoàn thành').length / grpTasks.length) * 100)
            return (
              <div key={nhom} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <span className="font-semibold text-gray-700 text-sm">{nhom}</span>
                  <span className="text-xs text-gray-400">{grpTasks.length} công việc</span>
                  <div className="flex-1 max-w-24 h-2 bg-gray-200 rounded-full ml-auto">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{pct}%</span>
                </div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-50">
                    {grpTasks.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-800">{t.ten_cong_viec}</td>
                        <td className="px-3 py-2.5 text-gray-500 text-xs hidden sm:table-cell">{t.nguoi_phu_trach}</td>
                        <td className="px-3 py-2.5"><PriorityBadge priority={t.priority} /></td>
                        <td className="px-3 py-2.5">
                          {isManager ? (
                            <select value={t.trang_thai} onChange={e => handleStatusChange(t, e.target.value)}
                              className="border-0 text-xs rounded px-1 py-0.5 bg-transparent focus:ring-1 focus:ring-blue-300">
                              {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          ) : <StatusBadge status={t.trang_thai} />}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-400 hidden md:table-cell">{t.deadline}</td>
                        {isManager && (
                          <td className="px-3 py-2.5">
                            <button onClick={() => openEdit(t)} className="text-xs text-blue-600 hover:underline mr-2">Sửa</button>
                            <button onClick={() => setDeleteTarget(t.id)} className="text-xs text-red-500 hover:underline">Xóa</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      )}

      {view === 'kanban' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TASK_STATUSES.map(status => (
            <div key={status} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-3">
                <StatusBadge status={status} />
                <span className="text-xs text-gray-400 ml-auto">{groupedByStatus[status]?.length || 0}</span>
              </div>
              <div className="space-y-2">
                {(groupedByStatus[status] || []).map(t => (
                  <div key={t.id} className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm">
                    <p className="text-sm font-medium text-gray-800 mb-2">{t.ten_cong_viec}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{t.nhom}</span>
                      <PriorityBadge priority={t.priority} />
                    </div>
                    {t.nguoi_phu_trach && <p className="text-xs text-gray-400 mt-1">{t.nguoi_phu_trach}</p>}
                    {isManager && (
                      <div className="mt-2 flex gap-2">
                        {TASK_STATUSES.filter(s => s !== status).map(s => (
                          <button key={s} onClick={() => handleStatusChange(t, s)} className="text-xs text-blue-600 hover:underline">→{s.slice(0, 6)}</button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editTask ? 'Chỉnh sửa công việc' : 'Thêm công việc'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Nhóm"><select value={form.nhom} onChange={e => setForm(f => ({ ...f, nhom: e.target.value }))} className={inp}>{TASK_GROUPS.map(g => <option key={g}>{g}</option>)}</select></F>
            <F label="Tên công việc *"><input required value={form.ten_cong_viec} onChange={e => setForm(f => ({ ...f, ten_cong_viec: e.target.value }))} className={inp} /></F>
            <F label="Người phụ trách"><select value={form.nguoi_phu_trach} onChange={e => setForm(f => ({ ...f, nguoi_phu_trach: e.target.value }))} className={inp}><option value="">Chọn...</option>{memberNames.map(m => <option key={m}>{m}</option>)}</select></F>
            <F label="Mức độ"><select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className={inp}>{['P1','P2','P3','P4'].map(p => <option key={p}>{p}</option>)}</select></F>
            <F label="Trạng thái"><select value={form.trang_thai} onChange={e => setForm(f => ({ ...f, trang_thai: e.target.value }))} className={inp}>{TASK_STATUSES.map(s => <option key={s}>{s}</option>)}</select></F>
            <F label="Deadline"><input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className={inp} /></F>
            <F label="% Hoàn thành"><input type="number" min={0} max={100} value={form.ti_le_hoan_thanh} onChange={e => setForm(f => ({ ...f, ti_le_hoan_thanh: Number(e.target.value) }))} className={inp} /></F>
          </div>
          <F label="Mô tả"><textarea value={form.mo_ta} onChange={e => setForm(f => ({ ...f, mo_ta: e.target.value }))} rows={2} className={inp} /></F>
          <F label="Ghi chú"><textarea value={form.ghi_chu} onChange={e => setForm(f => ({ ...f, ghi_chu: e.target.value }))} rows={2} className={inp} /></F>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">Hủy</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Xóa công việc" message="Bạn có chắc muốn xóa công việc này?" />
    </div>
  )
}
