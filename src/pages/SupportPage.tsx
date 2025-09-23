import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LifeBuoy, Mail, Phone } from "lucide-react";
import { usePageContent } from "@/hooks/use-page-content";
import { Skeleton } from "@/components/ui/skeleton";
import BackToProductsBanner from "@/components/BackToProductsBanner";

const SupportPage = () => {
  const { page, loading } = usePageContent("support");

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <Skeleton className="w-12 h-12 text-primary mx-auto mb-4" />
            <Skeleton className="h-8 w-1/2 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
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
            <LifeBuoy className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            {page.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-lg text-gray-700 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Informations de Contact</h3>
              <div className="flex items-center space-x-3">
                <Mail className="w-6 h-6 text-gray-500" />
                <a href={`mailto:${page.content.email}`} className="hover:text-primary">
                  {page.content.email}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-6 h-6 text-gray-500" />
                <span>{page.content.phone}</span>
              </div>
            </div>
            <div className="space-y-4">
               <h3 className="text-xl font-semibold">Envoyez-nous un message</h3>
               <form className="space-y-4">
                <Input type="text" placeholder="Votre nom" required />
                <Input type="email" placeholder="Votre email" required />
                <Textarea placeholder="Votre message" required />
                <Button type="submit" className="w-full">Envoyer</Button>
               </form>
            </div>
          </div>
          <div className="text-center pt-4">
            <p>Notre équipe vous répondra dans les 24 heures.</p>
          </div>
        </CardContent>
      </Card>
      <BackToProductsBanner />
    </div>
  );
};

export default SupportPage;