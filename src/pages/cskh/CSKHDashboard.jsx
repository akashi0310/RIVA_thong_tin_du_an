import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCskhStore } from '../../stores/cskhStore'
import KPICard from '../../components/common/KPICard'
import { StatusBadge } from '../../components/common/Badge'
import { CSKH_CHANNEL_LABELS } from '../../utils/constants'
import { format } from 'date-fns'

const CHANNEL_COLORS = {
  web_form: 'bg-blue-100 text-blue-700',
  messenger: 'bg-purple-100 text-purple-700',
  fb_comment: 'bg-indigo-100 text-indigo-700',
  tiktok: 'bg-gray-900 text-white',
  email: 'bg-orange-100 text-orange-700',
}

export default function CSKHDashboard() {
  const { messages, faqs, fetchMessages, fetchFaqs, subscribeRealtime } = useCskhStore()

  useEffect(() => {
    fetchMessages()
    fetchFaqs()
    const unsubscribe = subscribeRealtime()
    return unsubscribe
  }, [])

  const newCount = messages.filter(m => m.status === 'Mới').length
  const inProgressCount = messages.filter(m => m.status === 'Đang xử lý').length
  const repliedCount = messages.filter(m => m.status === 'Đã trả lời').length
  const activeFaqs = faqs.filter(f => f.is_active).length
  const recentNew = messages.filter(m => m.status === 'Mới').slice(0, 5)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Tin nhắn mới" value={newCount} icon="🆕" color={newCount > 0 ? 'red' : 'green'} />
        <KPICard label="Đang xử lý" value={inProgressCount} icon="⚡" color="yellow" />
        <KPICard label="Đã trả lời" value={repliedCount} icon="✅" color="green" />
        <KPICard label="FAQ đang dùng" value={activeFaqs} icon="📋" color="blue" />
      </div>

      {/* Alert for new messages */}
      {newCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-700 mb-3">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
            {newCount} tin nhắn mới chưa xử lý
          </h3>
          <div className="space-y-2">
            {recentNew.map(msg => (
              <Link key={msg.id} to="/cskh/inbox"
                className="flex items-center justify-between bg-white border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${CHANNEL_COLORS[msg.channel] || 'bg-gray-100 text-gray-600'}`}>
                    {CSKH_CHANNEL_LABELS[msg.channel] || msg.channel}
                  </span>
                  <span className="text-sm font-medium text-gray-800 truncate">{msg.sender_name || 'Ẩn danh'}</span>
                  <span className="text-sm text-gray-500 hidden sm:block truncate">{msg.content?.slice(0, 50)}{msg.content?.length > 50 ? '…' : ''}</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0 ml-2">
                  {msg.created_at ? format(new Date(msg.created_at), 'HH:mm dd/MM') : ''}
                </span>
              </Link>
            ))}
          </div>
          <Link to="/cskh/inbox" className="mt-3 inline-block text-sm text-red-600 font-medium hover:underline">
            Xem tất cả →
          </Link>
        </div>
      )}

      {/* Stats by channel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-4 text-sm">Tin nhắn theo kênh</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {['web_form', 'messenger', 'fb_comment', 'tiktok', 'email'].map(ch => {
            const count = messages.filter(m => m.channel === ch).length
            return (
              <div key={ch} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-800">{count}</p>
                <p className="text-xs text-gray-500 mt-1">{CSKH_CHANNEL_LABELS[ch]}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-3 flex-wrap">
        <Link to="/cskh/inbox" className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition">
          📨 Xem hộp thư
        </Link>
        <Link to="/cskh/faq" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
          📋 Quản lý FAQ
        </Link>
        <Link to="/cskh/web-form" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
          🌐 Web Form phụ huynh
        </Link>
      </div>
    </div>
  )
}
