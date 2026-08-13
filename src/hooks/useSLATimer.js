import { useState, useEffect } from 'react'
import { minutesUntilDeadline } from '../utils/slaCalculator'

export function useSLATimer(incidents) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])

  return incidents
    .filter(i => (i.mucDo === 'P1' || i.mucDo === 'P2') && i.trangThai !== 'Hoàn thành' && i.trangThai !== 'Đã hủy')
    .map(i => ({
      ...i,
      minutesLeft: minutesUntilDeadline(i.deadlineXuLy),
    }))
    .sort((a, b) => (a.minutesLeft ?? Infinity) - (b.minutesLeft ?? Infinity))
}
