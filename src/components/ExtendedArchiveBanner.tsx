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

interface ExtendedArchiveBannerProps {
  mode?: 'showroom' | 'empty-search';
  emptySearchTerm?: string;
  whatsappNumber?: string;
  telegramUsername?: string;
  onExploreHouses?: () => void;
  testIdPrefix?: string;
  className?: string;
}

export const ExtendedArchiveBanner: React.FC<ExtendedArchiveBannerProps> = ({
  mode = 'empty-search',
  emptySearchTerm = '',
  whatsappNumber = VORVAN_WHATSAPP_NUMBER,
  telegramUsername = VORVAN_TELEGRAM_USERNAME,
  onExploreHouses,
  testIdPrefix = 'extended-archive-banner',
  className = '',
}) => {
  const cleanKeyword = emptySearchTerm.trim();
  const whatsappUrl = buildExtendedArchiveWhatsAppUrl(
    cleanKeyword,
    whatsappNumber
  );
  const telegramUrl = buildExtendedArchiveTelegramUrl(
    cleanKeyword,
    telegramUsername
  );

  const isShowroomMode = mode === 'showroom';

  const headlineText = isShowroomMode
    ? '81 Kurasi Utama & 693+ Koleksi Tambahan Dunia'
    : cleanKeyword
    ? `Pencarian "${cleanKeyword}" Tersedia Melalui Layanan Concierge`
    : '693+ Koleksi Tambahan dari 63+ Rumah Mode Dunia';

  return (
    <div
      data-testid={testIdPrefix}
      style={{
        maxWidth: '560px',
        margin: '16px auto',
        padding: '28px 20px',
        border: '1px solid rgba(212, 175, 55, 0.4)',
      }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#15121C] via-[#0C0B10] to-[#17130B] shadow-[0_20px_50px_rgba(0,0,0,0.75)] text-center flex flex-col items-center justify-center gap-3.5 ${className}`}
    >
      {/* Subtle radial gold glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[360px] h-[160px] rounded-full opacity-15 blur-3xl bg-gradient-to-r from-[#D4AF37] via-[#F5E6B8] to-[#C5A059]"
      />

      {/* 0. Sub-Judul Aksara Sambung Latin Emas (Calligraphic Script Crown) */}
      <p
        data-testid={`${testIdPrefix}-script-crown`}
        className="relative z-10 font-latin-script text-2xl sm:text-3xl text-gold-champagne tracking-wide text-center m-0"
      >
        L’Archive Privée Étendue
      </p>

      {/* 1. Badge Atas (1 baris rapi) */}
      <div
        data-testid={`${testIdPrefix}-badge`}
        className="relative z-10 inline-flex items-center justify-center px-3.5 py-1 rounded-full bg-[#181522] border border-[#D4AF37]/40 font-brand text-[10px] sm:text-[11px] text-[#E5C87E] uppercase tracking-[0.18em] font-semibold whitespace-nowrap"
      >
        ✨ EXTENDED VAULT ARCHIVE
      </div>

      {/* 2. Judul Utama (Seimbang 2 baris dengan text-wrap: balance & clamp) */}
      <h2
        data-testid={`${testIdPrefix}-title`}
        style={{
          textWrap: 'balance',
          fontSize: 'clamp(1.2rem, 4vw, 1.65rem)',
          lineHeight: 1.3,
        }}
        className="relative z-10 font-serif-luxury font-semibold text-gold-shimmer tracking-wide text-center max-w-full m-0"
      >
        {headlineText}
      </h2>

      {/* 3. Deskripsi dengan Font Serif / Semi-Latin Miring (Cormorant Garamond / Playfair Display Italic) */}
      {isShowroomMode ? (
        <p
          data-testid={`${testIdPrefix}-description`}
          style={{
            fontSize: 'clamp(0.96rem, 2.6vw, 1.12rem)',
            lineHeight: 1.7,
            textWrap: 'pretty',
          }}
          className="relative z-10 font-latin-italic italic text-zinc-200 text-center max-w-[490px] m-0"
        >
          Jelajahi 81 kurasi utama dari 19 Rumah Mode Eropa di katalog kami. Apabila parfum spesifik yang Anda cari belum tercantum, sistem pencarian kami terhubung dengan{' '}
          <strong className="text-[#F5E6B8] font-semibold">
            693+ tipe parfum tambahan dari 63+ brand internasional
          </strong>
          .
        </p>
      ) : (
        <p
          data-testid={`${testIdPrefix}-description`}
          style={{
            fontSize: 'clamp(0.96rem, 2.6vw, 1.12rem)',
            lineHeight: 1.7,
            textWrap: 'pretty',
          }}
          className="relative z-10 font-latin-italic italic text-zinc-200 text-center max-w-[490px] m-0"
        >
          Koleksi yang Anda cari tidak ditampilkan pada 81 etalase utama, namun kami memiliki akses ke{' '}
          <strong className="text-[#F5E6B8] font-semibold">
            693+ tipe parfum tambahan dari 63+ brand internasional
          </strong>{' '}
          (efisiensi harga 20%–30% di bawah ritel butik). Silakan hubungi Concierge kami untuk informasi harga &amp; stok.
        </p>
      )}

      {/* 4. Tombol Aksi Sesuai Mode (Showroom vs Empty Search di 19 Houses) */}
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
          <span className="text-center">JELAJAHI &amp; CARI DI 19 HOUSES</span>
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
            <span className="text-center">TANYAKAN VIA WHATSAPP CONCIERGE</span>
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
            <span className="text-center">TANYAKAN VIA TELEGRAM VIP</span>
          </a>
        </div>
      )}
    </div>
  );
};
