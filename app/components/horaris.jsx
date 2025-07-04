import styles from './horaris.module.css';

export default function Horaris({ horaris }) {
  return (
    <div className={styles.container}>
      {horaris.map((item, index) => (
        <div key={index} className={styles.card}>
          <p><strong>Sortida:</strong> {item.departsAtOrigin}</p>
          <p><strong>Arribada:</strong> {item.arrivesAtDestination}</p>
          <p><strong>Durada:</strong> {item.duration}</p>
          <p><strong>Accessibilitat:</strong> {item.globalAccessibility ? 'Sí' : 'No'}</p>
        </div>
      ))}
    </div>
  );
}