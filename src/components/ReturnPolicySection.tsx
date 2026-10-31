import React from 'react';
import {
  AlertTriangle,
  Ban,
  PackageOpen,
  ShieldAlert,
  Video,
  X,
} from 'lucide-react';
import { ParallaxSectionBg, ScrollReveal } from './ScrollAnimations';
import { getTranslation, SupportedLocale } from '../i18n/translations';

interface ReturnPolicyProps {
  isModal?: boolean;
  onClose?: () => void;
  locale?: SupportedLocale;
}

const SEAL_TITLES = [
  'I · INTEGRITAS FISIK & ATOMIZER',
  'II · PROTOKOL VIDEO UNBOXING',
  'III · TOLERANSI KARGO INTERNASIONAL',
  'IV · KEBIJAKAN FINAL SALE',
];

export const ReturnPolicyContent: React.FC<ReturnPolicyProps> = ({
  isModal = false,
  onClose,
  locale = 'ID',
}) => {
  const t = getTranslation(locale).returnPolicy;
  const icons = [ShieldAlert, Video, PackageOpen, Ban];

  const inner = (
    <div className="space-y-10">
      {/* Header with Calligraphic Script Crown & Shimmering Semi-Gold Title */}
      <ScrollReveal variant="scale">
        <div className="relative border-b border-[#D4AF37]/25 pb-7 text-center">
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-2 right-0 p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer z-10"
              aria-label="Tutup Kebijakan Retur"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div
            className={`w-full max-w-3xl mx-auto space-y-2.5 text-center ${
              isModal ? 'pt-6 sm:pt-0 sm:px-10' : ''
            }`}
          >
            <p className="font-latin-script text-3xl sm:text-4xl text-gold-champagne text-center">
              Charte d’Authenticité & Garantie
            </p>
            <p className="font-brand text-[10px] sm:text-xs uppercase tracking-[0.26em] text-[#E5C87E] font-semibold text-center">
              {t.kicker}
            </p>
            <h2
              className="font-serif-luxury text-3xl sm:text-5xl font-semibold text-gold-shimmer leading-tight tracking-wide text-center"
              style={{ textWrap: 'balance' }}
            >
              {t.title}
            </h2>
            <p className="font-latin-italic text-base sm:text-lg text-zinc-200 max-w-2xl mx-auto leading-relaxed pt-1 text-center">
              {t.subtitle}
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* 4 Policy Pillars — Flush Equal Height Architectural Gold Seal Plaques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {t.clauses.map((clause, idx) => {
          const IconComponent = icons[idx % icons.length];
          const sealTitle = SEAL_TITLES[idx] || t.clausePrefix;

          return (
            <ScrollReveal
              key={clause.title}
              variant={idx % 2 === 0 ? 'left' : 'right'}
              delayMs={idx * 95}
              className="h-full"
            >
              <div className="relative h-full p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-[#16151F]/95 to-[#0F0E15]/95 border border-[#D4AF37]/35 hover:border-[#E5C87E]/65 transition-all duration-300 flex flex-col justify-between space-y-4 overflow-hidden animate-platinum-card">
                {/* Ambient Corner Gold Spotlight */}
                <div
                  aria-hidden="true"
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0) 70%)',
                  }}
                />

                <div className="space-y-3.5 relative z-10">
                  {/* Top Seal Ribbon */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#D4AF37]/20">
                    <span className="font-brand text-[10px] uppercase tracking-[0.22em] text-[#D8BE82] font-semibold">
                      {sealTitle}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#0B0A0E] border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
                      <IconComponent className="w-4 h-4 text-[#E5C87E]" />
                    </div>
                  </div>

                  <h3 className="font-serif-luxury text-xl sm:text-2xl font-semibold text-[#F5E6B8] leading-snug tracking-wide">
                    {clause.title}
                  </h3>

                  <p className="font-latin-italic text-base text-zinc-200/95 leading-[1.75]">
                    {clause.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Mandatory Unboxing Checklist Seal Banner */}
      <ScrollReveal variant="scale" delayMs={160}>
        <div className="relative p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#14131C]/95 via-[#181622]/95 to-[#14131C]/95 border border-[#D4AF37]/45 shadow-[0_12px_34px_-14px_rgba(212,175,55,0.22)] flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4 overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#F5E6B8]/70 to-transparent"
          />
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/45 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#E5C87E]" />
            </div>
            <div className="space-y-1">
              <p className="font-brand text-xs font-semibold text-[#F5E6B8] uppercase tracking-[0.18em]">
                {t.deadlineTitle}
              </p>
              <p className="font-latin-italic text-sm sm:text-base text-zinc-200">
                {t.deadlineDesc}
              </p>
            </div>
          </div>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl btn-luxury-gold font-brand text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.understandBtn}
            </button>
          )}
        </div>
      </ScrollReveal>
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Kebijakan Retur dan Jaminan VORVAN"
      >
        <div className="w-full max-w-4xl rounded-2xl bg-[#111016] border border-[#D4AF37]/40 p-6 sm:p-10 my-auto">
          {inner}
        </div>
      </div>
    );
  }

  return (
    <section
      id="return-policy"
      className="relative overflow-hidden py-16 sm:py-24 border-t border-[#D4AF37]/25 bg-[#0E0D13]/65"
    >
      <ParallaxSectionBg
        speed={0.16}
        tone="obsidian"
        watermarkText="VIII · CHARTE DE GARANTIE"
        align="right"
        testId="parallax-bg-return-policy"
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {inner}
      </div>
    </section>
  );
};

