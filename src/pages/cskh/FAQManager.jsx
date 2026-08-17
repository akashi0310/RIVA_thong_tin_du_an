import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useCskhStore } from '../../stores/cskhStore'
import { useAuth } from '../../hooks/useAuth'
import Modal from '../../components/common/Modal'
import KPICard from '../../components/common/KPICard'
import { CSKH_FAQ_CATEGORIES } from '../../utils/constants'

const emptyForm = {
  category: 'Học phí',
  question: '',
  answer: '',
  keywords: '',
  sort_order: 0,
  is_active: true,
}

export default function FAQManager() {
  const { faqs, fetchFaqs, addFaq, updateFaq, deleteFaq } = useCskhStore()
  const { isManager, session } = useAuth()

  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  useEffect(() => { fetchFaqs() }, [])

  const updateField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditItem(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (faq) => {
    setEditItem(faq)
    setForm({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      keywords: (faq.keywords || []).join(', '),
      sort_order: faq.sort_order || 0,
      is_active: faq.is_active !== false,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Vui lòng nhập câu hỏi và câu trả lời')
      return
    }
    setSaving(true)
    const payload = {
      ...form,
      keywords: form.keywords ? form.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
      sort_order: Number(form.sort_order) || 0,
      created_by: session?.user?.email,
    }
    const { error } = editItem
      ? await updateFaq(editItem.id, payload)
      : await addFaq(payload)
    setSaving(false)
    if (error) { toast.error('Lỗi: ' + error.message); return }
    toast.success(editItem ? 'Đã cập nhật FAQ' : 'Đã thêm FAQ mới')
    setShowForm(false)
  }

  const handleDelete = async () => {
    const { error } = await deleteFaq(deleteTarget.id)
    if (error) { toast.error('Xóa thất bại: ' + error.message); return }
    toast.success('Đã xóa FAQ')
    setDeleteTarget(null)
  }

  const filtered = faqs.filter(f => {
    const matchSearch = !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCategory || f.category === filterCategory
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Tổng FAQ" value={faqs.length} icon="📋" color="blue" />
        <KPICard label="Đang dùng" value={faqs.filter(f => f.is_active).length} icon="✅" color="green" />
        <KPICard label="Tạm tắt" value={faqs.filter(f => !f.is_active).length} icon="🔕" color="gray" />
        <KPICard label="Danh mục" value={[...new Set(faqs.map(f => f.category))].length} icon="🏷️" color="purple" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm câu hỏi, câu trả lời..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
          <option value="">Tất cả danh mục</option>
          {CSKH_FAQ_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(search || filterCategory) && (
          <button onClick={() => { setSearch(''); setFilterCategory('') }} className="text-sm text-gray-500 hover:text-gray-700 px-2">
            Xóa bộ lọc
          </button>
        )}
        {isManager && (
          <button onClick={openCreate} className="ml-auto bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition">
            + Thêm FAQ
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">📋</p>
            <p>Chưa có FAQ nào{search || filterCategory ? ' phù hợp' : ''}</p>
            {isManager && !search && !filterCategory && (
              <button onClick={openCreate} className="mt-3 text-sm text-teal-600 hover:underline">+ Thêm FAQ đầu tiên</button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Danh mục</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Câu hỏi</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Câu trả lời</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Từ khóa</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                  {isManager && <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(faq => (
                  <tr key={faq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
                        {faq.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs">
                      {faq.question}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-sm hidden lg:table-cell">
                      {faq.answer?.slice(0, 100)}{faq.answer?.length > 100 ? '…' : ''}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(faq.keywords || []).slice(0, 3).map(kw => (
                          <span key={kw} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{kw}</span>
                        ))}
                        {(faq.keywords || []).length > 3 && <span className="text-xs text-gray-400">+{faq.keywords.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${faq.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {faq.is_active ? 'Đang dùng' : 'Tắt'}
                      </span>
                    </td>
                    {isManager && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(faq)} className="text-xs text-blue-600 hover:underline">Sửa</button>
                          <button onClick={() => setDeleteTarget(faq)} className="text-xs text-red-500 hover:underline">Xóa</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editItem ? 'Chỉnh sửa FAQ' : 'Thêm FAQ mới'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
              <select value={form.category} onChange={e => updateField('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                {CSKH_FAQ_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự hiển thị</label>
              <input type="number" value={form.sort_order} onChange={e => updateField('sort_order', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Câu hỏi <span className="text-red-500">*</span></label>
            <textarea rows={2} value={form.question} onChange={e => updateField('question', e.target.value)}
              placeholder="VD: Học phí khóa du học Nhật Bản là bao nhiêu?"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Câu trả lời <span className="text-red-500">*</span></label>
            <textarea rows={4} value={form.answer} onChange={e => updateField('answer', e.target.value)}
              placeholder="Nhập câu trả lời chi tiết..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ khóa <span className="text-gray-400 font-normal">(cách nhau bằng dấu phẩy)</span></label>
            <input value={form.keywords} onChange={e => updateField('keywords', e.target.value)}
              placeholder="VD: học phí, chi phí, giá tiền, bao nhiêu tiền"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => updateField('is_active', e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded" />
            <label htmlFor="is_active" className="text-sm text-gray-700">Kích hoạt (hiển thị cho chatbot và phụ huynh)</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition disabled:opacity-50">
              {saving ? 'Đang lưu...' : editItem ? 'Cập nhật' : 'Thêm FAQ'}
            </button>
            <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
              Hủy
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-800 mb-2">Xóa FAQ này?</h3>
            <p className="text-sm text-gray-500 mb-4">"{deleteTarget.question}"</p>
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
