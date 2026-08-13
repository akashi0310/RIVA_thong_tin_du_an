export const PRIORITY_LEVELS = {
  P1: { label: 'P1', color: 'red', emoji: '🔴', responseMin: 15, resolutionMin: 120, bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-400' },
  P2: { label: 'P2', color: 'orange', emoji: '🟠', responseMin: 30, resolutionMin: 240, bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-400' },
  P3: { label: 'P3', color: 'yellow', emoji: '🟡', responseMin: 120, resolutionMin: 1440, bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-400' },
  P4: { label: 'P4', color: 'green', emoji: '🟢', responseMin: 240, resolutionMin: 2880, bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-400' },
}

export const INCIDENT_CATEGORIES = [
  { code: 'KT', label: 'Kỹ thuật' },
  { code: 'DK', label: 'Đăng ký' },
  { code: 'TK', label: 'Tài khoản' },
  { code: 'DATA', label: 'Dữ liệu' },
  { code: 'TT', label: 'Truyền thông' },
  { code: 'TC', label: 'Tài chính' },
  { code: 'KH', label: 'Khiếu nại' },
  { code: 'KHAC', label: 'Khác' },
]

export const INCIDENT_CHANNELS = ['Email', 'Zalo', 'Fanpage', 'Điện thoại', 'Sale']

export const INCIDENT_STATUSES = ['Tiếp nhận', 'Đang xử lý', 'Chờ phản hồi', 'Hoàn thành', 'Đã hủy']

export const TASK_GROUPS = [
  'SALE & LEAD', 'DATABASE', 'DATA', 'TÀI CHÍNH', 'ĐÀO TẠO',
  'OPERATION', 'EMAIL', 'FANPAGE', 'TRUYỀN THÔNG', 'ADS', 'ZALO', 'QUẢN LÝ',
]

export const TASK_STATUSES = ['Chưa bắt đầu', 'Đang thực hiện', 'Tạm dừng', 'Hoàn thành']

export const TEAM_MEMBERS = [
  { id: '1', ten: 'HÀ', vaiTro: 'Manager' },
  { id: '2', ten: 'HÒA', vaiTro: 'Sales Lead' },
  { id: '3', ten: 'HƯỜNG', vaiTro: 'Senior Sales' },
  { id: '4', ten: 'NGÂN', vaiTro: 'Finance & Support' },
  { id: '5', ten: 'NAM', vaiTro: 'Marketing Head' },
  { id: '6', ten: 'VÂN ANH', vaiTro: 'Operations Manager' },
  { id: '7', ten: 'DŨNG', vaiTro: 'Training & Content' },
  { id: '8', ten: 'SƠN', vaiTro: 'Data & Ops Support' },
  { id: '9', ten: 'ÁNH-NHI-PHƯƠNG', vaiTro: 'Marketing Team' },
]

export const NCKH_TYPES = ['IENA', 'IPITEX', 'SVIFF']

export const DUHOC_STATUSES = ['Tư vấn', 'Nộp hồ sơ', 'Chờ kết quả', 'Đậu', 'Không đậu']

export const ONLUYEN_STATUSES = ['Đăng ký', 'Đang học', 'Kết thúc']
