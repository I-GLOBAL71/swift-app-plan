import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const MYCOOLPAY_API_BASE = "https://my-coolpay.com";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) {
      throw new Error("Order ID is required.");
    }

    // 1. Get secrets and config
    const publicKey = Deno.env.get("MYCOOLPAY_PUBLIC_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const siteUrl = Deno.env.get("SITE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!publicKey || !supabaseUrl || !siteUrl || !serviceRoleKey) {
      throw new Error("Server configuration error: Missing environment variables.");
    }

    // 2. Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 3. Fetch order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("total_amount, customer_name, customer_phone, customer_email")
      .eq("id", orderId)
      .single();

    if (orderError) throw orderError;
    if (!order) throw new Error("Order not found.");

    // 4. Construct the payload for My-CoolPay paylink
    const payload = {
      transaction_amount: order.total_amount,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
    };

    // 5. Call the My-CoolPay API to generate a paylink
    const url = `${MYCOOLPAY_API_BASE}/api/${publicKey}/paylink`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`My-CoolPay API error: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();
    const paymentUrl = result?.payment_url;

    if (!paymentUrl) {
      throw new Error("Failed to retrieve payment URL from My-CoolPay.");
    }

    // 6. Return the payment link
    return new Response(JSON.stringify({ paymentUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in generate-payment-link function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});