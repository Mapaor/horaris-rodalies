'use client';

import { useState, useEffect } from 'react';
import Horaris from './components/horaris';
import RouteSelector from './components/routeSelector';
import styles from './page.module.css';

export default function Home() {
  const [horaris, setHoraris] = useState([]);
  const [origen, setOrigen] = useState(71801); // Sants per defecte
  const [desti, setDesti] = useState(79303); // Flaca per defecte
  
  // Obtenir l'hora actual per defecte
  const horaActual = new Date().getHours();
  const [hora, setHora] = useState(horaActual);


  // Definició de les estacions disponibles
  const estacions = [
    { id: 79303, nom: 'Flaça' },
    { id: 79302, nom: 'Bordils' },
    { id: 79300, nom: 'Girona' },
    { id: 71801, nom: 'Sants' }
  ];

  const avui = new Date();
  const dataActual = avui.toISOString().split('T')[0]; // Format YYYY-MM-DD

  const obtenirHoraris = async () => {
    const res = await fetch('/api/horaris', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origen: origen,
        desti: desti,
        data: dataActual,
        hora: hora
      }),
    });

    const json = await res.json();
    const items = json.result?.items || [];
    
    // Formateja les hores eliminant els segons (19:36:00 -> 19:36)
    const horarisFormatejats = items.map(item => ({
      ...item,
      departsAtOrigin: item.departsAtOrigin?.substring(0, 5) || item.departsAtOrigin,
      arrivesAtDestination: item.arrivesAtDestination?.substring(0, 5) || item.arrivesAtDestination,
      duration: item.duration?.substring(0, 5) || item.duration
    }));
    
    setHoraris(horarisFormatejats);
  };

  // Funció per invertir origen i destí
  const invertirTrajecte = () => {
    const origenTemp = origen;
    setOrigen(desti);
    setDesti(origenTemp);
  };

  // Carregar horaris quan canviïn origen, destí o hora
  useEffect(() => {
    obtenirHoraris();
  }, [origen, desti, hora]);


  return (
    <main>
      <h1 className={styles.titolPrincipal}>R11 Rodalies</h1>
      
      <RouteSelector
        origen={origen}
        desti={desti}
        hora={hora}
        estacions={estacions}
        onOrigenChange={setOrigen}
        onDestiChange={setDesti}
        onHoraChange={setHora}
        onInvertirTrajecte={invertirTrajecte}
      />

      <h2 className={styles.routeTitle}>
        {estacions.find(e => e.id === origen)?.nom} → {estacions.find(e => e.id === desti)?.nom}
      </h2>
      
      {horaris.length > 0 && (
        <Horaris horaris={horaris} />
      )}
    </main>
  );
}