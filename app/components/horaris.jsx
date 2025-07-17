import styles from './horaris.module.css';

const duracionsMaxMD = {
  79303: { 71801: 96 }, // Flaçà -> Sants dura normalment 1:35h
  71801: { 79303: 96 }, // Sants -> Flaçà dura normalment 1:35h
  79300: { 71801: 82 }, // Girona -> Sants dura normalment 1:21h
  71801: { 79300: 82 }  // Sants -> Girona dura normalment 1:21h
}

const duracioMaxAve = {
  79300: { 71801: 40 }, // Girona -> Sants dura normalment 0:39h
  71801: { 79300: 40 }  // Sants -> Girona dura normalment 0:39h
};

// Mirem si el tren és mitja distància o regional
const isMitjaDistancia = (idOrigen, idDesti, duration) => {
  const [hores, minuts] = duration.split(':'); // 1:40 -> [100]
  const duracioMinuts = parseInt(hores) * 60 + parseInt(minuts); // Convertim a minuts
  const duracioMD = duracionsMaxMD[idOrigen]?.[idDesti];
  const duracioAVE = duracioMaxAve[idOrigen]?.[idDesti];
  return duracioAVE < duracioMinuts && duracioMinuts < duracioMD;
}

// Mirem si el tren és AVE (Girona/Sants, duració < 40min)
const isAve = (idOrigen, idDesti, duration) => {
  let duracioMinuts = 0;
  duracioMinuts = parseInt(duration);
  const duracioAVE = duracioMaxAve[idOrigen]?.[idDesti];
  console.log(`Duració tren: ${duracioMinuts} <(?) Duració AVE: ${duracioAVE}`);
  return duracioMinuts < duracioAVE;
}

export default function Horaris({ horaris, idOrigen, idDesti }) {
  return (
    <div className={styles.timeline}>
      {horaris.map((item, index) => (
        <div key={index} className={styles.timelineItem + 
        (isMitjaDistancia(idOrigen, idDesti, item.duration) ? ` ${styles.mitjaDistanciaItem}` : '') 
        + (isAve(idOrigen, idDesti, item.duration) ? ` ${styles.aveItem}` : '')
        }>
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