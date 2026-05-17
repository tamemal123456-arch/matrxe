export function captureError(context: string, error: unknown, extra?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(JSON.stringify({
    level: "error",
    timestamp,
    context,
    message,
    stack,
    extra,
  }));

  try {
    const sentryDsn = Deno.env.get("SENTRY_DSN");
    if (sentryDsn) {
      const projectId = sentryDsn.split("/").pop()?.split("?")[0] || "";
      const publicKey = sentryDsn.split("@")[0]?.split("//")[1] || "";
      const body = JSON.stringify({
        event_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        level: "error",
        logger: context,
        message: { formatted: message },
        exception: { values: [{ type: error instanceof Error ? error.constructor.name : "Error", value: message, stacktrace: stack ? { frames: [{ filename: stack }] } : undefined }] },
        extra: extra || {},
        platform: "javascript",
      });
      fetch(`https://o${publicKey}.ingest.us.sentry.io/api/${projectId}/store/`, {
        method: "POST", body, headers: { "Content-Type": "application/json" },
      }).catch(() => {});
    }
  } catch { /* silent */ }
}

export function withErrorHandler(handler: (req: Request) => Promise<Response>, context: string) {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      captureError(context, error, { url: req.url, method: req.method });
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  };
}
