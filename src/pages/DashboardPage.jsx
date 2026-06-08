import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRooms } from '../hooks/useRooms'
import RoomCard from '../components/RoomCard'
import styles from './DashboardPage.module.css'

const FILTERS = [
  { key: 'all', label: 'Sve' },
  { key: 'occupied', label: 'Zauzeto' },
  { key: 'door', label: 'Vrata otvorena' },
  { key: 'light', label: 'Svjetlo uključeno' },
  { key: 'ZgradaA', label: 'Zgrada A' },
  { key: 'Martinovka', label: 'Martinovka' },
  { key: 'ZgradaD', label: 'Zgrada D' },
]

function StatusPill({ status }) {
  const map = {
    idle: { label: 'Čekanje', cls: styles.pillAmber },
    connecting: { label: 'Spajanje…', cls: styles.pillAmber },
    connected: { label: 'Live', cls: styles.pillGreen },
    error: { label: 'Greška', cls: styles.pillRed },
  }
  const { label, cls } = map[status] ?? map.idle
  return <span className={`${styles.pill} ${cls}`}>{label}</span>
}

export default function DashboardPage() {
  const { logout } = useAuth()
  const { token } = useAuth()
  const { rooms, stats, wsStatus } = useRooms(token)

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const roomList = useMemo(() => {
    return Object.values(rooms)
      .sort((a, b) => {
        const na = parseInt(a.name.replace(/\D/g, '')) || 0
        const nb = parseInt(b.name.replace(/\D/g, '')) || 0
        return na - nb
      })
      .filter((r) => {
        if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
        if (filter === 'occupied') return r.motion === true
        if (filter === 'door') return r.door   === true
        if (filter === 'light') return r.light  === true
        if (filter === 'ZgradaA') return r.name.startsWith('A-')
        if (filter === 'Martinovka') return r.name.startsWith('M')
        if (filter === 'ZgradaD') return r.name.startsWith('D')
        return true
      })
  }, [rooms, filter, search])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.heading}>Omnispark</h1>
        </div>
        <div className={styles.headerRight}>
          <StatusPill status={wsStatus} />
          <button className={styles.logoutBtn} onClick={logout}>Odjava</button>
        </div>
      </header>

      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statVal}>{stats.total}</span>
          <span className={styles.statLabel}>Ukupno soba</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statVal} ${styles.green}`}>{stats.occupied}</span>
          <span className={styles.statLabel}>Zauzeto</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statVal} ${styles.red}`}>{stats.doorsOpen}</span>
          <span className={styles.statLabel}>Vrata otvorena</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statVal} ${styles.amber}`}>{stats.lightsOn}</span>
          <span className={styles.statLabel}>Svjetlo uključeno</span>
        </div>
      </div>

      <div className={styles.filterRow}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
        <input
          className={styles.search}
          type="text"
          placeholder="Traži sobu…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {roomList.length === 0 ? (
        <div className={styles.empty}>
          {Object.keys(rooms).length === 0
            ? 'Učitavanje prostorija…'
            : 'Nema prostorija koje odgovaraju filteru'}
        </div>
      ) : (
        <div className={styles.grid}>
          {roomList.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  )
}
