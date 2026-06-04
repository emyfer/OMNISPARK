import { useReservations } from '../context/ReservationContext'
import styles from './RoomCard.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPersonWalking, faDoorOpen, faLightbulb, faPeopleGroup } from '@fortawesome/free-solid-svg-icons'

function SensorBadge({ value, trueLabel, falseLabel, trueClass, falseClass }) {
  if (value === null) return <span className={styles.badgeLoading}>—</span>
  return value
    ? <span className={`${styles.badge} ${styles[trueClass]}`}>{trueLabel}</span>
    : <span className={`${styles.badge} ${styles[falseClass]}`}>{falseLabel}</span>
}

export default function RoomCard({ room }) {
  const { name, motion, door, light } = room
  const { isReserved } = useReservations()

  const occupied  = motion === true
  const doorOpen  = door === true
  const reserved  = isReserved(name)

  const maybeFree = reserved && !motion && !light

  const cardClass = [
    styles.card,
    occupied  ? styles.occupied  : '',
    reserved  ? styles.reservedCard : '',
    !occupied && doorOpen ? styles.alert : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={cardClass}>
      {(occupied || doorOpen || reserved) && <div className={styles.topBar} />}

      <div className={styles.roomName}>{name}</div>

      <div className={styles.sensors}>

        <div className={styles.sensorRow}>
          <span className={styles.sensorLabel}>
            <FontAwesomeIcon icon={faPersonWalking} className={styles.icon} /> Pokret
          </span>
          <SensorBadge
            value={motion}
            trueLabel="Otkriven"  trueClass="badgeOn"
            falseLabel="Nema"     falseClass="badgeOff"
          />
        </div>

        <div className={styles.sensorRow}>
          <span className={styles.sensorLabel}>
            <FontAwesomeIcon icon={faDoorOpen} className={styles.icon} /> Vrata
          </span>
          <SensorBadge
            value={door}
            trueLabel="Otvorena"   trueClass="badgeOpen"
            falseLabel="Zatvorena" falseClass="badgeOff"
          />
        </div>

        <div className={styles.sensorRow}>
          <span className={styles.sensorLabel}>
            <FontAwesomeIcon icon={faLightbulb} className={styles.icon} /> Svjetlo
          </span>
          <SensorBadge
            value={light}
            trueLabel="Uključeno"   trueClass="badgeOn"
            falseLabel="Isključeno" falseClass="badgeOff"
          />
        </div>

        <div className={styles.sensorRow}>
          <span className={styles.sensorLabel}>
            <FontAwesomeIcon icon={faPeopleGroup} className={styles.icon} /> Rezervacija
          </span>
          {reserved
            ? <span className={`${styles.badge} ${styles.badgeReserved}`}>Rezervirano</span>
            : <span className={`${styles.badge} ${styles.badgeOff}`}>Slobodno</span>
          }
        </div>

      </div>

      <div className={styles.footer}>
        {occupied
          ? <span className={styles.occupiedTag}>Zauzeto</span>
          : maybeFree
            ? <span className={styles.maybeFreeTag}>Možda slobodno</span>
            : reserved
              ? <span className={styles.reservedTag}>Rezervirano</span>
              : <span className={styles.freeTag}>Slobodno</span>
        }
      </div>
    </div>
  )
}