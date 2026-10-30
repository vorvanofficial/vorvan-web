import React, { useState } from 'react';
import { ArrowUpRight, Layers, MessageCircle, Send } from 'lucide-react';
import { FragranceItem } from '../types/fragrance';
import {
  buildTelegramInquiryUrl,
  buildWhatsAppInquiryUrl,
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
  const [showPyramidInline, setShowPyramidInline] = useState<boolean>(false);
  const t = getTranslation(locale).card;

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
      className="group relative h-full flex flex-col justify-between bg-gradient-to-b from-[#15141B] via-[#111016] to-[#0D0C12] border border-[#D4AF37]/30 hover:border-[#E5C87E]/75 rounded-2xl overflow-hidden transition-all duration-300 animate-platinum-card"
      data-testid={`fragrance-card-${fragrance.id}`}
    >
      {/* Top Section: Studio Flacon Showcase + Uniform Body */}
      <div className="flex flex-col flex-1">
        {/* Studio Flacon Showcase */}
        <div className="relative aspect-[4/3.4] w-full shrink-0 overflow-hidden border-b border-[#D4AF37]/20">
          <FlaconArt fragrance={fragrance} selectedVolume={selectedVolume} />

          {/* Top-Left Gender Badge — Elevated Above Bottle Stage & Never Obscured */}
          <div className="absolute top-3.5 left-3.5 z-20 pointer-events-none">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-xs border border-amber-500/40 text-amber-300 font-brand text-[10px] font-semibold tracking-[0.18em] uppercase shadow-md">
              {fragrance.gender}
            </span>
          </div>

          {/* Quick Dossier Button — Comfortably Inset Inside Image Frame */}
          <button
            type="button"
            onClick={() => onOpenDossier(fragrance, selectedVolume)}
            className="absolute bottom-3 right-3 px-3 py-1.5 bg-[#0B0A0E]/90 hover:bg-[#E5C87E] text-[#F5E6B8] hover:text-zinc-950 border border-[#D4AF37]/45 rounded-lg text-xs font-latin-italic tracking-wider transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer z-20"
            aria-label={`Inspect olfactory pyramid for ${fragrance.house} ${fragrance.name}`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>{t.olfactoryDossier}</span>
          </button>
        </div>

        {/* Card Body — Mathematically Uniform Heights for Flush Row Alignment */}
        <div className="p-5 pb-4 flex flex-col flex-1 justify-between">
          <div className="text-center sm:text-left">
            {/* House Name in Semi-Gold */}
            <p className="font-brand text-xs text-[#E5C87E] font-semibold tracking-[0.22em] uppercase truncate">
              {fragrance.house}
            </p>
            <div className="mt-1 flex items-center justify-center sm:justify-start gap-1.5 text-xs font-latin-italic text-zinc-400 truncate">
              <span className="truncate">{fragrance.origin}</span>
              <span aria-hidden="true" className="text-[#D4AF37]">
                ·
              </span>
              <span className="truncate text-[#D8BE82]">
                {fragrance.availabilityStatus}
              </span>
            </div>

            {/* Fragrance Name — Uniform 1-Line Height */}
            <h3
              className="mt-2 font-serif-luxury text-2xl font-semibold text-white tracking-wide leading-snug truncate"
              title={fragrance.name}
            >
              {fragrance.name}
            </h3>

            {/* Scent Character Summary in Semi-Gold Italic — Uniform 1-Line Height */}
            <p
              className="mt-1 font-latin-italic text-sm text-[#E5C87E]/90 tracking-wide truncate"
              title={fragrance.characterSummary}
            >
              “{fragrance.characterSummary}”
            </p>

            {/* Editorial Description — Uniform 3-Line Box */}
            <p className="mt-2.5 font-editorial text-[15px] text-zinc-200/90 leading-[1.6] line-clamp-3 min-h-[4.65rem]">
              {fragrance.editorialDescription}
            </p>
          </div>

          {/* Olfactory Notes Pyramid Visualization */}
          <div className="mt-4 pt-3.5 border-t border-[#D4AF37]/20 text-left">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="font-brand text-[10px] uppercase tracking-[0.2em] text-[#E5C87E] font-semibold truncate">
                {t.olfactoryArchitecture}
              </span>
              <button
                type="button"
                onClick={() => setShowPyramidInline((prev) => !prev)}
                className="font-latin-italic text-xs text-[#F5E6B8] hover:text-white underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
              >
                {showPyramidInline ? t.compactNotes : t.detailPyramid}
              </button>
            </div>

            {/* 3-Tier Visual Pyramid Bar */}
            <div className="space-y-2 text-xs">
              {/* Top Notes */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-brand uppercase tracking-[0.16em] text-[#F5E6B8] font-medium">
                    I. Top Notes
                  </span>
                  <span className="font-latin-italic text-xs text-zinc-400">
                    {t.openingAccord}
                  </span>
                </div>
                <div className="w-3/5 h-1 rounded-full bg-gradient-to-r from-[#F5E6B8] via-[#D4AF37] to-zinc-600" />
                <p className="font-latin-italic text-sm text-zinc-200 truncate">
                  {fragrance.pyramid.top.join(' · ')}
                </p>
              </div>

              {/* Mid / Heart Notes */}
              <div className="flex flex-col gap-0.5 pt-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-brand uppercase tracking-[0.16em] text-[#E5C87E] font-medium">
                    II. Heart Notes
                  </span>
                  <span className="font-latin-italic text-xs text-zinc-400">
                    {t.coreIdentity}
                  </span>
                </div>
                <div className="w-4/5 h-1 rounded-full bg-gradient-to-r from-[#E5C87E] via-[#C8A24A] to-zinc-700" />
                <p className="font-latin-italic text-sm text-zinc-200 truncate">
                  {fragrance.pyramid.heart.join(' · ')}
                </p>
              </div>

              {/* Base Notes */}
              <div className="flex flex-col gap-0.5 pt-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-brand uppercase tracking-[0.16em] text-[#D8BE82] font-medium">
                    III. Base Notes
                  </span>
                  <span className="font-latin-italic text-xs text-zinc-400">
                    {fragrance.longevity}
                  </span>
                </div>
                <div className="w-full h-1 rounded-full bg-gradient-to-r from-[#F5E6B8] via-[#D4AF37] to-[#524320]" />
                <p className="font-latin-italic text-sm text-zinc-200 truncate">
                  {fragrance.pyramid.base.join(' · ')}
                </p>
              </div>

              {showPyramidInline && (
                <div className="pt-2 mt-1.5 border-t border-zinc-800/80 text-xs font-latin-italic text-[#E5C87E] flex items-center justify-between gap-2">
                  <span className="truncate">Nez: {fragrance.perfumer}</span>
                  <span className="shrink-0">Sillage: {fragrance.sillage}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Plaque: Recessed Valuation Box + Precision Luxury Semi-Gold Inquiry Frame */}
      <div className="px-5 pb-5 pt-2 shrink-0 space-y-3">
        {/* Recessed Private Valuation & Volume Selector Frame */}
        <div className="p-3 rounded-xl bg-[#0B0A0E]/90 border border-[#D4AF37]/25 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-brand text-[9px] uppercase tracking-[0.2em] text-[#D8BE82] truncate">
              {t.privateValuation}
            </p>
            <p className="font-latin-italic text-sm sm:text-base font-semibold text-[#F5E6B8] tracking-wide truncate">
              {t.priceOnRequest}
            </p>
            <p className="text-[10px] text-[#C5A059]/85 italic truncate">
              Estimasi 20%–30% di bawah ritel resmi
            </p>
          </div>

          {/* Volume Selector Buttons */}
          <div
            className="flex items-center gap-1 bg-[#14131A] p-1 rounded-lg border border-[#D4AF37]/30 shrink-0"
            role="group"
            aria-label={`Select bottle volume for ${fragrance.name}`}
          >
            {fragrance.volumes.map((vol) => (
              <button
                key={vol}
                type="button"
                onClick={() => setSelectedVolume(vol)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono-tabular transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedVolume === vol
                    ? 'bg-gradient-to-r from-[#E5C87E] to-[#D4AF37] text-zinc-950 font-bold'
                    : 'text-zinc-300 hover:text-[#F5E6B8]'
                }`}
              >
                {vol}
              </button>
            ))}
          </div>
        </div>

        {/* Dual-Concierge Inquiry CTA Plaque: WhatsApp Concierge + Telegram VIP (@vorvanofficial) */}
        <div className="space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleInquiryClick}
            className="w-full min-h-[46px] py-2.5 px-3.5 rounded-xl btn-luxury-gold font-brand text-[10px] sm:text-[11px] font-bold tracking-[0.14em] uppercase transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            data-testid={`wa-inquire-${fragrance.id}`}
          >
            <MessageCircle className="w-4 h-4 shrink-0 text-zinc-950" />
            <span className="truncate">{t.inquireViaWhatsapp}</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-zinc-950" />
          </a>

          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleInquiryClick}
            className="w-full min-h-[40px] py-2 px-3 rounded-xl bg-[#0B0A0E]/95 hover:bg-[#171622] border border-[#D4AF37]/40 hover:border-[#F5E6B8] text-[#F5E6B8] hover:text-white font-brand text-[9px] sm:text-[10px] font-semibold tracking-[0.14em] uppercase transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer"
            data-testid={`tg-inquire-${fragrance.id}`}
          >
            <Send className="w-3.5 h-3.5 shrink-0 text-[#E5C87E]" />
            <span className="truncate">Telegram VIP Concierge</span>
            <ArrowUpRight className="w-3 h-3 shrink-0 text-[#E5C87E]" />
          </a>
        </div>
      </div>
    </article>
  );
};

export const FragranceCard = React.memo(FragranceCardComponent);

