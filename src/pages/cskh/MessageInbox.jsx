import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useCskhStore } from '../../stores/cskhStore'
import { useAuth } from '../../hooks/useAuth'
import Modal from '../../components/common/Modal'
import { StatusBadge } from '../../components/common/Badge'
import { CSKH_STATUSES, CSKH_CHANNEL_LABELS, TEAM_MEMBERS } from '../../utils/constants'
import { format } from 'date-fns'

const CHANNEL_COLORS = {
  web_form: 'bg-blue-100 text-blue-700',
  messenger: 'bg-purple-100 text-purple-700',
  fb_comment: 'bg-indigo-100 text-indigo-700',
  tiktok: 'bg-gray-800 text-white',
  email: 'bg-orange-100 text-orange-700',
}

const emptyReply = { reply_content: '', assigned_to: '', status: 'Đã trả lời' }

export default function MessageInbox() {
  const { messages, loading, fetchError, fetchMessages, updateMessage, deleteMessage, subscribeRealtime } = useCskhStore()
  const { isManager, session } = useAuth()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterChannel, setFilterChannel] = useState('')
  const [replyTarget, setReplyTarget] = useState(null)
  const [reply, setReply] = useState(emptyReply)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchMessages()
    const unsubscribe = subscribeRealtime()
    return unsubscribe
  }, [])

  const filtered = messages.filter(m => {
    const matchSearch = !search ||
      m.sender_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.content?.toLowerCase().includes(search.toLowerCase()) ||
      m.sender_contact?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || m.status === filterStatus
    const matchChannel = !filterChannel || m.channel === filterChannel
    return matchSearch && matchStatus && matchChannel
  })

  const openReply = (msg) => {
    setReplyTarget(msg)
    setReply({
      reply_content: msg.reply_content || '',
      assigned_to: msg.assigned_to || '',
      status: msg.status === 'Đóng' ? 'Đóng' : 'Đã trả lời',
    })
  }

  const handleSaveReply = async () => {
    if (!reply.reply_content.trim()) { toast.error('Vui lòng nhập nội dung trả lời'); return }
    setSaving(true)
    const { error } = await updateMessage(replyTarget.id, {
      reply_content: reply.reply_content.trim(),
      assigned_to: reply.assigned_to,
      status: reply.status,
      replied_at: new Date().toISOString(),
      replied_by: session?.user?.email || 'Manager',
    })
    setSaving(false)
    if (error) { toast.error('Lỗi: ' + error.message); return }
    toast.success('Đã lưu phản hồi')
    setReplyTarget(null)
  }

  const handleClose = async (msg) => {
    const { error } = await updateMessage(msg.id, { status: 'Đóng' })
    if (error) { toast.error('Lỗi: ' + error.message); return }
    toast.success('Đã đóng tin nhắn')
  }

  const handleDelete = async () => {
    const { error } = await deleteMessage(deleteTarget.id)
    if (error) { toast.error('Xóa thất bại: ' + error.message); return }
    toast.success('Đã xóa')
    setDeleteTarget(null)
  }

  const newCount = messages.filter(m => m.status === 'Mới').length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Hộp thư thống nhất</h2>
          <p className="text-sm text-gray-500">
            {messages.length} tin nhắn tổng cộng
            {newCount > 0 && <span className="ml-2 text-red-600 font-medium">· {newCount} chưa xử lý</span>}
          </p>
        </div>
      </div>

      {/* Error state */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Không thể tải tin nhắn: {fetchError}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm tên, nội dung, liên hệ..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
          <option value="">Tất cả trạng thái</option>
          {CSKH_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterChannel} onChange={e => setFilterChannel(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
          <option value="">Tất cả kênh</option>
          {Object.entries(CSKH_CHANNEL_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        {(search || filterStatus || filterChannel) && (
          <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterChannel('') }} className="text-sm text-gray-500 hover:text-gray-700 px-2">
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">📨</p>
            <p>Chưa có tin nhắn nào{search || filterStatus || filterChannel ? ' phù hợp' : ''}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Thời gian</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kênh</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Phụ huynh</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nội dung</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Người xử lý</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(msg => (
                  <tr key={msg.id} className={`hover:bg-gray-50 transition-colors ${msg.status === 'Mới' ? 'border-l-4 border-red-400' : ''}`}>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {msg.created_at ? format(new Date(msg.created_at), 'HH:mm\ndd/MM/yy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CHANNEL_COLORS[msg.channel] || 'bg-gray-100 text-gray-600'}`}>
                        {CSKH_CHANNEL_LABELS[msg.channel] || msg.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{msg.sender_name || 'Ẩn danh'}</p>
                      {msg.sender_contact && <p className="text-xs text-gray-400">{msg.sender_contact}</p>}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-gray-700 line-clamp-2">{msg.content}</p>
                      {msg.reply_content && (
                        <p className="text-xs text-teal-600 mt-1 line-clamp-1">↩ {msg.reply_content}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={msg.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                      {msg.assigned_to || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {isManager && (
                          <>
                            <button onClick={() => openReply(msg)} className="text-xs text-blue-600 hover:underline whitespace-nowrap">
                              {msg.reply_content ? 'Sửa' : 'Trả lời'}
                            </button>
                            {msg.status !== 'Đóng' && (
                              <button onClick={() => handleClose(msg)} className="text-xs text-gray-400 hover:text-gray-600 hover:underline whitespace-nowrap">
                                Đóng
                              </button>
                            )}
                            <button onClick={() => setDeleteTarget(msg)} className="text-xs text-red-400 hover:underline">Xóa</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      <Modal isOpen={!!replyTarget} onClose={() => setReplyTarget(null)} title="Trả lời tin nhắn" size="lg">
        {replyTarget && (
          <div className="space-y-4">
            {/* Original message */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CHANNEL_COLORS[replyTarget.channel] || 'bg-gray-100 text-gray-600'}`}>
                  {CSKH_CHANNEL_LABELS[replyTarget.channel] || replyTarget.channel}
                </span>
                <span className="text-sm font-medium text-gray-800">{replyTarget.sender_name || 'Ẩn danh'}</span>
                {replyTarget.sender_contact && <span className="text-xs text-gray-400">{replyTarget.sender_contact}</span>}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{replyTarget.content}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung trả lời <span className="text-red-500">*</span></label>
              <textarea rows={4} value={reply.reply_content} onChange={e => setReply(r => ({ ...r, reply_content: e.target.value }))}
                placeholder="Nhập nội dung phản hồi..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Người xử lý</label>
                <select value={reply.assigned_to} onChange={e => setReply(r => ({ ...r, assigned_to: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                  <option value="">— Chưa phân công —</option>
                  {TEAM_MEMBERS.map(m => <option key={m.id} value={m.ten}>{m.ten} ({m.vaiTro})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select value={reply.status} onChange={e => setReply(r => ({ ...r, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                  {CSKH_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSaveReply} disabled={saving}
                className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition disabled:opacity-50">
                {saving ? 'Đang lưu...' : 'Lưu phản hồi'}
              </button>
              <button onClick={() => setReplyTarget(null)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                Hủy
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-800 mb-2">Xóa tin nhắn này?</h3>
            <p className="text-sm text-gray-500 mb-1">Từ: {deleteTarget.sender_name || 'Ẩn danh'}</p>
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{deleteTarget.content}</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">Xóa</button>
              <button onClick={() => setDeleteTarget(null)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
