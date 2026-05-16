// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { createClient } from "jsr:@supabase/supabase-js@2";

interface ApiKeyRow {
  id: string;
  service_name: string;
  provider: string;
  tier: "free" | "paid";
  api_key_encrypted: string;
  base_url: string | null;
  is_active: boolean;
  usage_count: number;
  monthly_limit: number | null;
}

interface ResolvedKey {
  id: string;
  key: string;
  provider: string;
  service_name: string;
  tier: "free" | "paid";
  base_url: string;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ENCRYPTION_KEY = Deno.env.get("API_KEY_ENCRYPTION_KEY") || "matrxe-default-dev-key-change-in-production-!!";

const PROVIDER_BASE_URLS: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
  google: "https://generativelanguage.googleapis.com/v1beta",
  deepseek: "https://api.deepseek.com/v1",
  kimi: "https://api.moonshot.cn/v1",
  groq: "https://api.groq.com/openai/v1",
  together: "https://api.together.xyz/v1",
  anthropic: "https://api.anthropic.com/v1",
  elevenlabs: "https://api.elevenlabs.io/v1",
};

const PROVIDER_PRIORITY: Record<string, string[]> = {
  chat: ["google", "openrouter", "groq", "deepseek", "kimi", "openai"],
  image: ["google", "openrouter", "openai"],
  tts: ["elevenlabs"],
  embedding: ["openai", "google"],
};

function getEncoder(): TextEncoder { return new TextEncoder(); }
function getDecoder(): TextDecoder { return new TextDecoder(); }

async function getCryptoKey(usage: "encrypt" | "decrypt"): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    getEncoder().encode(ENCRYPTION_KEY.padEnd(32, "x").slice(0, 32)),
    { name: "AES-GCM" },
    false,
    [usage],
  );
  return keyMaterial;
}

export async function encryptKey(plaintext: string): Promise<string> {
  const key = await getCryptoKey("encrypt");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = getEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptKey(encoded: string): Promise<string> {
  const key = await getCryptoKey("decrypt");
  const combined = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return getDecoder().decode(decrypted);
}

export async function getBestKey(
  serviceCategory: string,
  userId?: string,
  excludeProviders?: Set<string>,
): Promise<ResolvedKey | null> {
  const priorities = PROVIDER_PRIORITY[serviceCategory] || ["openrouter"];

  // 1. Try user's own keys from DB (free first, then paid)
  if (userId) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    for (const provider of priorities) {
      if (excludeProviders?.has(provider)) continue;
      const { data: keys } = await supabase
        .from("user_api_keys")
        .select("*")
        .eq("user_id", userId)
        .eq("provider", provider)
        .eq("is_active", true)
        .order("tier", { ascending: true })
        .order("usage_count", { ascending: true });

      if (!keys?.length) continue;

      for (const row of keys as ApiKeyRow[]) {
        if (row.monthly_limit !== null && row.monthly_limit > 0 && row.usage_count >= row.monthly_limit) continue;
        try {
          const decrypted = await decryptKey(row.api_key_encrypted);
          await supabase
            .from("user_api_keys")
            .update({ usage_count: row.usage_count + 1, last_used_at: new Date().toISOString() })
            .eq("id", row.id);
          return {
            id: row.id, key: decrypted, provider: row.provider,
            service_name: row.service_name, tier: row.tier,
            base_url: row.base_url || PROVIDER_BASE_URLS[row.provider] || "",
          };
        } catch { continue; }
      }
    }
  }

  // 2. Try system env var keys (built-in free tier - DeepSeek, etc.)
  for (const provider of priorities) {
    if (excludeProviders?.has(provider)) continue;
    const envKey = Deno.env.get(`${provider.toUpperCase()}_API_KEY`);
    if (envKey) {
      return {
        id: "system",
        key: envKey,
        provider,
        service_name: "system",
        tier: "free",
        base_url: PROVIDER_BASE_URLS[provider] || "",
      };
    }
  }

  return null;
}

export async function getKeyForService(
  provider: string,
  userId: string,
): Promise<ResolvedKey | null> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: rows, error } = await supabase
    .from("user_api_keys")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", provider)
    .eq("is_active", true)
    .order("tier", { ascending: true })
    .limit(1);

  if (error || !rows?.length) return null;

  const row = rows[0] as ApiKeyRow;
  if (row.monthly_limit !== null && row.monthly_limit > 0 && row.usage_count >= row.monthly_limit) {
    return null;
  }
  try {
    const decrypted = await decryptKey(row.api_key_encrypted);
    await supabase
      .from("user_api_keys")
      .update({ usage_count: row.usage_count + 1, last_used_at: new Date().toISOString() })
      .eq("id", row.id);
    return {
      id: row.id,
      key: decrypted,
      provider: row.provider,
      service_name: row.service_name,
      tier: row.tier,
      base_url: row.base_url || PROVIDER_BASE_URLS[row.provider] || "",
    };
  } catch {
    return null;
  }
}

export async function getSystemKey(provider: string): Promise<string | null> {
  const key = Deno.env.get(`${provider.toUpperCase()}_API_KEY`);
  return key || null;
}

export function buildChatUrl(provider: string, baseUrl: string, model?: string): string {
  if (provider === "google") {
    const googleModel = model ? model.replace("google/", "") : "gemini-2.5-flash";
    return `${baseUrl}/models/${googleModel}:generateContent?key=`;
  }
  return `${baseUrl}/chat/completions`;
}

export function buildAuthHeader(provider: string, key: string): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (provider === "google") return headers;
  if (provider === "anthropic") {
    headers["x-api-key"] = key;
    headers["anthropic-version"] = "2023-06-01";
  } else {
    headers["Authorization"] = `Bearer ${key}`;
  }
  return headers;
}

export function buildRequestBody(
  provider: string,
  model: string,
  messages: any[],
  extra: any = {},
): any {
  if (provider === "google") {
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : m.role,
      parts: [{ text: m.content }],
    }));
    return { contents, ...extra };
  }
  return { model, messages, ...extra };
}

export function parseAIResponse(provider: string, data: any): string {
  if (provider === "google") {
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
  if (provider === "anthropic") {
    return data?.content?.[0]?.text || "";
  }
  return data?.choices?.[0]?.message?.content || "";
}
