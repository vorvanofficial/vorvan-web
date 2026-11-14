import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  MapPin,
  PackageCheck,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
  Video,
} from 'lucide-react';
import {
  CustomAdminOrder,
  TrackingRecord,
  VorvanSiteSettings,
} from '../types/fragrance';
import {
  buildBinderbyteTrackUrl,
  loadVorvanSettings,
  lookupTrackingOrder,
  resolveCourierMetadata,
} from '../utils/businessRules';

interface BinderbyteHistoryItem {
  date: string;
  desc: string;
  location?: string;
}

interface BinderbyteLiveResponse {
  status: number;
  message: string;
  data?: {
    summary?: {
      awb?: string;
      courier?: string;
      service?: string;
      status?: string;
      date?: string;
      desc?: string;
    };
    detail?: {
      origin?: string;
      destination?: string;
      shipper?: string;
      receiver?: string;
    };
    history?: BinderbyteHistoryItem[];
  };
}

interface OrderTrackingViewProps {
  initialQuery?: string;
  smartOrder?: CustomAdminOrder | null;
  customOrders?: CustomAdminOrder[];
  settings?: VorvanSiteSettings;
  onBackToCatalog: () => void;
  onOpenInvoice: (invoiceId: string) => void;
  onRefreshFromCloud?: () =>
    | Promise<CustomAdminOrder[] | void>
    | CustomAdminOrder[]
    | void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialQuery = '',
  smartOrder,
  customOrders,
  settings,
  onBackToCatalog,
  onOpenInvoice,
  onRefreshFromCloud,
}) => {
  const [searchInput, setSearchInput] = useState<string>(
    initialQuery || smartOrder?.awbNumber || smartOrder?.invoiceId || ''
  );
  const [submittedQuery, setSubmittedQuery] = useState<string>(
    initialQuery?.trim() ||
      (smartOrder ? smartOrder.awbNumber || smartOrder.invoiceId : '')
  );
  const [notFoundError, setNotFoundError] = useState<string | null>(null);
  const [, setAutoTick] = useState<number>(0);
  const [copiedAwb, setCopiedAwb] = useState<boolean>(false);

  // Live Binderbyte Courier API State
  const [liveCourierData, setLiveCourierData] =
    useState<BinderbyteLiveResponse['data'] | null>(null);
  const [liveLoading, setLiveLoading] = useState<boolean>(false);

  const effectiveSettings = settings || loadVorvanSettings();
  const activeBinderbyteKey = (effectiveSettings.binderbyteApiKey || '').trim();

  // Pull latest Resi & Order Status from Cloud when opening CEK RESI and every 5 seconds
  useEffect(() => {
    void onRefreshFromCloud?.();
    const cloudTimer = window.setInterval(() => {
      void onRefreshFromCloud?.();
    }, 5000);
    return () => window.clearInterval(cloudTimer);
  }, [onRefreshFromCloud]);

  // Periodic tick so tracking view stays reactive to localStorage & cloud updates
  useEffect(() => {
    const timer = window.setInterval(() => {
      setAutoTick((t) => t + 1);
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  // Sync only when URL route query or smartOrder changes (never wipe active searchInput/submittedQuery on background customOrders polling)
  useEffect(() => {
    if (initialQuery?.trim()) {
      const clean = initialQuery.trim();
      setSearchInput(clean);
      const found = lookupTrackingOrder(clean, customOrders, smartOrder);
      if (found) {
        setSubmittedQuery(clean);
        setNotFoundError(null);
      } else {
        setSubmittedQuery('');
        setNotFoundError(
          `Data pengiriman untuk kode "${clean.toUpperCase()}" tidak ditemukan. Pastikan Nomor Resi atau Kode Invoice sesuai dengan yang dikirimkan oleh Concierge VORVAN.`
        );
      }
    } else if (smartOrder) {
      const code = (
        smartOrder.resi ||
        smartOrder.awbNumber ||
        smartOrder.invoiceId ||
        ''
      ).trim();
      setSearchInput(code);
      setSubmittedQuery(code);
      setNotFoundError(null);
    } else {
      setSearchInput('');
      setSubmittedQuery('');
      setNotFoundError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, smartOrder]);

  // If a searched/initial order arrives from background Cloud fetch while showing notFoundError, automatically resolve it
  useEffect(() => {
    if (!notFoundError) return;
    const candidate = (searchInput || initialQuery || '').trim().toUpperCase();
    if (!candidate) return;
    const found = lookupTrackingOrder(candidate, customOrders, smartOrder);
    if (found) {
      setSubmittedQuery(candidate);
      setNotFoundError(null);
    }
  }, [customOrders, smartOrder, initialQuery, searchInput, notFoundError]);

  const activeRecord: TrackingRecord | null =
    (submittedQuery || smartOrder) && !notFoundError
      ? lookupTrackingOrder(submittedQuery, customOrders, smartOrder)
      : null;

  const courierMeta = activeRecord
    ? resolveCourierMetadata(activeRecord.courierService, activeRecord.awbNumber)
    : null;

  const resolvedCondition = activeRecord
    ? activeRecord.orderCondition ||
      (activeRecord.isDelivered ||
      activeRecord.milestones[3]?.completed
        ? 'D_DELIVERED'
        : activeRecord.isCodFaceToFace || !activeRecord.isAwbPending
        ? 'C_IN_TRANSIT'
        : activeRecord.isPaid
        ? 'B_PAID_PACKING'
        : 'A_UNPAID')
    : null;

  const dynamicCourierName = activeRecord
    ? courierMeta?.displayName || activeRecord.courierService
    : 'JNE';

  const topBadgeText = !activeRecord
    ? ''
    : resolvedCondition === 'A_UNPAID'
    ? activeRecord.isCodFaceToFace
      ? 'STATUS: MENUNGGU KONFIRMASI JADWAL COD'
      : 'STATUS: MENUNGGU PEMBAYARAN'
    : resolvedCondition === 'B_PAID_PACKING'
    ? 'STATUS: PEMBAYARAN DITERIMA · SEDANG DIKEMAS'
    : resolvedCondition === 'D_DELIVERED'
    ? activeRecord.isCodFaceToFace
      ? 'VIP HAND-DELIVERY (COD) · DELIVERED'
      : `RESI ASLI (${dynamicCourierName}): ${activeRecord.awbNumber} · DELIVERED`
    : activeRecord.isCodFaceToFace
    ? 'METODE PENYERAHAN: VIP HAND-DELIVERY (COD)'
    : `RESI ASLI (${dynamicCourierName}): ${activeRecord.awbNumber}`;

  const mainStatusBoxTitle = !activeRecord
    ? ''
    : resolvedCondition === 'A_UNPAID'
    ? activeRecord.isCodFaceToFace
      ? '⏳ Menunggu Konfirmasi Persetujuan S&K & Jadwal COD pada Halaman Invoice'
      : '⏳ Silakan Selesaikan Pembayaran & Unggah Bukti Transfer pada Halaman Invoice'
    : resolvedCondition === 'B_PAID_PACKING'
    ? '📦 Pembayaran Terverifikasi — Pesanan Sedang Dikemas di Vault & Menunggu Nomor Resi Ekspedisi'
    : resolvedCondition === 'D_DELIVERED'
    ? '✅ PAKET TELAH DITERIMA OLEH PEMBELI — SELESAI'
    : activeRecord.isCodFaceToFace
    ? `🚚 Dalam Pengantaran Kurir VIP COD menuju ${activeRecord.destination}`
    : `🚚 Paket Sedang Dalam Perjalanan Menuju ${activeRecord.destination} (Resi: ${activeRecord.awbNumber})`;

  // Automatic Live API Fetch to Binderbyte ONLY when API Key + Expedition Courier + Valid AWB are available
  useEffect(() => {
    let cancelled = false;
    if (
      !activeRecord ||
      activeRecord.isCodFaceToFace ||
      activeRecord.isAwbPending ||
      !courierMeta ||
      !courierMeta.binderbyteCode ||
      !activeBinderbyteKey
    ) {
      setLiveCourierData(null);
      setLiveLoading(false);
      return;
    }

    const endpoint = buildBinderbyteTrackUrl(
      activeBinderbyteKey,
      courierMeta.binderbyteCode,
      activeRecord.awbNumber
    );

    setLiveLoading(true);
    fetch(endpoint)
      .then((res) => res.json())
      .then((json: BinderbyteLiveResponse) => {
        if (cancelled) return;
        if (json && json.status === 200 && json.data?.history?.length) {
          setLiveCourierData(json.data);
        } else {
          setLiveCourierData(null);
        }
      })
      .catch(() => {
        if (!cancelled) setLiveCourierData(null);
      })
      .finally(() => {
        if (!cancelled) setLiveLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    activeRecord?.awbNumber,
    activeRecord?.courierService,
    activeRecord?.isCodFaceToFace,
    activeRecord?.isAwbPending,
    activeBinderbyteKey,
    courierMeta?.binderbyteCode,
  ]);

  const handleCopyAwb = (awb: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(awb).catch(() => {});
    }
    setCopiedAwb(true);
    window.setTimeout(() => setCopiedAwb(false), 2600);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = searchInput.trim().toUpperCase();
    if (!cleaned) {
      setNotFoundError(
        'Mohon masukkan Nomor Resi Pengiriman atau Kode Private Invoice Anda.'
      );
      return;
    }
    let latestOrders = customOrders;
    try {
      const refreshed = await onRefreshFromCloud?.();
      if (Array.isArray(refreshed) && refreshed.length > 0) {
        latestOrders = refreshed;
      }
    } catch {
      // Fallback to existing orders
    }
    const found = lookupTrackingOrder(cleaned, latestOrders, smartOrder);
    if (!found) {
      setSubmittedQuery('');
      setNotFoundError(
        `Data pengiriman untuk kode "${cleaned}" tidak ditemukan. Pastikan Nomor Resi atau Kode Invoice sesuai dengan yang dikirimkan oleh Concierge VORVAN.`
      );
      return;
    }
    setNotFoundError(null);
    setSubmittedQuery(cleaned);
  };

  return (
    <section
      className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
      aria-labelledby="order-tracking-heading"
    >
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#D4AF37]/25">
        <button
          type="button"
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-[#F5E6B8] transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog Utama</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14131B] border border-[#D4AF37]/35 text-[11px] font-brand tracking-[0.18em] uppercase text-[#E5C87E]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#E5C87E]" />
          <span>VORVAN VAULT LOGISTICS &amp; DISPATCH</span>
        </div>
      </div>

      {/* CLEAN INITIAL SEARCH BOX */}
      <div className="mt-8 bg-gradient-to-b from-[#16151F] via-[#111017] to-[#0C0B10] border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-10 space-y-6 shadow-[0_18px_48px_-15px_rgba(0,0,0,0.85)]">
        <div className="max-w-2xl space-y-2">
          <span className="font-brand text-xs uppercase tracking-[0.24em] text-[#E5C87E] block">
            VORVAN AUTOMATED COURIER &amp; SATELLITE TRACKING
          </span>
          <h1
            id="order-tracking-heading"
            className="font-serif-luxury text-3xl sm:text-4xl font-semibold text-white"
          >
            Lacak Status Pengiriman Pesanan Anda
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Masukkan Nomor Resi Asli (JNE / J&amp;T Express / SiCepat / Paxel /
            Pos Indonesia / Anteraja) atau Kode Private Invoice Anda untuk
            memantau status pengemasan dan pergerakan paket secara real-time.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (notFoundError) setNotFoundError(null);
              }}
              placeholder="Ketik Nomor Resi atau Kode Invoice Anda..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/40 focus:border-[#F5E6B8] text-sm font-mono-tabular uppercase text-white placeholder:text-zinc-600 outline-none"
              aria-label="Nomor Resi atau Invoice"
              data-testid="tracking-search-input"
            />
          </div>
          <button
            type="submit"
            className="py-3.5 px-7 rounded-xl btn-luxury-gold text-zinc-950 font-brand text-xs font-bold uppercase tracking-[0.18em] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            data-testid="tracking-search-btn"
          >
            LACAK STATUS RESI
          </button>
        </form>

        {notFoundError && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/70 flex items-center gap-3 text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{notFoundError}</span>
          </div>
        )}
      </div>

      {/* CLEAN LOCKED PLACEHOLDER vs UNLOCKED TRACKING DETAILS */}
      {!activeRecord ? (
        <div
          className="mt-8 p-10 sm:p-14 rounded-2xl bg-[#0E0D14]/90 border border-[#D4AF37]/25 text-center space-y-4"
          data-testid="tracking-locked-placeholder"
        >
          <div className="w-14 h-14 rounded-full bg-[#171521] border border-[#D4AF37]/40 flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6 text-[#E5C87E]" />
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-white">
            Menunggu Input Nomor Resi / Kode Invoice
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Demi privasi pengiriman klien VORVAN, rincian penerima dan alamat
            tujuan hanya ditampilkan setelah Anda memasukkan Nomor Resi atau Kode
            Invoice pada kolom di atas dan menekan tombol{' '}
            <strong className="text-[#F5E6B8]">LACAK STATUS RESI</strong>.
          </p>
        </div>
      ) : (
        <div
          className="mt-8 bg-[#111115] border border-[#D4AF37]/40 rounded-2xl overflow-hidden shadow-2xl animate-fade-up"
          data-testid="tracking-result-card"
        >
          {/* Header Summary */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-[#171621] to-[#111016] border-b border-[#D4AF37]/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <span
                  className={`font-mono-tabular font-bold px-3 py-1 rounded-lg border ${
                    resolvedCondition === 'A_UNPAID'
                      ? 'bg-rose-950/70 border-amber-500/60 text-amber-200'
                      : resolvedCondition === 'B_PAID_PACKING'
                      ? 'bg-[#1D180C] border-[#D4AF37]/75 text-[#F5E6B8]'
                      : resolvedCondition === 'D_DELIVERED'
                      ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300'
                      : 'bg-[#0B0A0E] border-[#D4AF37]/45 text-[#F5E6B8]'
                  }`}
                  data-testid="tracking-top-badge"
                >
                  {topBadgeText}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenInvoice(activeRecord.invoiceId)}
                  className="font-mono-tabular text-[#E5C87E] hover:text-white underline cursor-pointer"
                >
                  Invoice: {activeRecord.invoiceId}
                </button>
              </div>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-white">
                {activeRecord.fragranceSummary}
              </h2>
              <p className="text-xs text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E5C87E] shrink-0" />
                <span>
                  Nama Pembeli:{' '}
                  <strong className="text-white">
                    {activeRecord.recipientName}
                  </strong>{' '}
                  — Tujuan:{' '}
                  <strong className="text-[#F5E6B8]">
                    {activeRecord.destination}
                  </strong>
                </span>
              </p>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-1.5">
              <span
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-[0.06em] ${
                  resolvedCondition === 'A_UNPAID'
                    ? 'bg-rose-950/75 border border-amber-500/65 text-amber-300'
                    : resolvedCondition === 'B_PAID_PACKING'
                    ? 'bg-[#211B0D] border border-[#D4AF37]/75 text-[#F5E6B8]'
                    : resolvedCondition === 'D_DELIVERED'
                    ? 'bg-emerald-950/80 border border-emerald-500/75 text-emerald-300 uppercase tracking-[0.12em]'
                    : 'bg-emerald-950/60 border border-[#D4AF37]/70 text-[#F5E6B8]'
                }`}
                data-testid="tracking-status-badge"
              >
                <Truck className="w-4 h-4 shrink-0" />
                <span>
                  {!activeRecord.isCodFaceToFace &&
                  !activeRecord.isAwbPending &&
                  liveCourierData?.summary?.status
                    ? `LIVE SERVER ${dynamicCourierName.toUpperCase()} — ${liveCourierData.summary.status}`
                    : mainStatusBoxTitle}
                </span>
              </span>
            </div>
          </div>

          {/* Real Order Information Cards */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0E0D14] border-b border-zinc-800 text-xs">
            <div className="p-4 rounded-xl bg-[#14131B] border border-[#D4AF37]/30 space-y-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#D8BE82] block">
                Penerima &amp; Kota Tujuan
              </span>
              <p className="text-white font-semibold text-sm">
                {activeRecord.recipientName}
              </p>
              <p className="text-zinc-300">{activeRecord.destination}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#14131B] border border-[#D4AF37]/30 space-y-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#D8BE82] block">
                Jalur Pengiriman &amp; Nomor Resi
              </span>
              <p className="text-[#F5E6B8] font-semibold text-sm">
                {activeRecord.isCodFaceToFace
                  ? 'COD / Serah Terima Tatap Muka Langsung (Tanpa Resi Ekspedisi)'
                  : dynamicCourierName}
              </p>
              <p className="font-mono-tabular text-zinc-200">
                {activeRecord.isCodFaceToFace ? (
                  <strong className="text-[#E5C87E]">
                    VIP Hand-Delivery · Area {activeRecord.destination}
                  </strong>
                ) : resolvedCondition === 'A_UNPAID' ? (
                  <strong className="text-amber-300">
                    ⏳ Menunggu Penyelesaian Pembayaran
                  </strong>
                ) : resolvedCondition === 'B_PAID_PACKING' ? (
                  <strong className="text-[#F5E6B8]">
                    📦 Sedang Dikemas di Vault (Menunggu Input Resi Ekspedisi)
                  </strong>
                ) : (
                  <>
                    No. Resi: <strong>{activeRecord.awbNumber}</strong>
                  </>
                )}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#14131B] border border-[#D4AF37]/30 space-y-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#D8BE82] block">
                Parfum yang Dipesan
              </span>
              <p className="text-white font-semibold text-sm">
                {activeRecord.fragranceSummary}
              </p>
              <p className="font-mono-tabular text-[#E5C87E]">
                Segel Vault: {activeRecord.vaultSealCode}
              </p>
            </div>
          </div>

          {/* 4 DYNAMIC CONDITION STATUS BOXES (A, B, C, D) */}
          <div className="px-6 sm:px-8 pt-6 sm:pt-8">
            {resolvedCondition === 'A_UNPAID' && (
              <div
                className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-rose-950/60 via-amber-950/50 to-rose-950/60 border border-amber-500/65 space-y-3 shadow-lg"
                data-testid="tracking-main-status-box"
              >
                <div className="text-xs sm:text-sm font-bold text-amber-200">
                  {activeRecord.isCodFaceToFace
                    ? '⏳ Menunggu Konfirmasi Persetujuan S&K & Jadwal COD pada Halaman Invoice'
                    : '⏳ Silakan Selesaikan Pembayaran & Unggah Bukti Transfer pada Halaman Invoice'}
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  {activeRecord.isCodFaceToFace ? (
                    <>
                      Pesanan VIP Hand-Delivery (COD) Anda untuk area{' '}
                      <strong className="text-[#F5E6B8]">
                        {activeRecord.destination}
                      </strong>{' '}
                      telah tercatat di Vault VORVAN. Silakan buka Halaman Invoice untuk mencentang persetujuan Klausul S&amp;K dan mengonfirmasi jadwal pertemuan tatap muka bersama Kurir VIP VORVAN.
                    </>
                  ) : (
                    <>
                      Pesanan Anda telah tercatat di Vault VORVAN dengan kurir{' '}
                      <strong className="text-[#F5E6B8]">{dynamicCourierName}</strong>.
                      Silakan selesaikan pembayaran dan unggah foto/screenshot bukti transfer pada halaman Invoice agar unit segera dikemas dan diserahkan ke pihak ekspedisi.
                    </>
                  )}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenInvoice(activeRecord.invoiceId)}
                    className="px-4 py-2.5 rounded-xl btn-luxury-gold text-zinc-950 font-brand text-[11px] font-bold uppercase tracking-[0.14em] inline-flex items-center gap-2 cursor-pointer shadow-md"
                    data-testid="tracking-open-invoice-btn"
                  >
                    <span>
                      {activeRecord.isCodFaceToFace
                        ? '[ BUKA HALAMAN INVOICE UNTUK KONFIRMASI COD -> ]'
                        : '[ BUKA HALAMAN INVOICE UNTUK PEMBAYARAN -> ]'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {resolvedCondition === 'B_PAID_PACKING' && (
              <div
                className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#1F190B] via-[#29200E] to-[#1F190B] border border-[#D4AF37]/75 space-y-2 shadow-lg"
                data-testid="tracking-main-status-box"
              >
                <div className="text-xs sm:text-sm font-bold text-[#F5E6B8]">
                  📦 Pembayaran Terverifikasi — Pesanan Sedang Dikemas di Vault &amp; Menunggu Nomor Resi Ekspedisi
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  Bukti pembayaran Anda telah diterima oleh Concierge VORVAN. Saat ini unit sedang melalui inspeksi akhir, pengemasan Double-Wall Thermal Box, dan menunggu nomor resi asli{' '}
                  <strong className="text-[#F5E6B8]">{dynamicCourierName}</strong>.
                  Begitu Nomor Resi diinput oleh Admin, tahapan pengiriman akan otomatis berpindah ke Dalam Perjalanan menuju{' '}
                  <strong className="text-white">{activeRecord.destination}</strong>.
                </p>
              </div>
            )}

            {resolvedCondition === 'C_IN_TRANSIT' && (
              <div
                className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#141D15] via-[#1B2214] to-[#1A160B] border border-[#D4AF37]/75 space-y-2 shadow-lg"
                data-testid="tracking-main-status-box"
              >
                <div className="text-xs sm:text-sm font-bold text-[#F5E6B8]">
                  {activeRecord.isCodFaceToFace
                    ? `🚚 Dalam Pengantaran Kurir VIP COD menuju ${activeRecord.destination}`
                    : `🚚 Paket Sedang Dalam Perjalanan Menuju ${activeRecord.destination} (Resi: ${activeRecord.awbNumber})`}
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  {activeRecord.isCodFaceToFace ? (
                    <>
                      Pesanan ini dijadwalkan untuk penyerahan tatap muka langsung (Face-to-Face Hand-Delivery) bersama{' '}
                      <strong className="text-[#F5E6B8]">
                        {activeRecord.recipientName}
                      </strong>{' '}
                      di <strong className="text-white">{activeRecord.destination}</strong>. Unit sedang dalam pengantaran oleh Kurir VIP COD VORVAN menuju lokasi penerima.
                    </>
                  ) : (
                    <>
                      Paket Anda telah diserahkan ke ekspedisi{' '}
                      <strong className="text-[#F5E6B8]">{dynamicCourierName}</strong>{' '}
                      dengan Nomor Resi Asli{' '}
                      <strong className="font-mono-tabular text-emerald-300">
                        {activeRecord.awbNumber}
                      </strong>{' '}
                      dan sedang dalam perjalanan menuju{' '}
                      <strong className="text-white">{activeRecord.destination}</strong>.
                    </>
                  )}
                </p>
              </div>
            )}

            {resolvedCondition === 'D_DELIVERED' && (
              <div
                className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#0F2419] to-emerald-950/80 border-2 border-emerald-500/80 space-y-2 shadow-[0_0_28px_rgba(16,185,129,0.22)]"
                data-testid="tracking-main-status-box"
              >
                <div className="text-xs sm:text-sm font-bold text-emerald-300 uppercase tracking-wider">
                  ✅ PAKET TELAH DITERIMA OLEH PEMBELI — SELESAI
                </div>
                <p className="text-xs sm:text-sm text-zinc-100 leading-relaxed">
                  Paket untuk{' '}
                  <strong className="text-[#F5E6B8]">
                    {activeRecord.recipientName}
                  </strong>{' '}
                  di <strong className="text-white">{activeRecord.destination}</strong>{' '}
                  {activeRecord.isCodFaceToFace
                    ? 'telah diserahterimakan secara langsung melalui layanan VIP Hand-Delivery VORVAN.'
                    : `melalui ekspedisi ${dynamicCourierName} (Resi: ${activeRecord.awbNumber}) telah tiba dan diterima dengan baik.`}
                </p>
              </div>
            )}
          </div>

          {/* LIVE COURIER SATELLITE LINK PANEL (ONLY ACTIVE AFTER AWB IS INPUT FOR EXPEDITION ORDERS) */}
          {!activeRecord.isCodFaceToFace &&
            !activeRecord.isAwbPending &&
            courierMeta && (
              <div className="px-6 sm:px-8 pt-6 sm:pt-8">
                <div
                  className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#14110C] via-[#1C170F] to-[#14110C] border border-[#D4AF37]/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg"
                  data-testid="live-courier-satellite-panel"
                >
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 text-[11px] font-brand uppercase tracking-[0.2em] text-[#E5C87E] font-bold">
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                      <span>
                        LIVE COURIER SATELLITE LINK · {courierMeta.displayName}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                      Terhubung langsung dengan sistem pelacakan resmi{' '}
                      <strong className="text-[#F5E6B8]">
                        {courierMeta.displayName}
                      </strong>
                      . Klik tombol di samping untuk menyalin Nomor Resi Asli (
                      <span className="font-mono-tabular text-[#E5C87E] font-semibold">
                        {activeRecord.awbNumber}
                      </span>
                      ) secara otomatis dan membuka radar pelacakan real-time resmi.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                    <button
                      type="button"
                      onClick={() => handleCopyAwb(activeRecord.awbNumber)}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#0B0A0E] hover:bg-[#171520] border border-[#D4AF37]/45 text-xs font-mono-tabular text-[#F5E6B8] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      data-testid="copy-awb-satellite-btn"
                    >
                      {copiedAwb ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Resi Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#E5C87E] shrink-0" />
                          <span>Salin No. Resi</span>
                        </>
                      )}
                    </button>

                    <a
                      href={
                        activeRecord.courierOfficialUrl ||
                        courierMeta.officialTrackUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleCopyAwb(activeRecord.awbNumber)}
                      className="w-full sm:w-auto px-4 py-3.5 rounded-xl btn-luxury-gold text-zinc-950 font-brand text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] sm:tracking-[0.13em] leading-snug text-center flex items-center justify-center gap-2 cursor-pointer whitespace-normal break-words"
                      data-testid="open-courier-satellite-link"
                    >
                      <span className="leading-snug">
                        {courierMeta.portalLabel}
                      </span>
                      <ArrowUpRight className="w-4 h-4 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            )}

          {/* LIVE BINDERBYTE API REAL-TIME MANIFEST TABLE (IF API KEY IS CONFIGURED & DATA RETURNED) */}
          {liveLoading && (
            <div className="px-6 sm:px-8 pt-6">
              <div className="p-4 rounded-xl bg-[#14131B] border border-[#D4AF37]/30 flex items-center gap-3 text-xs text-[#E5C87E]">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>
                  Menghubungkan ke server real-time{' '}
                  {courierMeta?.displayName || activeRecord.courierService}...
                </span>
              </div>
            </div>
          )}

          {liveCourierData &&
            liveCourierData.history &&
            liveCourierData.history.length > 0 && (
              <div
                className="px-6 sm:px-8 pt-6 sm:pt-8 space-y-3"
                data-testid="live-binderbyte-history-table"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-xs uppercase tracking-[0.22em] text-emerald-400 font-semibold flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    <span>
                      Riwayat Perjalanan Paket Real-Time Server{' '}
                      {courierMeta?.displayName}
                    </span>
                  </h3>
                  {liveCourierData.summary?.service && (
                    <span className="text-xs font-mono-tabular text-[#E5C87E]">
                      Layanan: {liveCourierData.summary.service}
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#D4AF37]/35 bg-[#0B0A0E]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[#E5C87E] uppercase">
                        <th className="py-3 px-4">Tanggal &amp; Jam</th>
                        <th className="py-3 px-4">Posisi Gudang / Lokasi</th>
                        <th className="py-3 px-4">Keterangan Status Kurir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80">
                      {liveCourierData.history.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#14131B]/60">
                          <td className="py-3 px-4 font-mono-tabular text-[#F5E6B8] whitespace-nowrap">
                            {item.date}
                          </td>
                          <td className="py-3 px-4 text-zinc-300">
                            {item.location || courierMeta?.displayName || '-'}
                          </td>
                          <td className="py-3 px-4 text-white font-medium">
                            {item.desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {/* MANDATORY UNBOXING VIDEO WARNING BOX (EXPEDITION) OR COD INSPECTION PROTOCOL BOX */}
          <div className="px-6 sm:px-8 pt-6 sm:pt-8">
            {activeRecord.isCodFaceToFace ? (
              <div
                className="p-5 rounded-2xl bg-gradient-to-r from-[#161D15] via-[#1C180D] to-[#161D15] border-2 border-[#D4AF37] flex items-start gap-3.5 shadow-lg"
                data-testid="cod-inspection-protocol-box"
              >
                <ShieldCheck className="w-6 h-6 text-[#F5E6B8] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-brand text-xs uppercase tracking-[0.2em] text-[#F5E6B8] font-bold">
                    PROTOKOL RESMI VIP HAND-DELIVERY VORVAN
                  </p>
                  <p className="text-xs sm:text-sm text-amber-100 font-medium leading-relaxed">
                    🤝 PROTOKOL INSPEKSI SERAH TERIMA COD: Silakan periksa keutuhan segel kemasan dan fungsi semprotan (sprayer) secara langsung bersama Kurir VIP VORVAN saat serah terima di tempat.
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-[#1D160B] to-amber-950/40 border-2 border-[#D4AF37] flex items-start gap-3.5 shadow-lg"
                data-testid="unboxing-warning-box"
              >
                <Video className="w-6 h-6 text-[#F5E6B8] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-brand text-xs uppercase tracking-[0.2em] text-[#F5E6B8] font-bold">
                    PERINGATAN RESMI GARANSI VAULT VORVAN
                  </p>
                  <p className="text-xs sm:text-sm text-amber-100 font-medium leading-relaxed">
                    WAJIB VIDEO UNBOXING UTUH TANPA JEDA sejak paket masih
                    tersegel untuk klaim garansi botol pecah atau
                    semprotan/atomizer macet pabrik.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 4 SMART AUTO-TRACKING SHIPPING STAGES */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs uppercase tracking-[0.22em] text-[#E5C87E] font-semibold">
                Smart Auto-Tracking Tahapan Pengiriman &amp; Quality Control VORVAN
              </h3>
              <span className="text-[11px] font-mono-tabular text-emerald-400">
                ● Sinkronisasi Waktu Otomatis (Real-Time Progression)
              </span>
            </div>

            <div className="relative pl-6 border-l-2 border-[#D4AF37]/40 space-y-7">
              {activeRecord.milestones.map((m, idx) => {
                const isStage4Completed = idx === 3 && m.completed;
                return (
                  <div
                    key={idx}
                    className={`relative ${
                      isStage4Completed
                        ? 'p-4 rounded-xl bg-gradient-to-r from-[#1E190C] via-[#27200F] to-[#17130A] border border-[#D4AF37]/80 shadow-[0_0_24px_rgba(212,175,55,0.22)]'
                        : ''
                    }`}
                    data-testid={`tracking-milestone-${idx + 1}`}
                  >
                    <span
                      className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isStage4Completed || m.current
                          ? 'bg-[#F5E6B8] border-[#D4AF37] ring-4 ring-[#D4AF37]/30'
                          : m.completed
                          ? 'bg-[#D4AF37] border-[#F5E6B8]'
                          : 'bg-zinc-900 border-zinc-600'
                      }`}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4
                        className={`text-sm sm:text-base font-semibold ${
                          isStage4Completed
                            ? 'text-[#F5E6B8] font-bold'
                            : m.completed
                            ? 'text-white'
                            : 'text-zinc-500'
                        }`}
                      >
                        {m.title}
                      </h4>
                      <span className="font-mono-tabular text-xs text-[#E5C87E]">
                        {m.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-[#D8BE82] mt-0.5">{m.location}</p>
                    <p
                      className={`text-xs mt-1.5 leading-relaxed ${
                        isStage4Completed
                          ? 'text-[#F5E6B8] font-medium'
                          : 'text-zinc-300'
                      }`}
                    >
                      {m.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5 text-[#E5C87E]">
                <PackageCheck className="w-4 h-4" />
                <span>Terverifikasi Sistem Logistik Otomatis VORVAN</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Private Fragrance Curation · Direct International Archive</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
