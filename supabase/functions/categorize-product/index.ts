import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { Buffer } from "https://deno.land/std@0.168.0/io/buffer.ts";

// Initialize Supabase client
// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  {
    global: {
      headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` },
    },
  }
);

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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { productTitle, productDescription } = await req.json();

    if (!productTitle) {
      throw new Error("Product title is required.");
    }

    // 1. Fetch settings for API key and model
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["gemini_api_key", "gemini_model_product_categorization"]);

    if (settingsError) throw settingsError;

    const apiKey = settings?.find((s: any) => s.key === 'gemini_api_key')?.value;
    const modelName = 'gemini-1.5-flash'; // Hardcode to a known working model
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Gemini API key is not configured." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
      });
    }

    // 2. Fetch all categories and sub-categories from the database
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

    // 3. Construct the prompt for Gemini
    const prompt = `
      Based on the product title and description, please select the most relevant category and sub-category from the list provided.
      
      Product Title: "${productTitle}"
      Product Description: "${productDescription || ''}"

      Available Categories and Sub-categories:
      ${categoryList}

      Your response must be a JSON object with two keys: "category" and "subcategory".
      For example: {"category": "Vêtements et Mode", "subcategory": "Robes"}
    `;

    // 4. Call Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    let suggestedCategoryName;
    try {
      const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonString);
      suggestedCategoryName = parsed.category;
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", text);
      // Fallback: try to extract category from plain text if JSON fails
      const match = text.match(/category"?:\s*"([^"]+)"/i);
      if (match && match[1]) {
        suggestedCategoryName = match[1];
      } else {
        throw new Error("Could not parse category from AI response.");
      }
    }

    if (!suggestedCategoryName || typeof suggestedCategoryName !== 'string') {
      throw new Error("AI response did not contain a valid category name.");
    }

    // 5. Find the best match in the database
    let bestMatch = null;
    let minDistance = Infinity;

    for (const category of categories) {
      const distance = levenshtein(suggestedCategoryName.toLowerCase(), category.name.toLowerCase());
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = { id: category.id, name: category.name };
      }
    }

    if (!bestMatch) {
      throw new Error(`Could not find a matching category for "${suggestedCategoryName}".`);
    }

    // 6. Return the matched category ID and name
    return new Response(JSON.stringify({ success: true, category: bestMatch }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Categorization error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});