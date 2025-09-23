import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Undo2 } from "lucide-react";
import { usePageContent } from "@/hooks/use-page-content";
import { Skeleton } from "@/components/ui/skeleton";
import BackToProductsBanner from "@/components/BackToProductsBanner";

const ReturnsPage = () => {
  const { page, loading } = usePageContent("returns");

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <Skeleton className="w-12 h-12 text-primary mx-auto mb-4" />
            <Skeleton className="h-8 w-1/2 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!page) {
    return <div className="text-center py-12">Page non trouvée.</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Undo2 className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            {page.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-lg text-gray-700 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Conditions de Retour</h3>
            <p>{page.content.return_conditions}</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Procédure de Retour</h3>
            <p>{page.content.return_procedure}</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Remboursements</h3>
            <p>{page.content.refunds}</p>
          </div>
        </CardContent>
      </Card>
      <BackToProductsBanner />
    </div>
  );
};

export default ReturnsPage;