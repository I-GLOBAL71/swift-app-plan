/// &lt;reference types="https://deno.land/x/deno/cli/types/dts/index.d.ts" /&gt;
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const MYCOOLPAY_API_BASE = "https://my-coolpay.com";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("--- create-payment function invoked ---");

    const { amount, currency, reference, reason, customer, orderId } = await req.json();
    console.log("Request body parsed:", { amount, currency, reference, reason, customer, orderId });

    const publicKey = Deno.env.get("MYCOOLPAY_PUBLIC_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const siteUrl = Deno.env.get("SITE_URL");

    if (!publicKey) {
      console.error("MYCOOLPAY_PUBLIC_KEY is not set.");
      throw new Error("Server configuration error: MYCOOLPAY_PUBLIC_KEY is not set.");
    }
    if (!supabaseUrl) {
      console.error("SUPABASE_URL is not available.");
      throw new Error("Server configuration error: SUPABASE_URL is not available.");
    }
     if (!siteUrl) {
      console.error("SITE_URL is not set.");
      throw new Error("Server configuration error: SITE_URL is not set.");
    }
    console.log("Environment variables loaded successfully.");

    const payload = {
      transaction_amount: amount,
      reason,
      customer,
      callback_url: `${supabaseUrl}/functions/v1/payment-callback`,
      success_url: `${siteUrl}/order-confirmation?orderId=${orderId}`,
      cancel_url: `${siteUrl}/order-confirmation?orderId=${orderId}`
    };
    console.log("Payload for My-CoolPay:", payload);

    const url = `${MYCOOLPAY_API_BASE}/api/${publicKey}/paylink`;
    console.log("Requesting URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log(`My-CoolPay API response status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("My-CoolPay API error:", errorBody);
      throw new Error(`My-CoolPay API error: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();
    console.log("My-CoolPay API success response:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("--- Error in create-payment function ---");
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});