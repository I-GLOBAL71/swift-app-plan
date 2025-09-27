import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, StarOff } from "lucide-react";

interface ImagePrioritySelectorProps {
  images: string[];
  priorityImageIndex: number;
  onPriorityChange: (index: number) => void;
}

export function ImagePrioritySelector({ 
  images, 
  priorityImageIndex, 
  onPriorityChange 
}: ImagePrioritySelectorProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-accent" />
          Image Prioritaire
        </CardTitle>
        <CardDescription>
          Sélectionnez l'image qui sera affichée en première dans les cartes produits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div 
                className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                  priorityImageIndex === index 
                    ? "border-accent shadow-lg ring-2 ring-accent/20" 
                    : "border-muted hover:border-accent/50"
                }`}
                onClick={() => onPriorityChange(index)}
              >
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
                
                {/* Priority indicator */}
                {priorityImageIndex === index && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="bg-accent text-accent-foreground">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Prioritaire
                    </Badge>
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                
                {/* Click to select overlay */}
                {priorityImageIndex !== index && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-background/90 hover:bg-background"
                    >
                      <StarOff className="h-4 w-4 mr-1" />
                      Définir prioritaire
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Image position label */}
              <div className="text-center mt-2">
                <span className="text-sm text-muted-foreground">
                  Image {index + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Astuce:</strong> L'image prioritaire sera la première affichée dans les cartes produits et servira d'aperçu principal.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}