import React from "react";
import { LazyImage } from "./LazyImage";

interface MediaRendererProps {
  url: string;
  type?: "image" | "video";
  alt?: string;
  className?: string;
  caption?: string;
}

export function parseYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If already an embed url
  if (trimmed.includes("youtube.com/embed/")) {
    return trimmed;
  }

  // Handle standard watch url: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?rel=0&modestbranding=1`;
  }

  // Handle short url: https://youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${shortMatch[1]}?rel=0&modestbranding=1`;
  }

  // Handle shorts url: https://www.youtube.com/shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}?rel=0&modestbranding=1`;
  }

  return null;
}

export const MediaRenderer: React.FC<MediaRendererProps> = ({
  url,
  type = "image",
  alt = "Mídia do case",
  className = "w-full h-full object-cover",
  caption,
}) => {
  const isYouTube = url && (url.includes("youtube.com") || url.includes("youtu.be"));
  const ytEmbedUrl = isYouTube ? parseYouTubeEmbedUrl(url) : null;

  if (type === "video" || ytEmbedUrl) {
    if (ytEmbedUrl) {
      return (
        <div className="relative w-full h-full bg-black flex flex-col justify-center">
          <iframe
            src={ytEmbedUrl}
            title={caption || alt}
            className="w-full h-full aspect-video border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    }

    // Direct video element fallback with metadata preload
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <video
          src={url}
          controls
          preload="metadata"
          className="w-full h-full object-contain"
        >
          Seu navegador não suporta a reprodução deste vídeo.
        </video>
      </div>
    );
  }

  // High-performance Lazy Image with skeleton shimmer
  return (
    <LazyImage
      src={url}
      alt={alt}
      className={className}
      containerClassName="relative w-full h-full bg-[#17151D] overflow-hidden"
      loading="lazy"
      decoding="async"
    />
  );
};
