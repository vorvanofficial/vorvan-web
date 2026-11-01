import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Database,
  KeyRound,
  Link2,
  Lock,
  Mail,
  PlusCircle,
  Settings,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  FRAGRANCE_CATALOG,
  SHIPPING_ZONES,
  VORVAN_81_CATALOG,
  VORVAN_CONCIERGE_EMAIL,
} from '../data/catalog';
import {
  ConciergeEmailLead,
  CustomAdminOrder,
  FragranceItem,
  ShippingMethodType,
  ShippingZoneKey,
  VorvanSiteSettings,
} from '../types/fragrance';
import {
  autoDetectShippingZoneByCity,
  buildConciergeRecommendationWaText,
  buildSmartShareUrl,
  computeAutoShippingStage,
  filterConciergeGuide81,
  filterVorvanCheatSheet,
  formatIDRCurrency,
  resolveCourierMetadata,
  resolveVorvanSkuPricing,
  validateConciergeEmail,
} from '../utils/businessRules';
import {
  CONCIERGE_MOMENT_BUTTONS,
  ConciergeGenderFilterKey,
  ConciergeMomentFilterKey,
} from '../data/conciergeGuide81';

const ADMIN_COURIER_OPTIONS: ShippingMethodType[] = [
  'JNE',
  'J&T Express',
  'SiCepat',
  'Paxel',
  'Anteraja',
  'COD Kurir Internal VORVAN',
];

const SHIPPING_ZONE_BUTTONS: {
  key: ShippingZoneKey;
  shortTitle: string;
  subText: string;
}[] = [
  { key: 'FREE_VIP', shortTitle: 'FREE VIP / COD', subText: 'Rp 0 (Gratis)' },
  { key: 'ZONA_1', shortTitle: 'Zona 1 · Jawa & Jabodetabek', subText: 'Rp 25.000' },
  { key: 'ZONA_2', shortTitle: 'Zona 2 · Bali, Sumatera, Kal', subText: 'Rp 45.000' },
  { key: 'ZONA_3', shortTitle: 'Zona 3 · Sulawesi, NTB, NTT', subText: 'Rp 65.000' },
  { key: 'ZONA_4', shortTitle: 'Zona 4 · Maluku & Papua', subText: 'Rp 95.000' },
];

interface EmailGatewayModalProps {
  isOpen: boolean;
  pendingFragrance?: { fragrance: FragranceItem; volume: string } | null;
  conciergeEmail?: string;
  onClose: () => void;
  onSuccessRegister: (normalizedEmail: string) => void;
}

