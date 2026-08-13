import { addMinutes, isAfter, differenceInMinutes } from 'date-fns'
import { PRIORITY_LEVELS } from './constants'

export function calculateDeadlines(thoiDiemTiepNhan, mucDo) {
  if (!thoiDiemTiepNhan || !mucDo || !PRIORITY_LEVELS[mucDo]) return { deadlinePhanhoi: null, deadlineXuLy: null }
  const base = new Date(thoiDiemTiepNhan)
  const { responseMin, resolutionMin } = PRIORITY_LEVELS[mucDo]
  return {
    deadlinePhanhoi: addMinutes(base, responseMin).toISOString(),
    deadlineXuLy: addMinutes(base, resolutionMin).toISOString(),
  }
}

export function isOverdue(incident) {
  if (!incident.deadlineXuLy) return false
  if (incident.trangThai === 'Hoàn thành' || incident.trangThai === 'Đã hủy') return false
  return isAfter(new Date(), new Date(incident.deadlineXuLy))
}

export function isSLACompliant(incident) {
  if (!incident.deadlineXuLy || !incident.thoiDiemHoanThanh) return null
  return !isAfter(new Date(incident.thoiDiemHoanThanh), new Date(incident.deadlineXuLy))
}

export function minutesUntilDeadline(deadline) {
  if (!deadline) return null
  return differenceInMinutes(new Date(deadline), new Date())
}
