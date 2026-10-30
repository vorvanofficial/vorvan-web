import React, { useState } from 'react';

export const VORVAN_TRANSPARENT_LOGO_ASSET =
  '/assets/aistudio/1001113998-removebg-preview_27bf4b0a.png';

/**
 * Fallback vector SVG if the image ever fails to load.
 */
export const VorvanFallbackSvg: React.FC<{ className?: string }> = ({
  className = 'w-14 h-14',
}) => (
  <svg
    viewBox="0 0 140 112"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`bg-transparent border-none select-none ${className}`}
    aria-hidden="true"
  >
    <path
      d="M16 14 H52 C44 16 42 20 46 28 L70 72 L77 58 L81 66 L69 88 L30 24 C26 17 22 15 16 14 Z"
      fill="#E4E4E7"
    />
    <path
      d="M58 28 H75 L94 63 C97 68 97 72 93 79 L76 104 L84 84 C87 77 86 72 82 65 L58 28 Z"
      fill="#D4D4D8"
    />
    <path
      d="M88 14 H122 C114 16 109 20 104 28 L89 53 L84 44 L96 24 C100 18 96 15 88 14 Z"
      fill="#FAFAFA"
    />
  </svg>
);

/**
 * Renders the newly uploaded transparent VORVAN monogram & wordmark image
 * (/assets/aistudio/1001113998-removebg-preview_27bf4b0a.png) with zero background box or border.
 */
export const VorvanMonogramSvg: React.FC<{ className?: string }> = ({
  className = 'w-20 h-20',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <VorvanFallbackSvg className={className} />;
  }

  return (
    <img
      src={VORVAN_TRANSPARENT_LOGO_ASSET}
      alt="VORVAN — Lifestyle For Everyone Official Transparent Logo"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`object-contain bg-transparent border-none select-none pointer-events-none ${className}`}
    />
  );
};

export const VorvanCrestImage: React.FC<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const [failed, setFailed] = useState(false);

  // Tightly framed wrapper heights to trim the empty top/bottom transparent space of the 500x500 PNG
  const wrapperSizeClasses =
    size === 'xl'
      ? 'w-64 h-36 sm:w-80 sm:h-44'
      : size === 'lg'
        ? 'w-52 h-28 sm:w-64 sm:h-36'
        : size === 'md'
          ? 'w-48 h-24 sm:w-56 sm:h-28'
          : size === 'sm'
            ? 'w-44 h-20 sm:w-48 sm:h-24'
            : 'w-28 h-11';

  const imgSizeClasses =
    size === 'xl'
      ? 'w-64 h-64 sm:w-80 sm:h-80'
      : size === 'lg'
        ? 'w-52 h-52 sm:w-64 sm:h-64'
        : size === 'md'
          ? 'w-48 h-48 sm:w-56 sm:h-56'
          : size === 'sm'
            ? 'w-44 h-44 sm:w-48 sm:h-48'
            : 'w-28 h-28';

  if (failed) {
    return <VorvanFallbackSvg className={wrapperSizeClasses} />;
  }

  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden bg-transparent border-none p-0 m-0 select-none ${wrapperSizeClasses} ${className}`}
    >
      <img
        src={VORVAN_TRANSPARENT_LOGO_ASSET}
        alt="VORVAN — Lifestyle For Everyone Official Transparent Logo"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${imgSizeClasses} max-w-none object-contain bg-transparent border-none select-none brightness-110 contrast-115`}
        data-testid="vorvan-transparent-logo-img"
      />
    </div>
  );
};

