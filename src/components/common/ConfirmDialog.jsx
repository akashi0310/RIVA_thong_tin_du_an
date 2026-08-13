import Modal from './Modal'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Xác nhận', message, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">Hủy</button>
        <button onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
          {loading ? 'Đang xử lý...' : 'Xác nhận xóa'}
        </button>
      </div>
    </Modal>
  )
}
