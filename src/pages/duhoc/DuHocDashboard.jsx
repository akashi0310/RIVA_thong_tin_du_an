import { useEffect, useState } from 'react'
import { useDuhocStore } from '../../stores/duhocStore'
import { useAuth } from '../../hooks/useAuth'
import { StatusBadge } from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import KPICard from '../../components/common/KPICard'
import { DUHOC_STATUSES } from '../../utils/constants'
import toast from 'react-hot-toast'

const empty = { ten_hoc_sinh: '', quoc_gia: '', chuong_trinh: '', truong_muc_tieu: '', trang_thai: 'Tư vấn', nguoi_phu_trach: '', ngay_nop_ho_so: '', ngay_co_ket_qua: '', hoc_bong: false, ghi_chu: '' }

export default function DuHocDashboard() {
  const { students, fetchStudents, addStudent, updateStudent, deleteStudent } = useDuhocStore()
  const { isManager } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchStudents() }, [])

  const filtered = students.filter(s => !search || s.ten_hoc_sinh?.toLowerCase().includes(search.toLowerCase()) || s.truong_muc_tieu?.toLowerCase().includes(search.toLowerCase()))
  const openCreate = () => { setEditItem(null); setForm(empty); setShowForm(true) }
  const openEdit = (s) => { setEditItem(s); setForm({ ...empty, ...s }); setShowForm(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error } = editItem ? await updateStudent(editItem.id, form) : await addStudent(form)
    setSaving(false)
    if (error) { toast.error('Lưu thất bại'); return }
    toast.success('Đã lưu')
    setShowForm(false)
  }

  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
  const F = ({ label, children }) => <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {DUHOC_STATUSES.map(s => (
          <KPICard key={s} label={s} value={students.filter(st => st.trang_thai === s).length} icon="🎓" color="green" />
        ))}
      </div>
      <div className="flex gap-3 items-center flex-wrap">
        <input type="text" placeholder="Tìm học sinh..." value={search} onChange={e => setSearch(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 min-w-48" />
        {isManager && <button onClick={openCreate} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition">+ Thêm học sinh</button>}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Họ tên', 'Quốc gia', 'Trường mục tiêu', 'Người phụ trách', 'Trạng thái', 'Học bổng', ...(isManager ? [''] : [])].map(h => <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-gray-400">Chưa có học sinh nào</td></tr>}
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 font-medium text-gray-800">{s.ten_hoc_sinh}</td>
                <td className="px-3 py-3 text-gray-600">{s.quoc_gia}</td>
                <td className="px-3 py-3 text-gray-600">{s.truong_muc_tieu}</td>
                <td className="px-3 py-3 text-gray-600">{s.nguoi_phu_trach}</td>
                <td className="px-3 py-3"><StatusBadge status={s.trang_thai} /></td>
                <td className="px-3 py-3 text-center">{s.hoc_bong ? '✅' : '—'}</td>
                {isManager && (
                  <td className="px-3 py-3">
                    <button onClick={() => openEdit(s)} className="text-xs text-blue-600 hover:underline mr-2">Sửa</button>
                    <button onClick={() => setDeleteTarget(s.id)} className="text-xs text-red-500 hover:underline">Xóa</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editItem ? 'Chỉnh sửa hồ sơ' : 'Thêm học sinh du học'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Họ và tên *"><input required value={form.ten_hoc_sinh} onChange={e => setForm(f => ({ ...f, ten_hoc_sinh: e.target.value }))} className={inp} /></F>
            <F label="Quốc gia"><input value={form.quoc_gia} onChange={e => setForm(f => ({ ...f, quoc_gia: e.target.value }))} className={inp} /></F>
            <F label="Chương trình"><input value={form.chuong_trinh} onChange={e => setForm(f => ({ ...f, chuong_trinh: e.target.value }))} className={inp} /></F>
            <F label="Trường mục tiêu"><input value={form.truong_muc_tieu} onChange={e => setForm(f => ({ ...f, truong_muc_tieu: e.target.value }))} className={inp} /></F>
            <F label="Trạng thái"><select value={form.trang_thai} onChange={e => setForm(f => ({ ...f, trang_thai: e.target.value }))} className={inp}>{DUHOC_STATUSES.map(s => <option key={s}>{s}</option>)}</select></F>
            <F label="Người phụ trách"><input value={form.nguoi_phu_trach} onChange={e => setForm(f => ({ ...f, nguoi_phu_trach: e.target.value }))} className={inp} /></F>
            <F label="Ngày nộp hồ sơ"><input type="date" value={form.ngay_nop_ho_so} onChange={e => setForm(f => ({ ...f, ngay_nop_ho_so: e.target.value }))} className={inp} /></F>
            <F label="Ngày có kết quả"><input type="date" value={form.ngay_co_ket_qua} onChange={e => setForm(f => ({ ...f, ngay_co_ket_qua: e.target.value }))} className={inp} /></F>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.hoc_bong} onChange={e => setForm(f => ({ ...f, hoc_bong: e.target.checked }))} className="rounded" />
              <label className="text-sm text-gray-700">Có học bổng</label>
            </div>
          </div>
          <F label="Ghi chú"><textarea value={form.ghi_chu} onChange={e => setForm(f => ({ ...f, ghi_chu: e.target.value }))} rows={2} className={inp} /></F>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">Hủy</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={async () => { const { error } = await deleteStudent(deleteTarget); setDeleteTarget(null); if (error) toast.error('Xóa thất bại'); else toast.success('Đã xóa') }}
        title="Xóa học sinh" message="Bạn có chắc muốn xóa hồ sơ này?" />
    </div>
  )
}
