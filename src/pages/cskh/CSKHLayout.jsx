import { Outlet, NavLink } from 'react-router-dom'

const tabs = [
  { to: '/cskh/dashboard', label: '📊 Dashboard' },
  { to: '/cskh/inbox', label: '📨 Hộp thư' },
  { to: '/cskh/faq', label: '📋 FAQ' },
  { to: '/cskh/web-form', label: '🌐 Web Form' },
]

export default function CSKHLayout() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">💬 Chăm sóc Khách Hàng</h1>
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map(tab => (
            <NavLink key={tab.to} to={tab.to}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`
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