export const EmailGatewayModal: React.FC<EmailGatewayModalProps> = ({
  isOpen,
  pendingFragrance,
  conciergeEmail = VORVAN_CONCIERGE_EMAIL,
  onClose,
  onSuccessRegister,
}) => {
  const [emailInput, setEmailInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateConciergeEmail(emailInput);
    if (!check.valid) {
      setErrorMsg(check.error || 'Format alamat email belum sesuai.');
      return;
    }
    setErrorMsg(null);
    onSuccessRegister(check.normalizedEmail);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-gateway-title"
    >
      <div className="relative w-full max-w-md bg-[#121216] border border-[#D4AF37]/45 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white cursor-pointer"
          aria-label="Tutup Email Gateway"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-[#E5C87E] uppercase tracking-[0.22em]">
          <Lock className="w-3.5 h-3.5 text-[#E5C87E]" />
          <span>VORVAN PRIVATE CLIENT REGISTRY</span>
        </div>

        <h2
          id="email-gateway-title"
          className="mt-2 font-serif-luxury text-2xl sm:text-3xl font-semibold text-white"
        >
          Akses Kuotasi Privat &amp; Katalog Concierge
        </h2>

        <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
          Masukkan alamat email Anda satu kali (tanpa kata sandi) untuk membuka
          jalur penawaran harga eksklusif WhatsApp &amp; Telegram VIP VORVAN.
        </p>

        {pendingFragrance && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#0D0D0F] border border-[#D4AF37]/30 text-xs">
            <span className="text-zinc-400 block">Melanjutkan Penawaran Untuk:</span>
            <span className="text-[#F5E6B8] font-medium mt-0.5 block">
              {pendingFragrance.fragrance.house} — {pendingFragrance.fragrance.name} (
              {pendingFragrance.volume})
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="concierge-email-input"
              className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5"
            >
              Alamat Email Klien
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="concierge-email-input"
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="nama.anda@domain.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/35 focus:border-[#E5C87E] text-sm text-white placeholder:text-zinc-600 outline-none"
                autoFocus
              />
            </div>
            {errorMsg && (
              <p className="mt-1.5 text-xs text-rose-400" role="alert">
                {errorMsg}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-5 rounded-xl btn-luxury-gold text-zinc-950 text-xs font-bold uppercase tracking-[0.18em] transition-colors cursor-pointer"
            data-testid="submit-concierge-email-btn"
          >
            Buka Akses Concierge Sekarang
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-start gap-2 text-[11px] text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-[#E5C87E] shrink-0 mt-0.5" />
          <span>
            Log pendaftaran klien disinkronkan secara otomatis ke sistem email resmi{' '}
            <strong className="text-[#F5E6B8]">{conciergeEmail}</strong> untuk
            pengiriman Private Invoice &amp; nomor resi pengiriman.
          </span>
        </div>
      </div>
    </div>
  );
};

interface AdminEmailRegistryModalProps {
  isOpen: boolean;
  leads: ConciergeEmailLead[];
  settings: VorvanSiteSettings;
  customOrders: CustomAdminOrder[];
  onClose: () => void;
  onUpdateSettings: (nextSettings: VorvanSiteSettings) => void;
  onCreateCustomOrder: (newOrder: CustomAdminOrder) => void;
  onUpdateCustomOrderStage: (invoiceId: string, stage: 1 | 2 | 3 | 4) => void;
  onUpdateCustomOrderStatus: (
    invoiceId: string,
    status: 'PENDING_PAYMENT' | 'PAID'
  ) => void;
  onDeleteCustomOrder: (invoiceId: string) => void;
  onOpenInvoicePreview: (invoiceId: string, smartOrder?: CustomAdminOrder) => void;
  onOpenTrackingPreview: (query: string, smartOrder?: CustomAdminOrder) => void;
  onSyncCloud?: () => Promise<void> | void;
}

export const AdminEmailRegistryModal: React.FC<AdminEmailRegistryModalProps> = ({
  isOpen,
  leads,
  settings,
  customOrders,
  onClose,
  onUpdateSettings,
  onCreateCustomOrder,
  onUpdateCustomOrderStage,
  onUpdateCustomOrderStatus,
  onDeleteCustomOrder,
  onOpenInvoicePreview,
  onOpenTrackingPreview,
  onSyncCloud,
}) => {
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [isPinUnlocked, setIsPinUnlocked] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'create' | 'settings' | 'database' | 'concierge'
  >('create');

  // Tab 4: Concierge Guide (Panduan 81 Parfum — Iklim Indonesia) state
  const [guideQuery, setGuideQuery] = useState<string>('');
  const [guideMomentFilter, setGuideMomentFilter] =
    useState<ConciergeMomentFilterKey>('ALL');
  const [guideGenderFilter, setGuideGenderFilter] =
    useState<ConciergeGenderFilterKey>('All');

  // Default initial SKU #1 (LV Afternoon Swim)
  const initialSku = VORVAN_81_CATALOG[0];

  // Tab 1: Create Invoice & Resi state
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerCity, setBuyerCity] = useState<string>('');
  const [selectedFragranceId, setSelectedFragranceId] = useState<string>(
    FRAGRANCE_CATALOG[0]?.id || 'lv-afternoon-swim'
  );
  const [customFragranceText, setCustomFragranceText] = useState<string>('');
  const [volume, setVolume] = useState<string>(initialSku?.size || '100ml');
  const [dealPriceIDR, setDealPriceIDR] = useState<string>(
    String(initialSku?.price || 4550000)
  );
  const [retailPriceIDR, setRetailPriceIDR] = useState<string>(
    String(initialSku?.retail || 6500000)
  );
  const [discountPct, setDiscountPct] = useState<string>(
    String(initialSku?.disc || 30)
  );
  const [selectedShippingZone, setSelectedShippingZone] =
    useState<ShippingZoneKey>('FREE_VIP');
  const [shippingCostIDR, setShippingCostIDR] = useState<string>(
    String(SHIPPING_ZONES.FREE_VIP.cost)
  );
  const [shippingLabel, setShippingLabel] = useState<string>(
    SHIPPING_ZONES.FREE_VIP.label
  );
  const [cheatSheetQuery, setCheatSheetQuery] = useState<string>('');
  const [cheatSheetTier, setCheatSheetTier] = useState<string>('ALL');

  const [shippingMethod, setShippingMethod] = useState<ShippingMethodType>('JNE');
  const [awbNumber, setAwbNumber] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'PENDING_PAYMENT' | 'PAID'>(
    'PENDING_PAYMENT'
  );
  const [createdOrderResult, setCreatedOrderResult] =
    useState<CustomAdminOrder | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // Tab 2: Settings form state
  const [formSettings, setFormSettings] = useState<VorvanSiteSettings>(settings);
  const [settingsSavedBanner, setSettingsSavedBanner] = useState<boolean>(false);

  useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!isOpen) {
      setPinInput('');
      setPinError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Resolve currently selected SKU pricing entry for the live badge
  const selectedCatalogIndex = FRAGRANCE_CATALOG.findIndex(
    (f) => f.id === selectedFragranceId
  );
  const activeSkuPricing =
    selectedFragranceId === 'CUSTOM'
      ? null
      : resolveVorvanSkuPricing(
          selectedCatalogIndex >= 0 ? selectedCatalogIndex : selectedFragranceId
        );

  const handleSelectPerfumeByIdOrIndex = (idOrIdx: string | number) => {
    if (idOrIdx === 'CUSTOM') {
      setSelectedFragranceId('CUSTOM');
      return;
    }
    const idx =
      typeof idOrIdx === 'number'
        ? idOrIdx
        : FRAGRANCE_CATALOG.findIndex((f) => f.id === idOrIdx);
    const catalogItem = idx >= 0 ? FRAGRANCE_CATALOG[idx] : undefined;
    const skuEntry = resolveVorvanSkuPricing(idx >= 0 ? idx : idOrIdx);

    if (catalogItem) {
      setSelectedFragranceId(catalogItem.id);
      setVolume(skuEntry?.size || catalogItem.defaultVolume);
    }
    if (skuEntry) {
      setDealPriceIDR(String(skuEntry.price));
      setRetailPriceIDR(String(skuEntry.retail));
      setDiscountPct(String(skuEntry.disc));
      setVolume(skuEntry.size);
    }
  };

  const handleApplyShippingZone = (zoneKey: ShippingZoneKey) => {
    const zone = SHIPPING_ZONES[zoneKey];
    if (!zone) return;
    setSelectedShippingZone(zoneKey);
    setShippingCostIDR(String(zone.cost));
    setShippingLabel(zone.label);
  };

  const handleBuyerCityChange = (nextCity: string) => {
    setBuyerCity(nextCity);
    if (nextCity.trim().length >= 3) {
      const detected = autoDetectShippingZoneByCity(nextCity);
      if (detected) {
        setSelectedShippingZone(detected.zoneKey);
        setShippingCostIDR(String(detected.cost));
        setShippingLabel(detected.label);
      }
    }
  };

  const filteredCheatSheetItems = filterVorvanCheatSheet(
    cheatSheetQuery,
    cheatSheetTier
  );

  const filteredConciergeGuideItems = filterConciergeGuide81(
    guideQuery,
    guideMomentFilter,
    guideGenderFilter
  );

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '8888') {
      setIsPinUnlocked(true);
      setPinError(null);
    } else {
      setPinError('Kode PIN Keamanan salah. Akses ditolak.');
    }
  };

  // Uses buildSmartShareUrl from businessRules.ts (?v=...)

  const handleCopyText = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2400);
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerCity.trim()) {
      setCreateError('Mohon isi Nama Pembeli dan Kota/Alamat Tujuan.');
      return;
    }
    const numericPrice = Number(dealPriceIDR.replace(/\D/g, ''));
    if (!numericPrice || numericPrice < 10000) {
      setCreateError('Mohon masukkan Harga Deal (Rp) yang valid.');
      return;
    }
    const rawRetail = Number(retailPriceIDR.replace(/\D/g, ''));
    const numericRetail =
      rawRetail > numericPrice
        ? rawRetail
        : activeSkuPricing?.retail || Math.round(numericPrice / 0.72);
    const rawDisc = Number(discountPct.replace(/\D/g, ''));
    const numericDisc =
      rawDisc > 0 && rawDisc < 95
        ? rawDisc
        : Math.max(
            1,
            Math.round(((numericRetail - numericPrice) / numericRetail) * 100)
          );
    const numericShipCost = Math.max(
      0,
      Number(shippingCostIDR.replace(/\D/g, '')) || 0
    );
    const cleanShipLabel =
      shippingLabel.trim() || SHIPPING_ZONES[selectedShippingZone].label;

    setCreateError(null);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const invoiceId = `INV-VRV-${randomDigits}`;
    const cleanAwb =
      awbNumber.trim() ||
      (shippingMethod.includes('COD')
        ? `COD-VRV-${randomDigits}`
        : `VRV-RESI-${randomDigits}`);

    const catalogItem = FRAGRANCE_CATALOG.find(
      (f) => f.id === selectedFragranceId
    );
    const houseName =
      selectedFragranceId === 'CUSTOM'
        ? 'VORVAN Private Selection'
        : catalogItem?.house || 'Louis Vuitton';
    const perfumeName =
      selectedFragranceId === 'CUSTOM'
        ? customFragranceText.trim() || 'Bespoke Fragrance'
        : catalogItem?.name || 'Afternoon Swim';
    const conc = catalogItem?.concentration || 'Eau de Parfum';
    const batch = catalogItem?.batchCode || `VRV-${randomDigits}`;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newOrder: CustomAdminOrder = {
      invoiceId,
      trackingId: cleanAwb,
      createdAt: `${formattedDate} · ${formattedTime} WIB`,
      createdAtTimestampMs: now.getTime(),
      buyerName: buyerName.trim(),
      buyerCity: buyerCity.trim(),
      house: houseName,
      fragranceName: perfumeName,
      concentration: conc,
      volume: volume.trim() || '100ml',
      batchCode: batch,
      dealPriceIDR: numericPrice,
      retailPriceIDR: numericRetail,
      discountPct: numericDisc,
      shippingCostIDR: numericShipCost,
      shippingLabel: cleanShipLabel,
      shippingMethod,
      awbNumber: cleanAwb,
      status: paymentStatus,
    };

    onCreateCustomOrder(newOrder);
    setCreatedOrderResult(newOrder);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formSettings);
    setSettingsSavedBanner(true);
    setTimeout(() => setSettingsSavedBanner(false), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="secret-admin-title"
    >
      {!isPinUnlocked ? (
        /* PIN 8888 SECURITY GATE */
        <div className="w-full max-w-md bg-[#111016] border border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2 text-xs text-[#E5C87E] uppercase tracking-[0.22em]">
              <KeyRound className="w-4 h-4 text-[#E5C87E]" />
              <span>VORVAN VAULT SECURITY GATE</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white cursor-pointer"
              aria-label="Tutup Pintu Admin"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 text-center">
            <h2
              id="secret-admin-title"
              className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-white"
            >
              Otorisasi Konsol Admin
            </h2>
            <p className="text-xs text-zinc-400">
              Masukkan 4 digit PIN keamanan internal VORVAN untuk membuka manajemen
              Invoice, Resi &amp; Rekening.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                if (pinError) setPinError(null);
              }}
              placeholder="••••"
              className="w-full py-3.5 px-4 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/40 focus:border-[#E5C87E] text-center font-mono-tabular text-2xl tracking-[0.5em] text-[#F5E6B8] outline-none"
              autoFocus
              data-testid="admin-pin-input"
            />
            {pinError && (
              <p className="text-xs text-rose-400 text-center flex items-center justify-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl btn-luxury-gold text-zinc-950 font-brand text-xs font-bold uppercase tracking-[0.2em] cursor-pointer"
              data-testid="admin-pin-submit"
            >
              Buka Vault Admin
            </button>
          </form>
        </div>
      ) : (
        /* UNLOCKED 3-TAB ADMIN DASHBOARD */
        <div className="w-full max-w-5xl bg-[#111016] border border-[#D4AF37]/50 rounded-2xl p-5 sm:p-8 shadow-2xl my-auto space-y-6 max-h-[92vh] overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/25 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#E5C87E] uppercase tracking-[0.2em]">
                <Database className="w-4 h-4 text-[#E5C87E]" />
                <span>VORVAN EXECUTIVE ADMIN SUITE · ANDRE SATRIA P</span>
              </div>
              <h2
                id="secret-admin-title"
                className="mt-1 font-serif-luxury text-2xl sm:text-3xl font-semibold text-white"
              >
                Manajemen Tagihan, Resi, Rekening &amp; Smart Link
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="self-end sm:self-auto px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Tutup Admin</span>
            </button>
          </div>

          {/* 4 ADMIN TABS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                activeTab === 'create'
                  ? 'btn-luxury-gold text-zinc-950 font-bold'
                  : 'bg-[#0B0A0E] text-zinc-300 border-[#D4AF37]/30 hover:border-[#E5C87E]'
              }`}
              data-testid="admin-tab-create"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <p className="font-brand text-[10px] uppercase tracking-wider truncate">
                  TAB 1 · GENERATOR &amp; SMART LINK
                </p>
                <p className="text-xs font-semibold truncate">
                  Buat Invoice &amp; Resi Baru
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                activeTab === 'settings'
                  ? 'btn-luxury-gold text-zinc-950 font-bold'
                  : 'bg-[#0B0A0E] text-zinc-300 border-[#D4AF37]/30 hover:border-[#E5C87E]'
              }`}
              data-testid="admin-tab-settings"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <p className="font-brand text-[10px] uppercase tracking-wider truncate">
                  TAB 2 · KONTAK &amp; PEMBAYARAN
                </p>
                <p className="text-xs font-semibold truncate">
                  Rekening, WA, Telegram &amp; PayPal QR
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('database')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                activeTab === 'database'
                  ? 'btn-luxury-gold text-zinc-950 font-bold'
                  : 'bg-[#0B0A0E] text-zinc-300 border-[#D4AF37]/30 hover:border-[#E5C87E]'
              }`}
              data-testid="admin-tab-database"
            >
              <Database className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <p className="font-brand text-[10px] uppercase tracking-wider truncate">
                  TAB 3 · DATABASE &amp; KODE AKTIF
                </p>
                <p className="text-xs font-semibold truncate">
                  Email Klien ({leads.length}) &amp; Semua Resi
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('concierge')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                activeTab === 'concierge'
                  ? 'btn-luxury-gold text-zinc-950 font-bold'
                  : 'bg-[#0B0A0E] text-zinc-300 border-[#D4AF37]/30 hover:border-[#E5C87E]'
              }`}
              data-testid="admin-tab-concierge"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <p className="font-brand text-[10px] uppercase tracking-wider truncate">
                  TAB 4 · CONCIERGE GUIDE
                </p>
                <p className="text-xs font-semibold truncate">
                  Panduan 81 Parfum — Iklim Indonesia
                </p>
              </div>
            </button>
          </div>

          {/* TAB 1: BUAT INVOICE & RESI BARU + SMART SHAREABLE URL + CONTEKAN 81 SKU */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <form
                  id="vorvan-admin-create-form"
                  onSubmit={handleCreateOrderSubmit}
                  className="lg:col-span-7 bg-[#0B0A0E] border border-[#D4AF37]/30 rounded-2xl p-5 sm:p-6 space-y-4"
                >
                  <h3 className="font-serif-luxury text-xl font-semibold text-[#F5E6B8] border-b border-zinc-800 pb-3">
                    Formulir Penerbitan Tagihan &amp; Resi Pembeli
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        Nama Pembeli *
                      </label>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="Contoh: Bpk. Hendra Wijaya"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 focus:border-[#E5C87E] text-sm text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        Kota / Alamat Lengkap * (Auto-Deteksi Zona Ongkir)
                      </label>
                      <input
                        id="admin-buyer-city"
                        type="text"
                        value={buyerCity}
                        onChange={(e) => handleBuyerCityChange(e.target.value)}
                        placeholder="Contoh: Kebayoran Baru, Jakarta Selatan"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 focus:border-[#E5C87E] text-sm text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="admin-perfume-select"
                        className="block text-xs text-zinc-400 mb-1"
                      >
                        Pilihan Parfum (81 SKU Resmi · Auto-Fill Harga &amp; Diskon)
                      </label>
                      <select
                        id="admin-perfume-select"
                        value={selectedFragranceId}
                        onChange={(e) =>
                          handleSelectPerfumeByIdOrIndex(e.target.value)
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 focus:border-[#E5C87E] text-sm text-white outline-none"
                      >
                        {FRAGRANCE_CATALOG.map((item, idx) => {
                          const sku = VORVAN_81_CATALOG[idx];
                          return (
                            <option key={item.id} value={item.id}>
                              #{idx + 1} {item.house} — {item.name} (
                              {sku?.size || item.defaultVolume}) · Rp{' '}
                              {(sku?.price || 4550000).toLocaleString('id-ID')}
                            </option>
                          );
                        })}
                        <option value="CUSTOM">
                          + Ketik Manual Parfum Lainnya (Pre-Order / Custom)
                        </option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="admin-bottle-size"
                        className="block text-xs text-zinc-400 mb-1"
                      >
                        Ukuran Botol
                      </label>
                      <input
                        id="admin-bottle-size"
                        type="text"
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        placeholder="100ml"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 focus:border-[#E5C87E] text-sm text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* POIN 2: LIVE AUTO-FILL PRICE & DISCOUNT BADGE */}
                  {activeSkuPricing && (
                    <div
                      id="admin-auto-price-badge"
                      className="p-3 rounded-xl bg-[#14121D] border border-[#D4AF37]/40 text-xs leading-relaxed text-zinc-200"
                    >
                      ✅{' '}
                      <strong className="text-[#E5C87E]">
                        {activeSkuPricing.brand} — {activeSkuPricing.name} (
                        {activeSkuPricing.size})
                      </strong>{' '}
                      | Ritel Resmi:{' '}
                      <del className="text-zinc-400">
                        Rp {activeSkuPricing.retail.toLocaleString('id-ID')}
                      </del>{' '}
                      | Diskon VORVAN:{' '}
                      <span className="text-emerald-400 font-semibold">
                        {activeSkuPricing.disc}% (Hemat Rp{' '}
                        {activeSkuPricing.cut.toLocaleString('id-ID')})
                      </span>{' '}
                      | Harga Jual:{' '}
                      <strong className="text-white font-mono-tabular">
                        Rp {activeSkuPricing.price.toLocaleString('id-ID')}
                      </strong>
                    </div>
                  )}

                  {selectedFragranceId === 'CUSTOM' && (
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        Nama Brand &amp; Parfum Custom *
                      </label>
                      <input
                        type="text"
                        value={customFragranceText}
                        onChange={(e) => setCustomFragranceText(e.target.value)}
                        placeholder="Contoh: Xerjoff — 1861 Naxos EDP"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 focus:border-[#E5C87E] text-sm text-white outline-none"
                      />
                    </div>
                  )}

                  {/* AUTO-FILLED PRICING FIELDS (DEAL PRICE, RETAIL PRICE, DISCOUNT %, STATUS) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label
                        htmlFor="admin-deal-price"
                        className="block text-xs text-[#E5C87E] font-medium mb-1"
                      >
                        Harga Jual VORVAN (Rp) *
                      </label>
                      <input
                        id="admin-deal-price"
                        type="text"
                        value={dealPriceIDR}
                        onChange={(e) => {
                          const nextDeal = e.target.value;
                          setDealPriceIDR(nextDeal);
                          const dNum = Number(nextDeal.replace(/\D/g, ''));
                          const rNum = Number(retailPriceIDR.replace(/\D/g, ''));
                          if (dNum > 0 && rNum > dNum) {
                            setDiscountPct(
                              String(Math.round(((rNum - dNum) / rNum) * 100))
                            );
                          }
                        }}
                        placeholder="4550000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-[#D4AF37]/50 focus:border-[#E5C87E] text-sm font-mono-tabular font-semibold text-[#F5E6B8] outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="admin-retail-price"
                        className="block text-xs text-zinc-400 mb-1"
                      >
                        Harga Ritel Resmi (Rp)
                      </label>
                      <input
                        id="admin-retail-price"
                        type="text"
                        value={retailPriceIDR}
                        onChange={(e) => {
                          const nextRetail = e.target.value;
                          setRetailPriceIDR(nextRetail);
                          const rNum = Number(nextRetail.replace(/\D/g, ''));
                          const dNum = Number(dealPriceIDR.replace(/\D/g, ''));
                          if (dNum > 0 && rNum > dNum) {
                            setDiscountPct(
                              String(Math.round(((rNum - dNum) / rNum) * 100))
                            );
                          }
                        }}
                        placeholder="6500000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 focus:border-[#E5C87E] text-sm font-mono-tabular text-zinc-300 outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="admin-discount-pct"
                        className="block text-xs text-zinc-400 mb-1"
                      >
                        Diskon Parallel Import (%)
                      </label>
                      <input
                        id="admin-discount-pct"
                        type="text"
                        value={discountPct}
                        onChange={(e) => setDiscountPct(e.target.value)}
                        placeholder="30"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 focus:border-[#E5C87E] text-sm font-mono-tabular text-emerald-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* POIN 4: SISTEM ONGKIR PINTAR (ZONA FLAT 1-KLIK + AUTO-DETEKSI KOTA) */}
                  <div className="p-4 rounded-xl bg-[#121118] border border-[#D4AF37]/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="block text-xs text-[#E5C87E] font-semibold uppercase tracking-wider">
                        Zona Ongkir Pintar &amp; Asuransi Kargo (1-Klik / Auto-Deteksi Kota)
                      </label>
                      <span className="text-[11px] text-zinc-400">
                        Ketik kota di atas atau klik tombol zona di bawah:
                      </span>
                    </div>

                    <div
                      className="grid grid-cols-2 sm:grid-cols-5 gap-2"
                      role="group"
                      aria-label="Pilih Zona Ongkir Pintar"
                    >
                      {SHIPPING_ZONE_BUTTONS.map((zBtn) => {
                        const isZoneSelected = selectedShippingZone === zBtn.key;
                        return (
                          <button
                            key={zBtn.key}
                            type="button"
                            onClick={() => handleApplyShippingZone(zBtn.key)}
                            data-testid={`shipping-zone-${zBtn.key.toLowerCase()}`}
                            className={`p-2 rounded-lg text-left transition-all cursor-pointer border ${
                              isZoneSelected
                                ? 'btn-luxury-gold text-zinc-950 border-[#F5E6B8] font-bold'
                                : 'bg-[#0B0A0E] text-zinc-300 border-zinc-700 hover:border-[#D4AF37]/60'
                            }`}
                          >
                            <span className="block text-[10px] font-semibold truncate">
                              {zBtn.shortTitle}
                            </span>
                            <span
                              className={`block text-[11px] font-mono-tabular mt-0.5 ${
                                isZoneSelected
                                  ? 'text-zinc-950 font-bold'
                                  : 'text-[#E5C87E]'
                              }`}
                            >
                              {zBtn.subText}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label
                          htmlFor="admin-shipping-cost"
                          className="block text-[11px] text-zinc-400 mb-1"
                        >
                          Nominal Ongkir (Rp)
                        </label>
                        <input
                          id="admin-shipping-cost"
                          type="text"
                          value={shippingCostIDR}
                          onChange={(e) => setShippingCostIDR(e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-lg bg-[#0B0A0E] border border-zinc-700 focus:border-[#E5C87E] text-xs font-mono-tabular text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="admin-shipping-label"
                          className="block text-[11px] text-zinc-400 mb-1"
                        >
                          Keterangan Ongkir &amp; Asuransi di Invoice
                        </label>
                        <input
                          id="admin-shipping-label"
                          type="text"
                          value={shippingLabel}
                          onChange={(e) => setShippingLabel(e.target.value)}
                          placeholder="COMPLIMENTARY (Free VIP Insured Shipping)"
                          className="w-full px-3 py-2 rounded-lg bg-[#0B0A0E] border border-zinc-700 focus:border-[#E5C87E] text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Status Pembayaran
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) =>
                        setPaymentStatus(
                          e.target.value as 'PENDING_PAYMENT' | 'PAID'
                        )
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 focus:border-[#E5C87E] text-sm text-white outline-none"
                    >
                      <option value="PENDING_PAYMENT">
                        PENDING PAYMENT (Menunggu Pembayaran)
                      </option>
                      <option value="PAID">PAID (Lunas Terverifikasi)</option>
                    </select>
                  </div>

                  <div className="p-4 rounded-xl bg-[#121118] border border-[#D4AF37]/30 space-y-3.5">
                    <div>
                      <label className="block text-xs text-[#E5C87E] font-semibold uppercase tracking-wider mb-2">
                        Pilih Kurir Ekspedisi (1x Input Otomatis) *
                      </label>
                      <div
                        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                        role="group"
                        aria-label="Pilih Kurir Ekspedisi"
                      >
                        {ADMIN_COURIER_OPTIONS.map((courierOpt) => {
                          const isSelected = shippingMethod === courierOpt;
                          return (
                            <button
                              key={courierOpt}
                              type="button"
                              onClick={() => setShippingMethod(courierOpt)}
                              data-testid={`courier-option-${courierOpt
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')}`}
                              className={`px-3 py-2 rounded-lg text-xs font-mono-tabular font-semibold transition-all cursor-pointer border text-center truncate ${
                                isSelected
                                  ? 'btn-luxury-gold text-zinc-950 border-[#F5E6B8] font-bold'
                                  : 'bg-[#0B0A0E] text-zinc-300 border-zinc-700 hover:border-[#D4AF37]/60'
                              }`}
                            >
                              {courierOpt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-300 mb-1">
                        Ketik Nomor Resi Asli dari Ekspedisi (AWB Number)
                      </label>
                      <input
                        type="text"
                        value={awbNumber}
                        onChange={(e) => setAwbNumber(e.target.value)}
                        placeholder="Contoh: JNE881920194 / JP99102831 (Kosongkan untuk auto-generate)"
                        data-testid="admin-awb-input"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0A0E] border border-zinc-700 focus:border-[#E5C87E] text-sm font-mono-tabular text-white outline-none"
                      />
                      <p className="mt-1.5 text-[11px] text-emerald-400/90 leading-relaxed">
                        ✓ Begitu disimpan 1 kali, seluruh tahapan pelacakan (Lolos QC Vault → Manifest Kurir → Transit Hub Antar-Kota → Menuju Alamat Penerima) berjalan OTOMATIS &amp; terhubung ke satelit kurir tanpa perlu diedit manual.
                      </p>
                    </div>
                  </div>

                  {createError && (
                    <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800 p-3 rounded-xl">
                      {createError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 px-5 rounded-xl btn-luxury-gold text-zinc-950 font-brand text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
                    data-testid="admin-generate-invoice-btn"
                  >
                    Terbitkan Kode Invoice (`INV-VRV-XXXX`) &amp; Smart Link
                  </button>
                </form>

                {/* Right Column: Generated Smart Link & Result Card */}
                <div className="lg:col-span-5 bg-[#0B0A0E] border border-[#D4AF37]/35 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5">
                  {createdOrderResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Tagihan &amp; Resi Berhasil Diterbitkan!</span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#14131A] border border-[#D4AF37]/40 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Kode Invoice:</span>
                          <span className="font-mono-tabular font-bold text-[#F5E6B8] text-sm">
                            {createdOrderResult.invoiceId}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Nomor Resi:</span>
                          <span className="font-mono-tabular font-semibold text-white">
                            {createdOrderResult.awbNumber}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Pembeli:</span>
                          <span className="text-white font-medium">
                            {createdOrderResult.buyerName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Parfum:</span>
                          <span className="text-[#E5C87E] font-medium text-right">
                            {createdOrderResult.house} —{' '}
                            {createdOrderResult.fragranceName} (
                            {createdOrderResult.volume})
                          </span>
                        </div>
                        {createdOrderResult.retailPriceIDR &&
                          createdOrderResult.retailPriceIDR >
                            createdOrderResult.dealPriceIDR && (
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Harga Ritel Resmi:</span>
                              <span className="font-mono-tabular text-zinc-400 line-through">
                                {formatIDRCurrency(createdOrderResult.retailPriceIDR)}
                              </span>
                            </div>
                          )}
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">
                            Harga VORVAN (Diskon {createdOrderResult.discountPct || 25}
                            %):
                          </span>
                          <span className="font-mono-tabular font-semibold text-emerald-400">
                            {formatIDRCurrency(createdOrderResult.dealPriceIDR)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Ongkir &amp; Asuransi:</span>
                          <span className="font-mono-tabular text-zinc-200">
                            {(createdOrderResult.shippingCostIDR ?? 0) === 0
                              ? 'COMPLIMENTARY (Rp 0)'
                              : formatIDRCurrency(
                                  createdOrderResult.shippingCostIDR || 0
                                )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                          <span className="text-[#F5E6B8] font-semibold">
                            Total Tagihan Pembeli:
                          </span>
                          <span className="font-mono-tabular font-bold text-[#F5E6B8] text-sm">
                            {formatIDRCurrency(
                              createdOrderResult.dealPriceIDR +
                                (createdOrderResult.shippingCostIDR || 0)
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-2">
                        <p className="font-brand text-[10px] uppercase tracking-[0.18em] text-[#E5C87E]">
                          SMART SHAREABLE URL (BISA DIBUKA DI HP PEMBELI MANAPUN):
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyText(
                              buildSmartShareUrl(createdOrderResult, 'invoice'),
                              'smart-inv'
                            )
                          }
                          className="w-full py-3 px-4 rounded-xl btn-luxury-gold text-zinc-950 font-brand text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {copiedKey === 'smart-inv' ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Link Tagihan Pembeli Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Link2 className="w-4 h-4" />
                              <span>Salin Link Tagihan Khusus Pembeli</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyText(
                              buildSmartShareUrl(createdOrderResult, 'track'),
                              'smart-trk'
                            )
                          }
                          className="w-full py-3 px-4 rounded-xl bg-[#15141D] hover:bg-[#1E1C29] border border-[#D4AF37]/45 text-[#F5E6B8] font-brand text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {copiedKey === 'smart-trk' ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span>Link Cek Resi Pembeli Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-[#E5C87E]" />
                              <span>Salin Link Cek Resi Khusus Pembeli</span>
                            </>
                          )}
                        </button>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              onOpenInvoicePreview(
                                createdOrderResult.invoiceId,
                                createdOrderResult
                              );
                              onClose();
                            }}
                            className="py-2.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 cursor-pointer"
                          >
                            Lihat Tampilan Invoice
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onOpenTrackingPreview(
                                createdOrderResult.awbNumber,
                                createdOrderResult
                              );
                              onClose();
                            }}
                            className="py-2.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 cursor-pointer"
                          >
                            Lihat Tampilan Resi
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="my-auto text-center space-y-3 py-8">
                      <Link2 className="w-10 h-10 text-[#D4AF37]/60 mx-auto" />
                      <h4 className="font-serif-luxury text-xl text-white">
                        Teknologi Smart Shareable URL Ringkas (`?v=...`)
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Setiap tagihan &amp; resi yang Anda buat menghasilkan tautan
                        terkompresi Base64url super pendek (`?v=...`) yang sudah memuat
                        harga ritel resmi, persentase diskon VORVAN, serta rincian zona
                        ongkir secara otomatis. Saat dibuka oleh pembeli, alamat browser
                        otomatis dibersihkan menjadi{' '}
                        <code className="text-[#E5C87E]">/pay/INV-VRV-XXXX</code> atau{' '}
                        <code className="text-[#E5C87E]">/track/RESI</code>.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* POIN 3: CONTEKAN HARGA CEPAT (CHEAT SHEET 81 SKU DARI EXCEL VORVAN) */}
              <div className="bg-[#0B0A0E] border border-[#D4AF37]/35 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-brand uppercase tracking-[0.2em] text-[#E5C87E] block">
                      CONTEKAN HARGA CEPAT · 81 SKU RESMI EXCEL VORVAN
                    </span>
                    <h3 className="font-serif-luxury text-lg sm:text-xl font-semibold text-white">
                      Tabel Katalog Harga Ritel, Diskon %, Potongan &amp; Harga VORVAN
                    </h3>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono-tabular">
                    Menampilkan {filteredCheatSheetItems.length} dari 81 SKU
                  </span>
                </div>

                {/* Search & Tier Filters */}
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    id="admin-cheatsheet-search"
                    type="text"
                    value={cheatSheetQuery}
                    onChange={(e) => setCheatSheetQuery(e.target.value)}
                    placeholder="Cari nama parfum / rumah mode (mis: Afternoon Swim, Baccarat, Aventus)..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 focus:border-[#E5C87E] text-xs sm:text-sm text-white outline-none"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'ALL', label: 'Semua (81)' },
                      { id: '1', label: 'Tier 1 (>3.5 Jt)' },
                      { id: '2', label: 'Tier 2 (3.0–3.5 Jt)' },
                      { id: '3', label: 'Tier 3 (2.5–3.0 Jt)' },
                      { id: '4', label: 'Tier 4 (2.0–2.5 Jt)' },
                      { id: '5', label: 'Tier 5 (<2.0 Jt)' },
                    ].map((tBtn) => {
                      const active = cheatSheetTier === tBtn.id;
                      return (
                        <button
                          key={tBtn.id}
                          type="button"
                          onClick={() => setCheatSheetTier(tBtn.id)}
                          data-testid={`cheatsheet-tier-${tBtn.id.toLowerCase()}`}
                          className={`px-3 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                            active
                              ? 'btn-luxury-gold text-zinc-950 border-[#F5E6B8] font-bold'
                              : 'bg-[#14131A] text-zinc-300 border-zinc-700 hover:border-[#D4AF37]/50'
                          }`}
                        >
                          {tBtn.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scrollable 81 SKU Cheat Sheet Table */}
                <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-zinc-800">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#14131A] border-b border-zinc-700 text-[11px] uppercase tracking-wider text-zinc-400">
                      <tr>
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Brand — Nama Parfum</th>
                        <th className="py-2.5 px-2 text-center">Ukuran</th>
                        <th className="py-2.5 px-3 text-right">Harga Ritel</th>
                        <th className="py-2.5 px-2 text-center">Diskon</th>
                        <th className="py-2.5 px-3 text-right">Potongan</th>
                        <th className="py-2.5 px-3 text-right">Harga VORVAN</th>
                        <th className="py-2.5 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody
                      id="vorvan-cheatsheet-tbody"
                      className="divide-y divide-zinc-800/70 bg-[#0E0D12]"
                    >
                      {filteredCheatSheetItems.map((sku) => (
                        <tr
                          key={sku.no}
                          className="hover:bg-[#171520] transition-colors"
                        >
                          <td className="py-2 px-3 text-xs text-zinc-400 font-mono-tabular">
                            {sku.no}
                          </td>
                          <td className="py-2 px-3 text-xs text-white">
                            <strong className="text-[#E5C87E]">{sku.brand}</strong>{' '}
                            — {sku.name}{' '}
                            <span className="text-[10px] text-zinc-400">
                              ({sku.gender})
                            </span>
                          </td>
                          <td className="py-2 px-2 text-xs text-zinc-300 text-center font-mono-tabular">
                            {sku.size}
                          </td>
                          <td className="py-2 px-3 text-xs text-zinc-400 text-right font-mono-tabular">
                            <del>Rp {sku.retail.toLocaleString('id-ID')}</del>
                          </td>
                          <td className="py-2 px-2 text-xs text-emerald-400 font-semibold text-center font-mono-tabular">
                            {sku.disc}%
                          </td>
                          <td className="py-2 px-3 text-xs text-zinc-300 text-right font-mono-tabular">
                            -Rp {sku.cut.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2 px-3 text-xs text-[#F5E6B8] font-bold text-right font-mono-tabular">
                            Rp {sku.price.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectPerfumeByIdOrIndex(sku.no - 1);
                                const formEl = document.getElementById(
                                  'vorvan-admin-create-form'
                                );
                                formEl?.scrollIntoView({
                                  behavior: 'smooth',
                                  block: 'start',
                                });
                              }}
                              data-testid={`cheatsheet-use-${sku.no}`}
                              className="px-2.5 py-1 rounded-md btn-luxury-gold text-zinc-950 text-[11px] font-bold cursor-pointer"
                            >
                              Pakai
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PENGATURAN KONTAK, REKENING & LINK QR PAYPAL */}
          {activeTab === 'settings' && (
            <form
              onSubmit={handleSaveSettings}
              className="bg-[#0B0A0E] border border-[#D4AF37]/35 rounded-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-serif-luxury text-xl font-semibold text-[#F5E6B8]">
                  Pengaturan Kontak Resmi, Rekening Bank &amp; QR PayPal
                </h3>
                {settingsSavedBanner && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Perubahan Disimpan!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Nomor WhatsApp Resmi (Format 628...)
                  </label>
                  <input
                    type="text"
                    value={formSettings.whatsappNumber}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        whatsappNumber: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 text-sm font-mono-tabular text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Username Telegram VIP (Tanpa @)
                  </label>
                  <input
                    type="text"
                    value={formSettings.telegramUsername}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        telegramUsername: e.target.value.replace(/^@/, ''),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 text-sm font-mono-tabular text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Email Resmi Concierge
                  </label>
                  <input
                    type="email"
                    value={formSettings.conciergeEmail}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        conciergeEmail: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-800/80">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    No. Rekening Bank Mandiri
                  </label>
                  <input
                    type="text"
                    value={formSettings.mandiriAccount}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        mandiriAccount: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 text-sm font-mono-tabular text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Atas Nama (Mandiri)
                  </label>
                  <input
                    type="text"
                    value={formSettings.mandiriHolder}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        mandiriHolder: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    SWIFT Code Mandiri
                  </label>
                  <input
                    type="text"
                    value={formSettings.mandiriSwift}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        mandiriSwift: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 text-sm font-mono-tabular text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    No. Rekening Bank BNI
                  </label>
                  <input
                    type="text"
                    value={formSettings.bniAccount}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        bniAccount: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 text-sm font-mono-tabular text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Atas Nama (BNI)
                  </label>
                  <input
                    type="text"
                    value={formSettings.bniHolder}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        bniHolder: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    SWIFT Code BNI
                  </label>
                  <input
                    type="text"
                    value={formSettings.bniSwift}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        bniSwift: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 text-sm font-mono-tabular text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    No. Rekening Bank BRI
                  </label>
                  <input
                    type="text"
                    value={formSettings.briAccount}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        briAccount: e.target.value,
                      })
                    }
                    data-testid="admin-bri-account-input"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 text-sm font-mono-tabular text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Atas Nama (BRI)
                  </label>
                  <input
                    type="text"
                    value={formSettings.briHolder}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        briHolder: e.target.value,
                      })
                    }
                    data-testid="admin-bri-holder-input"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    SWIFT Code BRI
                  </label>
                  <input
                    type="text"
                    value={formSettings.briSwift}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        briSwift: e.target.value,
                      })
                    }
                    data-testid="admin-bri-swift-input"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 text-sm font-mono-tabular text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    URL Gambar QR Code PayPal Resmi
                  </label>
                  <input
                    type="url"
                    value={formSettings.paypalQrUrl}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        paypalQrUrl: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 text-sm font-mono-tabular text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#E5C87E] mb-1">
                    API Key Binderbyte (Opsional — Live API Kurir JNE/J&amp;T/SiCepat)
                  </label>
                  <input
                    type="text"
                    value={formSettings.binderbyteApiKey || ''}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        binderbyteApiKey: e.target.value.trim(),
                      })
                    }
                    placeholder="Tempel API Key gratis dari binderbyte.com (Opsional)"
                    data-testid="admin-binderbyte-key-input"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14131A] border border-[#D4AF37]/40 focus:border-[#E5C87E] text-sm font-mono-tabular text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl btn-luxury-gold text-zinc-950 font-brand text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
              >
                Simpan Pengaturan Kontak, Rekening &amp; API Kurir
              </button>
            </form>
          )}

          {/* TAB 3: DATABASE EMAIL KLIEN & DAFTAR KODE AKTIF */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              {/* Sample Codes Box for Admin Testing */}
              <div className="p-5 rounded-2xl bg-[#0B0A0E] border border-[#D4AF37]/35 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <p className="font-brand text-xs uppercase tracking-[0.18em] text-[#E5C87E] font-semibold">
                    Sampel Simulasi Auto-Tracking &amp; Kurir Ekspedisi Terintegrasi:
                  </p>
                  <span className="text-[11px] text-emerald-400 font-mono-tabular">
                    ● Mode Otomatis Aktif (Tanpa Edit Tahap Manual)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenInvoicePreview('INV-SAMPLE');
                      onClose();
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-[#15141D] hover:bg-[#1E1C29] border border-[#D4AF37]/40 text-left text-xs font-mono-tabular text-[#F5E6B8] cursor-pointer transition-colors"
                  >
                    <span className="block text-[10px] text-zinc-400 uppercase">
                      Sampel Tagihan Privat
                    </span>
                    <span className="font-bold">INV-SAMPLE</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenTrackingPreview('JNE-INS-88019420019');
                      onClose();
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-[#15141D] hover:bg-[#1E1C29] border border-[#D4AF37]/40 text-left text-xs font-mono-tabular text-[#F5E6B8] cursor-pointer transition-colors"
                  >
                    <span className="block text-[10px] text-emerald-400 uppercase">
                      Auto-Track JNE Express
                    </span>
                    <span className="font-bold">JNE-INS-88019420019</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenTrackingPreview('SCP-0049182731');
                      onClose();
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-[#15141D] hover:bg-[#1E1C29] border border-[#D4AF37]/40 text-left text-xs font-mono-tabular text-[#F5E6B8] cursor-pointer transition-colors"
                  >
                    <span className="block text-[10px] text-emerald-400 uppercase">
                      Auto-Track SiCepat
                    </span>
                    <span className="font-bold">SCP-0049182731</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenTrackingPreview('COD-VRV-004192');
                      onClose();
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-[#15141D] hover:bg-[#1E1C29] border border-[#D4AF37]/40 text-left text-xs font-mono-tabular text-[#F5E6B8] cursor-pointer transition-colors"
                  >
                    <span className="block text-[10px] text-[#E5C87E] uppercase">
                      Auto-Track COD Internal
                    </span>
                    <span className="font-bold">COD-VRV-004192</span>
                  </button>
                </div>
              </div>

              {/* Created Custom Orders Table */}
              <div className="p-5 rounded-2xl bg-[#0B0A0E] border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-serif-luxury text-xl font-semibold text-white">
                    Daftar Invoice &amp; Resi Otomatis yang Dibuat Admin ({customOrders.length})
                  </h3>
                  {onSyncCloud && (
                    <button
                      type="button"
                      onClick={async () => {
                        setIsSyncingCloud(true);
                        try {
                          await onSyncCloud();
                        } finally {
                          setIsSyncingCloud(false);
                        }
                      }}
                      data-testid="admin-sync-cloud-btn"
                      className="px-3.5 py-1.5 rounded-lg bg-[#161521] hover:bg-[#1F1D2E] border border-[#D4AF37]/45 text-[11px] font-semibold text-[#F5E6B8] cursor-pointer self-start sm:self-auto"
                    >
                      {isSyncingCloud
                        ? '⏳ Menyinkronkan Cloud...'
                        : '🔄 Sinkronkan Cloud Lintas Perangkat'}
                    </button>
                  )}
                </div>
                {customOrders.length === 0 ? (
                  <p className="text-xs text-zinc-400">
                    Belum ada invoice/resi baru yang dibuat pada sesi ini. Gunakan Tab 1
                    untuk menerbitkan resi sekali input (otomatis terlacak).
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 uppercase">
                          <th className="py-2.5 px-3">Invoice / Resi AWB</th>
                          <th className="py-2.5 px-3">Pembeli</th>
                          <th className="py-2.5 px-3">Parfum &amp; Nilai</th>
                          <th className="py-2.5 px-3">Kurir &amp; Status Otomatis</th>
                          <th className="py-2.5 px-3">Aksi &amp; Smart Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/70">
                        {customOrders.map((ord) => {
                          const autoStage = computeAutoShippingStage(ord);
                          const courierMeta = resolveCourierMetadata(
                            ord.shippingMethod,
                            ord.awbNumber
                          );
                          return (
                            <tr key={ord.invoiceId}>
                              <td className="py-3 px-3 font-mono-tabular">
                                <div className="font-bold text-[#F5E6B8]">
                                  {ord.invoiceId}
                                </div>
                                <div className="text-zinc-400">{ord.awbNumber}</div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="text-white font-medium">
                                  {ord.buyerName}
                                </div>
                                <div className="text-zinc-400">{ord.buyerCity}</div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="text-[#E5C87E]">
                                  {ord.house} — {ord.fragranceName}
                                </div>
                                <div className="font-mono-tabular text-emerald-400">
                                  {formatIDRCurrency(ord.dealPriceIDR)} ·{' '}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onUpdateCustomOrderStatus(
                                        ord.invoiceId,
                                        ord.status === 'PAID'
                                          ? 'PENDING_PAYMENT'
                                          : 'PAID'
                                      )
                                    }
                                    className="underline cursor-pointer"
                                  >
                                    {ord.status}
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-semibold text-[#F5E6B8]">
                                  {courierMeta.displayName}
                                </div>
                                <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono-tabular text-emerald-300">
                                  <span>● AUTO TAHAP {autoStage}/4</span>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyText(
                                        buildSmartShareUrl(ord, 'invoice'),
                                        `inv-${ord.invoiceId}`
                                      )
                                    }
                                    className="px-2.5 py-1 rounded bg-[#D4AF37]/20 text-[#F5E6B8] border border-[#D4AF37]/40 hover:bg-[#D4AF37]/30 cursor-pointer"
                                  >
                                    {copiedKey === `inv-${ord.invoiceId}`
                                      ? 'Tersalin!'
                                      : 'Copy Link Invoice'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyText(
                                        buildSmartShareUrl(ord, 'track'),
                                        `trk-${ord.invoiceId}`
                                      )
                                    }
                                    className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 hover:bg-zinc-700 cursor-pointer"
                                  >
                                    {copiedKey === `trk-${ord.invoiceId}`
                                      ? 'Tersalin!'
                                      : 'Copy Link Resi'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteCustomOrder(ord.invoiceId)}
                                    className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Visitor Emails Table */}
              <div className="p-5 rounded-2xl bg-[#0B0A0E] border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-serif-luxury text-xl font-semibold text-white">
                      Database Email Pengunjung Terdaftar ({leads.length}) — Sinkron ke{' '}
                      <span className="text-[#E5C87E]">{settings.conciergeEmail}</span>
                    </h3>
                    <p className="text-[11px] text-emerald-400/90 mt-0.5">
                      ✓ Terhubung ke FormSubmit AJAX (`vorvanlifestyle@gmail.com`) &amp; Cloud Sync Lintas Perangkat / Tab Samaran
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 uppercase">
                        <th className="py-2.5 px-3">ID Lead</th>
                        <th className="py-2.5 px-3">Email Klien</th>
                        <th className="py-2.5 px-3">Waktu Registrasi</th>
                        <th className="py-2.5 px-3">Parfum yang Diminati</th>
                        <th className="py-2.5 px-3">Tujuan Sinkronisasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/70">
                      {leads.map((lead) => (
                        <tr key={lead.id}>
                          <td className="py-2.5 px-3 font-mono-tabular text-zinc-300">
                            {lead.id}
                          </td>
                          <td className="py-2.5 px-3 text-white font-medium">
                            {lead.email}
                          </td>
                          <td className="py-2.5 px-3 font-mono-tabular text-zinc-400">
                            {lead.registeredAt}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-300">
                            {lead.triggeredByFragrance || 'Katalog Umum VORVAN'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {settings.conciergeEmail}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONCIERGE GUIDE (PANDUAN 81 PARFUM — IKLIM INDONESIA) */}
          {activeTab === 'concierge' && (
            <div className="space-y-5" data-testid="admin-concierge-guide-panel">
              {/* Top Filter Bar: Moment/Weather Buttons, Gender Pills & Instant Search */}
              <div className="p-5 rounded-2xl bg-[#0B0A0E] border border-[#D4AF37]/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <span className="font-brand text-[10px] uppercase tracking-[0.2em] text-[#E5C87E] block">
                      CONTEKAN ADMIN SAAT DITANYA PEMBELI · 81 SKU RESMI VORVAN
                    </span>
                    <h3 className="font-serif-luxury text-xl sm:text-2xl font-semibold text-white">
                      Panduan Karakter Wangi, Momen Pakai &amp; Cuaca Indonesia
                    </h3>
                  </div>
                  <span className="text-xs font-mono-tabular text-[#F5E6B8] bg-[#16141F] border border-[#D4AF37]/35 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                    Menampilkan {filteredConciergeGuideItems.length} dari 81 Parfum
                  </span>
                </div>

                {/* 1. Filter Klik Cepat Berdasarkan Momen & Cuaca Indonesia */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Filter Klik Cepat Momen &amp; Cuaca Indonesia:
                  </label>
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="Filter Momen dan Cuaca Indonesia"
                  >
                    {CONCIERGE_MOMENT_BUTTONS.map((btn) => {
                      const isActive = guideMomentFilter === btn.key;
                      return (
                        <button
                          key={btn.key}
                          type="button"
                          onClick={() => setGuideMomentFilter(btn.key)}
                          data-testid={`concierge-moment-${btn.key.toLowerCase()}`}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                            isActive
                              ? 'btn-luxury-gold text-zinc-950 border-[#F5E6B8] font-bold shadow-md'
                              : 'bg-[#14131A] text-zinc-200 border-zinc-700 hover:border-[#D4AF37]/60'
                          }`}
                        >
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Gender Filter + Search Input */}
                <div className="flex flex-col md:flex-row gap-3 pt-1">
                  <div
                    className="flex items-center gap-1.5 flex-wrap"
                    role="group"
                    aria-label="Filter Gender Concierge"
                  >
                    {(['All', 'Men', 'Women', 'Unisex'] as ConciergeGenderFilterKey[]).map(
                      (gKey) => {
                        const isGenderActive = guideGenderFilter === gKey;
                        return (
                          <button
                            key={gKey}
                            type="button"
                            onClick={() => setGuideGenderFilter(gKey)}
                            data-testid={`concierge-gender-${gKey.toLowerCase()}`}
                            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                              isGenderActive
                                ? 'bg-[#E5C87E] text-zinc-950 border-[#F5E6B8] font-bold'
                                : 'bg-[#14131A] text-zinc-300 border-zinc-700 hover:border-[#D4AF37]/50'
                            }`}
                          >
                            {gKey}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <div className="flex-1 relative">
                    <input
                      id="concierge-guide-search"
                      type="text"
                      value={guideQuery}
                      onChange={(e) => setGuideQuery(e.target.value)}
                      placeholder='Cari parfum, brand, atau wangi ("vanilla", "jeruk", "kopi", "teh", "manis", "segar", "oud")...'
                      data-testid="concierge-guide-search-input"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#14131A] border border-zinc-700 focus:border-[#E5C87E] text-xs sm:text-sm text-white placeholder:text-zinc-500 outline-none"
                    />
                    {guideQuery && (
                      <button
                        type="button"
                        onClick={() => setGuideQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Kartu Panduan Iklim Indonesia untuk Seluruh 81 Parfum */}
              {filteredConciergeGuideItems.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0B0A0E] border border-zinc-800 text-center space-y-3">
                  <p className="text-sm text-zinc-300 font-medium">
                    Tidak ditemukan parfum yang cocok dengan filter / kata kunci tersebut.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setGuideQuery('');
                      setGuideMomentFilter('ALL');
                      setGuideGenderFilter('All');
                    }}
                    className="px-4 py-2 rounded-xl btn-luxury-gold text-zinc-950 text-xs font-bold cursor-pointer"
                  >
                    Tampilkan Kembali Semua 81 Parfum
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredConciergeGuideItems.map((item) => {
                    const copyKey = `wa-rec-${item.no}`;
                    const isCopied = copiedKey === copyKey;
                    const climateBadgeStyle =
                      item.climateCategory === 'HOT_SAFE'
                        ? 'bg-emerald-950/75 border-emerald-500/50 text-emerald-300'
                        : item.climateCategory === 'NIGHT_AC'
                        ? 'bg-amber-950/70 border-[#D4AF37]/60 text-[#F5E6B8]'
                        : 'bg-purple-950/75 border-purple-400/55 text-purple-200';

                    return (
                      <div
                        key={item.no}
                        data-testid={`concierge-card-${item.no}`}
                        className="p-4 sm:p-5 rounded-2xl bg-[#0B0A0E] border border-[#D4AF37]/35 hover:border-[#E5C87E]/75 transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          {/* Top Row: Brand, Variant, Gender, Size & Pricing */}
                          <div className="flex items-start justify-between gap-3 border-b border-zinc-800/90 pb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-mono-tabular px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-400">
                                  #{item.no}
                                </span>
                                <span className="font-brand text-[11px] uppercase tracking-wider text-[#E5C87E] font-bold">
                                  {item.brand}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#181622] border border-[#D4AF37]/30 text-zinc-200 font-medium">
                                  {item.gender} · {item.size}
                                </span>
                              </div>
                              <h4 className="mt-1 font-serif-luxury text-lg sm:text-xl font-semibold text-white leading-snug">
                                {item.name}
                              </h4>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-[11px] font-mono-tabular text-zinc-400 line-through">
                                Rp {item.retail.toLocaleString('id-ID')}
                              </div>
                              <div className="text-sm sm:text-base font-mono-tabular font-bold text-[#F5E6B8]">
                                Rp {item.price.toLocaleString('id-ID')}
                              </div>
                              <span className="inline-block text-[10px] font-mono-tabular font-semibold px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                                Hemat {item.disc}%
                              </span>
                            </div>
                          </div>

                          {/* Simple Indonesian Notes */}
                          <div className="p-3 rounded-xl bg-[#13121A] border border-zinc-800/90 space-y-1">
                            <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                              Profil Wangi Bahasa Simpel (Notes):
                            </span>
                            <p className="text-xs sm:text-sm text-zinc-100 leading-relaxed font-medium">
                              “{item.simpleNotes}”
                            </p>
                          </div>

                          {/* Recommended Moments Badges */}
                          <div className="space-y-1.5">
                            <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                              Rekomendasi Momen Pakai:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {item.momentBadges.map((badge) => (
                                <span
                                  key={badge}
                                  className="px-2.5 py-1 rounded-lg bg-[#171522] border border-[#D4AF37]/35 text-[11px] text-[#F5E6B8] font-medium"
                                >
                                  [{badge}]
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Indonesian Climate Advice Banner */}
                          <div
                            className={`p-2.5 rounded-xl border text-[11px] sm:text-xs font-bold leading-snug ${climateBadgeStyle}`}
                          >
                            {item.climateAdvice}
                          </div>
                        </div>

                        {/* 3. Tombol 1-Klik Salin Kalimat Rekomendasi WA */}
                        <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyText(
                                buildConciergeRecommendationWaText(item),
                                copyKey
                              )
                            }
                            data-testid={`copy-wa-rec-${item.no}`}
                            className="flex-1 py-2.5 px-3.5 rounded-xl btn-luxury-gold text-zinc-950 font-brand text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-4 h-4 shrink-0" />
                                <span>Teks Rekomendasi WA Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <span>📋 Salin Rekomendasi WA</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleSelectPerfumeByIdOrIndex(item.no - 1);
                              setActiveTab('create');
                            }}
                            title="Masukkan parfum ini ke Formulir Invoice Tab 1"
                            className="py-2.5 px-3 rounded-xl bg-[#15141D] hover:bg-[#1E1C29] border border-[#D4AF37]/40 text-[11px] text-[#F5E6B8] font-semibold cursor-pointer shrink-0"
                          >
                            Buat Invoice →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

