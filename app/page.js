'use client';

import { useState, useEffect } from 'react';
import Horaris from './components/horaris';
import RouteSelector from './components/routeSelector';
import styles from './page.module.css';

export default function Home() {
  const [horaris, setHoraris] = useState([]);
  const [origen, setOrigen] = useState(79303); // Flaça per defecte
  const [desti, setDesti] = useState(71801); // Sants per defecte
  
  // Obtenir l'hora actual per defecte
  const horaActual = new Date().getHours();
  const [hora, setHora] = useState(horaActual);
  
  // Estat per al dia seleccionat
  const [dia, setDia] = useState('Avui');
  
  // Estat per a la data específica seleccionada
  const [dataSeleccionada, setDataSeleccionada] = useState(null);
  
  // Estat per gestionar errors del servidor
  const [errorServidor, setErrorServidor] = useState(false);
  
  // Estat per gestionar la càrrega
  const [carregant, setCarregant] = useState(false);

  // Estat per indicar si no queden trens
  const [senseTrens, setSenseTrens] = useState(false);


  // Definició de les estacions disponibles
  const estacions = [
    { id: 79303, nom: 'Flaça' },
    { id: 79302, nom: 'Bordils' },
    { id: 79300, nom: 'Girona' },
    { id: 71801, nom: 'Sants' }
  ];

  // Funció per calcular la data basada en el dia seleccionat
  const calcularData = (diaSeleccionat, dataEspecifica) => {
    if (diaSeleccionat === 'Data concreta' && dataEspecifica) {
      return dataEspecifica;
    }
    
    const avui = new Date();
    if (diaSeleccionat === 'Demà') {
      const dema = new Date(avui);
      dema.setDate(avui.getDate() + 1);
      return dema.toISOString().split('T')[0];
    }
    return avui.toISOString().split('T')[0];
  };

  // Carregar horaris quan canviïn origen, destí, hora o dia
  useEffect(() => {
    const obtenirHoraris = async () => {
      // Si origen i destí són iguals, no fem crida API i mostrem missatge
      if (origen === desti) {
        setCarregant(false);
        setErrorServidor(false);
        setSenseTrens(false);
        setHoraris([]);
        return;
      }
      try {
        setCarregant(true);
        setErrorServidor(false);
        setSenseTrens(false); // Reset cada consulta
        const dataSeleccionadaFinal = calcularData(dia, dataSeleccionada);

        // Si trajecte és Girona <-> Sants, mostrar AVE
        const gironaId = 79300;
        const santsId = 71801;
        const isAve =
          (origen === gironaId && desti === santsId) ||
          (origen === santsId && desti === gironaId);

        if (isAve) {
          // Consulta rodalies i AVE en paral·lel
          // Convertim la data seleccionada de "YYYY-MM-DD" a "DD-MM-YYYY" per l'API AVE
          let dateParts = dataSeleccionadaFinal.split('-');
          let dataAve = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

          const [resRodalies, resAve] = await Promise.all([
            fetch('/api/horaris', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                origen: origen,
                desti: desti,
                data: dataSeleccionadaFinal,
                hora: hora
              }),
            }),
            fetch(`/api/horaris/ave?date=${dataAve}`)
          ]);

          // Només error si status >= 500 o 504
          console.log('Rod API status:', resRodalies.status);
          if (resRodalies.status === 504  || resRodalies.status >= 500) {
            console.log('Rodalies: error servidor');
            setErrorServidor(true);
            setHoraris([]);
            return;
          }

          const jsonRodalies = await resRodalies.json();
          console.log('Rodalies JSON:', jsonRodalies);

          // Detectar cas "no queden trens" de rodalies
          const noQuedenTrensRodalies =
            jsonRodalies &&
            jsonRodalies.code === "error.renfe.unavailable_data" &&
            Array.isArray(jsonRodalies.args) &&
            jsonRodalies.args.length === 1 &&
            jsonRodalies.args[0] === null;
          console.log('noQuedenTrensRodalies:', noQuedenTrensRodalies);

          let dataAveJson = null;
          let horarisAve = [];
          if (resAve.ok) {
            dataAveJson = await resAve.json();
            const trens = dataAveJson.infoTrenIda || [];
            const formatHora = (h) => h && h.length === 4 ? `${h.slice(0,2)}:${h.slice(2)}` : h || "-";
            horarisAve = trens
              .filter(tren => {
                if (!tren.horaSalida || tren.horaSalida.length !== 4) return false;
                const horaSortida = parseInt(tren.horaSalida.slice(0,2), 10);
                return horaSortida >= hora;
              })
              .map((tren) => {
                // Convertim duracionTotal de "0h39m" a "00:39"
                let duracioStr = "-";
                if (tren.duracionTotal) {
                  const match = tren.duracionTotal.match(/(\d+)h(\d+)m/);
                  if (match) {
                    const hores = match[1].padStart(2, '0');
                    const minuts = match[2].padStart(2, '0');
                    duracioStr = `${hores}:${minuts}`;
                  }
                }
                return {
                  departsAtOrigin: formatHora(tren.horaSalida),
                  arrivesAtDestination: formatHora(tren.horaLlegada),
                  duration: duracioStr,
                  tipusTren: tren.tipoTren?.descTipoTren || "AVE",
                };
              });
            // Eliminar AVEs duplicats per hora de sortida
            horarisAve = horarisAve.filter((tren, idx, arr) =>
              arr.findIndex(t => t.departsAtOrigin === tren.departsAtOrigin) === idx
            );
            console.log('AVE JSON:', dataAveJson);
            console.log('Horaris AVE:', horarisAve);
          }

          // Si no queden trens a rodalies, mostrar missatge específic
          if (noQuedenTrensRodalies) {
            console.log('Mostrant missatge: No queden trens a partir d\'aquesta hora');
            setSenseTrens(true);
            setHoraris([]);
            return;
          }

          // Si no hi ha resultats ni a rodalies ni a AVE però no és el cas anterior, mostrar error genèric
          const noHoraris =
            (!jsonRodalies.result && !noQuedenTrensRodalies) &&
            (!dataAveJson?.infoTrenIda);
          console.log('noHoraris:', noHoraris);
          if (noHoraris) {
            console.log('Mostrant missatge: Servei temporalment no disponible');
            setErrorServidor(true);
            setHoraris([]);
            return;
          }

          const itemsRodalies = jsonRodalies.result?.items || [];
          const horarisRodalies = itemsRodalies.map(item => ({
            ...item,
            departsAtOrigin: item.departsAtOrigin?.substring(0, 5) || item.departsAtOrigin,
            arrivesAtDestination: item.arrivesAtDestination?.substring(0, 5) || item.arrivesAtDestination,
            duration: item.duration?.substring(0, 5) || item.duration,
            tipusTren: item.tipusTren || "Rodalies",
          }));

          // Unim i ordenem per hora de sortida
          const totsHoraris = [...horarisRodalies, ...horarisAve].sort((a, b) => {
            if (!a.departsAtOrigin || !b.departsAtOrigin) return 0;
            return a.departsAtOrigin.localeCompare(b.departsAtOrigin);
          });
          setHoraris(totsHoraris);
        } else {
          // Consulta rodalies
          const res = await fetch('/api/horaris', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              origen: origen,
              desti: desti,
              data: dataSeleccionadaFinal,
              hora: hora
            }),
          });

          // Només error si status >= 500 o 504
          if (res.status === 504  || res.status >= 500) {
            setErrorServidor(true);
            setHoraris([]);
            return;
          }
          const json = await res.json();

          // Detectar cas "no queden trens" de rodalies
          const noQuedenTrensRodalies =
            json &&
            json.code === "error.renfe.unavailable_data" &&
            Array.isArray(json.args) &&
            json.args.length === 1 &&
            json.args[0] === null;

          if (noQuedenTrensRodalies) {
            setSenseTrens(true);
            setHoraris([]);
            return;
          }

          // Si no hi ha result però no és el cas anterior, mostrar error genèric
          if (!json.result && !noQuedenTrensRodalies) {
            setErrorServidor(true);
            setHoraris([]);
            return;
          }

          const items = json.result?.items || [];
          const horarisFormatejats = items.map(item => ({
            ...item,
            departsAtOrigin: item.departsAtOrigin?.substring(0, 5) || item.departsAtOrigin,
            arrivesAtDestination: item.arrivesAtDestination?.substring(0, 5) || item.arrivesAtDestination,
            duration: item.duration?.substring(0, 5) || item.duration
          }));
          setHoraris(horarisFormatejats);
        }
      } catch (error) {
        console.error('Error obtenint horaris:', error);
        setErrorServidor(true);
        setHoraris([]);
      } finally {
        setCarregant(false);
      }
    };
    obtenirHoraris();
  }, [origen, desti, hora, dia, dataSeleccionada]);

  // Funció per invertir origen i destí
  const invertirTrajecte = () => {
    const origenTemp = origen;
    setOrigen(desti);
    setDesti(origenTemp);
  };


  return (
    <main className={styles.main}>
      <h1 className={styles.titolPrincipal}>R11 Rodalies</h1>
      
      <RouteSelector
        origen={origen}
        desti={desti}
        hora={hora}
        dia={dia}
        dataSeleccionada={dataSeleccionada}
        estacions={estacions}
        onOrigenChange={setOrigen}
        onDestiChange={setDesti}
        onHoraChange={setHora}
        onDiaChange={setDia}
        onDataSeleccionadaChange={setDataSeleccionada}
        onInvertirTrajecte={invertirTrajecte}
      />

      <h2 className={styles.routeTitle}>
        {estacions.find(e => e.id === origen)?.nom} → {estacions.find(e => e.id === desti)?.nom}
      </h2>

      {origen === desti ? (
        <div className={styles.errorMessage}>
          Tria dues estacions diferents
        </div>
      ) : carregant ? (
        <div className={styles.loadingMessage}>
          Carregant...
        </div>
      ) : errorServidor ? (
        <div className={styles.errorMessage}>
          Servei temporalment no disponible
        </div>
      ) : senseTrens ? (
        <div className={styles.errorMessage}>
          No queden trens a partir d&apos;aquesta hora
        </div>
      ) : (
        horaris.length > 0 && (
          <Horaris horaris={horaris} idOrigen={origen} idDesti={desti} />
        )
      )}
    </main>
  );
}