import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAsmoStore } from '../stores/asmoStore'
import { useNckhStore } from '../stores/nckhStore'
import { useDuhocStore } from '../stores/duhocStore'
import { useOnluyenStore } from '../stores/onluyenStore'
import { useCskhStore } from '../stores/cskhStore'
import { useKhoiLuongStore } from '../stores/khoiluongStore'
import { isOverdue } from '../utils/slaCalculator'
import { computeKPI } from '../utils/kpiCalculator'

export default function Home() {
  const { incidents, tasks, fetchIncidents, fetchTasks } = useAsmoStore()
  const { projects, fetchProjects } = useNckhStore()
  const { students: duhocStudents, fetchStudents: fetchDuhoc } = useDuhocStore()
  const { students: onluyenStudents, fetchStudents: fetchOnluyen } = useOnluyenStore()
  const { messages: cskhMessages, fetchMessages: fetchCskh } = useCskhStore()
  const { congViec, fetchAll: fetchKhoiLuong } = useKhoiLuongStore()

  useEffect(() => {
    fetchIncidents(); fetchTasks(); fetchProjects(); fetchDuhoc(); fetchOnluyen(); fetchCskh(); fetchKhoiLuong()
  }, [])

  const kpi = computeKPI(incidents)
  const overdueCount = incidents.filter(isOverdue).length
  const activeIncidents = incidents.filter(i => i.trang_thai !== 'Hoàn thành' && i.trang_thai !== 'Đã hủy').length
  const activeTasks = tasks.filter(t => t.trang_thai === 'Đang thực hiện').length

  const cards = [
    {
      to: '/asmo/dashboard', label: 'ASMO 2026', icon: '⭐', color: 'blue',
      stats: [
        { label: 'Sự cố đang xử lý', value: activeIncidents, urgent: activeIncidents > 5 },
        { label: 'P1/P2 quá hạn', value: overdueCount, urgent: overdueCount > 0 },
        { label: 'Công việc đang làm', value: activeTasks },
        { label: 'Tỷ lệ đúng hạn', value: `${kpi.tyLeXuLyDungHan}%` },
      ],
      desc: 'Quản lý sự cố, công việc, đội nhóm ASMO',
      featured: true,
    },
    {
      to: '/nckh/dashboard', label: 'NCKH', icon: '🔬', color: 'purple',
      stats: [
        { label: 'IENA', value: projects.filter(p => p.loai === 'IENA').length },
        { label: 'IPITEX', value: projects.filter(p => p.loai === 'IPITEX').length },
        { label: 'SVIFF', value: projects.filter(p => p.loai === 'SVIFF').length },
        { label: 'Tổng đề tài', value: projects.length },
      ],
      desc: 'IENA, IPITEX, SVIFF — nghiên cứu khoa học',
    },
    {
      to: '/du-hoc/dashboard', label: 'Du học', icon: '✈️', color: 'green',
      stats: [
        { label: 'Đang tư vấn', value: duhocStudents.filter(s => s.trang_thai === 'Tư vấn').length },
        { label: 'Chờ kết quả', value: duhocStudents.filter(s => s.trang_thai === 'Chờ kết quả').length },
        { label: 'Đã đậu', value: duhocStudents.filter(s => s.trang_thai === 'Đậu').length },
        { label: 'Tổng hồ sơ', value: duhocStudents.length },
      ],
      desc: 'Theo dõi hồ sơ và kết quả du học',
    },
    {
      to: '/on-luyen/dashboard', label: 'Ôn luyện', icon: '📚', color: 'amber',
      stats: [
        { label: 'Đăng ký', value: onluyenStudents.filter(s => s.trang_thai === 'Đăng ký').length },
        { label: 'Đang học', value: onluyenStudents.filter(s => s.trang_thai === 'Đang học').length },
        { label: 'Kết thúc', value: onluyenStudents.filter(s => s.trang_thai === 'Kết thúc').length },
        { label: 'Tổng học sinh', value: onluyenStudents.length },
      ],
      desc: 'Quản lý học sinh ôn luyện thi cử',
    },
    {
      to: '/cskh/dashboard', label: 'CSKH', icon: '💬', color: 'teal',
      stats: [
        { label: 'Tin nhắn mới', value: cskhMessages.filter(m => m.status === 'Mới').length, urgent: cskhMessages.filter(m => m.status === 'Mới').length > 0 },
        { label: 'Đang xử lý', value: cskhMessages.filter(m => m.status === 'Đang xử lý').length },
        { label: 'Đã trả lời', value: cskhMessages.filter(m => m.status === 'Đã trả lời').length },
        { label: 'Tổng tin nhắn', value: cskhMessages.length },
      ],
      desc: 'Chăm sóc phụ huynh — câu hỏi, phản hồi, FAQ',
    },
    {
      to: '/khoi-luong/dashboard', label: 'Khối lượng', icon: '📊', color: 'indigo',
      stats: [
        { label: 'Tổng công việc', value: congViec.length },
        { label: 'Hoàn thành', value: congViec.filter(t => t.trang_thai === '✓').length },
        { label: 'Đang thực hiện', value: congViec.filter(t => t.trang_thai === '□').length },
        { label: 'Trễ hạn', value: congViec.filter(t => t.deadline && new Date(t.deadline) < new Date(new Date().toDateString()) && t.trang_thai !== '✓').length, urgent: congViec.filter(t => t.deadline && new Date(t.deadline) < new Date(new Date().toDateString()) && t.trang_thai !== '✓').length > 0 },
      ],
      desc: 'Theo dõi khối lượng công việc & KPI toàn đội',
    },
  ]

  const colorMap = {
    blue:   { border: 'border-blue-200',   icon: 'bg-blue-100 text-blue-600',   title: 'text-blue-700',   btn: 'bg-blue-600 hover:bg-blue-700',     bar: 'from-blue-400 to-blue-600' },
    purple: { border: 'border-purple-200', icon: 'bg-purple-100 text-purple-600', title: 'text-purple-700', btn: 'bg-purple-600 hover:bg-purple-700', bar: 'from-purple-400 to-purple-600' },
    green:  { border: 'border-green-200',  icon: 'bg-green-100 text-green-600',  title: 'text-green-700',  btn: 'bg-green-600 hover:bg-green-700',   bar: 'from-green-400 to-green-600' },
    amber:  { border: 'border-amber-200',  icon: 'bg-amber-100 text-amber-600',  title: 'text-amber-700',  btn: 'bg-amber-500 hover:bg-amber-600',   bar: 'from-amber-400 to-amber-500' },
    teal:   { border: 'border-teal-200',   icon: 'bg-teal-100 text-teal-600',   title: 'text-teal-700',   btn: 'bg-teal-600 hover:bg-teal-700',     bar: 'from-teal-400 to-teal-600' },
    indigo: { border: 'border-indigo-200', icon: 'bg-indigo-100 text-indigo-600', title: 'text-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700', bar: 'from-indigo-400 to-indigo-600' },
  }

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #2563eb 60%, #7c3aed 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative">
          <h1 className="text-2xl font-extrabold tracking-tight">Tổng quan dự án RIVA</h1>
          <p className="text-indigo-200 text-sm mt-1">Theo dõi tất cả các dự án đang triển khai</p>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="bg-white/15 px-3 py-1 rounded-full">{cards.reduce((s, c) => s + c.stats.reduce((ss, st) => ss + (typeof st.value === 'number' ? 0 : 0), 0), 0) || activeIncidents + activeTasks} hoạt động</span>
            {overdueCount > 0 && <span className="bg-red-500/80 px-3 py-1 rounded-full animate-pulse">{overdueCount} quá hạn</span>}
          </div>
        </div>
      </div>

      {/* ASMO featured card */}
      {cards.filter(c => c.featured).map(card => {
        const c = colorMap[card.color]
        return (
          <div key={card.to} className={`bg-white rounded-2xl border-2 ${c.border} shadow-sm p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${c.icon} flex items-center justify-center w-16 h-16`}>
                <img src="/logo-asmo.png" alt="ASMO" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${c.title}`}>{card.label}</h2>
                <p className="text-gray-500 text-sm">{card.desc}</p>
              </div>
              <Link to={card.to} className={`ml-auto text-white px-4 py-2 rounded-lg text-sm font-medium transition ${c.btn}`}>
                Vào Dashboard →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {card.stats.map(s => (
                <div key={s.label} className={`rounded-xl p-3 ${s.urgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                  <p className={`text-2xl font-bold ${s.urgent ? 'text-red-600' : 'text-gray-800'}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {overdueCount > 0 && (
              <div className="mt-3 flex items-center gap-2 text-red-600 text-sm font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {overdueCount} sự cố đang quá hạn — <Link to="/asmo/incidents" className="underline">xử lý ngay</Link>
              </div>
            )}
          </div>
        )
      })}

      {/* Other project cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.filter(c => !c.featured).map(card => {
          const c = colorMap[card.color]
          return (
            <div key={card.to} className={`bg-white rounded-2xl border ${c.border} shadow-sm p-5 hover:shadow-md transition-shadow overflow-hidden relative`}>
              {/* Gradient bar top */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.bar}`} />
              <div className="flex items-center gap-2 mb-3 mt-1">
                <span className={`text-xl p-2 rounded-xl ${c.icon}`}>{card.icon}</span>
                <h3 className={`font-bold ${c.title}`}>{card.label}</h3>
                <Link to={card.to} className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-lg text-white transition ${c.btn}`}>Xem →</Link>
              </div>
              <p className="text-xs text-gray-400 mb-3">{card.desc}</p>
              <div className="grid grid-cols-2 gap-2">
                {card.stats.map(s => (
                  <div key={s.label} className={`rounded-xl p-2.5 ${s.urgent ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}>
                    <p className={`text-lg font-bold ${s.urgent ? 'text-red-600' : 'text-gray-800'}`}>{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
