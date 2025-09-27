import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Call the is_admin_user RPC function with the user's ID.
    const { data: isAdmin, error: isAdminError } = await adminClient.rpc('is_admin_user', {
      user_uuid: user.id
    });

    if (isAdminError || !isAdmin) {
      const error_message = isAdminError ? isAdminError.message : 'User is not an admin.';
      return new Response(JSON.stringify({ error: `Permission denied: ${error_message}` }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const settingsToSave = await req.json();

    if (!Array.isArray(settingsToSave)) {
        return new Response(JSON.stringify({ error: 'Invalid request body. Expected an array of settings.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { error: upsertError } = await adminClient
      .from('settings')
      .upsert(settingsToSave, { onConflict: 'key' });

    if (upsertError) {
      throw upsertError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in update-settings function:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})