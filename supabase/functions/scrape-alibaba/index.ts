import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapedProduct {
  title: string;
  description: string;
  images: string[];
  price: string;
  variants?: any[];
}

interface RewriteRequest {
  content: string;
  type: 'title' | 'description' | 'keywords' | 'synonyms';
  prompt: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create two clients: a user-scoped client (for user context if needed) and an admin client (service role) for privileged reads like settings
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') || '' },
        },
      }
    )

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, url, rewriteData } = await req.json()

    if (action === 'scrape') {
      // Scraping logic for Alibaba
      const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
          }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch the page')
      }

      const html = await response.text()
      
      // Simple HTML parsing (in production, you'd want more robust parsing)
      const product: ScrapedProduct = {
        title: extractTitle(html),
        description: extractDescription(html),
        images: extractImages(html),
        price: extractPrice(html),
        variants: extractVariants(html)
      }

      return new Response(
        JSON.stringify({ success: true, product }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'rewrite') {
      // Get Gemini API key from settings
      let setting: { value?: string } | null = null;
      let readError: any = null;

      const userRead = await supabaseClient
        .from('settings')
        .select('value')
        .eq('key', 'gemini_api_key')
        .single();

      if (userRead.error) {
        readError = userRead.error;
      } else {
        setting = userRead.data;
      }

      if ((!setting || !setting.value) && Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
        const adminRead = await adminClient
          .from('settings')
          .select('value')
          .eq('key', 'gemini_api_key')
          .single();
        if (adminRead.error) readError = adminRead.error; else setting = adminRead.data;
      }

      if (!setting?.value) {
        const reason = readError ? ` (${readError.message})` : '';
        return new Response(
          JSON.stringify({ success: false, error: `Clé API Gemini manquante${reason}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // Get rewrite prompt from settings (try user client first)
      let promptSetting: { value?: string } | null = null;
      let promptReadError: any = null;

      const userPromptRead = await supabaseClient
        .from('settings')
        .select('value')
        .eq('key', `prompt_${rewriteData.type}`)
        .single();

      if (userPromptRead.error) {
        promptReadError = userPromptRead.error;
      } else {
        promptSetting = userPromptRead.data;
      }

      if ((!promptSetting || !promptSetting.value) && Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
        const adminPromptRead = await adminClient
          .from('settings')
          .select('value')
          .eq('key', `prompt_${rewriteData.type}`)
          .single();
        if (adminPromptRead.error) promptReadError = adminPromptRead.error; else promptSetting = adminPromptRead.data;
      }

      const prompt = promptSetting?.value || getDefaultPrompt(rewriteData.type)
      
      // Call Gemini API
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${setting.value}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${prompt}\n\nContenu original: ${rewriteData.content}`
            }]
          }]
        })
      })

      if (!geminiResponse.ok) {
        const txt = await geminiResponse.text().catch(() => '');
        throw new Error(`Gemini API error: ${geminiResponse.status} ${txt}`)
      }

      const geminiData = await geminiResponse.json()

      // Robust extraction of text from various Gemini response shapes
      const pickText = (d: any): string => {
        try {
          if (!d) return '';
          if (typeof d === 'string') return d.trim();
      
          const candidates = d.candidates || [];
          if (candidates.length > 0) {
            const content = candidates[0].content || {};
            const parts = content.parts || [];
            if (parts.length > 0) {
              return parts.map((p: any) => p.text || '').join('').trim();
            }
          }
          return '';
        } catch (e) {
          console.error('Error picking text:', e);
          return '';
        }
      }

      const rewrittenContent = pickText(geminiData)?.trim() || ''

      if (geminiData?.promptFeedback?.blockReason) {
        throw new Error(`Le prompt a été bloqué: ${geminiData.promptFeedback.blockReason}`);
      }

      if (!rewrittenContent) {
        console.error('Gemini returned empty content. Full response:', JSON.stringify(geminiData, null, 2));
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Le contenu généré par l\'IA est vide. La réponse de l\'API ne contenait pas de texte.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, content: rewrittenContent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Default response for unknown action
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('Caught an unhandled error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        error: 'An unhandled error occurred in the edge function.',
        details: errorMessage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                    html.match(/data-spm-anchor-id="[^"]*"[^>]*>([^<]+)</i) ||
                    html.match(/class="[^"]*product[^"]*title[^"]*"[^>]*>([^<]+)</i)
  return titleMatch?.[1]?.trim() || 'Titre non trouvé'
}

function extractDescription(html: string): string {
  const descMatch = html.match(/class="[^"]*description[^"]*"[^>]*>([^<]+)</i) ||
                   html.match(/data-role="description"[^>]*>([^<]+)</i) ||
                   html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i)
  return descMatch?.[1]?.trim() || 'Description non trouvée'
}

function extractImages(html: string): string[] {
  // Extraction des images principales du produit
  const mainImageMatches = html.match(/(?:data-src|src)="([^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/gi) || []
  const mainImages = mainImageMatches.map(match => {
    const url = match.match(/(?:data-src|src)="([^"]*)"/)?.[1]
    return url?.startsWith('//') ? `https:${url}` : url
  }).filter(Boolean) as string[]

  // Extraction des images de description et de galerie
  const galleryImageMatches = html.match(/https:\/\/[^"'\s,]+\.(jpg|jpeg|png|webp)(?:\?[^"'\s]*)?/gi) || []
  
  // Filtrer les images de petite taille et les doublons
  const allImages = [...mainImages, ...galleryImageMatches]
  const uniqueImages = [...new Set(allImages)]
    .filter(img => img && !img.includes('_50x50') && !img.includes('_60x60') && !img.includes('_100x100'))
    .slice(0, 20) // Limite à 20 images uniques
  
  return uniqueImages
}

function extractPrice(html: string): string {
  const priceMatch = html.match(/[\$€£¥₹]\s*[\d,.]+([\d,.])*/) ||
                    html.match(/US\s*\$\s*[\d,.]+/) ||
                    html.match(/Price[^:]*:\s*[\$€£¥₹]\s*[\d,.]+/i)
  return priceMatch?.[0] || 'Prix non trouvé'
}

function extractVariants(html: string): any[] {
  // Simple variant extraction - can be enhanced
  return []
}

function getDefaultPrompt(type: string): string {
  const prompts = {
    title: "Réécris ce titre de produit pour un site e-commerce. Le nouveau titre doit être en français, contenir entre 4 et 6 mots, être percutant, et optimisé pour le SEO. Ne fournis qu'une seule et unique proposition de titre, sans aucune explication, commentaire ou option supplémentaire. Le résultat doit être uniquement le titre réécrit.",
    description: "Réécris cette description de produit pour un site e-commerce. La nouvelle description doit être en français, détaillée, engageante, et mettre en avant les avantages et caractéristiques principales. Ne fournis qu'une seule et unique proposition de description, sans aucune explication, commentaire ou option supplémentaire. Le résultat doit être uniquement la description réécrite.",
    keywords: "Génère une liste de mots-clés pertinents en français pour ce produit, séparés par des virgules. Focus sur les termes de recherche populaires.",
    synonyms: "Génère une liste de synonymes et termes alternatifs en français pour ce produit, séparés par des virgules. Inclus les variations linguistiques courantes."
  }
  return prompts[type as keyof typeof prompts] || "Réécris ce contenu en français de manière professionnelle."
}