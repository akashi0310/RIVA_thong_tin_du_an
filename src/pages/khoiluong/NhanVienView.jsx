import { useEffect, useState } from 'react'
import { useKhoiLuongStore } from '../../stores/khoiluongStore'

const STATUS_STYLE = {
  '✓': 'bg-green-100 text-green-700',
  '✗': 'bg-red-100 text-red-600',
  '□': 'bg-gray-100 text-gray-500',
}

export default function NhanVienView() {
  const { congViec, loading, fetchAll } = useKhoiLuongStore()
  const [selected, setSelected] = useState('')

  useEffect(() => { fetchAll() }, [])

  // Lấy danh sách nhân viên từ data thực tế
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">Tổng công việc</p>
              <p className="text-2xl font-bold text-gray-800">{tasks.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-600">{done}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">Còn lại</p>
              <p className="text-2xl font-bold text-yellow-600">{tasks.length - done}</p>
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
                {tasks.map(t => (
                  <div key={t.id} className={`px-5 py-3 flex items-start justify-between gap-4 hover:bg-gray-50 ${t.trang_thai === '✓' ? 'opacity-60' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{t.ten_cong_viec}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{[t.nhom_cap_1, t.du_an, t.nhom_cap_2].filter(Boolean).join(' · ')}</p>
                      {t.san_pham && <p className="text-xs text-indigo-500 mt-0.5">📦 {t.san_pham}</p>}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${STATUS_STYLE[t.trang_thai] || STATUS_STYLE['□']}`}>
                      {t.trang_thai || '□'}
                    </span>
                  </div>
                ))}
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
