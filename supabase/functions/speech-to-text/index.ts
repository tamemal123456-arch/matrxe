// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getBestKey, buildChatUrl, buildAuthHeader } from "../_shared/api-key-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function tryTranscribeWithGoogle(audio: string, mimeType: string, apiKey: string): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const fmt = mimeType?.includes("wav") ? "wav" : mimeType?.includes("mp3") ? "mp3" : "webm";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { text: "Transcribe this audio exactly as spoken. Return ONLY the transcribed text, nothing else. If Arabic, return Arabic. If English, return English." },
            { inline_data: { mime_type: mimeType || "audio/webm", data: audio } },
          ],
        }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch { return null; }
}

async function tryTranscribeWithWhisper(audio: string, mimeType: string, baseUrl: string, apiKey: string): Promise<string | null> {
  try {
    const audioBytes = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
    const form = new FormData();
    form.append("model", "whisper-large-v3");
    form.append("file", new Blob([audioBytes], { type: mimeType || "audio/webm" }), `audio.${mimeType?.includes("wav") ? "wav" : mimeType?.includes("mp3") ? "mp3" : "webm"}`);
    form.append("response_format", "json");
    const res = await fetch(`${baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.text?.trim() || null;
  } catch { return null; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentLength = Number(req.headers.get("content-length") || "0");
    if (contentLength > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Audio payload too large (max 10MB)" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { audio, mime_type } = await req.json();

    if (typeof audio === "string" && audio.length > 10_000_000) {
      return new Response(
        JSON.stringify({ error: "Audio payload too large" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!audio) {
      return new Response(
        JSON.stringify({ error: "Audio data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try Google Gemini first (supports audio input natively)
    const googleKey = Deno.env.get("GOOGLE_API_KEY");
    if (googleKey) {
      const text = await tryTranscribeWithGoogle(audio, mime_type, googleKey);
      if (text) {
        return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Try DeepSeek or any OpenAI-compatible with Whisper
    const tried = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const key = await getBestKey("chat", undefined, tried);
      if (!key) break;
      tried.add(key.provider);
      if (key.provider === "deepseek" || key.provider === "openrouter" || key.provider === "groq" || key.provider === "openai") {
        const text = await tryTranscribeWithWhisper(audio, mime_type, key.base_url, key.key);
        if (text) {
          return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
    }

    return new Response(
      JSON.stringify({ error: "No AI provider available for transcription. Configure GOOGLE_API_KEY or OPENAI_API_KEY." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Speech-to-text error:", error);
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
