import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageContent } from "@/hooks/use-page-content";
import { Skeleton } from "@/components/ui/skeleton";
import BackToProductsBanner from "@/components/BackToProductsBanner";

const AboutPage = () => {
  const { page, loading } = usePageContent("about");

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mx-auto" />
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
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight text-center">
            {page.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-lg text-gray-700 space-y-6">
          <p>{page.content.description}</p>
          <p>{page.content.team}</p>
        </CardContent>
      </Card>
      <BackToProductsBanner />
    </div>
  );
};

export default AboutPage;