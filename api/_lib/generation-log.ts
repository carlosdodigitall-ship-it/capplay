type GenerationKind = "image" | "text";
type GenerationStatus = "pending" | "succeeded" | "failed";

const supabaseUrl = () => process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function startGenerationLog(kind: GenerationKind, model: string): Promise<string | null> {
  const url = supabaseUrl();
  const key = serviceKey();
  if (!url || !key) {
    console.error("Generation log unavailable: configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.");
    return null;
  }
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/generation_logs`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify([{ kind, status: "pending" as GenerationStatus, provider: "openai", model }]),
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) {
    console.error("Could not create generation log", { status: response.status });
    return null;
  }
  const rows = await response.json() as Array<{ id?: string }>;
  return rows[0]?.id || null;
}

export async function finishGenerationLog(
  id: string | null,
  status: Exclude<GenerationStatus, "pending">,
  durationMs: number,
  errorCode?: string
): Promise<boolean> {
  if (!id) return false;
  const url = supabaseUrl();
  const key = serviceKey();
  if (!url || !key) return false;
  const response = await fetch(
    `${url.replace(/\/$/, "")}/rest/v1/generation_logs?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        status,
        duration_ms: Math.max(0, Math.round(durationMs)),
        error_code: errorCode?.slice(0, 80) || null,
        finished_at: new Date().toISOString()
      }),
      signal: AbortSignal.timeout(8000)
    }
  );
  if (!response.ok) console.error("Could not finish generation log", { status: response.status });
  return response.ok;
}
