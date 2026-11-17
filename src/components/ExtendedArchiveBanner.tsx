import React from 'react';
import { Compass, MessageCircle, Send } from 'lucide-react';
import {
  buildExtendedArchiveTelegramUrl,
  buildExtendedArchiveWhatsAppUrl,
} from '../utils/businessRules';
import {
  VORVAN_TELEGRAM_USERNAME,
  VORVAN_WHATSAPP_NUMBER,
} from '../data/catalog';
import { getTranslation, SupportedLocale } from '../i18n/translations';

interface ExtendedArchiveBannerProps {
  mode?: 'showroom' | 'empty-search' | 'catalog-footer';
  emptySearchTerm?: string;
  locale?: SupportedLocale;
  whatsappNumber?: string;
  telegramUsername?: string;
  onExploreHouses?: () => void;
  testIdPrefix?: string;
  className?: string;
}

export const ExtendedArchiveBanner: React.FC<ExtendedArchiveBannerProps> = ({
  mode = 'empty-search',
  emptySearchTerm = '',
  locale = 'ID',
  whatsappNumber = VORVAN_WHATSAPP_NUMBER,
  telegramUsername = VORVAN_TELEGRAM_USERNAME,
  onExploreHouses,
  testIdPrefix = 'extended-archive-banner',
  className = '',
}) => {
  const cleanKeyword = emptySearchTerm.trim();
  const t = getTranslation(locale).extendedArchive;

  const whatsappUrl = buildExtendedArchiveWhatsAppUrl(
    cleanKeyword,
    whatsappNumber
  );
  const telegramUrl = buildExtendedArchiveTelegramUrl(
    cleanKeyword,
    telegramUsername
  );

  const isShowroomMode = mode === 'showroom';
  const isCatalogFooterMode = mode === 'catalog-footer';

  const headlineText = isShowroomMode
    ? t.showroomTitle
    : isCatalogFooterMode
    ? t.catalogFooterTitle
    : cleanKeyword
    ? `${t.emptySearchTitleWithKeywordPrefix}${cleanKeyword}${t.emptySearchTitleWithKeywordSuffix}`
    : t.emptySearchTitleFallback;

  const descriptionPrefix = isShowroomMode
    ? t.showroomDescPrefix
    : isCatalogFooterMode
    ? t.footerDescPrefix
    : t.emptyDescPrefix;

  return (
    <div
      data-testid={testIdPrefix}
      className={`relative w-full max-w-[660px] mx-auto my-4 px-4 py-6 sm:px-8 sm:py-8 overflow-hidden rounded-2xl bg-gradient-to-b from-[#15121C] via-[#0C0B10] to-[#17130B] border border-[#D4AF37]/40 shadow-[0_20px_50px_rgba(0,0,0,0.75)] text-center flex flex-col items-center justify-center gap-3.5 ${className}`}
    >
      {/* Subtle radial gold glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[360px] h-[160px] rounded-full opacity-15 blur-3xl bg-gradient-to-r from-[#D4AF37] via-[#F5E6B8] to-[#C5A059]"
      />

      {/* 0. Calligraphic Script Crown */}
      <p
        data-testid={`${testIdPrefix}-script-crown`}
        className="relative z-10 font-latin-script text-2xl sm:text-3xl text-gold-champagne tracking-wide text-center m-0"
      >
        {t.scriptCrown}
      </p>

      {/* 1. Badge Atas */}
      <div
        data-testid={`${testIdPrefix}-badge`}
        className="relative z-10 inline-flex items-center justify-center px-3.5 py-1 rounded-full bg-[#181522] border border-[#D4AF37]/40 font-brand text-[10px] sm:text-[11px] text-[#E5C87E] uppercase tracking-[0.18em] font-semibold whitespace-nowrap text-center"
      >
        {t.badge}
      </div>

      {/* 2. Judul Utama (Seimbang dengan text-wrap: balance & clamp) */}
      <h2
        data-testid={`${testIdPrefix}-title`}
        style={{
          textWrap: 'balance',
          fontSize: 'clamp(1.2rem, 3.8vw, 1.65rem)',
          lineHeight: 1.3,
        }}
        className="relative z-10 font-serif-luxury font-semibold text-gold-shimmer tracking-wide text-center max-w-full m-0"
      >
        {headlineText}
      </h2>

      {/* 3. Sub-deskripsi */}
      <p
        data-testid={`${testIdPrefix}-description`}
        style={{
          fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
          lineHeight: 1.65,
          textWrap: 'pretty',
        }}
        className="relative z-10 font-latin-italic italic text-zinc-200 text-center max-w-[540px] m-0"
      >
        {descriptionPrefix}
        <strong className="text-[#F5E6B8] font-semibold">
          {t.highlightText}
        </strong>
        :
      </p>

      {/* 4. 2 Kotak Rincian Sejajar Simetris (19 Merk Web +342 SKU & 44 Merk Baru +326 SKU) */}
      <div
        data-testid={`${testIdPrefix}-breakdown-grid`}
        className="relative z-10 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch pt-0.5"
      >
        <div
          data-testid={`${testIdPrefix}-box-19-brands`}
          className="h-full flex flex-col justify-center items-center text-center p-4 sm:p-5 rounded-xl bg-[#13121C]/90 border border-[#D4AF37]/35"
        >
          <span className="font-brand text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[#E5C87E] tabular-nums text-center mb-1">
            {t.box1Tag}
          </span>
          <h3 className="font-serif-luxury text-base sm:text-[17px] font-semibold text-white text-center m-0 mb-1">
            {t.box1Title}
          </h3>
          <p className="font-latin-italic italic text-[13px] sm:text-[14px] text-zinc-300 leading-relaxed text-center m-0">
            {t.box1Desc}
          </p>
        </div>

        <div
          data-testid={`${testIdPrefix}-box-44-brands`}
          className="h-full flex flex-col justify-center items-center text-center p-4 sm:p-5 rounded-xl bg-[#13121C]/90 border border-[#D4AF37]/35"
        >
          <span className="font-brand text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[#E5C87E] tabular-nums text-center mb-1">
            {t.box2Tag}
          </span>
          <h3 className="font-serif-luxury text-base sm:text-[17px] font-semibold text-white text-center m-0 mb-1">
            {t.box2Title}
          </h3>
          <p className="font-latin-italic italic text-[13px] sm:text-[14px] text-zinc-300 leading-relaxed text-center m-0">
            {t.box2Desc}
          </p>
        </div>
      </div>

      {!isShowroomMode && (
        <p className="relative z-10 font-latin-italic italic text-xs sm:text-sm text-[#D8BE82] leading-relaxed text-center max-w-[500px] m-0">
          {t.closingNote}
        </p>
      )}

      {/* 5. CTA Buttons */}
      {isShowroomMode ? (
        <button
          type="button"
          onClick={onExploreHouses}
          data-testid={`${testIdPrefix}-explore-houses-cta`}
          style={{
            fontSize: 'clamp(0.75rem, 2.3vw, 0.85rem)',
            lineHeight: 1.35,
          }}
          className="relative z-10 mt-1 w-full min-h-[48px] py-3 px-5 rounded-xl btn-luxury-gold font-brand font-bold uppercase tracking-[0.12em] transition-all flex items-center justify-center gap-2.5 text-center cursor-pointer text-zinc-950 shadow-[0_10px_28px_-8px_rgba(212,175,55,0.45)]"
        >
          <Compass className="w-4 h-4 shrink-0 text-zinc-950" />
          <span className="text-center">{t.ctaExploreHouses}</span>
        </button>
      ) : (
        <div className="relative z-10 mt-1 w-full flex flex-col items-stretch justify-center gap-[10px]">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`${testIdPrefix}-whatsapp-cta`}
            style={{
              fontSize: 'clamp(0.75rem, 2.3vw, 0.85rem)',
              lineHeight: 1.35,
            }}
            className="w-full min-h-[48px] py-3 px-5 rounded-xl btn-luxury-gold font-brand font-bold uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2.5 text-center cursor-pointer text-zinc-950 no-underline shadow-[0_10px_28px_-8px_rgba(212,175,55,0.45)]"
          >
            <MessageCircle className="w-4 h-4 shrink-0 text-zinc-950" />
            <span className="text-center">{t.ctaWhatsapp}</span>
          </a>

          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`${testIdPrefix}-telegram-cta`}
            style={{
              fontSize: 'clamp(0.75rem, 2.3vw, 0.85rem)',
              lineHeight: 1.35,
            }}
            className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-[#14131B]/95 hover:bg-[#1E1C29] border border-[#D4AF37]/55 hover:border-[#F5E6B8] text-[#F5E6B8] hover:text-white font-brand font-bold uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2.5 text-center cursor-pointer no-underline"
          >
            <Send className="w-4 h-4 shrink-0 text-[#E5C87E]" />
            <span className="text-center">{t.ctaTelegram}</span>
          </a>
        </div>
      )}
    </div>
  );
};
