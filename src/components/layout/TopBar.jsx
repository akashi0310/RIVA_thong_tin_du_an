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

  return (
    <>
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10 no-print">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="text-sm font-semibold text-gray-700 hidden lg:block">Hệ thống quản lý RIVA</div>
        <div className="ml-auto flex items-center gap-3">
          {isManager ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">{session?.user?.email}</span>
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                ✅ Quản lý
              </span>
              <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition">
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
            >
              🔐 Đăng nhập
            </button>
          )}
        </div>
      </header>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
