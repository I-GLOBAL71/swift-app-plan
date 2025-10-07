import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ViewAllProductsButton = () => {
  return (
    <div className="text-center my-8">
      <Button asChild size="lg">
        <Link to="/products">Voir tous nos produits</Link>
      </Button>
    </div>
  );
};

export default ViewAllProductsButton;