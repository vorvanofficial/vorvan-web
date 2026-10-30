import React, { useEffect, useState } from 'react';
import { FragranceItem } from '../types/fragrance';

interface FlaconArtProps {
  fragrance: FragranceItem;
  selectedVolume?: string;
  className?: string;
}

const FlaconArtComponent: React.FC<FlaconArtProps> = ({
  fragrance,
  selectedVolume,
  className = '',
}) => {
  const [imgSrc, setImgSrc] = useState<string>(fragrance.image);
  const activeVolume = (selectedVolume || fragrance.defaultVolume).toUpperCase();

  useEffect(() => {
    setImgSrc(fragrance.image);
  }, [fragrance.image]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (target.src.includes('perfume-thumbs/dark-375x500')) {
      const fallbackUrl = target.src.replace(
        'perfume-thumbs/dark-375x500',
        'perfume/375x500'
      );
      setImgSrc(fallbackUrl);
      target.src = fallbackUrl;
    } else if (target.src.includes('perfume-thumbs/375x500')) {
      const fallbackUrl = target.src.replace(
        'perfume-thumbs/375x500',
        'perfume/375x500'
      );
      setImgSrc(fallbackUrl);
      target.src = fallbackUrl;
    } else if (imgSrc.includes('perfume-thumbs/dark-375x500')) {
      const fallbackUrl = imgSrc.replace(
        'perfume-thumbs/dark-375x500',
        'perfume/375x500'
      );
      setImgSrc(fallbackUrl);
      target.src = fallbackUrl;
    }
  };

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none ${className}`}
      style={{
        background:
          'radial-gradient(circle at 50% 50%, rgba(235, 223, 200, 0.92) 0%, rgba(195, 170, 125, 0.55) 42%, rgba(28, 22, 14, 0.9) 75%, #0d0d0d 100%)',
      }}
      aria-label={`${fragrance.house} ${fragrance.name} ${activeVolume}`}
    >
      {/* Subtle Vignette Frame to Blend Seamlessly into the Obsidian Card */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 86% 88% at 50% 50%, transparent 58%, rgba(13, 13, 13, 0.72) 88%, #0d0d0d 100%)',
        }}
      />

      {/* Authentic Perfume Bottle Photo with Champagne Spotlight Blend & Soft Radial Edge Mask */}
      <img
        src={imgSrc}
        alt={`${fragrance.house} — ${fragrance.name} (${activeVolume})`}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        onError={handleImageError}
        style={{
          WebkitMaskImage:
            'radial-gradient(ellipse 78% 82% at 50% 50%, black 65%, transparent 100%)',
          maskImage:
            'radial-gradient(ellipse 78% 82% at 50% 50%, black 65%, transparent 100%)',
        }}
        className="relative z-10 w-full h-full max-h-[290px] object-contain p-3 sm:p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
        data-testid={`flacon-img-${fragrance.id}`}
      />
    </div>
  );
};

export const FlaconArt = React.memo(FlaconArtComponent);

