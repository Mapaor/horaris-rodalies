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
      try {
        setCarregant(true);
        setErrorServidor(false);
        const dataSeleccionadaFinal = calcularData(dia, dataSeleccionada);

        // Si trajecte és Girona <-> Sants, mostrar AVE
        const gironaId = 79300;
        const santsId = 71801;
        const isAve =
          (origen === gironaId && desti === santsId) ||
          (origen === santsId && desti === gironaId);

        if (isAve) {
          // Consulta rodalies
          const resRodalies = await fetch('/api/horaris', {
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
          if (resRodalies.status === 504  || resRodalies.status >= 500) {
            setErrorServidor(true);
            setHoraris([]);
            return;
          }
          const jsonRodalies = await resRodalies.json();
          const itemsRodalies = jsonRodalies.result?.items || [];
          const horarisRodalies = itemsRodalies.map(item => ({
            ...item,
            departsAtOrigin: item.departsAtOrigin?.substring(0, 5) || item.departsAtOrigin,
            arrivesAtDestination: item.arrivesAtDestination?.substring(0, 5) || item.arrivesAtDestination,
            duration: item.duration?.substring(0, 5) || item.duration,
            tipusTren: item.tipusTren || "Rodalies",
          }));

          // Consulta AVE
          let dateParts = dataSeleccionadaFinal.split('-');
          let dataAve = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
          const resAve = await fetch(`/api/horaris/ave?date=${dataAve}`);
          let horarisAve = [];
          if (resAve.ok) {
            const dataAveJson = await resAve.json();
            const trens = dataAveJson.infoTrenIda || [];
            const formatHora = (h) => h && h.length === 4 ? `${h.slice(0,2)}:${h.slice(2)}` : h || "-";
            horarisAve = trens
              .filter(tren => {
                if (!tren.horaSalida || tren.horaSalida.length !== 4) return false;
                const horaSortida = parseInt(tren.horaSalida.slice(0,2), 10);
                return horaSortida >= hora;
              })
              .map((tren) => {
                // Convertim duracionTotal de "0h39m" a minuts
                let minuts = "-";
                if (tren.duracionTotal) {
                  const match = tren.duracionTotal.match(/(?:(\d+)h)?(\d+)m/);
                  if (match) {
                    const h = parseInt(match[1] || "0", 10);
                    const m = parseInt(match[2] || "0", 10);
                    minuts = (h * 60 + m).toString();
                  }
                }
                return {
                  departsAtOrigin: formatHora(tren.horaSalida),
                  arrivesAtDestination: formatHora(tren.horaLlegada),
                  duration: minuts,
                  tipusTren: tren.tipoTren?.descTipoTren || "AVE",
                };
              });
          }

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
          if (res.status === 504  || res.status >= 500) {
            setErrorServidor(true);
            setHoraris([]);
            return;
          }
          const json = await res.json();
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
      
      {carregant ? (
        <div className={styles.loadingMessage}>
          Carregant...
        </div>
      ) : errorServidor ? (
        <div className={styles.errorMessage}>
          Servei temporalment no disponible
        </div>
      ) : (
        horaris.length > 0 && (
          <Horaris horaris={horaris} idOrigen={origen} idDesti={desti} />
        )
      )}
    </main>
  );
}