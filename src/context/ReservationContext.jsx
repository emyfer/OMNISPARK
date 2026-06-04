import { createContext, useContext, useState, useEffect } from 'react'

const ReservationContext = createContext(null)


const MOCK_STEPS = [
  { atMs: 0,     add: ['A-002'],         remove: [] },
  { atMs: 10000, add: ['A-301', 'A-302'], remove: [] },
  { atMs: 15000, add: ['A-101'],          remove: ['A-002'] },
  { atMs: 22000, add: ['A-205'],          remove: ['A-301'] },
  { atMs: 28000, add: [],                 remove: ['A-302', 'A-101'] },
  { atMs: 35000, add: ['A-002', 'A-103'], remove: ['A-205'] },
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
