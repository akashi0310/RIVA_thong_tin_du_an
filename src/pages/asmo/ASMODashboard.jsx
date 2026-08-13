import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAsmoStore } from '../../stores/asmoStore'
import { computeKPI } from '../../utils/kpiCalculator'
import { isOverdue } from '../../utils/slaCalculator'
import { useSLATimer } from '../../hooks/useSLATimer'
import KPICard from '../../components/common/KPICard'
import { PriorityBadge, StatusBadge } from '../../components/common/Badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { format } from 'date-fns'

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e']

export default function ASMODashboard() {
  const { incidents, tasks, fetchIncidents, fetchTasks, subscribeRealtime } = useAsmoStore()

  useEffect(() => {
    fetchIncidents()
    fetchTasks()
    const unsubscribe = subscribeRealtime()
    return unsubscribe
  }, [])

  const kpi = computeKPI(incidents)
  const slaIncidents = useSLATimer(incidents)
  const overdueList = incidents.filter(isOverdue)

  const priorityData = [
    { name: 'P1 🔴', value: kpi.p1, color: '#ef4444' },
    { name: 'P2 🟠', value: kpi.p2, color: '#f97316' },
    { name: 'P3 🟡', value: kpi.p3, color: '#eab308' },
    { name: 'P4 🟢', value: kpi.p4, color: '#22c55e' },
  ].filter(d => d.value > 0)

  const channelData = [
    { name: 'Email', count: kpi.kenhEmail },
    { name: 'Zalo', count: kpi.kenhZalo },
    { name: 'Fanpage', count: kpi.kenhFanpage },
    { name: 'Điện thoại', count: kpi.kenhDienThoai },
    { name: 'Sale', count: kpi.kenhSale },
  ]

  const groupCompletion = {}
  tasks.forEach(t => {
    if (!groupCompletion[t.nhom]) groupCompletion[t.nhom] = { total: 0, done: 0 }
    groupCompletion[t.nhom].total++
    if (t.trang_thai === 'Hoàn thành') groupCompletion[t.nhom].done++
  })
  const taskData = Object.entries(groupCompletion).map(([name, g]) => ({
    name: name.length > 10 ? name.slice(0, 10) + '…' : name,
    pct: g.total > 0 ? Math.round((g.done / g.total) * 100) : 0,
  }))

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Tổng sự cố hôm nay" value={kpi.total} icon="📋" color="blue" />
        <KPICard label="Đang xử lý" value={kpi.dangXuLy} icon="⚡" color="yellow" />
        <KPICard label="Hoàn thành" value={kpi.daXuLy} icon="✅" color="green" />
        <KPICard label="Tỷ lệ đúng hạn" value={`${kpi.tyLeXuLyDungHan}%`} icon="🎯" color={kpi.tyLeXuLyDungHan >= 80 ? 'green' : 'red'} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="P1 Nghiêm trọng" value={kpi.p1} icon="🔴" color="red" />
        <KPICard label="P2 Cao" value={kpi.p2} icon="🟠" color="yellow" />
        <KPICard label="Chờ xử lý" value={kpi.choXuLy} icon="⏳" color="purple" />
        <KPICard label="Cần leo thang" value={kpi.suCoCanLeoThang} icon="⚠️" color={kpi.suCoCanLeoThang > 0 ? 'red' : 'green'} />
      </div>

      {/* SLA Countdown for P1/P2 */}
      {slaIncidents.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-700 mb-3">🚨 Sự cố P1/P2 cần xử lý ngay</h3>
          <div className="space-y-2">
            {slaIncidents.map(inc => (
              <Link key={inc.id} to={`/asmo/incidents/${inc.id}`}
                className="flex items-center justify-between bg-white border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50 transition"
              >
                <div className="flex items-center gap-3">
                  <PriorityBadge priority={inc.mucDo} />
                  <span className="text-sm font-medium text-gray-800">{inc.ma_su_co}</span>
                  <span className="text-sm text-gray-500 hidden sm:inline">{inc.noi_dung?.slice(0, 40)}</span>
                </div>
                <span className={`text-sm font-bold ${inc.minutesLeft < 0 ? 'text-red-600' : inc.minutesLeft < 30 ? 'text-orange-600' : 'text-gray-600'}`}>
                  {inc.minutesLeft < 0 ? `Quá hạn ${Math.abs(inc.minutesLeft)} phút` : `Còn ${inc.minutesLeft} phút`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Pie */}
        {priorityData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-4 text-sm">Phân loại mức độ</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Channel Bar */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4 text-sm">Kênh phát sinh</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={channelData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Progress */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4 text-sm">Tiến độ công việc</h3>
          <div className="space-y-2 overflow-y-auto max-h-44">
            {taskData.map(g => (
              <div key={g.name}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{g.name}</span><span>{g.pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-3 flex-wrap">
        <Link to="/asmo/incidents/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          + Tạo sự cố mới
        </Link>
        <Link to="/asmo/incidents" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
          Xem tất cả sự cố
        </Link>
        <Link to="/asmo/report" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
          🖨️ Báo cáo ngày
        </Link>
      </div>
    </div>
  )
}
