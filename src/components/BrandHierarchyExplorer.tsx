import React, { useState } from 'react';
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

  const handleSelectBrand = (brandId: BrandHouseId) => {
    setSelectedBrandId(brandId);
    const hasCurrentGender =
      selectedGender === 'ALL' ||
      filterFragrancesByBrandAndGender(brandId, selectedGender).length > 0;
    if (!hasCurrentGender) {
      setSelectedGender('ALL');
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

  return (
    <section
      id="brand-hierarchy-explorer"
      className="relative overflow-hidden py-16 sm:py-24 bg-[#0B0A0F] border-t border-[#D4AF37]/25"
      data-testid="brand-hierarchy-section"
    >
      <ParallaxSectionBg
        speed={0.18}
        tone="champagne"
        watermarkText="III · MAISONS D’EUROPE"
        align="right"
        testId="parallax-bg-houses"
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
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

        {/* LUXURY BRAND HOUSE SELECTOR (11 BRANDS) — NO "LANGKAH 01" LABEL */}
        <ScrollReveal variant="up" delayMs={60} className="space-y-4">
          <div
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
                  onClick={() => handleSelectBrand(brand.id)}
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

        {/* GENDER CLASSIFICATION ([ GENTLEMAN ] • [ FEMME ] • [ UNISEX ]) — NO "LANGKAH 02" & NON-WRAPPING BRACKETS */}
        <ScrollReveal variant="scale" delayMs={90}>
          <div
            key={`house-banner-${activeBrand.id}`}
            className="p-5 sm:p-8 bg-gradient-to-b from-[#16151D] to-[#100F15] border border-[#D4AF37]/35 rounded-2xl space-y-6 animate-fade-up"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between text-center lg:text-left gap-4 pb-6 border-b border-[#D4AF37]/20">
              <div className="space-y-1.5">
                <div className="flex items-center justify-center lg:justify-start gap-2 font-brand text-[10px] text-[#E5C87E] uppercase tracking-[0.24em]">
                  <span>{activeBrand.origin}</span>
                  <span aria-hidden="true">·</span>
                  <span>EST. {activeBrand.est}</span>
                </div>
                <h3 className="font-brand text-2xl sm:text-3xl text-gold-shimmer font-semibold tracking-[0.2em]">
                  {activeBrand.name}
                </h3>
                <p className="font-latin-italic text-base text-zinc-200 leading-relaxed max-w-2xl">
                  “{activeBrand.signaturePhilosophy}”
                </p>
              </div>

              {/* Single-Line Non-Wrapping Bracket Strip */}
              <div className="flex items-center justify-center lg:justify-end">
                <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2 rounded-xl bg-[#0B0A0E]/90 border border-[#D4AF37]/30 font-brand text-[10px] sm:text-xs text-[#F5E6B8] tracking-[0.12em] sm:tracking-[0.18em] font-semibold whitespace-nowrap">
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

            {/* Interactive Gender Buttons — Strictly Non-Wrapping Brackets & Flush Height */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-stretch"
              role="group"
              aria-label={`Pilih kategori gender untuk ${activeBrand.name}`}
            >
              {genderOptions.map((g) => {
                const active = selectedGender === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGender(g.id)}
                    data-testid={`gender-btn-${g.id.toLowerCase()}`}
                    className={`h-full p-3.5 sm:p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-between ${
                      active
                        ? 'btn-luxury-gold shadow-md'
                        : 'bg-[#0C0B10] text-zinc-200 border-[#D4AF37]/25 hover:border-[#E5C87E]/70'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center gap-1 font-brand text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] sm:tracking-[0.16em] whitespace-nowrap ${
                        active ? 'text-zinc-950' : 'text-[#F5E6B8]'
                      }`}
                    >
                      <span>[</span>
                      <span>{g.label}</span>
                      <span>]</span>
                    </span>
                    <p
                      className={`mt-2 font-latin-italic text-xs leading-snug line-clamp-2 ${
                        active ? 'text-zinc-900 font-semibold' : 'text-zinc-300'
                      }`}
                    >
                      {g.subtitle}
                    </p>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setSelectedGender('ALL')}
                data-testid="gender-btn-all"
                className={`h-full p-3.5 sm:p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-between ${
                  selectedGender === 'ALL'
                    ? 'btn-luxury-gold shadow-md'
                    : 'bg-[#0C0B10] text-zinc-200 border-[#D4AF37]/25 hover:border-[#E5C87E]/70'
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center gap-1 font-brand text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] sm:tracking-[0.14em] whitespace-nowrap ${
                    selectedGender === 'ALL' ? 'text-zinc-950' : 'text-[#F5E6B8]'
                  }`}
                >
                  <span>[</span>
                  <span>{t.allCollectionLabel}</span>
                  <span>]</span>
                </span>
                <p
                  className={`mt-2 font-latin-italic text-xs leading-snug line-clamp-2 ${
                    selectedGender === 'ALL'
                      ? 'text-zinc-900 font-semibold'
                      : 'text-zinc-300'
                  }`}
                >
                  {t.allCollectionSub}
                </p>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* MATCHING FRAGRANCE CARDS — EQUAL HEIGHT & FLUSH BOTTOM/SIDE FRAMES (NO "LANGKAH 03") */}
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
