import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Share2, Link, Facebook, Twitter, MessageCircle } from "lucide-react";

interface ShareButtonProps {
  product: {
    id: string;
    title: string;
    slug: string;
  };
  size?: "default" | "sm" | "lg" | "icon";
}

const ShareButton = ({ product, size = "icon" }: ShareButtonProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const productUrl = `${window.location.origin}/product/${product.slug}/${product.id}`;

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: product.title,
      text: `Découvrez ce produit: ${product.title}`,
      url: productUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Erreur de partage:", error);
      }
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(productUrl).then(
      () => {
        toast({
          title: "Lien copié !",
          description: "Le lien du produit a été copié dans le presse-papiers.",
        });
      },
      (err) => {
        console.error("Erreur de copie:", err);
        toast({
          title: "Erreur",
          description: "Impossible de copier le lien.",
          variant: "destructive",
        });
      }
    );
  };

  const openSharePopup = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  const handleShareTo = (platform: "facebook" | "twitter" | "whatsapp") => (e: React.MouseEvent) => {
    e.stopPropagation();
    const encodedUrl = encodeURIComponent(productUrl);
    const text = encodeURIComponent(`Découvrez ce produit: ${product.title}`);
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${text}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${text}%20${encodedUrl}`;
        break;
    }
    openSharePopup(shareUrl);
  };
  
  const triggerButton = (
    <Button
      size={size}
      variant="outline"
      onClick={(e) => e.stopPropagation()}
      className="shrink-0"
      aria-label="Partager le produit"
    >
      <Share2 className="w-4 h-4" />
    </Button>
  );

  if (isMobile) {
    return (
      <Button
        size={size}
        variant="outline"
        onClick={handleNativeShare}
        className="shrink-0"
        aria-label="Partager le produit"
      >
        <Share2 className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-center mb-1">Partager via</p>
          <Button variant="outline" size="sm" onClick={handleCopyLink} className="justify-start">
            <Link className="w-4 h-4 mr-2" /> Copier le lien
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareTo("facebook")} className="justify-start">
            <Facebook className="w-4 h-4 mr-2" /> Facebook
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareTo("twitter")} className="justify-start">
            <Twitter className="w-4 h-4 mr-2" /> Twitter
          </Button>
           <Button variant="outline" size="sm" onClick={handleShareTo("whatsapp")} className="justify-start">
            <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShareButton;