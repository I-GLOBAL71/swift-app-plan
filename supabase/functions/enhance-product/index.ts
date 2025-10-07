import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting AI processing function');
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { title, description, action = 'enhance' } = await req.json();
    console.log('Request data:', { title, description, action });

    // Get Gemini API key and model from settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('key,value')
      .in('key', ['gemini_api_key', 'gemini_model', 'gemini_categorization_model']);

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      throw new Error('Impossible de charger la configuration de l\'IA.');
    }

    const settingsMap = new Map(settingsData.map((s: { key: string; value: any; }) => [s.key, s.value]));
    const geminiApiKey = settingsMap.get('gemini_api_key') as string;
    
    if (!geminiApiKey) {
      throw new Error('Clé API Gemini non configurée');
    }

    let geminiModel;
    if (action === 'categorize') {
      // Use the specific categorization model if available, otherwise fallback
      geminiModel = (settingsMap.get('gemini_categorization_model') as string) || (settingsMap.get('gemini_model') as string) || 'gemini-pro';
    } else {
      // Use the general enhancement model
      geminiModel = (settingsMap.get('gemini_model') as string) || 'gemini-pro';
    }

    let prompt;
    if (action === 'categorize') {
      // Fetch categories for the prompt
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name, sub_categories(id, name)");
      if (categoriesError) throw categoriesError;

      const categoryList = categories
        .map((cat: any) => {
          const subCategories = cat.sub_categories.map((sub: any) => `- ${sub.name}`).join("\n");
          return `**${cat.name}**:\n${subCategories}`;
        })
        .join("\n\n");

      prompt = `
        Tu es un expert en e-commerce. Ton rôle est de catégoriser un produit.
        Produit:
        - Titre: "${title}"
        - Description: "${description || ''}"

        Voici une liste de catégories et sous-catégories EXISTANTES:
        ${categoryList}

        Instructions:
        1.  Analyse la fonction principale du produit.
        2.  Vérifie si une paire catégorie/sous-catégorie EXISTANTE correspond PARFAITEMENT au produit.
        3.  Si une correspondance parfaite existe, utilise-la.
        4.  **Si AUCUNE catégorie existante n'est pertinente**, tu DOIS proposer une NOUVELLE catégorie et sous-catégorie logiques. Par exemple, pour des "écouteurs Bluetooth", si "Électronique > Audio" n'existe pas, tu dois le proposer. Ne force JAMAIS un produit dans une catégorie non pertinente (ex: écouteurs dans "Cuisine").
        5.  Ta réponse DOIT être un objet JSON valide et rien d'autre.

        Format de réponse OBLIGATOIRE:
        {"category": "Nom de la catégorie", "subcategory": "Nom de la sous-catégorie"}

        Si le produit est une catégorie principale sans sous-catégorie logique, la valeur de "subcategory" peut être null.
        Exemple 1 (catégorie existante): {"category": "Vêtements et Mode", "subcategory": "Robes"}
        Exemple 2 (nouvelle catégorie): {"category": "Électronique", "subcategory": "Accessoires mobiles"}
      `;
    } else { // Default to 'enhance'
      prompt = `
        Tu es un expert en e-commerce et marketing. Améliore ces informations de produit en français pour une boutique en ligne au Cameroun.

        Titre actuel: "${title}"
        Description actuelle: "${description}"

        Instructions:
        1. Crée un titre PRÉCIS, CONCIS, ACCROCHEUR et ÉMOTIONNEL en français (maximum 80 caractères) qui suscite l'émotion du visiteur et crée du désir
        2. Écris une description accrocheuse en français avec cette STRUCTURE OBLIGATOIRE:
           - Commence par une introduction listant exactement 7 points forts et exceptionnels du produit (format: ✓ Point fort 1, ✓ Point fort 2, etc.)
           - Puis développe une description détaillée et engageante (150-300 mots total)
           - Utilise un langage commercial attractif qui suscite l'émotion et le désir d'achat
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
    }

    // Call Gemini API
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`;

    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'x-goog-api-key': geminiApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Erreur API Gemini: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    
    // Log the full response from Gemini to help with debugging
    console.log('Full Gemini Response:', JSON.stringify(geminiData, null, 2));

    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      const finishReason = geminiData.candidates?.[0]?.finishReason;
      const safetyRatings = geminiData.candidates?.[0]?.safetyRatings;
      console.error(
        'Invalid Gemini response structure.',
        { finishReason, safetyRatings }
      );
      throw new Error(`Réponse API Gemini invalide. Raison: ${finishReason || 'Inconnue'}`);
    }

    const responseText = geminiData.candidates[0].content.parts[0].text;
    const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let responseData;
    try {
      responseData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw text:', responseText);
      throw new Error('Erreur lors de l\'analyse de la réponse IA');
    }

    if (action === 'categorize') {
      const { category: suggestedCategoryName, subcategory: suggestedSubCategoryName } = responseData;
      if (!suggestedCategoryName) {
        throw new Error("La réponse de l'IA ne contient pas de nom de catégorie.");
      }

      // 1. Find or create the category
      let category;
      const { data: existingCategory, error: catError } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', suggestedCategoryName.trim())
        .single();

      if (existingCategory) {
        category = existingCategory;
      } else {
        const { data: newCategory, error: newCatError } = await supabase
          .from('categories')
          .insert({ name: suggestedCategoryName.trim() })
          .select('id, name')
          .single();
        if (newCatError) throw new Error(`Impossible de créer la catégorie: ${newCatError.message}`);
        category = newCategory;
      }

      // 2. Find or create the subcategory (if provided)
      let subcategory = null;
      if (suggestedSubCategoryName) {
        const { data: existingSub, error: subCatError } = await supabase
          .from('sub_categories')
          .select('id, name')
          .eq('category_id', category.id)
          .ilike('name', suggestedSubCategoryName.trim())
          .single();

        if (existingSub) {
          subcategory = existingSub;
        } else {
          const { data: newSub, error: newSubError } = await supabase
            .from('sub_categories')
            .insert({ name: suggestedSubCategoryName.trim(), category_id: category.id })
            .select('id, name')
            .single();
          if (newSubError) throw new Error(`Impossible de créer la sous-catégorie: ${newSubError.message}`);
          subcategory = newSub;
        }
      }

      return new Response(JSON.stringify({ success: true, category, subcategory }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else { // 'enhance' action
      if (!responseData.title || !responseData.description) {
        throw new Error('Réponse IA incomplète pour l\'amélioration.');
      }
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            title: responseData.title || title,
            description: responseData.description || description,
            keywords: Array.isArray(responseData.keywords) ? responseData.keywords : [],
            synonyms: Array.isArray(responseData.synonyms) ? responseData.synonyms : []
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in enhance-product function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error instanceof Error ? error.message : 'Erreur lors de l\'amélioration avec l\'IA') 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});