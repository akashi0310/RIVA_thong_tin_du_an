import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAsmoStore } from '../../stores/asmoStore'
import { useAuth } from '../../hooks/useAuth'
import { INCIDENT_CATEGORIES, INCIDENT_CHANNELS, INCIDENT_STATUSES, PRIORITY_LEVELS, TEAM_MEMBERS } from '../../utils/constants'
import { calculateDeadlines } from '../../utils/slaCalculator'
import { generateIncidentCode } from '../../utils/incidentCodeGenerator'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

// Convert UTC ISO string to datetime-local input value (local time)
function toDatetimeLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return ''
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
      <h3 className="font-semibold text-gray-700 text-base border-b pb-2">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

const empty = {
  ngay: format(new Date(), 'yyyy-MM-dd'),
  gio: format(new Date(), 'HH:mm'),
  ma_su_co: '',
  kenh_phat_sinh: '',
  nguoi_bao_cao: '',
  doi_tuong_lien_quan: '',
  truong_don_vi: '',
  sdt: '',
  noi_dung: '',
  nhom_su_co: 'KT',
  muc_do: 'P3',
  nguoi_tiep_nhan: '',
  nguoi_phu_trach_xu_ly: '',
  nguoi_phoi_hop: '',
  thoi_diem_tiep_nhan: new Date().toISOString(),
  deadline_phanhoi: '',
  deadline_xu_ly: '',
  trang_thai: 'Tiếp nhận',
  phuong_an_xu_ly: '',
  ket_qua_xu_ly: '',
  thoi_diem_hoan_thanh: '',
  nguoi_xac_nhan: '',
  nguyen_nhan: '',
  hanh_dong_phong_ngua: '',
  ghi_chu: '',
}

const memberOptions = TEAM_MEMBERS.map(m => ({ value: m.ten, label: `${m.ten} (${m.vaiTro})` }))

