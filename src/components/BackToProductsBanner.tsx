import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const BackToProductsBanner = () => {
  return (
    <div className="bg-muted/40 mt-12">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Découvrez nos produits</h3>
            <p className="text-muted-foreground mt-1 max-w-lg">
              Vous avez trouvé les informations que vous cherchiez ? Parcourez notre collection et trouvez votre prochain coup de cœur.
            </p>
          </div>
          <Link to="/products" className="flex-shrink-0">
            <Button size="lg">
              Voir tous les produits
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BackToProductsBanner;