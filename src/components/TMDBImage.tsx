"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { getTMDBImageUrl, TMDBImageSize, TMDBFallbackType } from "../utils/imageUtils";

export interface TMDBImageProps extends Omit<ImageProps, "src"> {
  imagePath: string | null | undefined;
  imageSize?: TMDBImageSize;
  fallbackType?: TMDBFallbackType;
  fallbackSrc?: string;
}

export const TMDBImage: React.FC<TMDBImageProps> = ({
  imagePath,
  imageSize = "w342",
  fallbackType = "poster",
  fallbackSrc,
  alt,
  className,
  ...props
}) => {
  const initialUrl = getTMDBImageUrl(imagePath, imageSize, fallbackType);
  const [imgSrc, setImgSrc] = useState<string>(initialUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const freshUrl = getTMDBImageUrl(imagePath, imageSize, fallbackType);
    setImgSrc(freshUrl);
    setHasError(false);
  }, [imagePath, imageSize, fallbackType]);

  const defaultFallback = fallbackSrc || (fallbackType === "backdrop"
    ? "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200"
    : (fallbackType === "profile"
      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300"
      : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500"));

  return (
    <Image
      {...props}
      unoptimized={hasError}
      src={hasError ? defaultFallback : (imgSrc || defaultFallback)}
      alt={alt || "Media artwork"}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(defaultFallback);
        }
      }}
    />
  );
};
