import styles from './horaris.module.css';

const duracioMaxAve = {
  79300: { 71801: 45 }, // Girona -> Sants dura normalment 0:39h
  71801: { 79300: 45 }  // Sants -> Girona dura normalment 0:39h
};

const duracionsMaxMD = {
  79300: { 
    71801: 85, // Girona -> Sants dura normalment 1:21h
    79303: 12, // Sants -> Girona dura normalment 11min
  }, 
  71801: { 
    79300: 85, // Sants -> Flaçà dura normalment 1:21h
    79303: 96 // Sants -> Girona dura normalment 1:35h
  }, 
  79303: {
    79300: 12, // Flaçà -> Girona dura normalment 11min
    71801: 96 // Flaçà -> Sants dura normalment 1:35h
  }
}

const duracioMinRG1 = {
  71801: {
    79300: 110, // Sants -> Girona dura normalment 2:10h
    79303: 125, // Sants -> Flaçà dura normalment 2:05h
    79302: 130 // Sants -> Bordils dura normalment 2:10h
  },
  79300:{
    71801: 110 // Girona -> Sants dura normalment 2:10h
  },
  79303:{
    71801: 125 // Flaçà -> Sants dura normalment 2:05h
  },
  79302:{
    71801: 130 // Bordils -> Sants dura normalment 2:10h
  }
}

// Mirem si el tren és AVE (Girona/Sants, duració < 45min)
const isAve = (idOrigen, idDesti, duration) => {
  const [hores, minuts] = duration.split(':');
  const duracioMinuts = parseInt(hores, 10) * 60 + parseInt(minuts, 10);
  const duracioAVE = duracioMaxAve[idOrigen]?.[idDesti];
  return duracioMinuts < duracioAVE;
}

// Mirem si el tren és mitja distància o regional
const isMitjaDistancia = (idOrigen, idDesti, duration) => {
  const [hores, minuts] = duration.split(':'); // 1:40 -> [100]
  const duracioMinuts = parseInt(hores) * 60 + parseInt(minuts); // Convertim a minuts
  const duracioMD = duracionsMaxMD[idOrigen]?.[idDesti];
  const duracioAVE = duracioMaxAve[idOrigen]?.[idDesti];
  console.log(`Duració: ${duracioMinuts}, duració MD: ${duracioMD}, duració AVE: ${duracioAVE}`);
  const isMD = duracioMinuts < duracioMD && (duracioMinuts > duracioAVE || !duracioAVE);
  console.log(`isMD: ${isMD} (origen: ${idOrigen}, destí: ${idDesti}, duració: ${duration})`);
  return isMD
}

// Mirem si el tren és RG1 (duració > 2h10min)
const isRG1 = (idOrigen, idDesti, duration) => {
  const [hores, minuts] = duration.split(':');
  const duracioMinuts = parseInt(hores, 10) * 60 + parseInt(minuts, 10);
  const minRG1 = duracioMinRG1[idOrigen]?.[idDesti];
  return duracioMinuts > minRG1;
}

export default function Horaris({ horaris, idOrigen, idDesti, swapViewMaximized }) {
  return (
    <div className={styles.timeline}>
      {horaris.map((item, index) => (
        <div key={index} className={styles.timelineItem + 
        (isMitjaDistancia(idOrigen, idDesti, item.duration) ? ` ${styles.mitjaDistanciaItem}` : '') 
        + (isAve(idOrigen, idDesti, item.duration) ? ` ${styles.aveItem}` : '')
        + (isRG1(idOrigen, idDesti, item.duration) ? ` ${styles.rg1Item}` : '')
        }>
          <div className={styles.timelinePoint}></div>
          <div className={styles.timeInfo}>
            <div className={styles.departureTime}>{item.departsAtOrigin}</div>
            {swapViewMaximized && (
              <>
                <div className={styles.arrivalTime}>{item.arrivesAtDestination}</div>
                <div className={styles.duration}>{item.duration}</div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}