import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting enhance-product function');
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header from request
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      supabase.auth.setSession({
        access_token: authHeader.replace('Bearer ', ''),
        refresh_token: ''
      });
    }

    const { title, description } = await req.json();
    console.log('Request data:', { title, description });

    // Get Gemini API key from settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'gemini_api_key')
      .single();

    if (settingsError) {
      console.error('Error fetching API key:', settingsError);
      throw new Error('Clé API Gemini non configurée');
    }

    const geminiApiKey = settingsData?.value;
    if (!geminiApiKey) {
      throw new Error('Clé API Gemini non configurée');
    }

    console.log('Gemini API key found');

    // Enhanced prompt for better product descriptions
    const enhancementPrompt = `
Tu es un expert en e-commerce et marketing. Améliore ces informations de produit en français pour une boutique en ligne au Cameroun.

Titre actuel: "${title}"
Description actuelle: "${description}"

Instructions:
1. Crée un titre accrocheur et professionnel en français (maximum 80 caractères)
2. Écris une description détaillée et attractive en français (150-300 mots)
3. Génère 5-8 mots-clés pertinents en français
4. Crée 3-5 synonymes ou termes alternatifs en français

Réponds uniquement en JSON avec cette structure exacte:
{
  "title": "titre amélioré",
  "description": "description améliorée",
  "keywords": ["mot1", "mot2", "mot3"],
  "synonyms": ["synonyme1", "synonyme2", "synonyme3"]
}
`;

    // Call Gemini API
    console.log('Calling Gemini API...');
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: enhancementPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Erreur API Gemini: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini response received');

    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Réponse API Gemini invalide');
    }

    const responseText = geminiData.candidates[0].content.parts[0].text;
    console.log('Gemini response text:', responseText);

    // Parse JSON response
    let enhancedData;
    try {
      // Clean the response text (remove markdown formatting if any)
      const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      enhancedData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText);
      throw new Error('Erreur lors de l\'analyse de la réponse IA');
    }

    // Validate the response structure
    if (!enhancedData.title || !enhancedData.description) {
      throw new Error('Réponse IA incomplète');
    }

    console.log('Enhanced data:', enhancedData);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          title: enhancedData.title || title,
          description: enhancedData.description || description,
          keywords: Array.isArray(enhancedData.keywords) ? enhancedData.keywords : [],
          synonyms: Array.isArray(enhancedData.synonyms) ? enhancedData.synonyms : []
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in enhance-product function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur lors de l\'amélioration avec l\'IA' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});