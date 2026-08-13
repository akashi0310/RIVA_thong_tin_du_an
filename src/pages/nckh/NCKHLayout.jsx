import { Outlet, NavLink } from 'react-router-dom'

export default function NCKHLayout() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-3">🔬 NCKH</h1>
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {[
          { to: '/nckh/dashboard', label: '📊 Dashboard' },
          { to: '/nckh/iena', label: 'IENA' },
          { to: '/nckh/ipitex', label: 'IPITEX' },
          { to: '/nckh/sviff', label: 'SVIFF' },
        ].map(tab => (
          <NavLink key={tab.to} to={tab.to}
            className={({ isActive }) => `whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >{tab.label}</NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
