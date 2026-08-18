import { useEffect, useState } from 'react'
import { useKhoiLuongStore } from '../../stores/khoiluongStore'

const STATUS_STYLE = {
  '✓': 'bg-green-100 text-green-700',
  '✗': 'bg-red-100 text-red-600',
  '□': 'bg-gray-100 text-gray-500',
  '⏳': 'bg-yellow-100 text-yellow-700',
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

export default function NhanVienView() {
  const { congViec, loading, fetchAll } = useKhoiLuongStore()
  const [selected, setSelected] = useState('')

  useEffect(() => { fetchAll() }, [])

  const allMembers = [...new Set(
    congViec.flatMap(t =>
      (t.thuc_hien || '').split(/[,/]/).map(s => s.trim()).filter(Boolean)
    )
  )].sort()

  const matchName = (field, name) =>
    (field || '').split(/[,/]/).map(s => s.trim().toUpperCase()).includes(name.toUpperCase())

  const tasks = selected
    ? congViec.filter(t => matchName(t.thuc_hien, selected))
    : []

  const done = tasks.filter(t => t.trang_thai === '✓').length
  const choDuyet = tasks.filter(t => t.trang_thai === '⏳').length
  const quaHan = tasks.filter(isOverdue).length

  if (loading) return <div className="text-gray-400 py-8 text-center">Đang tải dữ liệu...</div>

  return (
    <div className="space-y-4">
      {/* Chọn nhân viên */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Chọn nhân viên</label>
        <div className="flex flex-wrap gap-2">
          {allMembers.map(m => (
            <button
              key={m}
              onClick={() => setSelected(selected === m ? '' : m)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                selected === m
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">Tổng công việc</p>
              <p className="text-2xl font-bold text-gray-800">{tasks.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-600">{done}</p>
              <p className="text-xs text-gray-400 mt-0.5">Đã được duyệt</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">Chờ duyệt</p>
              <p className="text-2xl font-bold text-yellow-600">{choDuyet}</p>
              <p className="text-xs text-gray-400 mt-0.5">Output chờ xác nhận</p>
            </div>
            <div className={`bg-white rounded-xl border shadow-sm p-4 ${quaHan > 0 ? 'border-red-200' : 'border-gray-100'}`}>
              <p className={`text-xs ${quaHan > 0 ? 'text-red-400' : 'text-gray-500'}`}>Quá hạn</p>
              <p className={`text-2xl font-bold ${quaHan > 0 ? 'text-red-600' : 'text-gray-300'}`}>{quaHan}</p>
              <p className="text-xs text-gray-400 mt-0.5">Deadline đã qua</p>
            </div>
          </div>

          {/* Danh sách công việc */}
          {tasks.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-700 text-sm">
                  Danh sách công việc
                  <span className="ml-2 text-xs text-gray-400 font-normal">({tasks.length} công việc)</span>
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {tasks.map(t => {
                  const overdue = isOverdue(t)
                  return (
                    <div
                      key={t.id}
                      className={`px-5 py-3 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors
                        ${overdue ? 'bg-red-50/40' : ''}
                        ${t.trang_thai === '✓' ? 'opacity-60' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-800">{t.ten_cong_viec}</p>
                          {t.loai_cong_viec === 'phat_sinh' && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Phát sinh</span>
                          )}
                          {overdue && (
                            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">⚠️ Quá hạn</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[t.nhom_cap_1, t.du_an, t.nhom_cap_2].filter(Boolean).join(' · ')}
                        </p>
                        {t.san_pham && <p className="text-xs text-indigo-500 mt-0.5">📦 {t.san_pham}</p>}
                        {t.deadline && (
                          <p className={`text-xs mt-0.5 ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                            Deadline: {new Date(t.deadline + 'T00:00:00').toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${STATUS_STYLE[t.trang_thai] || STATUS_STYLE['□']}`}>
                        {STATUS_LABEL[t.trang_thai] || 'Chưa làm'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
              Không tìm thấy công việc nào cho nhân viên này
            </div>
          )}
        </>
      )}

      {!selected && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
          Chọn một nhân viên để xem công việc của họ
        </div>
      )}
    </div>
  )
}
