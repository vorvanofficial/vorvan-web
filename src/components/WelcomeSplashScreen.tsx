import React, { useEffect, useState } from 'react';
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
  const [progress, setProgress] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const t = getTranslation(locale).splash;

  useEffect(() => {
    if (!isOpen) return;

    // Extended majestic duration (~5.4 seconds) so the welcome intro is never rushed
    const stepTimer = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 2 : 100));
    }, 96);

    const fadeStartTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 5000);

    const autoEnterTimer = setTimeout(() => {
      onEnterVault();
    }, 5600);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(fadeStartTimer);
      clearTimeout(autoEnterTimer);
    };
  }, [isOpen, onEnterVault]);

  if (!isOpen) return null;

  const handleManualEnter = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onEnterVault();
    }, 240);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#0B0A0E] flex flex-col items-center justify-between px-6 py-10 select-none transition-opacity duration-500 overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
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
            onClick={handleManualEnter}
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
