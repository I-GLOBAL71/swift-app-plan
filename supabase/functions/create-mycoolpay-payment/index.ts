import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const MYCOOLPAY_API_BASE = "https://my-coolpay.com/api";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, currency, description, sender, recipient, metadata, orderId } = await req.json();

    const apiKey = Deno.env.get("MYCOOLPAY_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    if (!apiKey) {
      throw new Error("Server configuration error: MYCOOLPAY_API_KEY is not set.");
    }
    if (!supabaseUrl) {
      throw new Error("Server configuration error: SUPABASE_URL is not available.");
    }

    const payload = {
      amount,
      currency,
      description,
      sender,
      recipient,
      callback_url: `${supabaseUrl}/functions/v1/mycoolpay-callback`,
      metadata: { ...metadata, orderId },
    };

    const response = await fetch(`${MYCOOLPAY_API_BASE}/transfers`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("My-CoolPay API error:", errorBody);
      throw new Error(`My-CoolPay API error: ${response.status} - ${JSON.stringify(errorBody)}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in create-mycoolpay-payment function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});