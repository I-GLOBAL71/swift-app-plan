import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Helper function to convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const signature = req.headers.get("x-mycoolpay-signature");
    const privateKey = Deno.env.get("MYCOOLPAY_PRIVATE_KEY");

    if (!privateKey) {
      throw new Error("MYCOOLPAY_PRIVATE_KEY is not set.");
    }

    const toSign = `${privateKey}|${payload.transaction_ref}|${payload.status}`;
    
    // Use Web Crypto API for MD5 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(toSign);
    const hashBuffer = await crypto.subtle.digest("MD5", data);
    const digest = bufferToHex(hashBuffer);

    if (digest !== signature) {
      console.warn("Invalid signature", { digest, signature });
      return new Response("KO", { status: 400 });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (payload.status === "SUCCESS" || payload.status === "COMPLETED") {
      // The 'reference' from CoolPay is our 'orderId'
      const { error } = await supabaseClient
        .from("orders")
        .update({ status: "confirmed" })
        .eq("id", payload.reference);

      if (error) {
        console.error("Error updating order status:", error);
        // Still return OK to My-CoolPay, but log the error for debugging
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Callback error:", error);
    return new Response("KO", { status: 500 });
  }
});