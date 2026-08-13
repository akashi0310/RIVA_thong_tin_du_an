import { Outlet, NavLink } from 'react-router-dom'
export default function OnLuyenLayout() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-3">📚 Ôn luyện</h1>
      <div className="flex gap-1 mb-4">
        <NavLink to="/on-luyen/dashboard" className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>📊 Dashboard</NavLink>
      </div>
      <Outlet />
    </div>
  )
}
