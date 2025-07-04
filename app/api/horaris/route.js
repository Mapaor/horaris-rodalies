// Next.js 13+ (Route Handler API)

export async function POST(req) {
  try {
    const { origen, desti, data, hora } = await req.json();

    const url = `https://serveisgrs.rodalies.gencat.cat/api/timetables?lang=ca&fullResponse=true&originStationId=${origen}&destinationStationId=${desti}&travelingOn=${data}&fromTime=${hora}`;
    const res = await fetch(url);

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Error a la resposta externa' }), { status: 500 });
    }

    const dataJson = await res.json();
    return new Response(JSON.stringify(dataJson), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Error intern al servidor', details: e.message }), {
      status: 500,
    });
  }
}
