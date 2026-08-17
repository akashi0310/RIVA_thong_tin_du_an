import { useEffect, useState } from 'react'
import { useCskhStore } from '../../stores/cskhStore'
import toast from 'react-hot-toast'

const emptyForm = { sender_name: '', sender_contact: '', content: '' }

export default function WebFormPage() {
  const { addMessage, faqs, fetchFaqs } = useCskhStore()
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [faqSearch, setFaqSearch] = useState('')

  useEffect(() => { fetchFaqs() }, [])

  const activeFaqs = faqs.filter(f => f.is_active)
  const filteredFaqs = faqSearch
    ? activeFaqs.filter(f =>
        f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
        (f.keywords || []).some(k => k.toLowerCase().includes(faqSearch.toLowerCase()))
      )
    : activeFaqs

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.sender_name.trim() || !form.sender_contact.trim() || !form.content.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    setSubmitting(true)
    const { error } = await addMessage({
      channel: 'web_form',
      sender_name: form.sender_name.trim(),
      sender_contact: form.sender_contact.trim(),
      content: form.content.trim(),
      status: 'Mới',
    })
    setSubmitting(false)
    if (error) { toast.error('Gửi thất bại, vui lòng thử lại'); return }
    setSubmitted(true)
    setForm(emptyForm)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Form card */}
      <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-teal-700">📨 Gửi câu hỏi đến RIVA Academy</h2>
          <p className="text-sm text-gray-500 mt-1">
            Điền thông tin bên dưới, đội ngũ RIVA sẽ liên hệ phản hồi sớm nhất có thể.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <p className="text-5xl mb-3">✅</p>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Đã gửi thành công!</h3>
            <p className="text-gray-500 text-sm mb-5">Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
            <button onClick={() => setSubmitted(false)}
              className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition">
              Gửi câu hỏi khác
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên phụ huynh <span className="text-red-500">*</span>
              </label>
              <input
                value={form.sender_name}
                onChange={e => setForm(f => ({ ...f, sender_name: e.target.value }))}
                placeholder="VD: Nguyễn Văn A"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại / Email liên hệ <span className="text-red-500">*</span>
              </label>
              <input
                value={form.sender_contact}
                onChange={e => setForm(f => ({ ...f, sender_contact: e.target.value }))}
                placeholder="VD: 0901234567 hoặc email@gmail.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Câu hỏi / Phản hồi <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Nhập nội dung câu hỏi hoặc góp ý của bạn..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
              />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-teal-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition disabled:opacity-50">
              {submitting ? 'Đang gửi...' : 'Gửi câu hỏi →'}
            </button>
          </form>
        )}
      </div>

      {/* FAQ self-service */}
      {activeFaqs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-1">📋 Câu hỏi thường gặp</h3>
          <p className="text-sm text-gray-500 mb-4">Có thể câu hỏi của bạn đã có câu trả lời tại đây.</p>

          <input
            value={faqSearch}
            onChange={e => setFaqSearch(e.target.value)}
            placeholder="Tìm kiếm câu hỏi..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />

          <div className="space-y-2">
            {filteredFaqs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Không tìm thấy câu hỏi phù hợp</p>
            ) : (
              filteredFaqs.map(faq => (
                <div key={faq.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full shrink-0">{faq.category}</span>
                      <span className="text-sm font-medium text-gray-800 truncate">{faq.question}</span>
                    </div>
                    <span className="text-gray-400 shrink-0 ml-2">{openFaq === faq.id ? '▲' : '▼'}</span>
                  </button>
                  {openFaq === faq.id && (
                    <div className="px-4 pb-4 pt-1 bg-teal-50 border-t border-teal-100">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
