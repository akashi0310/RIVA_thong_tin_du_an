import { isToday, parseISO } from 'date-fns'
import { isSLACompliant, isOverdue } from './slaCalculator'

export function computeKPI(incidents, date = new Date()) {
  const isTargetDate = (inc) => {
    if (!inc.ngay) return false
    try { return isToday(parseISO(inc.ngay)) } catch { return false }
  }
  const all = date ? incidents.filter(isTargetDate) : incidents

  const total = all.length
  const daXuLy = all.filter(i => i.trangThai === 'Hoàn thành').length
  const dangXuLy = all.filter(i => i.trangThai === 'Đang xử lý').length
  const choXuLy = all.filter(i => i.trangThai === 'Tiếp nhận' || i.trangThai === 'Chờ phản hồi').length
  const daHuy = all.filter(i => i.trangThai === 'Đã hủy').length

  const p1 = all.filter(i => i.mucDo === 'P1').length
  const p2 = all.filter(i => i.mucDo === 'P2').length
  const p3 = all.filter(i => i.mucDo === 'P3').length
  const p4 = all.filter(i => i.mucDo === 'P4').length

  const resolved = all.filter(i => i.trangThai === 'Hoàn thành')
  const compliantCount = resolved.filter(i => isSLACompliant(i) === true).length
  const tyLeXuLyDungHan = resolved.length > 0 ? Math.round((compliantCount / resolved.length) * 100) : 0

  const suCoCanLeoThang = all.filter(i => isOverdue(i)).length

  const kenhEmail = all.filter(i => i.kenhPhatSinh === 'Email').length
  const kenhZalo = all.filter(i => i.kenhPhatSinh === 'Zalo').length
  const kenhFanpage = all.filter(i => i.kenhPhatSinh === 'Fanpage').length
  const kenhDienThoai = all.filter(i => i.kenhPhatSinh === 'Điện thoại').length
  const kenhSale = all.filter(i => i.kenhPhatSinh === 'Sale').length

  return { total, daXuLy, dangXuLy, choXuLy, daHuy, p1, p2, p3, p4, tyLeXuLyDungHan, suCoCanLeoThang, kenhEmail, kenhZalo, kenhFanpage, kenhDienThoai, kenhSale }
}
