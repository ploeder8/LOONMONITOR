export const config = {
  runtime: "edge",
};

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const nummer = String(url.searchParams.get("nummer") || "").replace(/\D/g, "");

  if (!/^\d{10}$/.test(nummer)) {
    return new Response("Ongeldig ondernemingsnummer", { status: 400 });
  }

  try {
    const response = await fetch(`https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html?nummer=${nummer}&actionLu=Zoek`, {
      headers: { "user-agent": "Jaakie Loonmotor" },
    });
    const html = await response.text();
    return new Response(html, {
      status: response.ok ? 200 : response.status,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "onbekende fout";
    return new Response(`KBO kon niet opgehaald worden: ${message}`, { status: 502 });
  }
}
