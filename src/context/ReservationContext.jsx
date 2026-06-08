import { createContext, useContext, useState, useEffect } from 'react'

const ReservationContext = createContext(null)


const MOCK_STEPS = [
  { atMs: 0, add: ['A-002', 'M1', 'D2'], remove: [] },
  { atMs: 5000, add: ['A-009', 'A-202'], remove: [] },
  { atMs: 10000, add: ['A-301', 'A-302', 'D-273'], remove: ['A-002'] },
  { atMs: 15000, add: ['A-101', 'A-103', 'A-105'], remove: ['A-009', 'M1', 'D-273'] },
  { atMs: 20000, add: ['A-205', 'M-LAB2'], remove: ['A-301', 'A-103', 'D2'] },
  { atMs: 28000, add: ['A-208'], remove: ['A-302', 'A-101', 'A-202'] },
  { atMs: 35000, add: ['A-002', 'A-103'], remove: ['A-105', 'A-208'] },
  { atMs: 50000, add: ['D1', 'A-101', 'A-204'], remove: ['A-205', 'A-103'] },
  { atMs: 60000, add: ['A-102'], remove: ['A-002', 'M-LAB2'] },
  { atMs: 80000, add: ['A-111', 'M6'], remove: ['A-002', 'M-LAB2'] },
  { atMs: 100000, add: ['M2'], remove: ['D1', 'A-111', 'A-204'] },
  { atMs: 115000, add: ['D-346'], remove: ['M6', 'A-102'] },
  { atMs: 130000, add: [], remove: ['M2', 'A-101', 'D-346'] },
]

export function ReservationProvider({ children }) {
  const [reserved, setReserved] = useState(new Set())

  useEffect(() => {
    const timers = MOCK_STEPS.map(({ atMs, add, remove }) =>
      setTimeout(() => {
        setReserved(prev => {
          const next = new Set(prev)
          add.forEach(name => next.add(name))
          remove.forEach(name => next.delete(name))
          return next
        })
      }, atMs)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  const isReserved = (roomName) => reserved.has(roomName)

  return (
    <ReservationContext.Provider value={{ reserved, isReserved }}>
      {children}
    </ReservationContext.Provider>
  )
}

export function useReservations() {
  return useContext(ReservationContext)
}
