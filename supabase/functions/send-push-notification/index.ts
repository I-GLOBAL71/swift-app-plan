import { createClient } from "@supabase/supabase-js";
import admin from "firebase-admin";
import { corsHeaders } from "../_shared/cors.ts";

const serviceAccountKey = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_KEY');
if (!serviceAccountKey) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not defined.");
}
const serviceAccount = JSON.parse(serviceAccountKey);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { title, body, imageUrl } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: tokens, error } = await supabaseClient.from('fcm_tokens').select('token');

    if (error) {
      throw new Error(`Error fetching tokens: ${error.message}`);
    }

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ message: 'No registered devices to send notifications to.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const registrationTokens = tokens.map((t: { token: string }) => t.token);

    const message = {
      notification: {
        title,
        body,
      },
      webpush: {
        notification: {
          image: imageUrl,
        },
      },
      tokens: registrationTokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log('Successfully sent message:', response);

    return new Response(JSON.stringify({ success: true, response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    const error = e as Error;
    console.error('Error sending notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
