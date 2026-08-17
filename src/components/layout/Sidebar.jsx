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
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed top-0 left-0 h-full w-56 z-30 flex flex-col transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(175deg, #1e1b4b 0%, #1e3a5f 55%, #0f172a 100%)' }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="font-extrabold text-white text-xl tracking-widest">RIVA</div>
          <div className="text-xs text-indigo-300 mt-0.5">Quản lý dự án</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map(item => {
            const isParentActive = item.children && location.pathname.startsWith(item.to)
            return (
              <div key={item.to}>
                <NavLink
                  to={item.children ? item.children[0].to : item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      (isActive || isParentActive)
                        ? 'bg-white/15 text-white'
                        : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                    }`
                  }
                  onClick={onClose}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
                {item.children && isParentActive && (
                  <div className="ml-5 mt-0.5 mb-1 pl-3 border-l border-white/10 space-y-0.5">
                    {item.children.map(child => (
                      <NavLink key={child.to} to={child.to}
                        className={({ isActive }) =>
                          `block px-2 py-1.5 rounded-md text-xs transition-all ${
                            isActive ? 'text-white font-semibold bg-white/10' : 'text-indigo-300 hover:text-white hover:bg-white/5'
                          }`
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

        <div className="px-4 py-3 border-t border-white/10">
          <p className="text-xs text-indigo-400 text-center">© 2026 RIVA</p>
        </div>
      </aside>
    </>
  )
}
