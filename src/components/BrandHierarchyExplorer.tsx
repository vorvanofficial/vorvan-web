import React, { useEffect, useRef, useState } from 'react';
import { LUXURY_BRAND_HOUSES } from '../data/catalog';
import {
  BrandHouseId,
  FragranceItem,
  GenderCategory,
} from '../types/fragrance';
import { filterFragrancesByBrandAndGender } from '../utils/businessRules';
import { FragranceCard } from './FragranceCard';
import { ParallaxSectionBg, ScrollReveal } from './ScrollAnimations';
import { getTranslation, SupportedLocale } from '../i18n/translations';

interface BrandHierarchyExplorerProps {
  registeredEmail?: string | null;
  locale?: SupportedLocale;
  onOpenDossier: (fragrance: FragranceItem, selectedVolume: string) => void;
  onInquireFragrance: (fragrance: FragranceItem, selectedVolume: string) => void;
}

export const BrandHierarchyExplorer: React.FC<BrandHierarchyExplorerProps> = ({
  registeredEmail,
  locale = 'ID',
  onOpenDossier,
  onInquireFragrance,
}) => {
  const [selectedBrandId, setSelectedBrandId] =
    useState<BrandHouseId>('louis-vuitton');
  const [selectedGender, setSelectedGender] = useState<GenderCategory | 'ALL'>(
    'ALL'
  );

  const brandGridRef = useRef<HTMLDivElement | null>(null);
  const brandShowcaseRef = useRef<HTMLDivElement | null>(null);
  const ribbonBarRef = useRef<HTMLDivElement | null>(null);

  const t = getTranslation(locale).explorer;

  const activeBrand =
    LUXURY_BRAND_HOUSES.find((b) => b.id === selectedBrandId) ||
    LUXURY_BRAND_HOUSES[0];

  const allBrandFragrances = filterFragrancesByBrandAndGender(
    selectedBrandId,
    'ALL'
  );

  const filteredByGender = filterFragrancesByBrandAndGender(
    selectedBrandId,
    selectedGender
  );

  const matchingFragrances =
    filteredByGender.length > 0 ? filteredByGender : allBrandFragrances;

  // Keep active chip centered inside the horizontal quick-switch ribbon
  useEffect(() => {
    const bar = ribbonBarRef.current;
    if (!bar) return;
    const activeChip = bar.querySelector(
      `[data-ribbon-brand="${selectedBrandId}"]`
    ) as HTMLElement | null;
    if (activeChip) {
      const targetLeft =
        activeChip.offsetLeft -
        bar.clientWidth / 2 +
        activeChip.clientWidth / 2;
      bar.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
    }
  }, [selectedBrandId]);

  const smoothScrollToBrandShowcase = () => {
    setTimeout(() => {
      const targetEl = brandShowcaseRef.current;
      if (targetEl && typeof window !== 'undefined') {
        const yOffset = -70; // Ruang untuk sticky header
        const y =
          targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 90);
  };

  const smoothScrollToBrandGrid = () => {
    const gridEl = brandGridRef.current;
    if (gridEl && typeof window !== 'undefined') {
      const yOffset = -80;
      const y =
        gridEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleSelectBrand = (
    brandId: BrandHouseId,
    shouldAutoGlide: boolean = false
  ) => {
    setSelectedBrandId(brandId);
    const hasCurrentGender =
      selectedGender === 'ALL' ||
      filterFragrancesByBrandAndGender(brandId, selectedGender).length > 0;
    if (!hasCurrentGender) {
      setSelectedGender('ALL');
    }
    if (shouldAutoGlide) {
      smoothScrollToBrandShowcase();
    }
  };

  const genderOptions: {
    id: GenderCategory;
    label: string;
    subtitle: string;
    count: number;
  }[] = [
    {
      id: 'GENTLEMAN',
      label: 'GENTLEMAN',
      subtitle: t.genderSubtitles.GENTLEMAN,
      count: filterFragrancesByBrandAndGender(selectedBrandId, 'GENTLEMAN').length,
    },
    {
      id: 'FEMME',
      label: 'FEMME',
      subtitle: t.genderSubtitles.FEMME,
      count: filterFragrancesByBrandAndGender(selectedBrandId, 'FEMME').length,
    },
    {
      id: 'UNISEX',
      label: 'UNISEX',
      subtitle: t.genderSubtitles.UNISEX,
      count: filterFragrancesByBrandAndGender(selectedBrandId, 'UNISEX').length,
    },
  ];

  // Clean "Est. 1854" so it never renders as "EST. EST. 1854"
  const formattedEstLabel = `EST. ${activeBrand.est.replace(/^est\.?\s*/i, '')}`;

  return (
    <section
      id="brand-hierarchy-explorer"
      className="relative overflow-x-clip py-16 sm:py-24 bg-[#0B0A0F] border-t border-[#D4AF37]/25"
      data-testid="brand-hierarchy-section"
    >
      <ParallaxSectionBg
        speed={0.18}
        tone="champagne"
        watermarkText="III · MAISONS D’EUROPE"
        align="right"
        testId="parallax-bg-houses"
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Section Header — Centered Precision on Mobile */}
        <ScrollReveal variant="up">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between text-center md:text-left gap-5 pb-8 border-b border-[#D4AF37]/25">
            <div className="space-y-2">
              <p className="font-latin-script text-2xl sm:text-3xl text-gold-champagne">
                {t.scriptCrown}
              </p>
              <p className="font-brand text-[10px] sm:text-xs uppercase tracking-[0.24em] text-[#D8BE82]">
                {t.kicker}
              </p>
              <h2 className="font-serif-luxury text-3xl sm:text-5xl font-semibold text-white tracking-wide">
                {t.title}
              </h2>
            </div>
            <p className="font-latin-italic text-base sm:text-lg text-zinc-200 max-w-md leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </ScrollReveal>

        {/* LUXURY BRAND HOUSE SELECTOR (19 BRANDS) — AUTO-GLIDE ON CLICK */}
        <ScrollReveal variant="up" delayMs={60} className="space-y-4">
          <div
            ref={brandGridRef}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5"
            role="tablist"
            aria-label="Pilih Rumah Parfum Mewah"
          >
            {LUXURY_BRAND_HOUSES.map((brand) => {
              const isSelected = brand.id === selectedBrandId;
              return (
                <button
                  key={brand.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectBrand(brand.id, true)}
                  data-testid={`brand-tab-${brand.id}`}
                  className={`min-h-[68px] p-3.5 rounded-xl text-center border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'btn-luxury-gold scale-[1.02]'
                      : 'bg-[#131218] text-zinc-200 border-[#D4AF37]/25 hover:border-[#E5C87E]/70 hover:text-white'
                  }`}
                >
                  <span
                    className={`font-brand text-[11px] sm:text-sm font-bold tracking-[0.08em] sm:tracking-[0.15em] uppercase block truncate max-w-full ${
                      isSelected ? 'text-zinc-950' : 'text-white'
                    }`}
                  >
                    {brand.shortName}
                  </span>
                  <span
                    className={`mt-1 font-latin-italic text-xs tracking-wider block truncate max-w-full ${
                      isSelected
                        ? 'text-zinc-900 font-semibold'
                        : 'text-[#D8BE82]'
                    }`}
                  >
                    {brand.origin}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* 1. PITA GESER 19 MERK CEPAT (STICKY QUICK-SWITCH RIBBON) */}
        <div
          ref={ribbonBarRef}
          className="vorvan-quick-brand-bar"
          role="region"
          aria-label="Pita Geser Cepat 19 Merk"
          data-testid="vorvan-quick-brand-bar"
        >
          <button
            type="button"
            onClick={smoothScrollToBrandGrid}
            className="vorvan-back-grid-btn"
            data-testid="vorvan-back-grid-btn"
          >
            ↑ 19 Merk
          </button>
          {LUXURY_BRAND_HOUSES.map((brand) => {
            const isChipActive = brand.id === selectedBrandId;
            return (
              <button
                key={`ribbon-${brand.id}`}
                type="button"
                data-ribbon-brand={brand.id}
                data-testid={`ribbon-chip-${brand.id}`}
                onClick={() => handleSelectBrand(brand.id, false)}
                className={`vorvan-ribbon-chip font-brand ${
                  isChipActive ? 'active' : ''
                }`}
              >
                {brand.shortName}
              </button>
            );
          })}
        </div>

        {/* ACTIVE BRAND SHOWCASE + COMPACT GENDER PILLS */}
        <div ref={brandShowcaseRef}>
          <ScrollReveal variant="scale" delayMs={70}>
            <div
              key={`house-banner-${activeBrand.id}`}
              className="p-5 sm:p-7 bg-gradient-to-b from-[#16151D] to-[#100F15] border border-[#D4AF37]/35 rounded-2xl space-y-4 animate-fade-up"
            >
              <div className="flex flex-col lg:flex-row items-center justify-between text-center lg:text-left gap-4 pb-4 border-b border-[#D4AF37]/20">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-center lg:justify-start gap-2 font-brand text-[10px] text-[#E5C87E] uppercase tracking-[0.24em]">
                    <span>{activeBrand.origin}</span>
                    <span aria-hidden="true">·</span>
                    <span data-testid="active-brand-est">{formattedEstLabel}</span>
                  </div>
                  <h3 className="font-brand text-2xl sm:text-3xl text-gold-shimmer font-semibold tracking-[0.2em]">
                    {activeBrand.name}
                  </h3>
                  <p className="font-latin-italic text-base text-zinc-200 leading-relaxed max-w-2xl">
                    “{activeBrand.signaturePhilosophy}”
                  </p>
                </div>

                {/* Single-Line Non-Wrapping Bracket Strip */}
                <div className="hidden lg:flex items-center justify-end">
                  <div className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#0B0A0E]/90 border border-[#D4AF37]/30 font-brand text-[10px] sm:text-xs text-[#F5E6B8] tracking-[0.16em] font-semibold whitespace-nowrap">
                    <span className="whitespace-nowrap">[ GENTLEMAN ]</span>
                    <span aria-hidden="true" className="text-[#D4AF37]">
                      •
                    </span>
                    <span className="whitespace-nowrap">[ FEMME ]</span>
                    <span aria-hidden="true" className="text-[#D4AF37]">
                      •
                    </span>
                    <span className="whitespace-nowrap">[ UNISEX ]</span>
                  </div>
                </div>
              </div>

              {/* 2. BARIS KAPSUL GENDER RAMPING (.vorvan-compact-gender-row) */}
              <div
                className="vorvan-compact-gender-row"
                role="group"
                aria-label={`Pilih kategori gender untuk ${activeBrand.name}`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedGender('ALL')}
                  data-testid="gender-btn-all"
                  className={`vorvan-gender-pill font-brand ${
                    selectedGender === 'ALL' ? 'active' : ''
                  }`}
                >
                  [ {t.allCollectionLabel} ]
                </button>

                {genderOptions.map((g) => {
                  const active = selectedGender === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGender(g.id)}
                      data-testid={`gender-btn-${g.id.toLowerCase()}`}
                      className={`vorvan-gender-pill font-brand ${
                        active ? 'active' : ''
                      }`}
                    >
                      [ {g.label} ]
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* MATCHING FRAGRANCE CARDS — EQUAL HEIGHT & FLUSH BOTTOM/SIDE FRAMES */}
        <div
          key={`${selectedBrandId}-${selectedGender}`}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch animate-blur-sharp"
        >
          {matchingFragrances.map((fragrance, idx) => (
            <ScrollReveal
              key={fragrance.id}
              variant={idx % 2 === 0 ? 'up' : 'scale'}
              delayMs={idx * 70}
              className="h-full"
            >
              <FragranceCard
                fragrance={fragrance}
                registeredEmail={registeredEmail}
                locale={locale}
                onOpenDossier={onOpenDossier}
                onInquireFragrance={onInquireFragrance}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
