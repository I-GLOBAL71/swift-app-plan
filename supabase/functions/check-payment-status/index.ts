import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const MYCOOLPAY_API_BASE = "https://api.my-coolpay.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { transaction_ref } = await req.json();
    const publicKey = Deno.env.get("MYCOOLPAY_PUBLIC_KEY");

    if (!publicKey) {
      throw new Error("MYCOOLPAY_PUBLIC_KEY is not set.");
    }

    const url = `${MYCOOLPAY_API_BASE}/api/${publicKey}/checkStatus/${encodeURIComponent(transaction_ref)}`;

    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`My-CoolPay API error: ${response.status} ${errorBody}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});