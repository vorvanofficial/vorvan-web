import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import { LUXURY_BRAND_HOUSES } from '../data/catalog';
import {
  BrandHouseId,
  FragranceItem,
  GenderCategory,
} from '../types/fragrance';
import {
  filterFragrancesByBrandAndGender,
  searchCatalogFragrances81,
} from '../utils/businessRules';
import { FragranceCard } from './FragranceCard';
import { ExtendedArchiveBanner } from './ExtendedArchiveBanner';
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
  const [selectedGender, setSelectedGender] = useState<
    GenderCategory | 'ALL'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Strict gender filtering: NEVER fall back to allBrandFragrances when filtered count is 0
  const matchingFragrances = filterFragrancesByBrandAndGender(
    selectedBrandId,
    selectedGender
  );

  const isSearching = searchQuery.trim().length > 0;
  const searchResults = isSearching
    ? searchCatalogFragrances81(searchQuery)
    : matchingFragrances;
  const isEmptySearch = isSearching && searchResults.length === 0;
  const isEmptyGenderFilter = !isSearching && matchingFragrances.length === 0;
  const shouldShowFragranceGrid = !isEmptySearch && searchResults.length > 0;

  const matchingBrandIds = new Set(
    (isSearching ? searchResults : allBrandFragrances).map(
      (item) => item.brandId
    )
  );
  const visibleBrands = isSearching
    ? LUXURY_BRAND_HOUSES.filter((brand) => matchingBrandIds.has(brand.id))
    : LUXURY_BRAND_HOUSES;

  const centerRibbonChipManual = (brandId: BrandHouseId) => {
    const bar = ribbonBarRef.current;
    if (!bar) return;
    const activeChip = bar.querySelector(
      `[data-ribbon-brand="${brandId}"]`
    ) as HTMLElement | null;
    if (activeChip) {
      if (typeof activeChip.scrollIntoView === 'function') {
        activeChip.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      } else {
        const targetLeft =
          activeChip.offsetLeft -
          bar.clientWidth / 2 +
          activeChip.clientWidth / 2;
        bar.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
      }
    }
  };

  const smoothScrollToBrandShowcase = () => {
    setTimeout(() => {
      const targetEl = brandShowcaseRef.current;
      if (targetEl && typeof window !== 'undefined') {
        const yOffset = -124; // Ruang untuk sticky header + sticky 19-brand bar
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

  const handleScrollRibbonBy = (delta: number) => {
    const bar = ribbonBarRef.current;
    if (!bar) return;
    bar.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const handleSelectBrand = (
    brandId: BrandHouseId,
    shouldAutoGlide: boolean = false
  ) => {
    setSelectedBrandId(brandId);
    setSelectedGender('ALL');
    if (searchQuery.trim()) {
      setSearchQuery('');
    }
    if (shouldAutoGlide) {
      centerRibbonChipManual(brandId);
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

  const emptyGenderWaMessage = `Halo Concierge VORVAN, saya sedang mengeksplorasi rumah mode *${activeBrand.name}* kategori *[ ${selectedGender} ]* di halaman 19 HOUSES. Apakah terdapat koleksi *${activeBrand.name}* kategori *${selectedGender}* pada Extended Archive (693+ Koleksi)? Mohon informasi ketersediaan & penawaran harga privatnya.`;
  const emptyGenderWaUrl = `https://wa.me/628133866590?text=${encodeURIComponent(
    emptyGenderWaMessage
  )}`;

  return (
    <section
      id="brand-hierarchy-explorer"
      className="relative overflow-x-clip py-10 sm:py-16 bg-[#0B0A0F] border-t border-[#D4AF37]/25"
      data-testid="brand-hierarchy-section"
    >
      <ParallaxSectionBg
        speed={0.18}
        tone="champagne"
        watermarkText="III · MAISONS D’EUROPE"
        align="right"
        testId="parallax-bg-houses"
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-7 mb-5 sm:mb-6">
        {/* Section Header — Centered Precision on Mobile */}
        <ScrollReveal variant="up">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between text-center md:text-left gap-4 pb-6 border-b border-[#D4AF37]/25">
            <div className="space-y-1.5">
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

        {/* Instant Search Input Across 19 Houses + 693+ Extended Vault Archive Trigger */}
        <ScrollReveal variant="up" delayMs={40}>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-[#E5C87E] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari parfum atau brand di 19 Houses (mis. Baccarat, Aventus, Bvlgari, Xerjoff)..."
                aria-label="Cari parfum atau brand di 19 Houses"
                data-testid="houses-search-input"
                className="w-full h-12 pl-11 pr-10 rounded-xl bg-[#131218] border border-[#D4AF37]/40 focus:border-[#F5E6B8] focus:outline-none text-sm sm:text-base text-white placeholder:text-zinc-400 transition-colors"
              />
              {searchQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  data-testid="houses-search-clear-btn"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* DIRECT EMPTY-SEARCH NOTIFICATION CARD RIGHT BELOW SEARCH BAR */}
        {isEmptySearch && (
          <ExtendedArchiveBanner
            emptySearchTerm={searchQuery}
            testIdPrefix="houses-empty-search-extended-archive"
          />
        )}

        {/* LUXURY BRAND HOUSE SELECTOR — HIDDEN WHEN EMPTY SEARCH, FILTERED TO MATCHING BRANDS WHEN SEARCHING */}
        {!isEmptySearch && visibleBrands.length > 0 && (
          <ScrollReveal variant="up" delayMs={60} className="space-y-4">
            <div
              ref={brandGridRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5"
              role="tablist"
              aria-label="Pilih Rumah Parfum Mewah"
              data-testid="houses-brand-grid"
            >
              {visibleBrands.map((brand) => {
                const isSelected = !isSearching && brand.id === selectedBrandId;
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
        )}
      </div>

      {/* 1. PITA GESER 19 MERK CEPAT — HIDDEN WHEN EMPTY SEARCH */}
      {!isEmptySearch && visibleBrands.length > 0 && (
        <div
          className="vorvan-quick-brand-bar"
          role="region"
          aria-label="Pita Geser Cepat 19 Merk"
          data-testid="vorvan-quick-brand-bar"
        >
          <div className="vorvan-ribbon-edge-fade-left" aria-hidden="true" />
          <button
            type="button"
            onClick={() => handleScrollRibbonBy(-320)}
            className="vorvan-ribbon-arrow vorvan-ribbon-arrow-left font-brand text-xs font-bold"
            aria-label="Geser daftar merk ke kiri"
            data-testid="ribbon-scroll-left"
          >
            &lt;
          </button>

          <div
            ref={ribbonBarRef}
            className="vorvan-quick-brand-track"
            data-testid="vorvan-quick-brand-track"
          >
            <button
              type="button"
              onClick={smoothScrollToBrandGrid}
              className="vorvan-back-grid-btn"
              data-testid="vorvan-back-grid-btn"
            >
              ↑ 19 Merk
            </button>
            {visibleBrands.map((brand) => {
              const isChipActive = !isSearching && brand.id === selectedBrandId;
              return (
                <button
                  key={`ribbon-${brand.id}`}
                  type="button"
                  data-ribbon-brand={brand.id}
                  data-testid={`ribbon-chip-${brand.id}`}
                  onClick={(e) => {
                    e.currentTarget.scrollIntoView({
                      behavior: 'smooth',
                      inline: 'center',
                      block: 'nearest',
                    });
                    handleSelectBrand(brand.id, true);
                  }}
                  className={`vorvan-ribbon-chip font-brand ${
                    isChipActive ? 'active' : ''
                  }`}
                >
                  {brand.shortName}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleScrollRibbonBy(320)}
            className="vorvan-ribbon-arrow vorvan-ribbon-arrow-right font-brand text-xs font-bold"
            aria-label="Geser daftar merk ke kanan"
            data-testid="ribbon-scroll-right"
          >
            &gt;
          </button>
          <div className="vorvan-ribbon-edge-fade-right" aria-hidden="true" />
        </div>
      )}

      {!isEmptySearch && (
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-5 sm:mt-6 space-y-6 sm:space-y-8">
          {/* ACTIVE BRAND SHOWCASE + COMPACT GENDER PILLS — HIDDEN DURING SEARCH */}
          {!isSearching && (
            <div ref={brandShowcaseRef} data-testid="active-brand-showcase-card">
              <div
                key={`house-banner-${activeBrand.id}`}
                className="p-5 sm:p-6 bg-gradient-to-b from-[#16151D] to-[#100F15] border border-[#D4AF37]/35 rounded-2xl space-y-3.5 animate-fade-up"
              >
                <div className="flex flex-col lg:flex-row items-center justify-between text-center lg:text-left gap-3.5 pb-3.5 border-b border-[#D4AF37]/20">
                  <div className="space-y-1">
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
                    aria-pressed={selectedGender === 'ALL'}
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
                        aria-pressed={active}
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
            </div>
          )}

          {/* EMPTY GENDER FILTER CARD WHEN SELECTED BRAND HAS 0 ITEMS IN THAT GENDER */}
          {isEmptyGenderFilter && (
            <div
              data-testid="empty-gender-filter-card"
              className="max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#15141C] to-[#0D0C12] border border-[#D4AF37]/40 text-center space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.75)] animate-fade-up"
            >
              <p className="font-latin-script text-2xl sm:text-3xl text-gold-champagne m-0">
                L’Archive Privée Étendue
              </p>
              <p className="font-brand text-[10px] sm:text-xs uppercase tracking-[0.22em] text-[#E5C87E] font-semibold">
                {activeBrand.name} · KATEGORI [ {selectedGender} ]
              </p>
              <p
                data-testid="empty-gender-filter-message"
                className="font-latin-italic italic text-base sm:text-lg text-zinc-200 max-w-xl mx-auto leading-relaxed"
              >
                “Seluruh koleksi etalase utama pada rumah mode ini dirancang sebagai komposisi UNISEX, atau tersedia melalui Extended Archive (693+ Koleksi).”
              </p>
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setSelectedGender('ALL')}
                  data-testid="empty-gender-see-all-btn"
                  className="btn-luxury-gold h-11 px-4 rounded-xl font-brand text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] flex items-center justify-center whitespace-nowrap cursor-pointer"
                >
                  [ LIHAT SEMUA KOLEKSI ]
                </button>
                <a
                  href={emptyGenderWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="empty-gender-wa-btn"
                  className="h-11 px-4 rounded-xl bg-[#16151E] hover:bg-[#1E1C28] text-[#F5E6B8] border border-[#D4AF37]/55 hover:border-[#F5E6B8] font-brand text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] flex items-center justify-center whitespace-nowrap transition-all cursor-pointer no-underline"
                >
                  [ TANYA CONCIERGE WA ]
                </a>
              </div>
            </div>
          )}

          {/* MATCHING FRAGRANCE CARDS — 100% STRICT GENDER MATCH */}
          {shouldShowFragranceGrid && (
            <div
              key={
                isSearching
                  ? `search-${searchQuery.trim()}`
                  : `${selectedBrandId}-${selectedGender}`
              }
              data-testid="houses-fragrance-grid"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 items-stretch"
            >
              {searchResults.map((fragrance) => (
                <motion.div
                  key={fragrance.id}
                  initial={{ opacity: 0, y: 32, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.12, margin: "0px 0px -20px 0px" }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full will-change-transform transform-gpu"
                >
                  <FragranceCard
                    fragrance={fragrance}
                    registeredEmail={registeredEmail}
                    locale={locale}
                    onOpenDossier={onOpenDossier}
                    onInquireFragrance={onInquireFragrance}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
