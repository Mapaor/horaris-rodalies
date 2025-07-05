import styles from './horaris.module.css';

export default function Horaris({ horaris }) {
  return (
    <div className={styles.timeline}>
      {horaris.map((item, index) => (
        <div key={index} className={styles.timelineItem}>
          <div className={styles.timelinePoint}></div>
          <div className={styles.timeInfo}>
            <div className={styles.departureTime}>{item.departsAtOrigin}</div>
            <div className={styles.arrivalTime}>{item.arrivesAtDestination}</div>
            <div className={styles.duration}>{item.duration}</div>
          </div>
        </div>
      ))}
    </div>
  );
}