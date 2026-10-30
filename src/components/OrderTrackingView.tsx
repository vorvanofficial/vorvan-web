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
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialQuery = '',
  smartOrder,
  customOrders,
  settings,
  onBackToCatalog,
  onOpenInvoice,
}) => {
  const [searchInput, setSearchInput] = useState<string>(initialQuery || '');
  const [submittedQuery, setSubmittedQuery] = useState<string>(
    initialQuery?.trim() || (smartOrder ? smartOrder.awbNumber : '')
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

  // Periodic tick so automatic time-based tracking stages advance smoothly without page reload
  useEffect(() => {
    const timer = window.setInterval(() => {
      setAutoTick((t) => t + 1);
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (initialQuery?.trim()) {
      setSearchInput(initialQuery.trim());
      setSubmittedQuery(initialQuery.trim());
      setNotFoundError(null);
    } else if (smartOrder) {
      setSearchInput(smartOrder.awbNumber || smartOrder.invoiceId);
      setSubmittedQuery(smartOrder.awbNumber || smartOrder.invoiceId);
      setNotFoundError(null);
    } else {
      setSearchInput('');
      setSubmittedQuery('');
      setNotFoundError(null);
    }
  }, [initialQuery, smartOrder]);

  const activeRecord: TrackingRecord | null =
    submittedQuery || smartOrder
      ? lookupTrackingOrder(submittedQuery, customOrders, smartOrder)
      : null;

  const courierMeta = activeRecord
    ? resolveCourierMetadata(activeRecord.courierService, activeRecord.awbNumber)
    : null;

  // Automatic Live API Fetch to Binderbyte when API Key + Courier + AWB are available
  useEffect(() => {
    let cancelled = false;
    if (
      !activeRecord ||
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = searchInput.trim().toUpperCase();
    if (!cleaned) {
      setNotFoundError(
        'Mohon masukkan Nomor Resi Pengiriman atau Kode Private Invoice Anda.'
      );
      return;
    }
    const found = lookupTrackingOrder(cleaned, customOrders, smartOrder);
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
            Anteraja / COD Internal) atau Kode Private Invoice Anda untuk
            memantau pergerakan paket secara otomatis dan terintegrasi langsung
            dengan kurir ekspedisi.
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
                <span className="font-mono-tabular font-bold text-[#F5E6B8] px-3 py-1 rounded-lg bg-[#0B0A0E] border border-[#D4AF37]/40">
                  RESI ASLI ({courierMeta?.displayName || activeRecord.courierService}):{' '}
                  {activeRecord.awbNumber}
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
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs font-bold uppercase tracking-[0.16em]">
                <Truck className="w-4 h-4 shrink-0" />
                <span>
                  {liveCourierData?.summary?.status
                    ? `LIVE SERVER ${courierMeta?.displayName.toUpperCase()} — ${liveCourierData.summary.status}`
                    : activeRecord.statusLabel}
                </span>
              </span>
              <span className="text-xs text-zinc-400">
                Status Integrasi: {activeRecord.estimatedArrival}
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
                Jalur Pengiriman &amp; Nomor Resi Asli
              </span>
              <p className="text-[#F5E6B8] font-semibold text-sm">
                {courierMeta?.displayName || activeRecord.courierService}
              </p>
              <p className="font-mono-tabular text-zinc-200">
                No. Resi: <strong>{activeRecord.awbNumber}</strong>
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

          {/* LIVE COURIER SATELLITE LINK PANEL */}
          {courierMeta && (
            <div className="px-6 sm:px-8 pt-6 sm:pt-8">
              <div
                className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#14110C] via-[#1C170F] to-[#14110C] border border-[#D4AF37]/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg"
                data-testid="live-courier-satellite-panel"
              >
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 text-[11px] font-brand uppercase tracking-[0.2em] text-[#E5C87E] font-bold">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                    <span>LIVE COURIER SATELLITE LINK · {courierMeta.displayName}</span>
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

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyAwb(activeRecord.awbNumber)}
                    className="px-4 py-3 rounded-xl bg-[#0B0A0E] hover:bg-[#171520] border border-[#D4AF37]/45 text-xs font-mono-tabular text-[#F5E6B8] flex items-center justify-center gap-2 cursor-pointer transition-colors"
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
                    className="px-5 py-3 rounded-xl btn-luxury-gold text-zinc-950 font-brand text-[11px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    data-testid="open-courier-satellite-link"
                  >
                    <span>{courierMeta.portalLabel}</span>
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

          {/* MANDATORY UNBOXING VIDEO WARNING BOX */}
          <div className="px-6 sm:px-8 pt-6 sm:pt-8">
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
              {activeRecord.milestones.map((m, idx) => (
                <div key={idx} className="relative">
                  <span
                    className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      m.current
                        ? 'bg-[#F5E6B8] border-[#D4AF37] ring-4 ring-[#D4AF37]/25'
                        : m.completed
                        ? 'bg-emerald-400 border-emerald-950'
                        : 'bg-zinc-900 border-zinc-600'
                    }`}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4
                      className={`text-sm sm:text-base font-semibold ${
                        m.completed ? 'text-white' : 'text-zinc-500'
                      }`}
                    >
                      {m.title}
                    </h4>
                    <span className="font-mono-tabular text-xs text-[#E5C87E]">
                      {m.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-[#D8BE82] mt-0.5">{m.location}</p>
                  <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                    {m.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5 text-[#E5C87E]">
                <PackageCheck className="w-4 h-4" />
                <span>Terverifikasi Sistem Logistik Otomatis VORVAN</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Original Parallel Import</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
