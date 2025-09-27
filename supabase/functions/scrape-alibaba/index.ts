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
  type: 'title' | 'description' | 'keywords' | 'synonyms' | 'categorize';
  prompt: string;
}

// Function to calculate Levenshtein distance
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
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

    const { action, url, rewriteData, productTitle, productDescription } = await req.json()

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

    if (action === 'rewrite' || action === 'categorize') {
      // --- Centralized AI Logic ---
      const isCategorize = action === 'categorize';
      
      // 1. Fetch settings
      const { data: settings, error: settingsError } = await adminClient
        .from('settings')
        .select('key, value')
        .in('key', ['ai_provider', 'gemini_api_key', 'claude_api_key', 'gemini_model', 'claude_model', `prompt_${isCategorize ? 'categorize' : rewriteData.type}`]);

      if (settingsError) throw new Error(`Failed to fetch settings: ${settingsError.message}`);
      
      const settingsMap = new Map(settings.map((s: { key: string; value: any }) => [s.key, s.value]));
      const aiProvider = settingsMap.get('ai_provider') || 'gemini';
      const apiKey = String(settingsMap.get(`${aiProvider}_api_key`) || '');
      let model = settingsMap.get(`${aiProvider}_model`) || (aiProvider === 'gemini' ? 'gemini-1.5-flash' : 'claude-3-haiku-20240307');

      if (!apiKey) {
        return new Response(JSON.stringify({ success: false, error: `Clé API pour ${aiProvider} manquante.` }), { status: 400 });
      }

      // 2. Prepare prompt and content
      let prompt;
      let content;

      if (isCategorize) {
        prompt = settingsMap.get('prompt_categorize') || getDefaultPrompt('categorize');
        content = `Product Title: "${productTitle}"\nProduct Description: "${productDescription || ''}"`;
      } else {
        prompt = settingsMap.get(`prompt_${rewriteData.type}`) || getDefaultPrompt(rewriteData.type);
        content = rewriteData.content;
      }

      // 3. Call AI Provider
      let aiResponseText = '';
      if (aiProvider === 'gemini') {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `${prompt}\n\n${isCategorize ? '' : 'Contenu original: '}${content}` }] }] })
        });
        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            throw new Error(`Gemini API error: ${geminiResponse.status} ${errorText}`);
        }
        const geminiData = await geminiResponse.json();
        aiResponseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      } else { // claude
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
          body: JSON.stringify({ model, max_tokens: 1024, messages: [{ role: 'user', content: `${prompt}\n\n${isCategorize ? '' : 'Contenu original: '}${content}` }] })
        });
        if (!claudeResponse.ok) {
            const errorText = await claudeResponse.text();
            throw new Error(`Claude API error: ${claudeResponse.status} ${errorText}`);
        }
        const claudeData = await claudeResponse.json();
        aiResponseText = claudeData.content?.[0]?.text?.trim() || '';
      }

      if (!aiResponseText) {
        return new Response(JSON.stringify({ success: false, error: "Le contenu généré par l'IA est vide." }), { status: 500 });
      }

      // 4. Process and return response
      if (isCategorize) {
        try {
          // The AI is expected to return a JSON string like {"category": "...", "subcategory": "..."}
          // Sometimes the AI wraps the JSON in markdown, so we clean it up.
          const cleanedText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
          const jsonResponse = JSON.parse(cleanedText);
          return new Response(JSON.stringify({ success: true, ...jsonResponse }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          throw new Error(`Failed to parse AI response as JSON: ${aiResponseText}`);
        }
      } else {
        return new Response(JSON.stringify({ success: true, content: aiResponseText }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
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
    synonyms: "Génère une liste de synonymes et termes alternatifs en français pour ce produit, séparés par des virgules. Inclus les variations linguistiques courantes.",
    categorize: `Analyse le titre et la description du produit et suggère la catégorie et la sous-catégorie les plus pertinentes.
Réponds uniquement avec un objet JSON contenant les clés "category" et "subcategory".
Par exemple: {"category": "Électronique", "subcategory": "Smartphones"}`
  }
  return prompts[type as keyof typeof prompts] || "Réécris ce contenu en français de manière professionnelle."
}