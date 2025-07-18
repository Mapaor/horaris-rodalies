// Next.js 13+ (Route Handler API)

export async function POST(req) {
  try {
    const { origen, desti, data, hora } = await req.json();

    const url = `https://serveisgrs.rodalies.gencat.cat/api/timetables?lang=ca&fullResponse=true&originStationId=${origen}&destinationStationId=${desti}&travelingOn=${data}&fromTime=${hora}`;
    const res = await fetch(url);

    const text = await res.text();
    console.log('Rodalies API status:', res.status);
    console.log('Rodalies API body:', text);

    // Intenta parsejar el cos com a JSON
    let dataJson;
    try {
      dataJson = JSON.parse(text);
    } catch (e) {
      dataJson = { error: 'Resposta no JSON', raw: text };
    }

    // Si la resposta indica "no queden trens", retorna status 200
    if (
      dataJson &&
      dataJson.code === "error.renfe.unavailable_data" &&
      Array.isArray(dataJson.args) &&
      dataJson.args.length === 1 &&
      dataJson.args[0] === null
    ) {
      return new Response(JSON.stringify(dataJson), { status: 200 });
    }

    // Retorna el cos i el status original
    return new Response(JSON.stringify(dataJson), { status: res.status });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Error intern al servidor', details: e.message }), {
      status: 500,
    });
  }
}
