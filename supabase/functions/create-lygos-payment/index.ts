import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const LYGOS_API_URL = "https://api.lygosapp.com/v1/gateway";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, shop_name, message, success_url, failure_url, order_id } = await req.json();

    console.log('Creating Lygos payment for order:', order_id, 'amount:', amount);

    // Récupérer la clé API Lygos depuis Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const settingsResponse = await fetch(`${supabaseUrl}/rest/v1/settings?key=eq.lygos_api_key&select=value`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    });

    const settingsData = await settingsResponse.json();
    const lygosApiKey = settingsData[0]?.value;

    if (!lygosApiKey) {
      throw new Error('Clé API Lygos non configurée');
    }

    // Créer le paiement Lygos
    const paymentData = {
      amount: Math.round(amount), // Lygos attend un entier
      shop_name: shop_name || "Ma Boutique",
      message: message || `Commande #${order_id}`,
      success_url,
      failure_url,
      order_id: order_id
    };

    console.log('Sending payment request to Lygos:', paymentData);

    const lygosResponse = await fetch(LYGOS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': lygosApiKey
      },
      body: JSON.stringify(paymentData)
    });

    const responseData = await lygosResponse.json();
    console.log('Lygos API response:', responseData);

    if (!lygosResponse.ok) {
      throw new Error(`Erreur Lygos API: ${responseData.message || 'Erreur inconnue'}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: responseData.link,
        payment_id: responseData.id,
        order_id: responseData.order_id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error creating Lygos payment:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur lors de la création du paiement'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});