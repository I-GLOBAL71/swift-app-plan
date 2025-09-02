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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { action, url, rewriteData } = await req.json()

    if (action === 'scrape') {
      // Scraping logic for Alibaba
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
      const { data: setting } = await supabaseClient
        .from('settings')
        .select('value')
        .eq('key', 'gemini_api_key')
        .single()

      if (!setting?.value) {
        throw new Error('Gemini API key not configured')
      }

      // Get rewrite prompt from settings
      const { data: promptSetting } = await supabaseClient
        .from('settings')
        .select('value')
        .eq('key', `prompt_${rewriteData.type}`)
        .single()

      const prompt = promptSetting?.value || getDefaultPrompt(rewriteData.type)
      
      // Call Gemini API
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${setting.value}`, {
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

      const geminiData = await geminiResponse.json()
      const rewrittenContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

      return new Response(
        JSON.stringify({ success: true, content: rewrittenContent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
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
  const imageMatches = html.match(/https:\/\/[^"'\s]+\.(jpg|jpeg|png|webp)/gi) || []
  return [...new Set(imageMatches)].slice(0, 10) // Limite à 10 images uniques
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
    title: "Réécris ce titre de produit en français de manière attrayante et professionnelle pour un site e-commerce. Le titre doit être accrocheur et optimisé pour le SEO.",
    description: "Réécris cette description de produit en français de manière détaillée et engageante pour un site e-commerce. Mets en avant les avantages et caractéristiques principales.",
    keywords: "Génère une liste de mots-clés pertinents en français pour ce produit, séparés par des virgules. Focus sur les termes de recherche populaires.",
    synonyms: "Génère une liste de synonymes et termes alternatifs en français pour ce produit, séparés par des virgules. Inclus les variations linguistiques courantes."
  }
  return prompts[type as keyof typeof prompts] || "Réécris ce contenu en français de manière professionnelle."
}