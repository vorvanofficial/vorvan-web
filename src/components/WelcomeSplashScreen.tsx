import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getTranslation, SupportedLocale } from '../i18n/translations';

interface WelcomeSplashScreenProps {
  isOpen: boolean;
  onEnterVault: () => void;
  locale?: SupportedLocale;
}

export const WelcomeSplashScreen: React.FC<WelcomeSplashScreenProps> = ({
  isOpen,
  onEnterVault,
  locale = 'ID',
}) => {
  const [shouldRender, setShouldRender] = useState<boolean>(isOpen);
  const [progress, setProgress] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  const isExitingRef = useRef<boolean>(false);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoExitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = getTranslation(locale).splash;

  const clearSplashTimers = useCallback(() => {
    if (stepTimerRef.current !== null) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    if (autoExitTimerRef.current !== null) {
      clearTimeout(autoExitTimerRef.current);
      autoExitTimerRef.current = null;
    }
  }, []);

  const triggerSmoothExit = useCallback(() => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    clearSplashTimers();

    if (typeof window !== 'undefined' && window.scrollY !== 0) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    setProgress(100);
    // Mount Header & Bottom Bar underneath while splash is still opaque (0px layout shift),
    // then smoothly dissolve the z-[9999] splash curtain over 420ms on the GPU.
    onEnterVault();

    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => {
        setIsFadingOut(true);
      });
    } else {
      setIsFadingOut(true);
    }

    unmountTimerRef.current = setTimeout(() => {
      setShouldRender(false);
    }, 440);
  }, [clearSplashTimers, onEnterVault]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (!isOpen) {
      if (!isExitingRef.current) {
        setShouldRender(false);
      }
      return;
    }

    setShouldRender(true);
    setIsFadingOut(false);
    isExitingRef.current = false;

    if (typeof window !== 'undefined' && window.scrollY !== 0) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    stepTimerRef.current = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 2 : 100));
    }, 96);

    autoExitTimerRef.current = setTimeout(() => {
      triggerSmoothExit();
    }, 5100);

    return () => {
      clearSplashTimers();
    };
  }, [isOpen, clearSplashTimers, triggerSmoothExit]);

  useEffect(() => {
    return () => {
      if (unmountTimerRef.current !== null) {
        clearTimeout(unmountTimerRef.current);
      }
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0B0A0E] flex flex-col items-center justify-between px-6 py-10 select-none overflow-hidden touch-none transform-gpu will-change-[opacity,transform] transition-[opacity,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isFadingOut
          ? 'opacity-0 scale-[1.015] pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      data-testid="welcome-splash-screen"
    >
      {/* Ambient Champagne Semi-Gold Radial Glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(212, 175, 55, 0.16) 0%, rgba(229, 200, 126, 0.05) 45%, rgba(11, 10, 14, 0) 75%)',
        }}
      />

      {/* Top Subtle Whisper */}
      <div className="relative z-10 font-brand text-[10px] uppercase tracking-[0.38em] text-[#E5C87E]/80 animate-fade-up">
        {t.vaultWhisper}
      </div>

      {/* Center Welcome Headline */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl my-auto">
        <div className="space-y-2.5 animate-fade-up">
          <p className="font-latin-script text-3xl sm:text-4xl text-gold-champagne">
            {t.scriptCrown}
          </p>
          <h1 className="font-brand text-xl sm:text-3xl font-semibold tracking-[0.3em] text-gold-shimmer uppercase">
            {t.welcomeTitle}
          </h1>
          <p className="font-brand text-[11px] sm:text-xs tracking-[0.38em] text-[#E5C87E]/90 uppercase">
            {t.tagline}
          </p>
        </div>

        {/* Hairline Semi-Gold Progress Indicator & Enter Vault CTA */}
        <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-[290px] sm:max-w-[330px] px-2 animate-fade-up">
          <div className="w-full h-1 rounded-full bg-zinc-800/90 overflow-hidden border border-[#D4AF37]/25">
            <div
              className="h-full bg-gradient-to-r from-[#C8A24A] via-[#F5E6B8] to-[#D4AF37] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <button
            type="button"
            onClick={triggerSmoothExit}
            className="w-full py-3.5 px-5 sm:px-7 rounded-xl btn-luxury-gold font-brand text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] text-center flex items-center justify-center transition-all active:scale-[0.99] cursor-pointer whitespace-nowrap shrink-0"
            data-testid="enter-vault-btn"
          >
            <span>{t.enterVaultBtn}</span>
          </button>
        </div>
      </div>

      {/* Bottom Editorial Note */}
      <div className="relative z-10 font-brand text-[10px] uppercase tracking-[0.28em] text-[#D8BE82]/75 text-center animate-fade-up">
        {t.bottomNote}
      </div>
    </div>
  );
};
