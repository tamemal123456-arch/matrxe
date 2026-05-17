import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (_req: Request) => {
  const start = performance.now()

  try {
    const envOk = !!(Deno.env.get("SUPABASE_URL") && Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))
    const decodeOk = typeof new TextDecoder().decode === "function"
    const elapsed = performance.now() - start

    const checks = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: performance.now(),
      environment: envOk ? "ok" : "missing variables",
      encoding: decodeOk ? "ok" : "failed",
      response_time_ms: Math.round(elapsed),
      version: "1.0.0",
    }

    const allOk = envOk && decodeOk

    return new Response(JSON.stringify(checks, null, 2), {
      status: allOk ? 200 : 503,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
        "X-Health-Check": "true",
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ status: "error", error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
