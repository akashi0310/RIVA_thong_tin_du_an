import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import LoginModal from '../auth/LoginModal'
import toast from 'react-hot-toast'

export default function TopBar({ onMenuClick }) {
  const { isManager, session, logout } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Đã đăng xuất')
  }

  const initials = session?.user?.email?.slice(0, 2).toUpperCase() || 'QL'

  return (
    <>
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10 no-print">
        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-bold text-blue-600 hidden lg:block">RIVA</span>
          <span className="text-sm text-gray-400 hidden lg:block">|</span>
          <span className="text-sm text-gray-600 hidden lg:block">Hệ thống quản lý dự án</span>
        </div>

        {/* Right: auth section */}
        {isManager ? (
          /* === ĐÃ ĐĂNG NHẬP === */
          <div className="flex items-center gap-3">
            {/* Avatar + info */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-800 leading-tight">{session?.user?.email}</p>
                <p className="text-xs text-green-600 font-medium">✅ Quản lý</p>
              </div>
            </div>

            {/* Logout button — đỏ, nổi bật */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        ) : (
          /* === CHƯA ĐĂNG NHẬP === */
          <button
            onClick={() => setShowLogin(true)}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Đăng nhập quản lý
          </button>
        )}
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
