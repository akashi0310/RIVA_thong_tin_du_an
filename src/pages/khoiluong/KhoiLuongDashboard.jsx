import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useKhoiLuongStore } from '../../stores/khoiluongStore'
import KPICard from '../../components/common/KPICard'

function isOverdueDate(deadlineStr) {
  if (!deadlineStr) return false
  return new Date(deadlineStr) < new Date(new Date().toDateString())
}

function isDueSoon(deadlineStr) {
  if (!deadlineStr) return false
  const diff = (new Date(deadlineStr) - new Date(new Date().toDateString())) / 86400000
  return diff >= 0 && diff <= 3
}

export default function KhoiLuongDashboard() {
  const { congViec, loading, fetchAll, getPeopleStats } = useKhoiLuongStore()

  useEffect(() => { fetchAll() }, [])

  const total = congViec.length
  const done = congViec.filter(t => t.trang_thai === '✓').length
  const inProgress = congViec.filter(t => t.trang_thai === '□').length
  const overdue = congViec.filter(t => isOverdueDate(t.deadline) && t.trang_thai !== '✓').length

  const warningSoon = congViec.filter(t => isDueSoon(t.deadline) && t.trang_thai !== '✓')
  const warningOverdue = congViec.filter(t => isOverdueDate(t.deadline) && t.trang_thai !== '✓')

  const people = getPeopleStats()

  if (loading) return <div className="text-gray-400 py-8 text-center">Đang tải dữ liệu...</div>

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Tổng công việc" value={total} icon="📋" color="blue" />
        <KPICard label="Hoàn thành" value={done} icon="✅" color="green" sub={total ? `${Math.round(done / total * 100)}%` : '0%'} />
        <KPICard label="Đang thực hiện" value={inProgress} icon="⏳" color="yellow" />
        <KPICard label="Trễ hạn" value={overdue} icon="🚨" color="red" />
      </div>

      {/* Cảnh báo */}
      {(warningOverdue.length > 0 || warningSoon.length > 0) && (
        <div className="space-y-2">
          {warningOverdue.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 font-semibold text-sm mb-2">🚨 {warningOverdue.length} công việc đã quá hạn</p>
              <ul className="space-y-1">
                {warningOverdue.slice(0, 5).map(t => (
                  <li key={t.id} className="text-xs text-red-600 flex justify-between">
                    <span>{t.ten_cong_viec}</span>
                    <span className="font-medium">{t.deadline} · {t.thuc_hien}</span>
                  </li>
                ))}
                {warningOverdue.length > 5 && (
                  <li className="text-xs text-red-400">
                    <Link to="/khoi-luong/cong-viec" className="underline">Xem thêm {warningOverdue.length - 5} công việc...</Link>
                  </li>
                )}
              </ul>
            </div>
          )}
          {warningSoon.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-700 font-semibold text-sm mb-2">⚠️ {warningSoon.length} công việc sắp đến hạn (≤ 3 ngày)</p>
              <ul className="space-y-1">
                {warningSoon.slice(0, 3).map(t => (
                  <li key={t.id} className="text-xs text-yellow-700 flex justify-between">
                    <span>{t.ten_cong_viec}</span>
                    <span className="font-medium">{t.deadline} · {t.thuc_hien}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Bảng phân phối khối lượng theo nhân viên */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Phân phối khối lượng theo nhân viên</h2>
          <Link to="/khoi-luong/nhan-vien" className="text-xs text-indigo-600 hover:underline">Xem chi tiết →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Nhân viên</th>
                <th className="px-4 py-3 text-center">Điều hành</th>
                <th className="px-4 py-3 text-center">Điều phối</th>
                <th className="px-4 py-3 text-center">Thực hiện</th>
                <th className="px-4 py-3 text-center">Tổng</th>
                <th className="px-4 py-3 text-center">Hoàn thành</th>
                <th className="px-4 py-3 text-left w-40">Tiến độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {people.map(p => {
                const pct = p.total ? Math.round(p.done / p.total * 100) : 0
                return (
                  <tr key={p.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{p.directorCount}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{p.coordinatorCount}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{p.executorCount}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-800">{p.total}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">{p.done}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {people.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Chưa có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
