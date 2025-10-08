import { Button } from "@/components/ui/button";
import { Crown, Menu, X } from "lucide-react";
import { CartButton } from "./CartButton";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Category, SubCategory } from "@/lib/types";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data: catData } = await supabase.from('categories').select('id, name, parent_id').order('name');
      setCategories((catData || []) as Category[]);
      const { data: subCatData } = await supabase.from('sub_categories').select('id, name, parent_id').order('name');
      setSubCategories((subCatData || []).map(sc => ({
        id: sc.id,
        name: sc.name,
        parent_id: sc.parent_id
      })) as SubCategory[]);
    };
    fetchCategories();
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="oneprice.shop logo" className="h-10 sm:h-12 w-auto object-contain" />
          </Link>


          <div className="flex items-center space-x-2">
            <nav className="hidden md:flex items-center space-x-2">
              <Link to="/products">
                <Button variant="ghost">Produits</Button>
              </Link>
              <Link to="/premium">
                <Button variant="premium" size="sm" className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Premium
                </Button>
              </Link>
            </nav>
            <CartButton />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="w-full">
                <Button
                  variant="ghost"
                  className="text-base font-medium justify-start w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Accueil
                </Button>
              </Link>
              <Link to="/products" className="w-full">
                <Button
                  variant="ghost"
                  className="text-base font-medium justify-start w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Produits
                </Button>
              </Link>
              <Accordion type="multiple" className="w-full">
                {categories.map(category => (
                  <AccordionItem value={category.id} key={category.id}>
                    <AccordionTrigger className="text-base font-medium justify-start w-full py-2 px-4 hover:no-underline">
                      {category.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col pl-4">
                        {subCategories.filter(sc => sc.parent_id === category.id).map(subCategory => (
                          <Link to={`/products?category=${category.name.toLowerCase()}&subcategory=${subCategory.name.toLowerCase()}`} key={subCategory.id} className="w-full">
                            <Button
                              variant="ghost"
                              className="text-sm font-medium justify-start w-full"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {subCategory.name}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Link to="/premium" className="w-full">
                <Button
                  variant="premium"
                  size="sm"
                  className="flex items-center gap-2 justify-start w-fit mt-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Crown className="w-4 h-4" />
                  Premium
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;