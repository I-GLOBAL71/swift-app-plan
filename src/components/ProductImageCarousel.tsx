import { useState, useCallback, useRef, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageCarouselProps {
  images: string[];
  productName: string;
  className?: string;
  onSwipe?: () => void;
}

interface SwipeableCarouselContentProps {
  images: string[];
  productName: string;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  onSwipe?: () => void;
}

function SwipeableCarouselContent({ images, productName, currentImageIndex, setCurrentImageIndex, onSwipe }: SwipeableCarouselContentProps) {
  const { api, scrollPrev, scrollNext } = useCarousel();
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      scrollNext();
      onSwipe?.();
    } else if (isRightSwipe) {
      scrollPrev();
      onSwipe?.();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [scrollNext, scrollPrev, minSwipeDistance, onSwipe]);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentImageIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api, setCurrentImageIndex]);

  return (
    <>
      <CarouselContent
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative">
              <img
                src={image}
                alt={`${productName} - Image ${index + 1}`}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {index + 1} / {images.length}
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {/* Navigation personnalisée avec un style moderne */}
      <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <CarouselPrevious className="relative translate-x-0 translate-y-0 bg-white/80 hover:bg-white border-none shadow-lg">
          <ChevronLeft className="h-4 w-4" />
        </CarouselPrevious>
        <CarouselNext className="relative translate-x-0 translate-y-0 bg-white/80 hover:bg-white border-none shadow-lg">
          <ChevronRight className="h-4 w-4" />
        </CarouselNext>
      </div>

      {/* Indicateurs de points */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              index === currentImageIndex 
                ? "bg-white" 
                : "bg-white/50 hover:bg-white/75"
            }`}
            onClick={() => {
              if (api) {
                api.scrollTo(index);
              }
            }}
          />
        ))}
      </div>
    </>
  );
}

export function ProductImageCarousel({ images, productName, className, onSwipe }: ProductImageCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-muted rounded-lg flex items-center justify-center h-64 ${className}`}>
        <p className="text-muted-foreground">Aucune image disponible</p>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={`relative group ${className}`}>
        <img
          src={images[0]}
          alt={productName}
          className="w-full h-64 object-cover rounded-lg"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <Carousel className="w-full">
        <SwipeableCarouselContent 
          images={images}
          productName={productName}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          onSwipe={onSwipe}
        />
      </Carousel>
    </div>
  );
}