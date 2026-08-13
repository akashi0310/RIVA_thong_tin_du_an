import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAsmoStore } from '../stores/asmoStore'
import { useNckhStore } from '../stores/nckhStore'
import { useDuhocStore } from '../stores/duhocStore'
import { useOnluyenStore } from '../stores/onluyenStore'
import { isOverdue } from '../utils/slaCalculator'
import { computeKPI } from '../utils/kpiCalculator'

export default function Home() {
  const { incidents, tasks, fetchIncidents, fetchTasks } = useAsmoStore()
  const { projects, fetchProjects } = useNckhStore()
  const { students: duhocStudents, fetchStudents: fetchDuhoc } = useDuhocStore()
  const { students: onluyenStudents, fetchStudents: fetchOnluyen } = useOnluyenStore()

  useEffect(() => {
    fetchIncidents(); fetchTasks(); fetchProjects(); fetchDuhoc(); fetchOnluyen()
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
  ]

  const colorMap = {
    blue: { border: 'border-blue-200', icon: 'bg-blue-100', title: 'text-blue-700', btn: 'bg-blue-600 hover:bg-blue-700' },
    purple: { border: 'border-purple-200', icon: 'bg-purple-100', title: 'text-purple-700', btn: 'bg-purple-600 hover:bg-purple-700' },
    green: { border: 'border-green-200', icon: 'bg-green-100', title: 'text-green-700', btn: 'bg-green-600 hover:bg-green-700' },
    amber: { border: 'border-amber-200', icon: 'bg-amber-100', title: 'text-amber-700', btn: 'bg-amber-600 hover:bg-amber-700' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan dự án RIVA</h1>
        <p className="text-gray-500 text-sm mt-1">Theo dõi tất cả các dự án đang triển khai</p>
      </div>

      {/* ASMO featured card */}
      {cards.filter(c => c.featured).map(card => {
        const c = colorMap[card.color]
        return (
          <div key={card.to} className={`bg-white rounded-2xl border-2 ${c.border} shadow-sm p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-3xl p-3 rounded-xl ${c.icon}`}>{card.icon}</span>
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
            <div key={card.to} className={`bg-white rounded-xl border ${c.border} shadow-sm p-5`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xl p-2 rounded-lg ${c.icon}`}>{card.icon}</span>
                <h3 className={`font-bold ${c.title}`}>{card.label}</h3>
                <Link to={card.to} className="ml-auto text-xs text-gray-400 hover:text-gray-600">→</Link>
              </div>
              <p className="text-xs text-gray-500 mb-3">{card.desc}</p>
              <div className="grid grid-cols-2 gap-2">
                {card.stats.map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-800">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
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
