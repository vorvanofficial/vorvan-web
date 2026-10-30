import React, { useEffect, useRef, useState } from 'react';
import { computeParallaxOffset } from '../utils/businessRules';

interface ScrollBubbleItem {
  id: number;
  leftPercent: number;
  topPercent: number;
  sizePx: number;
  tint: 'champagne' | 'gold' | 'pearl';
}

const AMBIENT_ORBS: {
  id: string;
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
  tint: 'gold' | 'pearl';
}[] = [
  { id: 'orb-1', left: '12%', top: '22%', size: 5, delay: '0s', duration: '8.5s', tint: 'gold' },
  { id: 'orb-2', left: '86%', top: '48%', size: 6, delay: '2.2s', duration: '9.4s', tint: 'pearl' },
  { id: 'orb-3', left: '18%', top: '76%', size: 5, delay: '4.1s', duration: '8.8s', tint: 'gold' },
];

/**
 * Subtle Fine Perfume Micro-Mist Layer (Sparse, Delicate & Behind Content)
 */
const LuxuryScrollBubblesComponent: React.FC = () => {
  const [scrollBubbles, setScrollBubbles] = useState<ScrollBubbleItem[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const counterRef = useRef<number>(1);

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastSpawnRef.current < 480) return;
      lastSpawnRef.current = now;

      const tints: ('champagne' | 'gold' | 'pearl')[] = [
        'gold',
        'champagne',
        'pearl',
      ];
      const id = counterRef.current++;
      const nextBubble: ScrollBubbleItem = {
        id,
        leftPercent: 10 + ((id * 37) % 80),
        topPercent: 24 + ((id * 23) % 60),
        sizePx: 4 + (id % 4),
        tint: tints[id % tints.length],
      };

      setScrollBubbles((prev) => [...prev.slice(-3), nextBubble]);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getBubbleGradient = (tint: 'champagne' | 'gold' | 'pearl') => {
    if (tint === 'gold') {
      return 'radial-gradient(circle at 35% 35%, rgba(245, 230, 184, 0.42) 0%, rgba(212, 175, 55, 0.16) 55%, rgba(212, 175, 55, 0) 100%)';
    }
    if (tint === 'champagne') {
      return 'radial-gradient(circle at 35% 35%, rgba(254, 243, 199, 0.38) 0%, rgba(229, 200, 126, 0.14) 55%, rgba(180, 140, 60, 0) 100%)';
    }
    return 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.34) 0%, rgba(228, 228, 231, 0.12) 55%, rgba(161, 161, 170, 0) 100%)';
  };

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transform-gpu"
      style={{
        transform: 'translateZ(0)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Sparse Delicate Ambient Perfume Dust Glints */}
      {AMBIENT_ORBS.map((orb) => (
        <span
          key={orb.id}
          className="absolute rounded-full animate-ambient-orb"
          style={{
            left: orb.left,
            top: orb.top,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            animationDelay: orb.delay,
            animationDuration: orb.duration,
            background:
              orb.tint === 'gold'
                ? 'radial-gradient(circle, rgba(229, 200, 126, 0.38) 0%, rgba(212, 175, 55, 0.08) 65%, rgba(11, 10, 14, 0) 100%)'
                : 'radial-gradient(circle, rgba(244, 244, 245, 0.3) 0%, rgba(212, 212, 216, 0.06) 65%, rgba(11, 10, 14, 0) 100%)',
          }}
        />
      ))}

      {/* Subtle Scroll-Triggered Micro-Mist Particles (Max 4, 4px–7px) */}
      {scrollBubbles.map((b) => (
        <span
          key={b.id}
          className="absolute rounded-full animate-bubble-rise"
          style={{
            left: `${b.leftPercent}%`,
            top: `${b.topPercent}%`,
            width: `${b.sizePx}px`,
            height: `${b.sizePx}px`,
            background: getBubbleGradient(b.tint),
          }}
        />
      ))}
    </div>
  );
};

export const LuxuryScrollBubbles = React.memo(LuxuryScrollBubblesComponent);

export interface ParallaxSectionBgProps {
  speed?: number;
  tone?: 'platinum' | 'champagne' | 'obsidian' | 'silver';
  watermarkText?: string;
  align?: 'left' | 'center' | 'right';
  testId?: string;
}

/**
 * Multi-Plane Rich Editorial Luxury Parallax Background Layer
 * Features warm Semi-Gold & Platinum chiaroscuro auroras, golden geometric filigree medallions,
 * architectural hairline guides, and counter-scrolling French haute-parfumerie watermarks.
 */
