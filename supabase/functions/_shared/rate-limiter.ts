export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

export async function checkRateLimit(
  supabase: any,
  userId: string,
  endpoint: string,
  maxRequests = 60,
  windowSeconds = 60
): Promise<RateLimitResult> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_user_id: userId,
    p_endpoint: endpoint,
    p_max: maxRequests,
    p_window_seconds: windowSeconds,
  });
  if (error || !data) return { allowed: false, remaining: 0, resetIn: windowSeconds };
  return data as RateLimitResult;
}

export async function withRateLimit(
  supabase: any,
  userId: string,
  endpoint: string,
  handler: () => Promise<Response>,
  maxRequests = 60,
  windowSeconds = 60
): Promise<Response> {
  const result = await checkRateLimit(supabase, userId, endpoint, maxRequests, windowSeconds);
  if (!result.allowed) {
    return new Response(JSON.stringify({
      error: "Rate limit exceeded",
      retryAfter: result.resetIn,
    }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.resetIn),
        "X-RateLimit-Remaining": "0",
      },
    });
  }
  return handler();
}
