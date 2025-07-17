import styles from './horaris.module.css';

const duracionsMaxMD = {
  79303: { 71801: 96 }, // Flaçà -> Sants dura normalment 1:35h
  71801: { 79303: 96 }, // Sants -> Flaçà dura normalment 1:35h
  79300: { 71801: 82 }, // Girona -> Sants dura normalment 1:21h
  71801: { 79300: 82 }  // Sants -> Girona dura normalment 1:21h
}

// Mirem si el tren és mitja distància o regional
const isMitjaDistancia = (idOrigen, idDesti, duration) => {
  const [hores, minuts] = duration.split(':'); // 1:40 -> [100]
  const duracioMinuts = parseInt(hores) * 60 + parseInt(minuts); // Convertim a minuts
  const duracioMD = duracionsMaxMD[idOrigen]?.[idDesti];
  console.log(`Duració: ${duracioMinuts} < Duració MD: ${duracioMD} ?`);
  return (duracioMinuts < duracioMD) ? true : false;
}

export default function Horaris({ horaris, idOrigen, idDesti }) {
  return (
    <div className={styles.timeline}>
      {horaris.map((item, index) => (
        <div key={index} className={styles.timelineItem + (isMitjaDistancia(idOrigen, idDesti, item.duration) ? ` ${styles.mitjaDistanciaItem}` : '') }>
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