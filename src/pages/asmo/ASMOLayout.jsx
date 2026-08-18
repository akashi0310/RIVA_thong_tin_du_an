import { Outlet, NavLink } from 'react-router-dom'

const tabs = [
  { to: '/asmo/dashboard', label: '📊 Dashboard' },
  { to: '/asmo/incidents', label: '🚨 Sự cố' },
  { to: '/asmo/tasks', label: '✅ Công việc' },
  { to: '/asmo/team', label: '👥 Đội nhóm' },
  { to: '/asmo/report', label: '🖨️ Báo cáo ngày' },
]

export default function ASMOLayout() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <img src="/logo-asmo.png" alt="ASMO" className="h-8 w-auto object-contain" />
          ASMO 2026
        </h1>
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map(tab => (
            <NavLink key={tab.to} to={tab.to}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`
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
