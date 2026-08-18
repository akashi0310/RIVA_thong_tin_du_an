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

// Lấy task phù hợp với một nhân viên dựa trên vai trò của họ
function getTasksForEmployee(tasks, vaiTros) {
  return tasks.filter(t => {
    const taskDepts = (t.thuc_hien || '').split(/[\/,]/).map(s => s.trim().toLowerCase())
    return vaiTros.some(vt => taskDepts.includes(vt.toLowerCase()))
  })
}

// Nhóm phanCong rows theo tên nhân viên → danh sách vai trò
function buildEmployeeMap(phanCong) {
  const map = {}
  for (const row of phanCong) {
    if (!map[row.ten_nhan_vien]) map[row.ten_nhan_vien] = []
    map[row.ten_nhan_vien].push(row.vai_tro)
  }
  return map
}

export default function NhanVienView() {
  const { congViec, phanCong, loading, fetchAll } = useKhoiLuongStore()
  const [selectedNV, setSelectedNV] = useState('')
  const [expandedNV, setExpandedNV] = useState({})

  useEffect(() => { fetchAll() }, [])

  const employeeMap = buildEmployeeMap(phanCong)
  const allNhanVien = Object.keys(employeeMap).sort((a, b) => a.localeCompare(b, 'vi'))

  // Build danh sách nhân viên với task tương ứng
  const nhanVienData = allNhanVien.map(name => {
    const vaiTros = employeeMap[name]
    const tasks = getTasksForEmployee(congViec, vaiTros)
    const done = tasks.filter(t => t.trang_thai === '✓').length
    const choDuyet = tasks.filter(t => t.trang_thai === '⏳').length
    const quaHan = tasks.filter(isOverdue).length
    const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0

    // Nhóm task theo vai trò
    const byVaiTro = {}
    for (const vt of vaiTros) {
      const vtTasks = tasks.filter(t => {
        const taskDepts = (t.thuc_hien || '').split(/[\/,]/).map(s => s.trim().toLowerCase())
        return taskDepts.includes(vt.toLowerCase())
      })
      if (vtTasks.length > 0) byVaiTro[vt] = vtTasks
    }

    return { name, vaiTros, tasks, done, choDuyet, quaHan, pct, byVaiTro }
  })

  const displayList = selectedNV
    ? nhanVienData.filter(nv => nv.name === selectedNV)
    : nhanVienData

  const toggleNV = (name) => setExpandedNV(p => ({ ...p, [name]: !p[name] }))

  if (loading) return <div className="text-gray-400 py-8 text-center">Đang tải dữ liệu...</div>

  if (phanCong.length === 0)
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
        Chưa có dữ liệu phân công. Hãy chạy SQL tạo bảng <code className="bg-gray-100 px-1 rounded">kl_phan_cong</code> trong Supabase.
      </div>
    )

  return (
    <div className="space-y-4">
      {/* Header + bộ lọc */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Phân công theo Nhân viên
          <span className="ml-2 text-xs font-normal text-gray-400">
            — dựa theo bảng phân công vai trò trong hệ thống
          </span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedNV('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              !selectedNV ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
            }`}
          >
            Tất cả
          </button>
          {nhanVienData.map(nv => (
            <button
              key={nv.name}
              onClick={() => setSelectedNV(selectedNV === nv.name ? '' : nv.name)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1.5 ${
                selectedNV === nv.name
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {nv.name}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                selectedNV === nv.name ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {nv.tasks.length}
              </span>
              {nv.quaHan > 0 && <span className="w-2 h-2 rounded-full bg-red-400 inline-block" title="Có việc quá hạn" />}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách nhân viên */}
      {displayList.map(nv => (
        <div key={nv.name} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header nhân viên */}
          <button
            onClick={() => toggleNV(nv.name)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center shrink-0">
                {nv.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{nv.name}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {nv.vaiTros.map(vt => (
                    <span key={vt} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium">
                      {vt}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">✓ {nv.done}</span>
                {nv.choDuyet > 0 && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">⏳ {nv.choDuyet}</span>}
                {nv.quaHan > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">⚠️ {nv.quaHan}</span>}
              </div>
              <div className="flex items-center gap-2 w-28">
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${nv.pct >= 80 ? 'bg-green-500' : nv.pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${nv.pct}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold w-8 text-right ${nv.pct >= 80 ? 'text-green-600' : nv.pct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {nv.pct}%
                </span>
              </div>
              <span className="text-gray-400 text-sm ml-1">{expandedNV[nv.name] ? '▲' : '▼'}</span>
            </div>
          </button>

          {/* Task list (expandable) — nhóm theo vai trò */}
          {expandedNV[nv.name] && (
            <div className="border-t border-gray-100">
              {Object.entries(nv.byVaiTro).map(([vaiTro, vtTasks]) => (
                <div key={vaiTro}>
                  <div className="px-5 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-indigo-500 uppercase tracking-wide">{vaiTro}</span>
                    <span className="text-xs text-gray-400">{vtTasks.length} việc</span>
                  </div>
                  {vtTasks.map(t => {
                    const od = isOverdue(t)
                    return (
                      <div
                        key={t.id}
                        className={`px-5 py-3 flex items-start justify-between gap-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors
                          ${od ? 'bg-red-50/30' : ''} ${t.trang_thai === '✓' ? 'opacity-60' : ''}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm text-gray-800 font-medium">{t.ten_cong_viec}</p>
                            {t.loai_cong_viec === 'phat_sinh' && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Phát sinh</span>
                            )}
                            {od && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">⚠️ Quá hạn</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            {t.du_an && <span className="text-xs text-indigo-500">{t.du_an}</span>}
                            {t.nhom_cap_1 && <span className="text-xs text-gray-400">{t.nhom_cap_1}</span>}
                            {t.deadline && (
                              <span className={`text-xs ${od ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                Deadline: {new Date(t.deadline + 'T00:00:00').toLocaleDateString('vi-VN')}
                              </span>
                            )}
                            {t.thuc_hien && (
                              <span className="text-xs text-gray-300">Thực hiện: {t.thuc_hien}</span>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${STATUS_STYLE[t.trang_thai] || STATUS_STYLE['□']}`}>
                          {STATUS_LABEL[t.trang_thai] || 'Chưa làm'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ))}
              {Object.keys(nv.byVaiTro).length === 0 && (
                <div className="px-5 py-6 text-center text-gray-400 text-sm">
                  Chưa có công việc nào được phân công cho {nv.name}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {displayList.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
          Không có dữ liệu phân công
        </div>
      )}
    </div>
  )
}
