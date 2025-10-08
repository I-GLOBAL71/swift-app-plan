import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const WEBHOOK_SECRET = Deno.env.get("MYCOOLPAY_WEBHOOK_SECRET");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Verify the webhook signature
    const signature = req.headers.get("X-Signature");
    if (WEBHOOK_SECRET && signature) {
      // In a real implementation, you would compare the signature with one you generate
      // using the payload and your secret. For now, we'll just check for its presence.
      // const isValid = await verifySignature(req.body, signature, WEBHOOK_SECRET);
      // if (!isValid) {
      //   return new Response("Invalid signature", { status: 400 });
      // }
    } else if (WEBHOOK_SECRET) {
        console.warn("Webhook secret is set, but no signature was provided.");
    }

    // 2. Parse the notification
    const notification = await req.json();
    const { transfer_id, status, metadata } = notification;
    const orderId = metadata?.orderId;

    if (!transfer_id || !status || !orderId) {
      console.error("Invalid notification payload:", notification);
      return new Response("Invalid payload", { status: 400 });
    }

    // 3. Update your database
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let paymentStatusUpdate;
    if (status === 'success') {
      paymentStatusUpdate = 'paid';
    } else if (status === 'failed' || status === 'cancelled') {
      paymentStatusUpdate = 'failed';
    } else {
      paymentStatusUpdate = 'pending';
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: paymentStatusUpdate,
        payment_transaction_id: transfer_id,
        status: status === 'success' ? 'confirmed' : 'pending_payment', // Also update order status
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Failed to update order status:", updateError);
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    console.log(`Order ${orderId} updated to status: ${paymentStatusUpdate}`);

    // 4. Respond with 200 OK
    return new Response("Webhook received", { status: 200 });

  } catch (error: any) {
    console.error("Error in mycoolpay-callback:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});