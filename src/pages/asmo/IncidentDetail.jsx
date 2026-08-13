import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAsmoStore } from '../../stores/asmoStore'
import { useAuth } from '../../hooks/useAuth'
import { PriorityBadge, StatusBadge } from '../../components/common/Badge'
import { isOverdue } from '../../utils/slaCalculator'
import { format } from 'date-fns'

export default function IncidentDetail() {
  const { id } = useParams()
  const { incidents, fetchIncidents } = useAsmoStore()
  const { isManager } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { fetchIncidents() }, [])

  const inc = incidents.find(i => i.id === id)
  if (!inc) return <div className="text-gray-400 py-10 text-center">Không tìm thấy sự cố</div>

  const overdue = isOverdue(inc)

  const Row = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-gray-50 last:border-0">
      <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-40 shrink-0">{label}</dt>
      <dd className="text-sm text-gray-700 mt-0.5 sm:mt-0">{value || <span className="text-gray-300">—</span>}</dd>
    </div>
  )

  const fmtDT = (v) => v ? format(new Date(v), 'dd/MM/yyyy HH:mm') : null

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700">← Quay lại</button>
        <h2 className="text-xl font-bold text-gray-800 font-mono">{inc.ma_su_co}</h2>
        <PriorityBadge priority={inc.muc_do} />
        <StatusBadge status={inc.trang_thai} />
        {overdue && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">⚠️ Quá hạn</span>}
        {isManager && (
          <Link to={`/asmo/incidents/${id}/edit`} className="ml-auto text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
            ✏️ Chỉnh sửa
          </Link>
        )}
      </div>

      {[
        {
          title: '1. Thông tin cơ bản', rows: [
            ['Ngày / Giờ', `${inc.ngay} ${inc.gio}`],
            ['Kênh phát sinh', inc.kenh_phat_sinh], ['Người báo cáo', inc.nguoi_bao_cao],
            ['Đối tượng liên quan', inc.doi_tuong_lien_quan], ['Trường / Đơn vị', inc.truong_don_vi],
            ['SĐT', inc.sdt], ['Nội dung', inc.noi_dung],
          ]
        },
        {
          title: '2. Phân loại & Phân công', rows: [
            ['Nhóm sự cố', inc.nhom_su_co], ['Mức độ', inc.muc_do],
            ['Thời điểm tiếp nhận', fmtDT(inc.thoi_diem_tiep_nhan)],
            ['Người tiếp nhận', inc.nguoi_tiep_nhan],
            ['Người phụ trách', inc.nguoi_phu_trach_xu_ly],
            ['Người phối hợp', inc.nguoi_phoi_hop],
          ]
        },
        {
          title: '3. SLA', rows: [
            ['Deadline phản hồi', fmtDT(inc.deadline_phanhoi)],
            ['Deadline xử lý', fmtDT(inc.deadline_xu_ly)],
          ]
        },
        {
          title: '4. Xử lý', rows: [
            ['Phương án', inc.phuong_an_xu_ly], ['Kết quả', inc.ket_qua_xu_ly],
            ['Thời điểm hoàn thành', fmtDT(inc.thoi_diem_hoan_thanh)],
            ['Người xác nhận', inc.nguoi_xac_nhan],
          ]
        },
        {
          title: '5. Nguyên nhân & Phòng ngừa', rows: [
            ['Nguyên nhân', inc.nguyen_nhan],
            ['Hành động phòng ngừa', inc.hanh_dong_phong_ngua],
            ['Ghi chú', inc.ghi_chu],
          ]
        },
      ].map(section => (
        <div key={section.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">{section.title}</h3>
          <dl>{section.rows.map(([label, value]) => <Row key={label} label={label} value={value} />)}</dl>
        </div>
      ))}
    </div>
  )
}
