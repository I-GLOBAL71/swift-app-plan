import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
}

export function CategoriesBar() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  if (categories.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex justify-center p-2 space-x-4">
        {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.name.toLowerCase()}`}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'font-semibold'
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
  );
}