export default function IncidentForm() {
  const { id } = useParams()
  const isEdit = !!id
  const { incidents, addIncident, updateIncident } = useAsmoStore()
  const { isManager, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!isManager) { navigate('/asmo/incidents'); return }
    if (isEdit) {
      const found = incidents.find(i => i.id === id)
      if (found) setForm({ ...empty, ...found })
    } else {
      const code = generateIncidentCode(form.kenh_phat_sinh, form.ngay, incidents)
      setForm(f => ({ ...f, ma_su_co: code }))
    }
  }, [id, incidents, isManager, authLoading])

  const updateField = (k, v) => setForm(f => {
    const next = { ...f, [k]: v }
    if (k === 'muc_do' || k === 'thoi_diem_tiep_nhan') {
      const dl = calculateDeadlines(next.thoi_diem_tiep_nhan, next.muc_do)
      next.deadline_phanhoi = dl.deadlinePhanhoi || ''
      next.deadline_xu_ly = dl.deadlineXuLy || ''
    }
    if ((k === 'kenh_phat_sinh' || k === 'ngay') && !isEdit) {
      next.ma_su_co = generateIncidentCode(next.kenh_phat_sinh, next.ngay, incidents)
    }
    return next
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const datetimeFields = ['thoi_diem_tiep_nhan', 'deadline_phanhoi', 'deadline_xu_ly', 'thoi_diem_hoan_thanh']
    const payload = { ...form }
    datetimeFields.forEach(f => { if (!payload[f]) payload[f] = null })
    const { error } = isEdit ? await updateIncident(id, payload) : await addIncident(payload)
    setSaving(false)
    if (error) { console.error(error); toast.error('Lỗi: ' + error.message); return }
    toast.success(isEdit ? 'Đã cập nhật sự cố' : 'Đã tạo sự cố mới')
    navigate('/asmo/incidents')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">{isEdit ? 'Chỉnh sửa sự cố' : 'Tạo sự cố mới'}</h2>
        <button type="button" onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700">← Quay lại</button>
      </div>

      {/* Section 1 */}
      <Section title="1. Thông tin cơ bản">
        <Field label="Mã sự cố" required>
          <input className={inputCls} value={form.ma_su_co} onChange={e => updateField('ma_su_co', e.target.value)} required />
        </Field>
        <Field label="Ngày" required>
          <input type="date" className={inputCls} value={form.ngay} onChange={e => updateField('ngay', e.target.value)} required />
        </Field>
        <Field label="Giờ">
          <input type="time" className={inputCls} value={form.gio} onChange={e => updateField('gio', e.target.value)} />
        </Field>
        <Field label="Kênh phát sinh" required>
          <select className={inputCls} value={form.kenh_phat_sinh} onChange={e => updateField('kenh_phat_sinh', e.target.value)}>
            <option value="">Chọn kênh...</option>
            {INCIDENT_CHANNELS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Người báo cáo">
          <input className={inputCls} value={form.nguoi_bao_cao} onChange={e => updateField('nguoi_bao_cao', e.target.value)} />
        </Field>
        <Field label="Đối tượng liên quan">
          <input className={inputCls} value={form.doi_tuong_lien_quan} onChange={e => updateField('doi_tuong_lien_quan', e.target.value)} />
        </Field>
        <Field label="Trường / Đơn vị">
          <input className={inputCls} value={form.truong_don_vi} onChange={e => updateField('truong_don_vi', e.target.value)} />
        </Field>
        <Field label="SĐT / Liên hệ">
          <input className={inputCls} value={form.sdt} onChange={e => updateField('sdt', e.target.value)} />
        </Field>
        <div className="col-span-2">
          <Field label="Nội dung sự cố" required>
            <textarea className={inputCls + ' resize-none'} rows={3} value={form.noi_dung} onChange={e => updateField('noi_dung', e.target.value)} required />
          </Field>
        </div>
      </Section>

      {/* Section 2 */}
      <Section title="2. Phân loại & Phân công">
        <Field label="Nhóm sự cố" required>
          <select className={inputCls} value={form.nhom_su_co} onChange={e => updateField('nhom_su_co', e.target.value)}>
            {INCIDENT_CATEGORIES.map(c => <option key={c.code} value={c.code}>{c.code} – {c.label}</option>)}
          </select>
        </Field>
        <Field label="Mức độ" required>
          <select className={inputCls} value={form.muc_do} onChange={e => updateField('muc_do', e.target.value)}>
            {Object.entries(PRIORITY_LEVELS).map(([k, p]) => <option key={k} value={k}>{k} {p.emoji}</option>)}
          </select>
        </Field>
        <Field label="Thời điểm tiếp nhận">
          <input type="datetime-local" className={inputCls} value={toDatetimeLocal(form.thoi_diem_tiep_nhan)} onChange={e => updateField('thoi_diem_tiep_nhan', new Date(e.target.value).toISOString())} />
        </Field>
        <Field label="Người tiếp nhận">
          <select className={inputCls} value={form.nguoi_tiep_nhan} onChange={e => updateField('nguoi_tiep_nhan', e.target.value)}>
            <option value="">Chọn...</option>
            {memberOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Người phụ trách xử lý">
          <select className={inputCls} value={form.nguoi_phu_trach_xu_ly} onChange={e => updateField('nguoi_phu_trach_xu_ly', e.target.value)}>
            <option value="">Chọn...</option>
            {memberOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Người phối hợp">
          <input className={inputCls} value={form.nguoi_phoi_hop} onChange={e => updateField('nguoi_phoi_hop', e.target.value)} />
        </Field>
      </Section>

      {/* Section 3: SLA */}
      <Section title="3. SLA (tự động tính)">
        <Field label="Deadline phản hồi">
          <input readOnly className={inputCls + ' bg-gray-50 cursor-not-allowed'} value={form.deadline_phanhoi ? format(new Date(form.deadline_phanhoi), 'dd/MM/yyyy HH:mm') : ''} />
        </Field>
        <Field label="Deadline xử lý">
          <input readOnly className={inputCls + ' bg-gray-50 cursor-not-allowed'} value={form.deadline_xu_ly ? format(new Date(form.deadline_xu_ly), 'dd/MM/yyyy HH:mm') : ''} />
        </Field>
      </Section>

      {/* Section 4 */}
      <Section title="4. Xử lý">
        <Field label="Trạng thái">
          <select className={inputCls} value={form.trang_thai} onChange={e => updateField('trang_thai', e.target.value)}>
            {INCIDENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Thời điểm hoàn thành">
          <input type="datetime-local" className={inputCls} value={toDatetimeLocal(form.thoi_diem_hoan_thanh)} onChange={e => updateField('thoi_diem_hoan_thanh', e.target.value ? new Date(e.target.value).toISOString() : '')} />
        </Field>
        <div className="col-span-2">
          <Field label="Phương án xử lý">
            <textarea className={inputCls + ' resize-none'} rows={3} value={form.phuong_an_xu_ly} onChange={e => updateField('phuong_an_xu_ly', e.target.value)} />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Kết quả xử lý">
            <textarea className={inputCls + ' resize-none'} rows={3} value={form.ket_qua_xu_ly} onChange={e => updateField('ket_qua_xu_ly', e.target.value)} />
          </Field>
        </div>
        <Field label="Người xác nhận">
          <select className={inputCls} value={form.nguoi_xac_nhan} onChange={e => updateField('nguoi_xac_nhan', e.target.value)}>
            <option value="">Chọn...</option>
            {memberOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
      </Section>

      {/* Section 5 */}
      <Section title="5. Nguyên nhân & Phòng ngừa">
        <div className="col-span-2">
          <Field label="Nguyên nhân">
            <textarea className={inputCls + ' resize-none'} rows={3} value={form.nguyen_nhan} onChange={e => updateField('nguyen_nhan', e.target.value)} />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Hành động phòng ngừa">
            <textarea className={inputCls + ' resize-none'} rows={3} value={form.hanh_dong_phong_ngua} onChange={e => updateField('hanh_dong_phong_ngua', e.target.value)} />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Ghi chú">
            <textarea className={inputCls + ' resize-none'} rows={2} value={form.ghi_chu} onChange={e => updateField('ghi_chu', e.target.value)} />
          </Field>
        </div>
      </Section>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
          {saving ? 'Đang lưu...' : (isEdit ? 'Lưu thay đổi' : 'Tạo sự cố')}
        </button>
        <button type="button" onClick={() => navigate(-1)} className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 transition">Hủy</button>
      </div>
    </form>
  )
}
