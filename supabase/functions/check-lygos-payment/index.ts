import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const LYGOS_PAYIN_URL = "https://api.lygosapp.com/v1/gateway/payin";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();

    console.log('Checking Lygos payment status for order:', order_id);

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

    // Vérifier le statut du paiement
    const statusResponse = await fetch(`${LYGOS_PAYIN_URL}/${order_id}`, {
      method: 'GET',
      headers: {
        'api-key': lygosApiKey
      }
    });

    const statusData = await statusResponse.json();
    console.log('Lygos payment status response:', statusData);

    if (!statusResponse.ok) {
      throw new Error(`Erreur Lygos API: ${statusData.message || 'Erreur inconnue'}`);
    }

    // Mettre à jour le statut de la commande si le paiement est confirmé
    if (statusData.status === 'completed' || statusData.status === 'success') {
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order_id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'confirmed',
          payment_status: 'paid'
        })
      });

      if (!updateResponse.ok) {
        console.error('Failed to update order status');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: statusData.status,
        order_id: statusData.order_id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error checking Lygos payment status:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur lors de la vérification du paiement'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});