const ParallaxSectionBgComponent: React.FC<ParallaxSectionBgProps> = ({
  speed = 0.18,
  tone = 'champagne',
  watermarkText,
  align = 'center',
  testId,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [offsetY, setOffsetY] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let rafId: number | null = null;

    const updatePosition = () => {
      rafId = null;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nextOffset = computeParallaxOffset(
        window.innerHeight,
        rect.top,
        rect.height,
        speed,
        88
      );
      setOffsetY((prev) => (Math.abs(prev - nextOffset) >= 0.5 ? nextOffset : prev));
    };

    const onScrollOrResize = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updatePosition);
      }
    };

    updatePosition();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [speed]);

  const radialStyle =
    tone === 'champagne'
      ? 'radial-gradient(circle at 50% 38%, rgba(212, 175, 55, 0.16) 0%, rgba(229, 200, 126, 0.06) 42%, rgba(11, 10, 14, 0) 74%)'
      : tone === 'silver'
      ? 'radial-gradient(circle at 30% 48%, rgba(212, 175, 55, 0.12) 0%, rgba(228, 228, 231, 0.07) 44%, rgba(11, 10, 14, 0) 75%)'
      : tone === 'obsidian'
      ? 'radial-gradient(circle at 70% 45%, rgba(212, 175, 55, 0.11) 0%, rgba(63, 63, 70, 0.06) 45%, rgba(11, 10, 14, 0) 75%)'
      : 'radial-gradient(circle at 50% 32%, rgba(229, 200, 126, 0.15) 0%, rgba(212, 212, 216, 0.06) 45%, rgba(11, 10, 14, 0) 72%)';

  const watermarkAlignClass =
    align === 'left'
      ? 'justify-start pl-4 sm:pl-12'
      : align === 'right'
      ? 'justify-end pr-4 sm:pr-12'
      : 'justify-center';

  const counterOffsetY = Math.round(-offsetY * 0.65 * 100) / 100;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-testid={testId || 'parallax-section-bg'}
      data-parallax-offset={offsetY}
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 transform-gpu"
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Plane 1: Primary Parallax Semi-Gold & Platinum Chiaroscuro Spotlight + Architectural Grid */}
      <div
        className="absolute -inset-y-28 inset-x-0 transition-transform duration-75 ease-out will-change-transform transform-gpu"
        style={{
          transform: `translate3d(0, ${offsetY}px, 0)`,
          background: radialStyle,
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Warm Semi-Gold & Platinum Architectural Hairline Grid */}
        <div
          className="w-full h-full opacity-[0.075]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(229, 200, 126, 0.55) 1px, transparent 1px), linear-gradient(to bottom, rgba(229, 200, 126, 0.38) 1px, transparent 1px)',
            backgroundSize: '96px 96px',
          }}
        />
      </div>

      {/* Plane 2: Rotating Golden Olfactory Compass / Filigree Medallion */}
      <div
        className="absolute -inset-y-24 inset-x-0 flex items-center justify-center transition-transform duration-75 ease-out will-change-transform transform-gpu"
        style={{
          transform: `translate3d(0, ${Math.round(offsetY * 0.45)}px, 0)`,
          backfaceVisibility: 'hidden',
        }}
      >
        <svg
          viewBox="0 0 400 400"
          className="w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] opacity-[0.08] animate-filigree-slow"
          fill="none"
        >
          <circle
            cx="200"
            cy="200"
            r="175"
            stroke="#E5C87E"
            strokeWidth="1"
            strokeDasharray="6 6"
          />
          <circle
            cx="200"
            cy="200"
            r="138"
            stroke="#D4AF37"
            strokeWidth="0.8"
          />
          <circle
            cx="200"
            cy="200"
            r="96"
            stroke="#F3E5AB"
            strokeWidth="0.7"
            strokeDasharray="3 5"
          />
          <polygon
            points="200,32 222,178 368,200 222,222 200,368 178,222 32,200 178,178"
            stroke="#E5C87E"
            strokeWidth="0.9"
          />
          <line x1="200" y1="10" x2="200" y2="390" stroke="#D4AF37" strokeWidth="0.6" />
          <line x1="10" y1="200" x2="390" y2="200" stroke="#D4AF37" strokeWidth="0.6" />
        </svg>
      </div>

      {/* Plane 3: Counter-Parallax Diagonal Silk Light Ribbon & Editorial Watermark */}
      <div
        className={`absolute -inset-y-24 inset-x-0 flex items-center ${watermarkAlignClass} transition-transform duration-75 ease-out will-change-transform transform-gpu`}
        style={{
          transform: `translate3d(0, ${counterOffsetY}px, 0)`,
          backfaceVisibility: 'hidden',
        }}
      >
        <div
          className="absolute inset-0 opacity-55"
          style={{
            background:
              'linear-gradient(125deg, rgba(212,175,55,0) 24%, rgba(229,200,126,0.065) 50%, rgba(212,175,55,0) 76%)',
          }}
        />
        {watermarkText && (
          <span className="font-brand text-3xl sm:text-6xl lg:text-7xl font-semibold uppercase tracking-[0.34em] text-[#E5C87E]/[0.05] whitespace-nowrap">
            {watermarkText}
          </span>
        )}
      </div>
    </div>
  );
};

