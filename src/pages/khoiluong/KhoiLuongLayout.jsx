import { useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useKhoiLuongStore } from '../../stores/khoiluongStore'

const tabs = [
  { to: '/khoi-luong/dashboard', label: '📊 Tổng quan' },
  { to: '/khoi-luong/cong-viec', label: '📋 Danh mục' },
  { to: '/khoi-luong/kpi', label: '🎯 KPI' },
  { to: '/khoi-luong/an-pham', label: '🖼 Ấn phẩm' },
  { to: '/khoi-luong/nhan-vien', label: '👤 Nhân viên' },
]

export default function KhoiLuongLayout() {
  const { subscribeRealtime } = useKhoiLuongStore()

  useEffect(() => {
    const unsubscribe = subscribeRealtime()
    return unsubscribe
  }, [])

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">📊 Khối lượng Công việc</h1>
        <p className="text-sm text-gray-500 mt-0.5">Quản lý & theo dõi khối lượng công việc toàn đội</p>
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map(tab => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>
      <Outlet />
    </div>
  )
}
