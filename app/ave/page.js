'use client';
// const aveServeiId = 23190;
// const data_viaje = "18-07-2025";

// // Convert date from "dd-mm-yyyy" to "yyyy-mm-dd"
// const [day, month, year] = data_viaje.split("-");
// const data_viaje_iso = `${year}-${month}-${day}`;

// // Build JSON and encode
// const data_json = `[{"date":"${data_viaje_iso}"},{"selects":[{"${aveServeiId}":"1"}]}]`;
// const data_param = encodeURIComponent(data_json);

// // Build URL
// const renfeUrl =
//     `https://renfeviajes.renfe.com/es/CompraDestino/9799` +
//     `?dateFrom=${data_viaje}&dateTo=${data_viaje}` +
//     `&departureStation=112&destinationStation=105` +
//     `&numTicketsAdults=1&numTicketsChildren=0&numTicketsBabies=0` +
//     `&soloIda=true&data=${data_param}` +
//     `&showPriceTrain=false&allTrains=true`;

// console.log(`🔗 URL Renfe: ${renfeUrl}`);

const dataViatge = "18-07-2025"; // Data del viatge
const estacionsIDs ={
    'Girona': 79300,
    'Sants': 71801
}
const cookiesValides = {
    1: 'cbbf66f9fecc04df48807fee88c78aa1',
    2: '6601a72d2f08df79a93d22844ed24064'
}

const urlAPI = 
`https://resttrain.renfeviajes.renfe.com/RenfeAPI/queryNewAPIProceso?` +
`query[departureStation]=${estacionsIDs['Girona']}&query[destinationStation]=${estacionsIDs['Sants']}` +
`&query[dateFrom]=${dataViatge}` +
`&query[numTicketsAdults]=1&query[numTicketsChildren]=0&query[numTicketsBabies]=0` +
`&query[idaVuelta]=soloIda&query[idProducto]=2451&query[paqueteId]=9987&query[idPaquete]=9987` +
`&query[cookie]=${cookiesValides[1]}`;


import React, { useEffect, useState } from "react";
import Horaris from "../components/horaris";
import styles from "../page.module.css";
import "../globals.css";

export default function AvePage() {
  const [trens, setTrens] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/horaris/ave")
      .then((res) => {
        if (!res.ok) throw new Error("Error en la resposta de l'API");
        return res.json();
      })
      .then((data) => {
        console.log("JSON obtingut:", data);
        if (!data.infoTrenIda) {
          setError("No s'ha trobat infoTrenIda en la resposta");
          return;
        }
        setTrens(data.infoTrenIda);
      })
      .catch((err) => setError(err.message));
  }, []);

  // Format hora tipus "0546" → "05:46"
  const formatHora = (h) => h && h.length === 4 ? `${h.slice(0,2)}:${h.slice(2)}` : h || "-";

  // Transformació al format esperat per la component Horaris
  const horaris = trens.map((tren) => ({
    departsAtOrigin: formatHora(tren.horaSalida),
    arrivesAtDestination: formatHora(tren.horaLlegada),
    duration: tren.duracionTotal || "-",
    tipusTren: tren.tipoTren?.descTipoTren || "-",
  }));

  return (
    <main className={styles.main}>
      <h1 className={styles.titolPrincipal}>Horaris AVE</h1>
      <h2 className={styles.routeTitle}>Girona → Sants</h2>
      {error && <div className={styles.errorMessage}>Error: {error}</div>}
      <Horaris horaris={horaris} idOrigen={estacionsIDs['Girona']} idDesti={estacionsIDs['Sants']} />
    </main>
  );
}