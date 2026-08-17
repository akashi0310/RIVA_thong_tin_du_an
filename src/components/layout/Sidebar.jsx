import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Tổng quan', icon: '🏠', exact: true },
  {
    to: '/asmo', label: 'ASMO', icon: '⭐', children: [
      { to: '/asmo/dashboard', label: 'Dashboard' },
      { to: '/asmo/incidents', label: 'Sự cố' },
      { to: '/asmo/tasks', label: 'Công việc' },
      { to: '/asmo/team', label: 'Đội nhóm' },
      { to: '/asmo/report', label: 'Báo cáo ngày' },
    ]
  },
  { to: '/nckh', label: 'NCKH', icon: '🔬' },
  { to: '/du-hoc', label: 'Du học', icon: '✈️' },
  { to: '/on-luyen', label: 'Ôn luyện', icon: '📚' },
  {
    to: '/cskh', label: 'CSKH', icon: '💬', children: [
      { to: '/cskh/dashboard', label: 'Dashboard' },
      { to: '/cskh/inbox', label: 'Hộp thư' },
      { to: '/cskh/faq', label: 'FAQ' },
      { to: '/cskh/web-form', label: 'Web Form' },
    ]
  },
  {
    to: '/khoi-luong', label: 'Khối lượng', icon: '📊', children: [
      { to: '/khoi-luong/dashboard', label: 'Tổng quan' },
      { to: '/khoi-luong/cong-viec', label: 'Danh mục' },
      { to: '/khoi-luong/kpi', label: 'KPI' },
      { to: '/khoi-luong/an-pham', label: 'Ấn phẩm' },
      { to: '/khoi-luong/nhan-vien', label: 'Nhân viên' },
    ]
  },
]

export default function Sidebar({ open, onClose }) {
  const location = useLocation()

  return (
    <>
      {/* Overlay mobile */}
      {open && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-200 z-30 flex flex-col transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="font-bold text-blue-600 text-lg">RIVA</div>
          <div className="text-xs text-gray-400">Quản lý dự án</div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map(item => {
            const isParentActive = item.children && location.pathname.startsWith(item.to)
            return (
              <div key={item.to}>
                <NavLink
                  to={item.children ? item.children[0].to : item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${(isActive || isParentActive) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`
                  }
                  onClick={onClose}
                >
                  <span>{item.icon}</span> {item.label}
                </NavLink>
                {item.children && isParentActive && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map(child => (
                      <NavLink key={child.to} to={child.to}
                        className={({ isActive }) =>
                          `block px-3 py-1.5 rounded-lg text-xs transition-colors ${isActive ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-50'}`
                        }
                        onClick={onClose}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
