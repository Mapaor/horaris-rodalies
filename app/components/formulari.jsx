'use client';

import { useState } from 'react';

export default function Formulari({ onSubmit }) {
  const [origen, setOrigen] = useState('79303');
  const [desti, setDesti] = useState('71801');
  const [data, setData] = useState('2025-07-04');
  const [hora, setHora] = useState('15');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ origen, desti, data, hora });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Estació origen:
        <input type="text" value={origen} onChange={(e) => setOrigen(e.target.value)} required />
      </label>
      <label>
        Estació destí:
        <input type="text" value={desti} onChange={(e) => setDesti(e.target.value)} required />
      </label>
      <label>
        Data:
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
      </label>
      <label>
        Hora (0-23):
        <input type="number" min="0" max="23" value={hora} onChange={(e) => setHora(e.target.value)} required />
      </label>
      <button type="submit">Consulta</button>
    </form>
  );
}