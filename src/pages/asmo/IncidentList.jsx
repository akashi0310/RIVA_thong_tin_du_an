import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAsmoStore } from '../../stores/asmoStore'
import { useAuth } from '../../hooks/useAuth'
import { PriorityBadge, StatusBadge } from '../../components/common/Badge'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { isOverdue } from '../../utils/slaCalculator'
import { INCIDENT_CATEGORIES, INCIDENT_CHANNELS, INCIDENT_STATUSES, PRIORITY_LEVELS, TEAM_MEMBERS } from '../../utils/constants'
import { exportToCSV } from '../../utils/exportUtils'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function IncidentList() {
  const { incidents, fetchIncidents, deleteIncident, subscribeRealtime } = useAsmoStore()
  const { isManager } = useAuth()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterChannel, setFilterChannel] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchIncidents()
    const unsub = subscribeRealtime()
    return unsub
  }, [])

  const filtered = incidents.filter(inc => {
    if (filterPriority && inc.muc_do !== filterPriority) return false
    if (filterStatus && inc.trang_thai !== filterStatus) return false
    if (filterCategory && inc.nhom_su_co !== filterCategory) return false
    if (filterChannel && inc.kenh_phat_sinh !== filterChannel) return false
    if (search) {
      const q = search.toLowerCase()
      if (!(inc.noi_dung?.toLowerCase().includes(q) || inc.nguoi_bao_cao?.toLowerCase().includes(q) || inc.truong_don_vi?.toLowerCase().includes(q) || inc.ma_su_co?.toLowerCase().includes(q))) return false
    }
    return true
  })

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await deleteIncident(deleteTarget)
    setDeleting(false)
    setDeleteTarget(null)
    if (error) toast.error('Xóa thất bại')
    else toast.success('Đã xóa sự cố')
  }

  const handleExport = () => {
    exportToCSV(filtered.map(i => ({
      'Mã SC': i.ma_su_co, 'Ngày': i.ngay, 'Kênh': i.kenh_phat_sinh,
      'Người BC': i.nguoi_bao_cao, 'Trường/ĐV': i.truong_don_vi,
      'Nội dung': i.noi_dung, 'Nhóm': i.nhom_su_co, 'Mức độ': i.muc_do,
      'Trạng thái': i.trang_thai, 'Người xử lý': i.nguoi_phu_trach_xu_ly,
    })), `incidents-${format(new Date(), 'yyyy-MM-dd')}.csv`)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Danh sách sự cố ({filtered.length})</h2>
        <div className="flex gap-2">
          <button onClick={handleExport} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">📥 Xuất CSV</button>
          {isManager && (
            <Link to="/asmo/incidents/new" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
              + Tạo mới
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)}
            className="col-span-2 lg:col-span-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {[
            { value: filterPriority, onChange: setFilterPriority, options: Object.keys(PRIORITY_LEVELS), placeholder: 'Mức độ' },
            { value: filterStatus, onChange: setFilterStatus, options: INCIDENT_STATUSES, placeholder: 'Trạng thái' },
            { value: filterCategory, onChange: setFilterCategory, options: INCIDENT_CATEGORIES.map(c => c.code), placeholder: 'Nhóm SC' },
            { value: filterChannel, onChange: setFilterChannel, options: INCIDENT_CHANNELS, placeholder: 'Kênh' },
          ].map((f, i) => (
            <select key={i} value={f.value} onChange={e => f.onChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{f.placeholder}</option>
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>
        {(search || filterPriority || filterStatus || filterCategory || filterChannel) && (
          <button onClick={() => { setSearch(''); setFilterPriority(''); setFilterStatus(''); setFilterCategory(''); setFilterChannel('') }}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >Xóa bộ lọc</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Mã SC', 'Ngày', 'Kênh', 'Nội dung', 'Nhóm', 'Mức độ', 'Người xử lý', 'Trạng thái', 'Deadline XL', ...(isManager ? [''] : [])].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-400">Không có sự cố nào</td></tr>
              )}
              {filtered.map(inc => {
                const overdue = isOverdue(inc)
                return (
                  <tr key={inc.id}
                    className={`hover:bg-gray-50 transition ${overdue ? 'border-l-4 border-red-400' : ''} ${inc.muc_do === 'P1' ? 'bg-red-50/30' : ''}`}
                  >
                    <td className="px-3 py-3 font-mono text-xs font-semibold text-blue-700 whitespace-nowrap">
                      <Link to={`/asmo/incidents/${inc.id}`} className="hover:underline">
                        {inc.ma_su_co}
                        {inc.muc_do === 'P1' && <span className="ml-1 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{inc.ngay}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{inc.kenh_phat_sinh}</td>
                    <td className="px-3 py-3 text-gray-700 max-w-xs truncate">{inc.noi_dung}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{inc.nhom_su_co}</td>
                    <td className="px-3 py-3 whitespace-nowrap"><PriorityBadge priority={inc.muc_do} /></td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{inc.nguoi_phu_trach_xu_ly || '—'}</td>
                    <td className="px-3 py-3 whitespace-nowrap"><StatusBadge status={inc.trang_thai} /></td>
                    <td className={`px-3 py-3 whitespace-nowrap text-xs ${overdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                      {inc.deadline_xu_ly ? format(new Date(inc.deadline_xu_ly), 'dd/MM HH:mm') : '—'}
                      {overdue && ' ⚠️'}
                    </td>
                    {isManager && (
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex gap-1">
                          <button onClick={() => navigate(`/asmo/incidents/${inc.id}/edit`)} className="text-xs text-blue-600 hover:underline px-1">Sửa</button>
                          <button onClick={() => setDeleteTarget(inc.id)} className="text-xs text-red-500 hover:underline px-1">Xóa</button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={deleting}
        title="Xóa sự cố" message="Bạn có chắc muốn xóa sự cố này? Hành động này không thể hoàn tác."
      />
    </div>
  )
}
