import React, { useState, useEffect, useRef } from "react";
import { Image as ImageIcon } from "lucide-react";

interface LazyImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
  aspectRatio?: string;
  fallbackIcon?: React.ReactNode;
  onLoadComplete?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = "w-full h-full object-cover",
  containerClassName = "relative w-full h-full overflow-hidden bg-[#17151D]/5",
  loading = "lazy",
  decoding = "async",
  fallbackIcon,
  onLoadComplete,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    // If already cached by browser
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
      onLoadComplete?.();
    }
  }, [src, onLoadComplete]);

  if (!src || hasError) {
    return (
      <div
        className={`${containerClassName} flex items-center justify-center bg-gradient-to-br from-[#17151D] to-[#262135] text-white/40 p-4 select-none`}
      >
        {fallbackIcon || (
          <div className="flex flex-col items-center gap-1.5 text-center">
            <ImageIcon className="w-6 h-6 text-white/30" />
            <span className="text-[10px] font-mono text-white/50">{alt || "Imagem"}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {/* Skeleton Shimmer Placeholder (visible while loading) */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#17151D]/10 via-[#17151D]/5 to-[#17151D]/10 animate-pulse pointer-events-none" />
      )}

      {/* Optimized Lazy Image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        referrerPolicy="no-referrer"
        onLoad={() => {
          setIsLoaded(true);
          onLoadComplete?.();
        }}
        onError={() => {
          setHasError(true);
        }}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};
