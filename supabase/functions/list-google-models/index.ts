import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

serve(async (_req: Request) => {
  console.log("--- list-google-models (simplified) function started ---");

  if (_req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = "AIzaSyBtaM4OXsfCQnNuVEc1p0K6K1W-_CEv_kQ";

    if (!apiKey) {
      throw new Error("Gemini API key is not configured.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = await genAI.listModels();
    
    const modelList = [];
    for await (const m of models) {
      modelList.push(m);
    }

    console.log("--- Successfully listed models ---");
    return new Response(JSON.stringify(modelList), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("--- Fatal error in list-google-models:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});