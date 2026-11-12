import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { FragranceItem } from '../types/fragrance';
import {
  buildTelegramInquiryUrl,
  buildWhatsAppInquiryUrl,
  formatIDRCurrency,
  resolveVorvanSkuPricing,
} from '../utils/businessRules';
import { FlaconArt } from './FlaconArt';
import { getTranslation, SupportedLocale } from '../i18n/translations';

interface FragranceCardProps {
  fragrance: FragranceItem;
  registeredEmail?: string | null;
  locale?: SupportedLocale;
  onOpenDossier: (fragrance: FragranceItem, selectedVolume: string) => void;
  onInquireFragrance: (fragrance: FragranceItem, selectedVolume: string) => void;
}

const FragranceCardComponent: React.FC<FragranceCardProps> = ({
  fragrance,
  registeredEmail,
  locale = 'ID',
  onOpenDossier,
  onInquireFragrance,
}) => {
  const [selectedVolume, setSelectedVolume] = useState<string>(
    fragrance.defaultVolume
  );
  const t = getTranslation(locale).card;

  const skuPricing =
    resolveVorvanSkuPricing(fragrance.id) ||
    resolveVorvanSkuPricing(fragrance.name);
  const retailPriceIDR = skuPricing?.retail || 4500000;
  const formattedRetail = formatIDRCurrency(retailPriceIDR);
  const displayVolume = skuPricing?.size || selectedVolume;

  const whatsappUrl = buildWhatsAppInquiryUrl(
    fragrance,
    selectedVolume,
    undefined,
    registeredEmail || undefined
  );

  const telegramUrl = buildTelegramInquiryUrl(
    fragrance,
    selectedVolume,
    undefined,
    registeredEmail || undefined
  );

  const handleInquiryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!registeredEmail) {
      e.preventDefault();
      onInquireFragrance(fragrance, selectedVolume);
    }
  };

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
      className="group relative h-full flex flex-col justify-between bg-gradient-to-b from-[#15141B] via-[#111016] to-[#0D0C12] border border-[#D4AF37]/30 hover:border-[#E5C87E]/75 rounded-2xl overflow-hidden transition-all duration-300 animate-platinum-card"
      data-testid={`fragrance-card-${fragrance.id}`}
    >
      {/* Top Section: Studio Flacon Showcase (aspect-[4/5]) + Uniform Title Body */}
      <div className="flex flex-col flex-1">
        {/* 1. Foto Produk — Rasio Seragam aspect-[4/5] */}
        <div
          className="relative aspect-[4/5] w-full shrink-0 overflow-hidden border-b border-[#D4AF37]/20"
          data-testid={`fragrance-photo-frame-${fragrance.id}`}
        >
          <FlaconArt fragrance={fragrance} selectedVolume={selectedVolume} />

          {/* Badge Gender Kompak di Pojok Kiri Atas */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 pointer-events-none">
            <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/80 backdrop-blur-xs border border-amber-500/40 text-amber-300 font-brand text-[8px] sm:text-[10px] font-semibold tracking-[0.12em] sm:tracking-[0.18em] uppercase shadow-md">
              {fragrance.gender}
            </span>
          </div>

          {/* Tombol Olfactory Dossier di Pojok Bawah Foto */}
          <button
            type="button"
            onClick={() => onOpenDossier(fragrance, selectedVolume)}
            data-testid={`dossier-btn-${fragrance.id}`}
            className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-[#0B0A0E]/92 hover:bg-[#E5C87E] text-[#F5E6B8] hover:text-zinc-950 border border-[#D4AF37]/50 rounded-lg text-[10px] sm:text-xs font-latin-italic italic tracking-wider transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer z-20 shadow-md"
            aria-label={`Inspect olfactory pyramid for ${fragrance.house} ${fragrance.name}`}
          >
            <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>{t.olfactoryDossier}</span>
          </button>
        </div>

        {/* 2. Judul Parfum: Nama Brand (Kecil Emas) di Atas Nama Parfum & Ukuran ml (Font Serif/Semi-Latin Elegan, Maks 2 Baris Sejajar) */}
        <div className="p-2.5 sm:p-4 pb-2 sm:pb-3 flex flex-col flex-1 justify-between text-center">
          <div>
            {/* Nama Brand (Kecil Emas) */}
            <p className="font-brand text-[9px] sm:text-[11px] text-[#E5C87E] font-semibold tracking-[0.14em] sm:tracking-[0.2em] uppercase truncate">
              {fragrance.house}
            </p>

            {/* Nama Parfum — Maksimal 2 Baris Rata & Sejajar */}
            <h3
              className="mt-1 font-serif-luxury text-[15px] sm:text-xl font-semibold text-white tracking-wide leading-[1.25] line-clamp-2 min-h-[2.35rem] sm:min-h-[3.1rem] flex items-center justify-center text-center"
              style={{ textWrap: 'balance' }}
              title={fragrance.name}
            >
              <span>{fragrance.name}</span>
            </h3>

            {/* Ukuran ml & Konsentrasi dalam Font Semi-Latin Miring */}
            <div className="mt-1 flex items-center justify-center gap-1 text-[11px] sm:text-xs font-latin-italic italic text-[#D8BE82] truncate">
              <span>{displayVolume}</span>
              <span aria-hidden="true" className="text-[#D4AF37]">
                ·
              </span>
              <span className="truncate">{fragrance.concentration}</span>
            </div>

            {/* Ringkasan Karakter Aroma (1 Baris Semi-Latin Italic) */}
            <p
              className="mt-1 font-latin-italic italic text-[11px] sm:text-sm text-zinc-300/90 truncate"
              title={fragrance.characterSummary}
            >
              “{fragrance.characterSummary}”
            </p>
          </div>

          {/* Pilihan Volume (Selalu Ditampilkan Agar Tinggi Kartu 100% Identik Sejajar) */}
          <div
            className="mt-2 flex items-center justify-center gap-1 min-h-[22px]"
            role="group"
            aria-label={`Select bottle volume for ${fragrance.name}`}
          >
            {fragrance.volumes.map((vol) => (
              <button
                key={vol}
                type="button"
                onClick={() => setSelectedVolume(vol)}
                className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono-tabular transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                  selectedVolume === vol
                    ? 'bg-gradient-to-r from-[#E5C87E] to-[#D4AF37] text-zinc-950 border-[#E5C87E] font-bold'
                    : 'bg-[#14131A] text-zinc-300 border-[#D4AF37]/30 hover:text-[#F5E6B8]'
                }`}
              >
                {vol}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 & 4. Bottom Plaque: Harga Ritel Butik Dicoret + Privilege 20%-30% OFF + Tombol 💬 TANYA HARGA & ✈️ */}
      <div className="px-2.5 sm:px-4 pb-2.5 sm:pb-4 pt-1 shrink-0 space-y-2">
        {/* Kotak Valuasi Publik: Harga Ritel Resmi Dicoret + Privilege 20%–30% OFF (Tanpa Harga Final) */}
        <div
          className="p-2 sm:p-2.5 rounded-xl bg-[#0B0A0E]/92 border border-[#D4AF37]/25 flex flex-col items-center justify-center text-center gap-1"
          data-testid={`public-valuation-box-${fragrance.id}`}
        >
          {/* Harga Ritel Butik Resmi Dicoret */}
          <div
            className="flex items-center justify-center gap-1 text-[9.5px] sm:text-xs text-zinc-400 leading-tight whitespace-nowrap"
            data-testid={`retail-strikethrough-${fragrance.id}`}
          >
            <span className="font-latin-italic italic text-zinc-400">
              Ritel Butik:
            </span>
            <span className="line-through decoration-[#D4AF37]/85 text-zinc-300 font-mono-tabular">
              {formattedRetail}
            </span>
          </div>

          {/* Badge Emas Privilege 20%–30% OFF */}
          <span
            className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-[#18140C] border border-[#D4AF37]/45 font-brand text-[8.5px] sm:text-[10px] font-bold uppercase tracking-[0.06em] sm:tracking-[0.12em] text-[#E5C87E] whitespace-nowrap"
            data-testid={`privilege-badge-${fragrance.id}`}
          >
            Privilege 20%–30% OFF
          </span>

          {/* Teks Emas Tanya Harga Final via Concierge */}
          <p
            className="font-latin-italic italic text-[10px] sm:text-[13px] font-semibold text-[#F5E6B8] leading-tight whitespace-nowrap m-0"
            data-testid={`inquire-final-price-label-${fragrance.id}`}
          >
            Tanya Harga Final via Concierge
          </p>
        </div>

        {/* Baris Tombol Aksi Sejajar Rata Bawah: 💬 TANYA HARGA (WhatsApp) + ✈️ (Telegram) */}
        <div className="flex items-stretch gap-1.5 sm:gap-2 w-full">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleInquiryClick}
            className="flex-1 min-w-0 min-h-[38px] sm:min-h-[42px] py-2 px-2 sm:px-3 rounded-xl btn-luxury-gold font-brand text-[9.5px] sm:text-[11px] font-bold tracking-[0.05em] sm:tracking-[0.12em] uppercase transition-all active:scale-[0.99] flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer text-zinc-950 no-underline"
            data-testid={`wa-inquire-${fragrance.id}`}
          >
            <span aria-hidden="true" className="text-[11px] sm:text-xs leading-none shrink-0">
              💬
            </span>
            <span className="whitespace-nowrap">TANYA HARGA</span>
          </a>

          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleInquiryClick}
            title="Tanya Harga via Telegram VIP (@vorvanofficial)"
            aria-label={`Tanya Harga ${fragrance.name} via Telegram VIP`}
            className="w-[38px] sm:w-[42px] min-h-[38px] sm:min-h-[42px] shrink-0 rounded-xl bg-[#0B0A0E]/95 hover:bg-[#171622] border border-[#D4AF37]/45 hover:border-[#F5E6B8] text-[#F5E6B8] hover:text-white transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer no-underline"
            data-testid={`tg-inquire-${fragrance.id}`}
          >
            <span aria-hidden="true" className="text-xs sm:text-sm leading-none">
              ✈️
            </span>
          </a>
        </div>
      </div>
    </article>
  );
};

export const FragranceCard = React.memo(FragranceCardComponent);
