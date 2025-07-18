
export async function GET(request) {
  // Obtenim la data del query param, si existeix
  const { searchParams } = new URL(request.url);
  const dataViatge = searchParams.get('date') || "18-07-2025";
  const estacionsIDs = {
    Girona: 79300,
    Sants: 71801,
  };
  const cookiesValides = {
    1: "cbbf66f9fecc04df48807fee88c78aa1",
    2: "6601a72d2f08df79a93d22844ed24064",
    3: "d2c521b778689e635a2a890a99416eaa"
  };

  const urlAPI =
    `https://resttrain.renfeviajes.renfe.com/RenfeAPI/queryNewAPIProceso?` +
    `query[departureStation]=${estacionsIDs["Girona"]}&query[destinationStation]=${estacionsIDs["Sants"]}` +
    `&query[dateFrom]=${dataViatge}` +
    `&query[numTicketsAdults]=1&query[numTicketsChildren]=0&query[numTicketsBabies]=0` +
    `&query[idaVuelta]=soloIda&query[idProducto]=2451&query[paqueteId]=9987&query[idPaquete]=9987` +
    `&query[cookie]=${cookiesValides[1]}`;

  try {
    const res = await fetch(urlAPI, {
      headers: {
        "Accept": "application/json",
      },
      // Si cal, pots afegir més headers aquí
    });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Error en la resposta de l'API externa" }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
