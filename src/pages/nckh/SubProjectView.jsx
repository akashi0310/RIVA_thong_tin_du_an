import { useEffect, useState } from 'react'
import { useNckhStore } from '../../stores/nckhStore'
import { useAuth } from '../../hooks/useAuth'
import { StatusBadge } from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import toast from 'react-hot-toast'

const statuses = ['Đang nghiên cứu', 'Nộp hồ sơ', 'Dự thi', 'Hoàn thành', 'Không đạt']

export default function SubProjectView({ type }) {
  const { projects, fetchProjects, addProject, updateProject, deleteProject } = useNckhStore()
  const { isManager } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ loai: type, ten_de_tai: '', nhom_nghien_cuu: '', trang_thai: 'Đang nghiên cứu', ngay_bat_dau: '', deadline: '', mo_ta: '', ket_qua: '', ghi_chu: '' })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchProjects() }, [])

  const items = projects.filter(p => p.loai === type)

  const openCreate = () => { setEditItem(null); setForm({ loai: type, ten_de_tai: '', nhom_nghien_cuu: '', trang_thai: 'Đang nghiên cứu', ngay_bat_dau: '', deadline: '', mo_ta: '', ket_qua: '', ghi_chu: '' }); setShowForm(true) }
  const openEdit = (p) => { setEditItem(p); setForm({ ...p }); setShowForm(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error } = editItem ? await updateProject(editItem.id, form) : await addProject({ ...form, loai: type })
    setSaving(false)
    if (error) { toast.error('Lưu thất bại'); return }
    toast.success('Đã lưu')
    setShowForm(false)
  }

  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
  const F = ({ label, children }) => <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{type} — {items.length} đề tài</h3>
        {isManager && <button onClick={openCreate} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-700 transition">+ Thêm đề tài</button>}
      </div>

      <div className="space-y-3">
        {items.length === 0 && <p className="text-gray-400 text-sm py-8 text-center">Chưa có đề tài {type} nào.</p>}
        {items.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{p.ten_de_tai}</p>
                {p.nhom_nghien_cuu && <p className="text-sm text-gray-500 mt-0.5">Nhóm: {p.nhom_nghien_cuu}</p>}
                {p.mo_ta && <p className="text-sm text-gray-600 mt-1">{p.mo_ta}</p>}
                <div className="flex gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                  {p.ngay_bat_dau && <span>Bắt đầu: {p.ngay_bat_dau}</span>}
                  {p.deadline && <span>Deadline: {p.deadline}</span>}
                </div>
                {p.ket_qua && <p className="text-sm text-green-700 mt-1 font-medium">Kết quả: {p.ket_qua}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={p.trang_thai} />
                {isManager && (
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-xs text-blue-600 hover:underline">Sửa</button>
                    <button onClick={() => setDeleteTarget(p.id)} className="text-xs text-red-500 hover:underline">Xóa</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={`${editItem ? 'Chỉnh sửa' : 'Thêm'} đề tài ${type}`} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2"><F label="Tên đề tài *"><input required value={form.ten_de_tai} onChange={e => setForm(f => ({ ...f, ten_de_tai: e.target.value }))} className={inp} /></F></div>
            <F label="Nhóm nghiên cứu"><input value={form.nhom_nghien_cuu} onChange={e => setForm(f => ({ ...f, nhom_nghien_cuu: e.target.value }))} className={inp} /></F>
            <F label="Trạng thái"><select value={form.trang_thai} onChange={e => setForm(f => ({ ...f, trang_thai: e.target.value }))} className={inp}>{statuses.map(s => <option key={s}>{s}</option>)}</select></F>
            <F label="Ngày bắt đầu"><input type="date" value={form.ngay_bat_dau} onChange={e => setForm(f => ({ ...f, ngay_bat_dau: e.target.value }))} className={inp} /></F>
            <F label="Deadline"><input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className={inp} /></F>
            <div className="col-span-2"><F label="Mô tả"><textarea value={form.mo_ta} onChange={e => setForm(f => ({ ...f, mo_ta: e.target.value }))} rows={2} className={inp} /></F></div>
            <div className="col-span-2"><F label="Kết quả"><textarea value={form.ket_qua} onChange={e => setForm(f => ({ ...f, ket_qua: e.target.value }))} rows={2} className={inp} /></F></div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">Hủy</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { setDeleting(true); const { error } = await deleteProject(deleteTarget); setDeleting(false); setDeleteTarget(null); if (error) toast.error('Xóa thất bại'); else toast.success('Đã xóa') }} loading={deleting} title="Xóa đề tài" message="Bạn có chắc muốn xóa đề tài này?" />
    </div>
  )
}
