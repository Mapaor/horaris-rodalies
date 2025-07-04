'use client';

import { useState } from 'react';
import Formulari from './components/formulari';
import Horaris from './components/horaris';

export default function Home() {
  const [dadesConsulta, setDadesConsulta] = useState(null);
  const [horaris, setHoraris] = useState([]);

  const obtenirHoraris = async (params) => {
  setDadesConsulta(params);

    const res = await fetch('/api/horaris', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const json = await res.json();
    setHoraris(json.result?.items || []);
  };


  return (
    <main>
      <h1>Consulta d'Horaris Rodalies</h1>
      <Formulari onSubmit={obtenirHoraris} />
      {horaris.length > 0 && <Horaris horaris={horaris} />}
    </main>
  );
}