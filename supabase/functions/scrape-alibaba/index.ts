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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, url } = await req.json()

    if (action === 'scrape') {
      if (!url) {
        throw new Error("L'URL du produit est manquante.");
      }
      // Scraping logic for Alibaba
      const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
          }
      })

      if (!response.ok) {
        throw new Error('Impossible de récupérer la page du produit.');
      }

      const html = await response.text()
      
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

    // Default response for unknown action
    return new Response(
      JSON.stringify({ success: false, error: 'Action invalide. Seule l\'action "scrape" est autorisée.' }),
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
