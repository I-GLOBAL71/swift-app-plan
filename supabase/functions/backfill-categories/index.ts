import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const BATCH_SIZE = 50;

serve(async (_req: Request) => {
  console.log("Backfill function started.");

  if (_req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request.");
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Fetching total count of uncategorized products.");
    const { count, error: countError } = await supabase
      .from("products")
      .select('*', { count: 'exact', head: true })
      .is("category_id", null);

    if (countError) {
      console.error("Error fetching product count:", countError.message);
      throw countError;
    }
    
    if (count === 0) {
      console.log("No products to categorize.");
      return new Response(JSON.stringify({ message: "No products to categorize." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`Found ${count} products to categorize. Processing in batches of ${BATCH_SIZE}.`);
    let categorizedCount = 0;
    
    for (let i = 0; i < Math.ceil(count / BATCH_SIZE); i++) {
      console.log(`Processing batch ${i + 1}...`);
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, title, description")
        .is("category_id", null)
        .range(i * BATCH_SIZE, (i + 1) * BATCH_SIZE - 1);

      if (productsError) {
        console.error(`Error fetching batch ${i + 1}:`, productsError.message);
        continue;
      }

      for (const product of products) {
        try {
          console.log(`Categorizing product ID: ${product.id}`);
          const { data: categoryData, error: invokeError } = await supabase.functions.invoke("categorize-product", {
            body: { product: { title: product.title, description: product.description } },
          });

          if (invokeError) {
            console.error(`Error invoking categorize-product for ${product.id}:`, invokeError.message);
            continue;
          }

          const { category: categoryName, subcategory: subcategoryName } = categoryData;
          console.log(`AI suggested: ${categoryName} > ${subcategoryName} for product ${product.id}`);

          if (categoryName && subcategoryName) {
            let { data: category } = await supabase.from('categories').select('id').ilike('name', categoryName).single();
            if (!category) {
              console.log(`Creating new category: ${categoryName}`);
              const { data: newCategory, error: newCatError } = await supabase.from('categories').insert({ name: categoryName }).select('id').single();
              if (newCatError) throw newCatError;
              category = newCategory;
            }

            let { data: subcategory } = await supabase.from('sub_categories').select('id').ilike('name', subcategoryName).eq('category_id', category.id).single();
            if (!subcategory) {
              console.log(`Creating new sub-category: ${subcategoryName}`);
              const { data: newSubcategory, error: newSubCatError } = await supabase.from('sub_categories').insert({ name: subcategoryName, category_id: category.id }).select('id').single();
              if (newSubCatError) throw newSubCatError;
              subcategory = newSubcategory;
            }

            const { error: updateError } = await supabase
              .from("products")
              .update({ category_id: category.id, sub_category_id: subcategory.id })
              .eq("id", product.id);

            if (updateError) {
              console.error(`Error updating product ${product.id}:`, updateError.message);
            } else {
              console.log(`Successfully updated product ${product.id}`);
              categorizedCount++;
            }
          }
        } catch (e) {
          console.error(`Unexpected error for product ${product.id}:`, (e as Error).message);
        }
      }
    }

    console.log("Backfill process finished.");
    return new Response(JSON.stringify({ message: `Successfully categorized ${categorizedCount} out of ${count} products.` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Fatal error in backfill function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});