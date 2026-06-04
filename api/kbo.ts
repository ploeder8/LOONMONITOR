import { cbeEnterpriseToKboHtml, extractCbeEnterprise } from "../src/lib/cbe";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const nummer = String(url.searchParams.get("nummer") || "").replace(/\D/g, "");

  if (!/^\d{10}$/.test(nummer)) {
    return new Response("Ongeldig ondernemingsnummer", { status: 400 });
  }

  const token = process.env.CBE_API_KEY;
  if (!token) {
    return new Response("CBE API configuratie ontbreekt: CBE_API_KEY.", { status: 500 });
  }

  try {
    const response = await fetch(`https://cbeapi.be/api/v1/company/${nummer}?lang=nl`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "user-agent": "Jaakie Loonmotor",
      },
    });

    if (!response.ok) {
      return new Response(`CBE API gaf geen bruikbare gegevens terug (status ${response.status}).`, {
        status: response.status,
      });
    }

    const enterprise = extractCbeEnterprise(await response.json());
    const html = cbeEnterpriseToKboHtml(enterprise);
    return new Response(html, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "onbekende fout";
    return new Response(`CBE API kon niet opgehaald worden: ${message}`, { status: 502 });
  }
}