export const ParallaxSectionBg = React.memo(ParallaxSectionBgComponent);

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: 'up' | 'left' | 'right' | 'scale';
  delayMs?: number;
  className?: string;
}

/**
 * Bidirectional Scroll-Reveal Wrapper
 * Animates elements smoothly when entering AND exiting the viewport on scroll.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'up',
  delayMs = 0,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  const hiddenClass =
    variant === 'left'
      ? 'scroll-reveal-hidden-left'
      : variant === 'right'
      ? 'scroll-reveal-hidden-right'
      : variant === 'scale'
      ? 'scroll-reveal-hidden-scale'
      : 'scroll-reveal-hidden-up';

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`scroll-reveal-base ${
        isVisible ? 'scroll-reveal-visible' : hiddenClass
      } ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Full-Container Slowly Drifting Mesh Gradient ("Liquid Luxury" Background Effect)
 * Enhances depth and visual richness across the entire application while scrolling.
 */
const LiquidLuxuryBackgroundComponent: React.FC = () => {
  const [scrollShift, setScrollShift] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const y = window.scrollY || 0;
        const nextShift = Math.round((y * 0.06) % 140);
        setScrollShift((prev) => (prev !== nextShift ? nextShift : prev));
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      data-testid="liquid-luxury-background"
      data-scroll-shift={scrollShift}
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 transform-gpu"
      style={{
        transform: 'translateZ(0)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Base Obsidian-Gold Liquid Mesh Canvas */}
      <div
        className="absolute inset-0 transition-transform duration-150 ease-out transform-gpu"
        style={{
          transform: `translate3d(0, ${-scrollShift * 0.35}px, 0)`,
          backfaceVisibility: 'hidden',
          background:
            'radial-gradient(120% 90% at 15% 10%, rgba(212, 175, 55, 0.11) 0%, rgba(11, 10, 14, 0) 60%), radial-gradient(110% 85% at 85% 35%, rgba(229, 200, 126, 0.09) 0%, rgba(11, 10, 14, 0) 62%), radial-gradient(120% 95% at 45% 85%, rgba(180, 134, 52, 0.1) 0%, rgba(11, 10, 14, 0) 65%)',
        }}
      />

      {/* Slowly Drifting Liquid Champagne Gold Mesh Ribbon 1 */}
      <div
        className="absolute -top-[18%] -left-[14%] w-[78vw] h-[78vw] max-w-[760px] max-h-[760px] rounded-full blur-3xl opacity-70 animate-liquid-mesh-1 transform-gpu"
        style={{
          backfaceVisibility: 'hidden',
          background:
            'radial-gradient(circle at 42% 42%, rgba(212, 175, 55, 0.17) 0%, rgba(229, 200, 126, 0.08) 42%, rgba(11, 10, 14, 0) 72%)',
        }}
      />

      {/* Slowly Drifting Smoked Amber & Platinum Mesh Ribbon 2 */}
      <div
        className="absolute top-[22%] -right-[16%] w-[82vw] h-[82vw] max-w-[800px] max-h-[800px] rounded-full blur-3xl opacity-65 animate-liquid-mesh-2 transform-gpu"
        style={{
          backfaceVisibility: 'hidden',
          background:
            'radial-gradient(circle at 55% 48%, rgba(229, 200, 126, 0.14) 0%, rgba(212, 212, 216, 0.06) 45%, rgba(11, 10, 14, 0) 74%)',
        }}
      />

      {/* Slowly Drifting Lower Vault Gold Velvet Mesh Ribbon 3 */}
      <div
        className="absolute -bottom-[20%] left-[12%] w-[80vw] h-[80vw] max-w-[780px] max-h-[780px] rounded-full blur-3xl opacity-70 animate-liquid-mesh-3 transform-gpu"
        style={{
          backfaceVisibility: 'hidden',
          background:
            'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.15) 0%, rgba(161, 124, 48, 0.07) 46%, rgba(11, 10, 14, 0) 74%)',
        }}
      />

      {/* Subtle Liquid Silk Diagonal Sheen */}
      <div
        className="absolute inset-0 opacity-45"
        style={{
          background:
            'linear-gradient(135deg, rgba(212, 175, 55, 0.03) 0%, rgba(11, 10, 14, 0) 35%, rgba(229, 200, 126, 0.045) 52%, rgba(11, 10, 14, 0) 70%, rgba(212, 175, 55, 0.03) 100%)',
        }}
      />
    </div>
  );
};

export const LiquidLuxuryBackground = React.memo(LiquidLuxuryBackgroundComponent);


