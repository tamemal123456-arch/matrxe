// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formData = await req.formData();
    const voiceName = formData.get("name") as string;
    const description = formData.get("description") as string || "Digital Twin Voice";
    
    // Get all audio files from the form
    const audioFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("audio_") && value instanceof File) {
        audioFiles.push(value);
      }
    }

    if (!voiceName) {
      return new Response(
        JSON.stringify({ error: "Voice name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (audioFiles.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one audio file is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Cloning voice "${voiceName}" with ${audioFiles.length} audio samples`);

    // Prepare the form data for ElevenLabs API
    const elevenLabsFormData = new FormData();
    elevenLabsFormData.append("name", voiceName);
    elevenLabsFormData.append("description", description);
    
    // Add all audio files
    for (const audioFile of audioFiles) {
      elevenLabsFormData.append("files", audioFile);
    }

    // Call ElevenLabs Voice Cloning API
    const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: elevenLabsFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      
      // Parse error for better messaging
      let errorMessage = "Failed to clone voice";
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail?.message) {
          errorMessage = errorJson.detail.message;
        } else if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        // Use default error message
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    console.log("Voice cloned successfully:", result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        voice_id: result.voice_id,
        message: "Voice cloned successfully" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Clone voice error:", error);
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
