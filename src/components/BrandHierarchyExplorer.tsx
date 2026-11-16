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
  whatsappNumber?: string;
  telegramUsername?: string;
  onOpenDossier: (fragrance: FragranceItem, selectedVolume: string) => void;
  onInquireFragrance: (fragrance: FragranceItem, selectedVolume: string) => void;
}

export const BrandHierarchyExplorer: React.FC<BrandHierarchyExplorerProps> = ({
  registeredEmail,
  locale = 'ID',
  whatsappNumber,
  telegramUsername,
  onOpenDossier,
  onInquireFragrance,
}) => {
  const [selectedBrandId, setSelectedBrandId] =
    useState<BrandHouseId>('louis-vuitton');
  const [selectedGender, setSelectedGender] = useState<
    GenderCategory | 'ALL' | null
  >(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const stickyBarRef = useRef<HTMLDivElement | null>(null);
  const catalogContentRef = useRef<HTMLDivElement | null>(null);
  const ribbonBarRef = useRef<HTMLDivElement | null>(null);

  const t = getTranslation(locale).explorer;

  const activeBrand =
    LUXURY_BRAND_HOUSES.find((b) => b.id === selectedBrandId) ||
    LUXURY_BRAND_HOUSES[0];

  const allBrandFragrances = filterFragrancesByBrandAndGender(
    selectedBrandId,
    'ALL'
  );

  // Strict gender filtering: NEVER fall back to allBrandFragrances when filtered count is 0,
  // and wait until a category button is clicked (selectedGender !== null) before showing fragrances.
  const matchingFragrances =
    selectedGender !== null
      ? filterFragrancesByBrandAndGender(selectedBrandId, selectedGender)
      : [];

  const isSearching = searchQuery.trim().length > 0;
  const searchResults = isSearching
    ? searchCatalogFragrances81(searchQuery)
    : matchingFragrances;
  const isEmptySearch = isSearching && searchResults.length === 0;
  const isAwaitingGenderSelection = !isSearching && selectedGender === null;
  const isEmptyGenderFilter =
    !isSearching && selectedGender !== null && matchingFragrances.length === 0;
  const shouldShowFragranceGrid =
    !isEmptySearch &&
    (isSearching
      ? searchResults.length > 0
      : selectedGender !== null && matchingFragrances.length > 0);

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
      const buttonLeft = activeChip.offsetLeft;
      const barWidth = bar.clientWidth;
      const buttonWidth = activeChip.clientWidth;
      bar.scrollTo({
        left: Math.max(0, buttonLeft - barWidth / 2 + buttonWidth / 2),
        behavior: 'smooth',
      });
    }
  };

  const scrollToCatalogContent = () => {
    setTimeout(() => {
      const targetEl = catalogContentRef.current;
      if (!targetEl || typeof window === 'undefined') return;
      const mainHeaderEl = document.querySelector('header');
      const mainHeaderHeight =
        mainHeaderEl?.getBoundingClientRect().height ||
        (window.innerWidth >= 640 ? 64 : 56);
      const stickyBarHeight = stickyBarRef.current?.offsetHeight ?? 140;
      const stickyHeaderTotalHeight = mainHeaderHeight + stickyBarHeight;
      const targetY =
        targetEl.getBoundingClientRect().top +
        window.scrollY -
        stickyHeaderTotalHeight -
        16;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }, 45);
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
    setSelectedGender(null);
    if (searchQuery.trim()) {
      setSearchQuery('');
    }
    if (shouldAutoGlide) {
      setTimeout(() => centerRibbonChipManual(brandId), 30);
      scrollToCatalogContent();
    }
  };

  const handleSelectGender = (gender: GenderCategory | 'ALL') => {
    if (searchQuery.trim()) {
      setSearchQuery('');
    }
    setSelectedGender(gender);
    scrollToCatalogContent();
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

  const emptyGenderWaMessage = `Halo Concierge VORVAN, saya sedang mengeksplorasi rumah mode *${activeBrand.name}* kategori *[ ${selectedGender || ''} ]* di halaman 19 HOUSES. Apakah terdapat koleksi *${activeBrand.name}* kategori *${selectedGender || ''}* pada Extended Archive (693+ Koleksi)? Mohon informasi ketersediaan & penawaran harga privatnya.`;
  const emptyGenderWaUrl = `https://wa.me/628133866590?text=${encodeURIComponent(
    emptyGenderWaMessage
  )}`;

  return (
    <section
      id="brand-hierarchy-explorer"
      className="relative overflow-x-clip pt-6 pb-12 sm:pt-10 sm:pb-16 bg-[#0B0A0F] border-t border-[#D4AF37]/25"
      data-testid="brand-hierarchy-section"
    >
      <ParallaxSectionBg
        speed={0.18}
        tone="champagne"
        watermarkText="III · MAISONS D’EUROPE"
        align="right"
        testId="parallax-bg-houses"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-5">
        {/* Section Header — Compact Editorial Crown */}
        <ScrollReveal variant="up">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between text-center md:text-left gap-3 pb-4 sm:pb-5 border-b border-[#D4AF37]/20">
            <div className="space-y-1">
              <p className="font-latin-script text-2xl sm:text-3xl text-gold-champagne">
                {t.scriptCrown}
              </p>
              <p className="font-brand text-[10px] sm:text-xs uppercase tracking-[0.24em] text-[#D8BE82]">
                {t.kicker}
              </p>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-wide">
                {t.title}
              </h2>
            </div>
            <p className="font-latin-italic text-sm sm:text-base lg:text-lg text-zinc-200 max-w-md leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* UNIFIED 3-ROW STICKY HEADER: SEARCH (38px) + 19-BRAND RIBBON + MODEL 3 GENDER PITA (34px) */}
      <div
        ref={stickyBarRef}
        className="vorvan-quick-brand-bar z-40"
        role="region"
        aria-label="Pencarian, Pita 19 Merk, dan Filter Gender"
        data-testid="vorvan-quick-brand-bar"
      >
        {/* Baris 1: Input Pencarian Ramping (height: 38px) */}
        <div className="max-w-3xl mx-auto w-full px-3 sm:px-6 pt-2 pb-1.5">
          <div className="relative">
            <Search className="w-4 h-4 text-[#E5C87E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari parfum atau brand di 19 Houses (mis. Baccarat, Aventus, Bvlgari, Xerjoff)..."
              aria-label="Cari parfum atau brand di 19 Houses"
              data-testid="houses-search-input"
              className="w-full h-[38px] pl-10 pr-9 rounded-xl bg-[#131218] border border-[#D4AF37]/40 focus:border-[#F5E6B8] focus:outline-none text-xs sm:text-sm text-white placeholder:text-zinc-400 transition-colors"
            />
            {searchQuery.trim().length > 0 && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Hapus pencarian"
                data-testid="houses-search-clear-btn"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Baris 2: Horizontal 19-Brand Scroll Bar */}
        {!isEmptySearch && visibleBrands.length > 0 && (
          <div className="vorvan-quick-brand-ribbon-row">
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
              role="tablist"
              aria-label="Pilih Rumah Parfum Mewah"
              data-testid="vorvan-quick-brand-track"
            >
              {visibleBrands.map((brand) => {
                const isChipActive = !isSearching && brand.id === selectedBrandId;
                return (
                  <button
                    key={`ribbon-${brand.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isChipActive}
                    data-ribbon-brand={brand.id}
                    data-testid={`ribbon-chip-${brand.id}`}
                    onClick={() => handleSelectBrand(brand.id, true)}
                    className={`vorvan-ribbon-chip font-brand ${
                      isChipActive ? 'active' : ''
                    }`}
                  >
                    <span className="vorvan-ribbon-chip-name">
                      {brand.shortName}
                    </span>
                    <span className="vorvan-ribbon-chip-origin">
                      {brand.origin}
                    </span>
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

        {/* Baris 3: Pita Filter Gender 1 Baris Sejajar — Model 3 Sticky (SEMUA | GENTLEMAN | FEMME | UNISEX) */}
        {!isEmptySearch && (
          <div
            className="vorvan-compact-gender-row"
            role="group"
            aria-label={`Pilih kategori gender untuk ${activeBrand.name}`}
            data-testid="houses-sticky-gender-ribbon"
          >
            <button
              type="button"
              onClick={() => handleSelectGender('ALL')}
              data-testid="gender-btn-all"
              aria-pressed={!isSearching && selectedGender === 'ALL'}
              className={`vorvan-gender-pill font-brand ${
                !isSearching && selectedGender === 'ALL' ? 'active' : ''
              }`}
            >
              SEMUA
            </button>

            {genderOptions.map((g) => {
              const active = !isSearching && selectedGender === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleSelectGender(g.id)}
                  data-testid={`gender-btn-${g.id.toLowerCase()}`}
                  aria-pressed={active}
                  className={`vorvan-gender-pill font-brand ${
                    active ? 'active' : ''
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* DIRECT EMPTY-SEARCH NOTIFICATION CARD RIGHT BELOW STICKY SEARCH BAR */}
      {isEmptySearch && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 sm:mt-6 min-h-[65vh] animate-editorial-fade">
          <ExtendedArchiveBanner
            mode="empty-search"
            emptySearchTerm={searchQuery}
            whatsappNumber={whatsappNumber}
            telegramUsername={telegramUsername}
            testIdPrefix="houses-empty-search-extended-archive"
          />
        </div>
      )}

      {!isEmptySearch && (
        <div
          ref={catalogContentRef}
          className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-5 space-y-5 sm:space-y-6 min-h-[65vh] scroll-mt-[210px] sm:scroll-mt-[230px]"
        >
          {/* CONCISE 1-LINE EDITORIAL PROMPT BEFORE USER CLICKS SEMUA / GENTLEMAN / FEMME / UNISEX */}
          {isAwaitingGenderSelection && (
            <div
              key={`awaiting-hint-${activeBrand.id}`}
              data-testid="awaiting-gender-selection-hint"
              className="max-w-3xl mx-auto px-4 py-3.5 rounded-xl bg-[#13121A]/85 border border-[#D4AF37]/30 text-center animate-editorial-fade"
            >
              <p className="font-latin-italic italic text-sm sm:text-base text-zinc-200 m-0 leading-relaxed">
                <span className="font-brand not-italic font-semibold text-[#F5E6B8] tracking-[0.12em] text-xs sm:text-sm">
                  {activeBrand.name}
                </span>{' '}
                <span className="text-[#D8BE82]">({activeBrand.origin})</span> — Silakan ketuk kategori{' '}
                <strong className="font-brand not-italic text-[11px] text-[#F5E6B8] tracking-[0.08em]">
                  SEMUA
                </strong>
                ,{' '}
                <strong className="font-brand not-italic text-[11px] text-[#F5E6B8] tracking-[0.08em]">
                  GENTLEMAN
                </strong>
                ,{' '}
                <strong className="font-brand not-italic text-[11px] text-[#F5E6B8] tracking-[0.08em]">
                  FEMME
                </strong>
                , atau{' '}
                <strong className="font-brand not-italic text-[11px] text-[#F5E6B8] tracking-[0.08em]">
                  UNISEX
                </strong>{' '}
                pada bar di atas untuk membuka etalase flacon.
              </p>
            </div>
          )}

          {/* EMPTY GENDER FILTER CARD WHEN SELECTED BRAND HAS 0 ITEMS IN THAT GENDER */}
          {isEmptyGenderFilter && (
            <div
              key={`empty-gender-${activeBrand.id}-${selectedGender}`}
              data-testid="empty-gender-filter-card"
              className="max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#15141C] to-[#0D0C12] border border-[#D4AF37]/40 text-center space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.75)] animate-editorial-fade"
            >
              <p className="font-latin-script text-2xl sm:text-3xl text-gold-champagne m-0">
                L’Archive Privée Étendue
              </p>
              <div
                data-testid="empty-gender-filter-subtitle"
                className="font-brand text-[10px] sm:text-xs uppercase tracking-[0.22em] text-[#E5C87E] font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
              >
                <span>{activeBrand.name}</span>
                <span aria-hidden="true" className="hidden sm:inline">
                  ·
                </span>
                <span className="whitespace-nowrap inline-block">
                  KATEGORI{' '}
                  <span className="whitespace-nowrap inline-block">
                    [ {selectedGender} ]
                  </span>
                </span>
              </div>
              <p
                data-testid="empty-gender-filter-message"
                className="font-latin-italic italic text-base sm:text-lg text-zinc-200 max-w-xl mx-auto leading-relaxed"
              >
                “Koleksi kategori{' '}
                <span className="whitespace-nowrap inline-block font-semibold text-[#F5E6B8] not-italic">
                  [ {selectedGender} ]
                </span>{' '}
                untuk rumah mode ini tidak ditampilkan pada etalase utama (83 SKU), namun tersedia lengkap melalui Extended Archive (693+ Koleksi dari 63+ Brand).”
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
            <>
              <div
                key={
                  isSearching
                    ? `search-${searchQuery.trim()}`
                    : `${selectedBrandId}-${selectedGender}`
                }
                data-testid="houses-fragrance-grid"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 items-stretch animate-editorial-fade"
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

              <div className="pt-4">
                <ExtendedArchiveBanner
                  mode="catalog-footer"
                  whatsappNumber={whatsappNumber}
                  telegramUsername={telegramUsername}
                  testIdPrefix="houses-extended-archive-banner"
                />
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};
