"use client";

import React, { useState, useEffect, useRef } from "react";
import Image, { ImageProps } from "next/image";
import { getTMDBImageUrl, TMDBImageSize, TMDBFallbackType } from "../utils/imageUtils";

export interface TMDBImageProps extends Omit<ImageProps, "src"> {
  imagePath: string | null | undefined;
  imageSize?: TMDBImageSize;
  fallbackType?: TMDBFallbackType;
  fallbackSrc?: string;
  enableBlurUp?: boolean;
}

export const TMDBImage: React.FC<TMDBImageProps> = ({
  imagePath,
  imageSize,
  fallbackType = "poster",
  fallbackSrc,
  alt,
  className = "",
  enableBlurUp = true,
  onLoad,
  onError,
  ...props
}) => {
  // Default poster images to full-resolution "w500" as requested
  const resolvedSize = imageSize || (fallbackType === "poster" ? "w500" : "w500");

  const lowResUrl = getTMDBImageUrl(imagePath, "w92", fallbackType);
  const highResUrl = getTMDBImageUrl(imagePath, resolvedSize, fallbackType);

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    // If high-res image is already cached in browser memory, show immediately
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [imagePath, resolvedSize, fallbackType]);

  const defaultFallback = fallbackSrc || (fallbackType === "backdrop"
    ? "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200"
    : (fallbackType === "profile"
      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300"
      : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500"));

  // Check if valid TMDB image path exists
  const isRealTMDBImage = !!(imagePath && imagePath !== "null" && imagePath !== "undefined" && !imagePath.startsWith("http"));

  // Blur-up enabled for poster & backdrop images when loading real TMDB assets
  const shouldBlurUp = enableBlurUp && isRealTMDBImage && !hasError;

  return (
    <>
      {/* w92 Low-resolution thumbnail placeholder with blur filter */}
      {shouldBlurUp && !isLoaded && (
        <Image
          {...props}
          unoptimized={props.unoptimized ?? true}
          src={lowResUrl}
          alt={alt || "Media artwork placeholder"}
          className={`${className} filter blur-md scale-105 transition-all duration-500 ease-out`}
          referrerPolicy="no-referrer"
          aria-hidden="true"
        />
      )}

      {/* Full-resolution asset (w500 for posters) */}
      <Image
        {...props}
        ref={imgRef}
        unoptimized={props.unoptimized ?? true}
        src={hasError ? defaultFallback : (highResUrl || defaultFallback)}
        alt={alt || "Media artwork"}
        className={`${className} transition-all duration-500 ease-out ${
          shouldBlurUp && !isLoaded
            ? "opacity-0 blur-sm scale-105"
            : "opacity-100 blur-0 scale-100"
        }`}
        referrerPolicy="no-referrer"
        onLoad={(e) => {
          setIsLoaded(true);
          if (onLoad) onLoad(e);
        }}
        onError={(e) => {
          if (!hasError) {
            setHasError(true);
          }
          if (onError) onError(e);
        }}
      />
    </>
  );
};
