import { useEffect } from 'react'
import { useAsmoStore } from '../../stores/asmoStore'
import { TEAM_MEMBERS } from '../../utils/constants'
import { isOverdue } from '../../utils/slaCalculator'

export default function TeamView() {
  const { incidents, tasks, fetchIncidents, fetchTasks } = useAsmoStore()

  useEffect(() => { fetchIncidents(); fetchTasks() }, [])

  const getMemberStats = (name) => {
    const myIncidents = incidents.filter(i => i.nguoi_phu_trach_xu_ly === name)
    const myTasks = tasks.filter(t => t.nguoi_phu_trach === name)
    const openIncidents = myIncidents.filter(i => i.trang_thai !== 'Hoàn thành' && i.trang_thai !== 'Đã hủy')
    const overdueInc = openIncidents.filter(isOverdue)
    const openTasks = myTasks.filter(t => t.trang_thai !== 'Hoàn thành')
    const load = overdueInc.length > 0 ? 'red' : openIncidents.length > 3 ? 'yellow' : 'green'
    return { openIncidents: openIncidents.length, overdueInc: overdueInc.length, openTasks: openTasks.length, totalTasks: myTasks.length, load }
  }

  const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500', 'bg-red-500', 'bg-indigo-500', 'bg-amber-500']
  const loadColors = { red: 'border-red-300 bg-red-50', yellow: 'border-yellow-300 bg-yellow-50', green: 'border-green-300 bg-green-50' }
  const loadLabels = { red: '🔴 Quá tải', yellow: '🟡 Bình thường', green: '🟢 Nhẹ' }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Đội nhóm ASMO 2026</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEAM_MEMBERS.map((member, i) => {
          const stats = getMemberStats(member.ten)
          return (
            <div key={member.id} className={`rounded-xl border-2 p-5 shadow-sm ${loadColors[stats.load]}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold text-lg`}>
                  {member.ten.slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{member.ten}</p>
                  <p className="text-xs text-gray-500">{member.vaiTro}</p>
                </div>
                <span className="ml-auto text-xs font-medium">{loadLabels[stats.load]}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-2xl font-bold text-gray-800">{stats.openIncidents}</p>
                  <p className="text-xs text-gray-500">SC đang xử lý</p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className={`text-2xl font-bold ${stats.overdueInc > 0 ? 'text-red-600' : 'text-gray-800'}`}>{stats.overdueInc}</p>
                  <p className="text-xs text-gray-500">SC quá hạn</p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-2xl font-bold text-gray-800">{stats.openTasks}</p>
                  <p className="text-xs text-gray-500">CV đang làm</p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-2xl font-bold text-gray-800">{stats.totalTasks}</p>
                  <p className="text-xs text-gray-500">Tổng CV</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
