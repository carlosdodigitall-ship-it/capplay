import type { VercelRequest, VercelResponse } from "@vercel/node";

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
  const prompt = clean(body?.prompt, 3000);
  const ratio = clean(body?.ratio, 8);
  if (prompt.length < 8) return res.status(400).json({ error: "Descreva a imagem com pelo menos 8 caracteres." });
  const size = ratio === "16:9" || ratio === "3:2" ? "1536x1024" : ratio === "9:16" || ratio === "4:5" ? "1024x1536" : "1024x1024";
  const ip = requestIp(req);
  if (!allowRequest(ip)) return res.status(429).json({ error: "Muitas solicitações deste endereço. Aguarde um minuto e tente novamente." });

  try {
    const upstream = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
        prompt: `Create a polished, professional marketing image. Aspect ratio requested: ${ratio || "1:1"}. Prompt: ${prompt}`,
        size,
        n: 1
      }),
      signal: AbortSignal.timeout(90000)
    });
    const data = await upstream.json() as any;
    if (!upstream.ok) {
      console.error("OpenAI image provider error", { status: upstream.status, code: data?.error?.code || "provider_error" });
      return res.status(upstream.status === 429 ? 429 : 502).json({ error: "O provedor de imagens não concluiu a solicitação. Verifique permissões, saldo e modelo." });
    }
    const image = data?.data?.[0]?.b64_json;
    if (typeof image !== "string" || !image) return res.status(502).json({ error: "O provedor não retornou uma imagem em formato compatível." });
    return res.status(200).json({ image: `data:image/png;base64,${image}`, provider: "openai", model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1" });
  } catch (error) {
    console.error("Image generation request failed", error instanceof Error ? error.name : "unknown");
    return res.status(504).json({ error: "Tempo limite atingido ao gerar a imagem. Tente novamente." });
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
  return current.count <= 3;
}
