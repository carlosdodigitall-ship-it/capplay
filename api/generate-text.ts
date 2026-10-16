import type { VercelRequest, VercelResponse } from "@vercel/node";

const MAX_TEXT = 12000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido." });
  }
  if (process.env.CAPPLAY_GENERATION_ENABLED !== "true") {
    return res.status(503).json({ error: "A geração está desativada até concluir a configuração e a proteção de acesso no servidor." });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "OPENAI_API_KEY não foi configurada na Vercel." });

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body;
  if (!body || typeof body !== "object") return res.status(400).json({ error: "Corpo da requisição inválido." });
  const product = clean(body.product, 300);
  const audience = clean(body.audience, 300);
  const tone = clean(body.tone, 80);
  const goal = clean(body.goal, 80);
  const contentType = clean(body.contentType, 100);
  if (!product || product.length < 2) return res.status(400).json({ error: "Informe um produto ou serviço válido." });

  const ip = requestIp(req);
  if (!allowRequest(ip)) return res.status(429).json({ error: "Muitas solicitações deste endereço. Aguarde um minuto e tente novamente." });

  const input = [
    "Você é um redator profissional de marketing e comércio eletrônico. Responda em português brasileiro.",
    "Crie um conteúdo original, específico e útil. Não invente certificações, resultados, características ou garantias que não foram informadas.",
    `Tipo de conteúdo: ${contentType || "Descrição de produto"}`,
    `Produto ou serviço: ${product}`,
    `Público-alvo: ${audience || "Público geral"}`,
    `Tom de voz: ${tone || "Profissional"}`,
    `Objetivo: ${goal || "Vender"}`,
    "Use títulos e listas quando fizer sentido. Não inclua explicações sobre o processo."
  ].join("\n");

  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_TEXT_MODEL || "gpt-4.1-mini",
        messages: [{ role: "user", content: input }],
        temperature: 0.7,
        max_tokens: 1200
      }),
      signal: AbortSignal.timeout(45000)
    });
    const data = await upstream.json() as any;
    if (!upstream.ok) {
      console.error("OpenAI text provider error", { status: upstream.status, code: data?.error?.code || "provider_error" });
      return res.status(upstream.status === 429 ? 429 : 502).json({ error: "O provedor de texto não concluiu a solicitação. Verifique a conta, o modelo e os limites do provedor." });
    }
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) return res.status(502).json({ error: "O provedor retornou uma resposta vazia." });
    return res.status(200).json({ text: text.trim(), provider: "openai", model: data?.model || process.env.OPENAI_TEXT_MODEL || "gpt-4.1-mini" });
  } catch (error) {
    console.error("Text generation request failed", error instanceof Error ? error.name : "unknown");
    return res.status(504).json({ error: "Tempo limite atingido ao gerar o texto. Tente novamente." });
  }
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "";
}
function safeParse(value: string): any {
  try { return JSON.parse(value); } catch { return null; }
}
function requestIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return (raw || req.socket.remoteAddress || "unknown").slice(0, 100);
}
const requestWindow = new Map<string, { start: number; count: number }>();
function allowRequest(ip: string): boolean {
  const now = Date.now();
  const current = requestWindow.get(ip);
  if (!current || now - current.start > 60_000) {
    requestWindow.set(ip, { start: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= 5;
}
