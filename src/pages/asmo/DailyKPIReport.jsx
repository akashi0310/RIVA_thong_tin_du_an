import { useEffect, useRef, useState } from 'react'
import { useAsmoStore } from '../../stores/asmoStore'
import { computeKPI } from '../../utils/kpiCalculator'
import { format } from 'date-fns'
import { useReactToPrint } from 'react-to-print'

export default function DailyKPIReport() {
  const { incidents, fetchIncidents } = useAsmoStore()
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const printRef = useRef()

  useEffect(() => { fetchIncidents() }, [])

  const filtered = incidents.filter(i => i.ngay === date)
  const kpi = computeKPI(filtered, null)

  const handlePrint = useReactToPrint({ content: () => printRef.current })

  const Row = ({ label, value, highlight }) => (
    <tr className={highlight ? 'bg-blue-50 font-semibold' : ''}>
      <td className="py-2 px-4 text-sm text-gray-700 border-b border-gray-100">{label}</td>
      <td className="py-2 px-4 text-sm font-bold text-gray-800 text-right border-b border-gray-100">{value}</td>
    </tr>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between no-print">
        <h2 className="text-lg font-semibold text-gray-800">Báo cáo KPI ngày</h2>
        <div className="flex gap-3 items-center">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
            🖨️ In báo cáo
          </button>
        </div>
      </div>

      <div ref={printRef} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">BÁO CÁO KPI NGÀY</h1>
          <p className="text-gray-500 mt-1">ASMO 2026 — {format(new Date(date), 'dd/MM/yyyy')}</p>
          <p className="text-xs text-gray-400 mt-1">Xuất lúc: {format(new Date(), 'HH:mm dd/MM/yyyy')}</p>
        </div>

        <table className="w-full mb-4">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-2 px-4 text-left text-sm">Chỉ số</th>
              <th className="py-2 px-4 text-right text-sm">Giá trị</th>
            </tr>
          </thead>
          <tbody>
            <Row label="Tổng sự cố trong ngày" value={kpi.total} highlight />
            <Row label="Sự cố đã hoàn thành" value={kpi.daXuLy} />
            <Row label="Sự cố đang xử lý" value={kpi.dangXuLy} />
            <Row label="Sự cố chờ xử lý" value={kpi.choXuLy} />
            <Row label="Sự cố đã hủy" value={kpi.daHuy} />
            <Row label="Mức độ P1 (Nghiêm trọng)" value={kpi.p1} highlight />
            <Row label="Mức độ P2 (Cao)" value={kpi.p2} />
            <Row label="Mức độ P3 (Trung bình)" value={kpi.p3} />
            <Row label="Mức độ P4 (Thấp)" value={kpi.p4} />
            <Row label="Tỷ lệ xử lý đúng hạn" value={`${kpi.tyLeXuLyDungHan}%`} highlight />
            <Row label="Sự cố cần leo thang" value={kpi.suCoCanLeoThang} />
            <Row label="Kênh Email" value={kpi.kenhEmail} />
            <Row label="Kênh Zalo" value={kpi.kenhZalo} />
            <Row label="Kênh Fanpage" value={kpi.kenhFanpage} />
            <Row label="Kênh Điện thoại" value={kpi.kenhDienThoai} />
            <Row label="Kênh Sale" value={kpi.kenhSale} />
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-4">Không có sự cố nào trong ngày {format(new Date(date), 'dd/MM/yyyy')}</p>
        )}

        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-xs text-gray-400 text-center">Báo cáo tự động tạo từ Hệ thống quản lý RIVA</p>
        </div>
      </div>
    </div>
  )
}
