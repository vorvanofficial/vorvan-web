import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, MessageCircle, Send, ShieldCheck, X } from 'lucide-react';
import { FragranceItem } from '../types/fragrance';
import {
  buildTelegramInquiryUrl,
  buildWhatsAppInquiryUrl,
} from '../utils/businessRules';
import { FlaconArt } from './FlaconArt';

interface FragranceDossierModalProps {
  fragrance: FragranceItem | null;
  initialVolume?: string;
  registeredEmail?: string | null;
  onClose: () => void;
  onRequireEmailGateway: (fragrance: FragranceItem, volume: string) => void;
}

export const FragranceDossierModal: React.FC<FragranceDossierModalProps> = ({
  fragrance,
  initialVolume,
  registeredEmail,
  onClose,
  onRequireEmailGateway,
}) => {
  if (!fragrance) return null;

  const [selectedVolume, setSelectedVolume] = useState<string>(
    initialVolume || fragrance.defaultVolume
  );
  const [clientNote, setClientNote] = useState<string>('');

  const whatsappUrl = buildWhatsAppInquiryUrl(
    fragrance,
    selectedVolume,
    clientNote,
    registeredEmail || undefined
  );

  const telegramUrl = buildTelegramInquiryUrl(
    fragrance,
    selectedVolume,
    clientNote,
    registeredEmail || undefined
  );

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!registeredEmail) {
      e.preventDefault();
      onRequireEmailGateway(fragrance, selectedVolume);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-[#111114] border border-zinc-700/80 shadow-2xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-[0.22em]">
            <span>VORVAN Olfactory Dossier</span>
            <span aria-hidden="true">·</span>
            <span>{fragrance.gender}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular text-zinc-300">
              Batch {fragrance.batchCode}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Olfactory Dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Flacon & Specs */}
          <div className="lg:col-span-5 bg-[#0D0D0F] p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800">
            <div className="aspect-[4/3] w-full">
              <FlaconArt fragrance={fragrance} selectedVolume={selectedVolume} />
            </div>

            <div className="mt-6 space-y-3 pt-4 border-t border-zinc-800/80 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Master Perfumer</span>
                <span className="text-zinc-200 font-medium">{fragrance.perfumer}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Concentration</span>
                <span className="text-zinc-200 font-medium">{fragrance.concentration}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Longevity &amp; Projection</span>
                <span className="text-zinc-200 font-medium">
                  {fragrance.longevity} · {fragrance.sillage}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Recommended Wearing</span>
                <span className="text-zinc-200 font-medium">{fragrance.seasonality}</span>
              </div>
            </div>
          </div>

          {/* Right Olfactory Pyramid & WhatsApp Concierge */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-400">
                {fragrance.house} · {fragrance.origin} ({fragrance.launchYear})
              </div>
              <h2
                id="dossier-modal-title"
                className="mt-1 font-serif-luxury text-3xl sm:text-4xl font-semibold text-white"
              >
                {fragrance.name}
              </h2>
              <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
                {fragrance.editorialDescription}
              </p>

              {/* Visual Olfactory Pyramid Diagram */}
              <div className="mt-6 p-5 bg-[#0D0D0F] border border-zinc-800">
                <h3 className="text-xs uppercase tracking-[0.24em] text-zinc-300 font-semibold mb-4 text-center">
                  Piramida Olfaktori (Top · Heart · Base Notes)
                </h3>

                <div className="flex flex-col items-center space-y-3">
                  <div className="w-full sm:w-3/5 bg-[#17171B] border border-zinc-700/70 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                      Top Notes · First Impression
                    </p>
                    <p className="mt-1 text-xs font-medium text-white">
                      {fragrance.pyramid.top.join(' · ')}
                    </p>
                  </div>

                  <div className="w-full sm:w-4/5 bg-[#17171B] border border-zinc-700/70 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                      Heart Notes · Core Identity
                    </p>
                    <p className="mt-1 text-xs font-medium text-white">
                      {fragrance.pyramid.heart.join(' · ')}
                    </p>
                  </div>

                  <div className="w-full bg-[#17171B] border border-zinc-600/80 p-3.5 text-center">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-300">
                      Base Notes · Drydown &amp; Sillage Trail
                    </p>
                    <p className="mt-1 text-xs font-medium text-white">
                      {fragrance.pyramid.base.join(' · ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Concierge Action Module */}
            <div className="pt-4 border-t border-zinc-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-zinc-400 block">
                    Private Boutique Valuation
                  </span>
                  <span className="text-sm font-semibold text-white">
                    Price on Request — Cek Ketersediaan &amp; Penawaran
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {fragrance.volumes.map((vol) => (
                    <button
                      key={vol}
                      type="button"
                      onClick={() => setSelectedVolume(vol)}
                      className={`px-3 py-1.5 text-xs font-mono-tabular border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        selectedVolume === vol
                          ? 'bg-white text-zinc-950 border-white font-semibold'
                          : 'bg-transparent text-zinc-300 border-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      {vol}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="dossier-custom-note"
                  className="block text-xs text-zinc-400 mb-1.5"
                >
                  Catatan ke Concierge (Opsional — misal request gift box atau pengiriman instan):
                </label>
                <input
                  id="dossier-custom-note"
                  type="text"
                  value={clientNote}
                  onChange={(e) => setClientNote(e.target.value)}
                  placeholder="Contoh: Mohon info batch terbaru & opsi pembuatan Private Invoice web..."
                  className="w-full px-3.5 py-2.5 bg-[#0D0D0F] border border-zinc-800 focus:border-zinc-400 text-sm text-white placeholder:text-zinc-600 outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCtaClick}
                  className="flex-1 py-3.5 px-4 rounded-xl btn-luxury-gold text-zinc-950 text-xs font-bold uppercase tracking-[0.16em] transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>WhatsApp Concierge</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                </a>

                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCtaClick}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/45 hover:border-[#F5E6B8] text-[#F5E6B8] hover:text-white text-xs font-semibold uppercase tracking-[0.16em] transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4 shrink-0 text-[#E5C87E]" />
                  <span>Telegram VIP Concierge</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0 text-[#E5C87E]" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E5C87E]" />
                  100% Original Parallel Import Batch
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E5C87E]" />
                  Efisiensi Valuasi 20% – 30% &amp; Opsi COD Antar Langsung
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
