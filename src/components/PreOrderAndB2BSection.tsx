import React, { useState } from 'react';
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Compass,
  MessageCircle,
  Plane,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { NICHE_PREORDER_HOUSES } from '../data/catalog';
import { B2BPartnerSubmission, PreOrderSubmission } from '../types/fragrance';
import {
  buildPreOrderWhatsAppUrl,
  validateB2BInput,
  validatePreOrderInput,
} from '../utils/businessRules';
import { ParallaxSectionBg, ScrollReveal } from './ScrollAnimations';
import { getTranslation, SupportedLocale } from '../i18n/translations';

interface PreOrderConciergeSectionProps {
  onOpenB2BModal: () => void;
  locale?: SupportedLocale;
}

export const PreOrderConciergeSection: React.FC<PreOrderConciergeSectionProps> = ({
  onOpenB2BModal,
  locale = 'ID',
}) => {
  const [clientName, setClientName] = useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [house, setHouse] = useState<string>('Xerjoff');
  const [fragranceName, setFragranceName] = useState<string>('1861 Naxos');
  const [volume, setVolume] = useState<string>('100 ml');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<PreOrderSubmission[]>([]);

  const t = getTranslation(locale).preOrder;

  const handleSelectQuickPreset = (presetHouse: string, presetPerfume: string) => {
    setHouse(presetHouse);
    setFragranceName(presetPerfume);
    setErrorMsg(null);
  };

  const handleSubmitPreOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePreOrderInput({
      clientName,
      whatsappNumber,
      house,
      fragranceName,
    });
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Mohon lengkapi seluruh kolom wajib.');
      return;
    }

    setErrorMsg(null);
    const newEntry: PreOrderSubmission = {
      id: `PO-VRV-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: clientName.trim(),
      whatsappNumber: whatsappNumber.trim(),
      house: house.trim(),
      fragranceName: fragranceName.trim(),
      volume,
      notes: notes.trim(),
      submittedAt: 'Baru Saja Tercatat di Meja Concierge',
    };

    setSubmissions((prev) => [newEntry, ...prev]);
  };

  const directWaUrl = buildPreOrderWhatsAppUrl({
    clientName: clientName || 'Private Collector',
    house,
    fragranceName,
    volume,
    notes,
  });

  return (
    <section
      id="preorder-concierge"
      className="relative overflow-hidden py-16 sm:py-24 border-t border-[#D4AF37]/30 bg-[#0B0A0E]/65"
    >
      <ParallaxSectionBg
        speed={0.18}
        tone="champagne"
        watermarkText="VII · SOURCING PRIVÉ"
        align="left"
        testId="parallax-bg-preorder"
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header with Calligraphic Script Crown & Shimmering Semi-Gold Title */}
        <ScrollReveal variant="scale">
          <div className="max-w-3xl mx-auto text-center space-y-3 pb-8 border-b border-[#D4AF37]/25">
            <p className="font-latin-script text-3xl sm:text-4xl text-gold-champagne">
              L’Allocation sur Mesure
            </p>
            <p className="font-brand text-[10px] sm:text-xs uppercase tracking-[0.26em] text-[#E5C87E] font-semibold">
              {t.kicker}
            </p>
            <h2
              className="font-serif-luxury text-3xl sm:text-5xl font-semibold text-gold-shimmer leading-tight tracking-wide"
              style={{ textWrap: 'balance' }}
            >
              {t.title}
            </h2>
            <p className="font-latin-italic text-base sm:text-lg text-zinc-200 leading-relaxed pt-1">
              {t.description}
            </p>
          </div>
        </ScrollReveal>

        {/* Row 1: 4 Niche Maison Cards & Bespoke Concierge Request Form with Symmetrical Height */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column: 2x2 Architectural Maison Plaques (Xerjoff, Amouage, Parfums de Marly, Roja Parfums & Initio) */}
          <div className="lg:col-span-7 h-full flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 h-full items-stretch">
              {NICHE_PREORDER_HOUSES.map((item, idx) => {
                const shortHouseName = item.house.split(' ')[0];
                const isHouseActive =
                  house.toLowerCase().includes(shortHouseName.toLowerCase()) ||
                  item.house.toLowerCase().includes(house.toLowerCase());

                return (
                  <ScrollReveal
                    key={item.house}
                    variant={idx % 2 === 0 ? 'left' : 'right'}
                    delayMs={idx * 90}
                    className="h-full"
                  >
                    <div
                      className={`relative h-full p-5 sm:p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between space-y-4 overflow-hidden ${
                        isHouseActive
                          ? 'bg-gradient-to-b from-[#1A1824] to-[#111017] border border-[#E5C87E]/75 shadow-[0_12px_32px_-12px_rgba(212,175,55,0.28)]'
                          : 'bg-gradient-to-b from-[#15141D]/95 to-[#0F0E15]/95 border border-[#D4AF37]/30 hover:border-[#E5C87E]/55 animate-platinum-card'
                      }`}
                    >
                      {/* Subtle Top-Right Gold Radial Glow */}
                      <div
                        aria-hidden="true"
                        className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none"
                        style={{
                          background:
                            'radial-gradient(circle, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0) 70%)',
                        }}
                      />

                      <div className="space-y-3 relative z-10">
                        {/* Top Metadata Row: Origin City & Air Allocation Emblem */}
                        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#D4AF37]/20">
                          <span className="inline-flex items-center gap-1.5 font-brand text-[10px] uppercase tracking-[0.2em] text-[#D8BE82]">
                            <Plane className="w-3 h-3 text-[#E5C87E] shrink-0" />
                            <span>{item.origin}</span>
                          </span>
                          <span className="font-latin-italic text-xs text-[#E5C87E]">
                            Direct Vault
                          </span>
                        </div>

                        {/* Maison Title */}
                        <h3 className="font-serif-luxury text-2xl font-semibold text-gold-shimmer tracking-wide">
                          {item.house}
                        </h3>

                        {/* Lead Time */}
                        <p className="font-latin-italic text-sm text-zinc-300 leading-snug">
                          {t.estimatedLeadTime}{' '}
                          <span className="text-[#F5E6B8] not-italic font-brand text-[11px] tracking-wider block mt-1">
                            {item.leadTime}
                          </span>
                        </p>
                      </div>

                      {/* Interactive Quick-Select Fragrance Buttons */}
                      <div className="pt-3 border-t border-[#D4AF37]/15 space-y-2 relative z-10">
                        <span className="block font-brand text-[9px] text-[#D8BE82] uppercase tracking-[0.22em]">
                          {t.quickSelect}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.popularRequests.map((req) => {
                            const isSelectedReq =
                              fragranceName.toLowerCase() === req.toLowerCase();
                            return (
                              <button
                                key={req}
                                type="button"
                                onClick={() =>
                                  handleSelectQuickPreset(
                                    item.house.split(' ')[0],
                                    req
                                  )
                                }
                                className={`px-2.5 py-1.5 rounded-lg font-brand text-[10px] tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                  isSelectedReq
                                    ? 'btn-luxury-gold font-bold'
                                    : 'bg-[#0B0A0E]/90 hover:bg-[#1E1C29] text-[#FAF8F5] border border-[#D4AF37]/35 hover:border-[#E5C87E]'
                                }`}
                              >
                                {req}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>

          {/* Right Column: Bespoke Pre-Order Concierge Dossier Form (Flushed height with 2x2 grid) */}
          <div className="lg:col-span-5 h-full">
            <ScrollReveal variant="up" delayMs={120} className="h-full">
              <div className="relative h-full flex flex-col justify-between bg-gradient-to-b from-[#16151F]/95 to-[#0E0D14]/95 border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_16px_42px_-16px_rgba(0,0,0,0.85)]">
                {/* Inner Recessed Gold Header */}
                <div className="border-b border-[#D4AF37]/25 pb-5 text-center sm:text-left space-y-1.5">
                  <div className="flex items-center justify-center sm:justify-start gap-2 font-brand text-[10px] sm:text-xs text-[#E5C87E] uppercase tracking-[0.22em]">
                    <Compass className="w-4 h-4 text-[#E5C87E] shrink-0" />
                    <span>{t.formKicker}</span>
                  </div>
                  <h3 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-gold-shimmer">
                    {t.formTitle}
                  </h3>
                </div>

                <form onSubmit={handleSubmitPreOrder} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="po-client-name"
                        className="block font-brand text-[10px] uppercase tracking-[0.18em] text-[#D8BE82] mb-1.5"
                      >
                        {t.clientNameLabel}
                      </label>
                      <input
                        id="po-client-name"
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Mis. Bpk. Adrian Kusuma"
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/30 focus:border-[#E5C87E] text-sm text-white outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="po-whatsapp"
                        className="block font-brand text-[10px] uppercase tracking-[0.18em] text-[#D8BE82] mb-1.5"
                      >
                        {t.whatsappLabel}
                      </label>
                      <input
                        id="po-whatsapp"
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="0811xxxxxxx"
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/30 focus:border-[#E5C87E] text-sm font-mono-tabular text-white outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="po-house"
                        className="block font-brand text-[10px] uppercase tracking-[0.18em] text-[#D8BE82] mb-1.5"
                      >
                        {t.houseLabel}
                      </label>
                      <input
                        id="po-house"
                        type="text"
                        value={house}
                        onChange={(e) => setHouse(e.target.value)}
                        placeholder="Xerjoff / Amouage"
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/30 focus:border-[#E5C87E] text-sm text-white outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="po-fragrance"
                        className="block font-brand text-[10px] uppercase tracking-[0.18em] text-[#D8BE82] mb-1.5"
                      >
                        {t.variantLabel}
                      </label>
                      <input
                        id="po-fragrance"
                        type="text"
                        value={fragranceName}
                        onChange={(e) => setFragranceName(e.target.value)}
                        placeholder="Mis. 1861 Naxos / Reflection 45"
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/30 focus:border-[#E5C87E] text-sm text-white outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Interactive Luxury Flacon Volume Selector */}
                  <div>
                    <label
                      htmlFor="po-volume"
                      className="block font-brand text-[10px] uppercase tracking-[0.18em] text-[#D8BE82] mb-1.5"
                    >
                      {t.volumeLabel}
                    </label>
                    <div className="grid grid-cols-4 gap-2 p-1.5 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/30">
                      {['50 ml', '75 ml', '100 ml', '125 ml'].map((volOpt) => (
                        <button
                          key={volOpt}
                          type="button"
                          onClick={() => setVolume(volOpt)}
                          className={`py-2 rounded-lg font-mono-tabular text-xs transition-all cursor-pointer whitespace-nowrap ${
                            volume === volOpt
                              ? 'btn-luxury-gold font-bold'
                              : 'text-zinc-300 hover:text-[#F5E6B8]'
                          }`}
                        >
                          {volOpt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="po-notes"
                      className="block font-brand text-[10px] uppercase tracking-[0.18em] text-[#D8BE82] mb-1.5"
                    >
                      {t.notesLabel}
                    </label>
                    <input
                      id="po-notes"
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Segel BNIB (Brand New in Box), sertakan opsi Private Invoice..."
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/30 focus:border-[#E5C87E] text-sm text-white outline-none transition-colors"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/60 p-3 rounded-xl">
                      {errorMsg}
                    </p>
                  )}

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      type="submit"
                      className="w-full min-h-[48px] py-3.5 px-5 rounded-xl btn-luxury-gold font-brand text-xs font-bold uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                      data-testid="submit-preorder-btn"
                    >
                      <Send className="w-3.5 h-3.5 shrink-0" />
                      <span>{t.submitBtn}</span>
                    </button>

                    <a
                      href={directWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/45 hover:border-[#F5E6B8] text-[#F5E6B8] hover:text-white font-brand text-xs font-semibold uppercase tracking-[0.16em] transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                    >
                      <MessageCircle className="w-4 h-4 text-[#E5C87E] shrink-0" />
                      <span>{t.sendWaBtn}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#E5C87E] shrink-0" />
                    </a>
                  </div>
                </form>

                {/* Submitted Pre-Order Ticket Confirmation */}
                {submissions.length > 0 && (
                  <div
                    className="pt-4 border-t border-[#D4AF37]/25 space-y-3"
                    data-testid="preorder-confirmation-list"
                  >
                    <p className="font-brand text-[10px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Tiket Pre-Order Tercatat di Sistem Concierge</span>
                    </p>
                    {submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/35 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-mono-tabular text-[#E5C87E]">
                          <span>TIKET: {sub.id}</span>
                          <span>{sub.submittedAt}</span>
                        </div>
                        <p className="text-white font-medium">
                          {sub.house} — {sub.fragranceName} ({sub.volume})
                        </p>
                        <p className="text-zinc-400">
                          Pemohon: {sub.clientName} ({sub.whatsappNumber})
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Row 2: Full-Width B2B Wholesale Royal Vault Card (Horizontal Layout on Laptop/Desktop) */}
        <ScrollReveal variant="scale" delayMs={160} className="w-full">
          <div className="relative w-full p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#181622]/95 via-[#121119]/95 to-[#0D0C12]/95 border border-[#D4AF37]/45 shadow-[0_14px_38px_-14px_rgba(212,175,55,0.22)] flex flex-col lg:flex-row items-center justify-between text-center lg:text-left gap-6 overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#F5E6B8]/70 to-transparent"
            />
            {/* Left side: Script Kicker, Title, Subtext */}
            <div className="space-y-2 max-w-2xl">
              <p className="font-latin-script text-2xl sm:text-3xl text-gold-champagne">
                Partenariat Corporatif & B2B
              </p>
              <div className="space-y-1">
                <p className="font-brand text-[10px] sm:text-xs uppercase tracking-[0.24em] text-[#E5C87E] font-semibold">
                  {t.b2bKicker}
                </p>
                <p className="font-serif-luxury text-xl sm:text-2xl font-semibold text-white leading-snug">
                  {t.b2bTitle}
                </p>
              </div>
            </div>

            {/* Right side: Action Button */}
            <div className="shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={onOpenB2BModal}
                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-xl btn-luxury-gold font-brand text-xs font-bold uppercase tracking-[0.2em] transition-all cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-2 shadow-[0_8px_24px_-6px_rgba(212,175,55,0.35)]"
              >
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>{t.b2bButton}</span>
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

interface B2BWholesaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const B2BWholesaleModal: React.FC<B2BWholesaleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [companyName, setCompanyName] = useState<string>('');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [whatsappOrEmail, setWhatsappOrEmail] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [partnershipTier, setPartnershipTier] = useState<
    B2BPartnerSubmission['partnershipTier']
  >('B2B Boutique Wholesale');
  const [estimatedMonthlyVolume, setEstimatedMonthlyVolume] =
    useState<string>('10–25 Botol / Bulan');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedRecord, setSubmittedRecord] =
    useState<B2BPartnerSubmission | null>(null);

  if (!isOpen) return null;

  const handleB2BSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateB2BInput({
      companyName,
      contactPerson,
      whatsappOrEmail,
      city,
    });
    if (!check.valid) {
      setErrorMsg(check.error || 'Mohon lengkapi seluruh data kemitraan.');
      return;
    }

    setErrorMsg(null);
    setSubmittedRecord({
      id: `B2B-VRV-${Math.floor(1000 + Math.random() * 9000)}`,
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim(),
      whatsappOrEmail: whatsappOrEmail.trim(),
      city: city.trim(),
      partnershipTier,
      estimatedMonthlyVolume,
      submittedAt: '25 Okt 2026 · Terkirim ke Divisi B2B VORVAN',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="b2b-modal-title"
    >
      <div className="w-full max-w-2xl bg-[#121215] border border-zinc-700 p-6 sm:p-8 my-auto space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-[0.18em]">
              <Briefcase className="w-4 h-4 text-zinc-200" />
              <span>VORVAN TRADE & PRIVATE SOURCING</span>
            </div>
            <h2
              id="b2b-modal-title"
              className="mt-1 font-serif-luxury text-2xl sm:text-3xl font-semibold text-white"
            >
              Pendaftaran Kemitraan B2B Wholesale / Private Sourcing
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white cursor-pointer"
            aria-label="Tutup Pendaftaran B2B"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedRecord ? (
          <div className="p-6 bg-[#0D0D0F] border border-zinc-700 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              <span>Pengajuan Kemitraan B2B Berhasil Diterima ({submittedRecord.id})</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Terima kasih, <strong className="text-white">{submittedRecord.contactPerson}</strong> dari{' '}
              <strong className="text-white">{submittedRecord.companyName}</strong> ({submittedRecord.city}). Tim Trade Director VORVAN akan mengirimkan katalog harga grosir (Tiered Allocation Sheet) ke{' '}
              <span className="font-mono-tabular text-white">{submittedRecord.whatsappOrEmail}</span>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white text-zinc-950 text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Selesai & Kembali
            </button>
          </div>
        ) : (
          <form onSubmit={handleB2BSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="b2b-company"
                  className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5"
                >
                  Nama Butik / Perusahaan *
                </label>
                <input
                  id="b2b-company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="PT / Nama Bisnis Anda"
                  className="w-full px-3.5 py-2.5 bg-[#0D0D0F] border border-zinc-700 focus:border-white text-sm text-white outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="b2b-pic"
                  className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5"
                >
                  Nama Penanggung Jawab (PIC) *
                </label>
                <input
                  id="b2b-pic"
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Nama Lengkap PIC"
                  className="w-full px-3.5 py-2.5 bg-[#0D0D0F] border border-zinc-700 focus:border-white text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="b2b-contact"
                  className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5"
                >
                  WhatsApp Bisnis / Email Korporat *
                </label>
                <input
                  id="b2b-contact"
                  type="text"
                  value={whatsappOrEmail}
                  onChange={(e) => setWhatsappOrEmail(e.target.value)}
                  placeholder="0811xxxx / procurement@company.id"
                  className="w-full px-3.5 py-2.5 bg-[#0D0D0F] border border-zinc-700 focus:border-white text-sm text-white outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="b2b-city"
                  className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5"
                >
                  Kota Domisili *
                </label>
                <input
                  id="b2b-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Jakarta / Surabaya / Bali / Medan"
                  className="w-full px-3.5 py-2.5 bg-[#0D0D0F] border border-zinc-700 focus:border-white text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="b2b-tier"
                  className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5"
                >
                  Kategori Kemitraan
                </label>
                <select
                  id="b2b-tier"
                  value={partnershipTier}
                  onChange={(e) =>
                    setPartnershipTier(
                      e.target.value as B2BPartnerSubmission['partnershipTier']
                    )
                  }
                  className="w-full px-3.5 py-2.5 bg-[#0D0D0F] border border-zinc-700 focus:border-white text-sm text-white outline-none"
                >
                  <option value="B2B Boutique Wholesale">
                    B2B Boutique Wholesale (Reseller / Decant Atelier)
                  </option>
                  <option value="Corporate Gifting & VIP Souvenir">
                    Corporate Gifting &amp; VIP Souvenir
                  </option>
                  <option value="Private Collector Sourcing">
                    Private Collector Sourcing
                  </option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="b2b-volume"
                  className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5"
                >
                  Estimasi Kuantitas Bulanan
                </label>
                <select
                  id="b2b-volume"
                  value={estimatedMonthlyVolume}
                  onChange={(e) => setEstimatedMonthlyVolume(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D0D0F] border border-zinc-700 focus:border-white text-sm text-white outline-none"
                >
                  <option value="10–25 Botol / Bulan">10–25 Botol / Bulan</option>
                  <option value="25–50 Botol / Bulan">25–50 Botol / Bulan</option>
                  <option value="50+ Botol / Kontrak Tahunan">
                    50+ Botol / Kontrak Tahunan
                  </option>
                </select>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/60 p-3">
                {errorMsg}
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold uppercase tracking-[0.14em] cursor-pointer"
                data-testid="submit-b2b-btn"
              >
                Kirim Pendaftaran Kemitraan B2B
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
