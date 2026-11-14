import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { formatIDRCurrency } from '../utils/businessRules';
import {
  OfficialPdfInvoiceData,
  downloadOfficialPdfInvoice,
} from '../utils/officialInvoicePdf';

interface OfficialPdfInvoiceModalProps {
  data: OfficialPdfInvoiceData | null;
  isGenerating?: boolean;
  downloadSuccessMessage?: string | null;
  onClose: () => void;
}

export const OfficialPdfInvoiceModal: React.FC<
  OfficialPdfInvoiceModalProps
> = ({ data, isGenerating = false, downloadSuccessMessage, onClose }) => {
  const [reDownloading, setReDownloading] = useState(false);

  if (!data) return null;

  const handleManualDownload = async () => {
    setReDownloading(true);
    try {
      await downloadOfficialPdfInvoice(data);
    } finally {
      setReDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="official-pdf-preview-title"
      data-testid="official-pdf-preview-modal"
    >
      <div
        className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-[#121118] border border-[#D4AF37]/60 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#0B0A0E] border-b border-[#D4AF37]/35 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#1A1724] border border-[#D4AF37]/50 flex items-center justify-center text-[#E5C87E] shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3
                id="official-pdf-preview-title"
                className="font-brand text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#F5E6B8] truncate"
              >
                Preview Dokumen Invoice Resmi (Standar A4)
              </h3>
              <p className="font-mono-tabular text-[11px] text-zinc-400 truncate">
                {data.filename}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleManualDownload}
              disabled={isGenerating || reDownloading}
              data-testid="official-pdf-modal-download-btn"
              className="px-3.5 py-2 rounded-xl btn-luxury-gold text-zinc-950 font-brand text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] inline-flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {isGenerating || reDownloading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyiapkan PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF Lagi</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Preview PDF"
              data-testid="official-pdf-modal-close-btn"
              className="p-2 rounded-xl bg-[#181622] hover:bg-[#242133] border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Notification Strip */}
        {(isGenerating || downloadSuccessMessage) && (
          <div className="px-4 sm:px-6 py-2 bg-[#161E18] border-b border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 shrink-0">
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E5C87E]" />
                <span>
                  Sedang menyusun dokumen PDF A4{' '}
                  <strong className="font-mono-tabular">{data.filename}</strong>
                  ...
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{downloadSuccessMessage}</span>
              </>
            )}
          </div>
        )}

        {/* Scrollable A4 Luxury Paper Preview */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#1B1923]">
          <div
            className="mx-auto max-w-[794px] bg-[#FCF9F2] text-[#141218] border-2 border-[#C5A059] shadow-2xl p-4 sm:p-10 space-y-6 relative"
            style={{ outline: '1px solid #E4CFA0', outlineOffset: '-8px' }}
            data-testid="official-pdf-a4-sheet"
          >
            {/* 1. KOP SURAT RESMI */}
            <header className="pb-5 border-b-2 border-[#C5A059] flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div
                className="w-16 h-16 rounded-full bg-[#15131B] border-2 border-[#C5A059] flex items-center justify-center shrink-0 shadow-md"
                style={{ boxShadow: 'inset 0 0 0 3px #15131B, inset 0 0 0 4px #E6CA82' }}
              >
                <span className="font-serif-luxury text-3xl font-bold text-[#F2DBA0]">
                  V
                </span>
              </div>
              <div className="space-y-1 min-w-0">
                <h1 className="font-serif-luxury text-lg sm:text-2xl font-bold tracking-wide text-[#141218]">
                  VORVAN — LA MAISON DE HAUTE PARFUMERIE
                </h1>
                <p className="font-brand text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#8F6A23]">
                  PRIVATE FRAGRANCE CURATION · DIRECT INTERNATIONAL ARCHIVE
                </p>
                <p className="text-[11px] sm:text-xs text-[#4B4652]">
                  Official Portal: <strong>www.vorvanofficial.com</strong> |
                  Concierge: <strong>{data.conciergeEmail}</strong>
                </p>
              </div>
            </header>

            {/* 2. METADATA DOKUMEN & STATUS STEMPEL */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-brand text-[10px] font-bold uppercase tracking-[0.18em] text-[#8F6A23]">
                  DOKUMEN TAGIHAN RESMI (OFFICIAL INVOICE)
                </p>
                <p className="font-mono-tabular text-xl sm:text-2xl font-bold text-[#141218]">
                  #{data.invoiceId}
                </p>
                <p className="text-xs text-[#3F3B47]">
                  Tanggal Terbit: <strong>{data.createdAt}</strong>
                </p>
                <p className="text-xs text-[#3F3B47]">
                  Berlaku Hingga: {data.expiresAt}
                </p>
              </div>

              <div
                className={`px-4 py-3 rounded-xl border-2 text-center shadow-sm ${
                  data.isPaid
                    ? 'bg-[#ECFDF3] border-[#1E7E4C] text-[#135E38]'
                    : 'bg-[#FEF8EA] border-[#C5922C] text-[#7D5410]'
                }`}
                data-testid="official-pdf-status-stamp"
              >
                <p className="font-brand text-[9px] font-bold uppercase tracking-[0.2em]">
                  STATUS OTORISASI DOKUMEN
                </p>
                <p className="font-brand text-xs sm:text-sm font-bold tracking-wide mt-0.5">
                  {data.statusStampLabel}
                </p>
              </div>
            </div>

            {/* 3. DATA KLIEN & LOGISTIK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-[#DFC896] space-y-1.5 text-xs">
                <p className="font-brand text-[10px] font-bold uppercase tracking-[0.16em] text-[#8F6A23] border-b border-[#EFE3C6] pb-1.5">
                  DITERBITKAN UNTUK (PRIVATE BUYER)
                </p>
                <p className="font-serif-luxury text-base font-bold text-[#141218] pt-1">
                  {data.buyerName}
                </p>
                <p className="text-[#3F3B47]">
                  WhatsApp: <span className="font-mono-tabular font-semibold">{data.buyerPhone}</span>
                </p>
                <p className="text-[#3F3B47] break-all">
                  Email: <span className="font-mono-tabular">{data.buyerEmail}</span>
                </p>
                <div className="pt-1">
                  <p className="font-brand text-[9px] font-bold uppercase tracking-[0.14em] text-[#8F6A23]">
                    ALAMAT PENGIRIMAN:
                  </p>
                  <p className="text-[#1F1D26] font-medium leading-relaxed">
                    {data.buyerAddress}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#DFC896] space-y-1.5 text-xs">
                <p className="font-brand text-[10px] font-bold uppercase tracking-[0.16em] text-[#8F6A23] border-b border-[#EFE3C6] pb-1.5">
                  METODE PENGIRIMAN &amp; LOGISTIK RESMI
                </p>
                <p className="font-serif-luxury text-base font-bold text-[#141218] pt-1">
                  {data.courierDisplay}
                </p>
                <p className="text-[#4B4652] leading-relaxed">
                  {data.shippingZoneLabel}
                </p>
                <div className="pt-1">
                  <p className="font-brand text-[9px] font-bold uppercase tracking-[0.14em] text-[#8F6A23]">
                    NOMOR RESI PENGIRIMAN:
                  </p>
                  <p className="font-mono-tabular font-bold text-[#141218] text-sm">
                    {data.resiDisplay}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. TABEL RINCIAN VALUASI RESMI */}
            <div className="space-y-3">
              <p className="font-brand text-xs font-bold uppercase tracking-[0.14em] text-[#141218]">
                Rincian Valuasi &amp; Alokasi Koleksi Resmi
              </p>

              <div className="overflow-x-auto rounded-lg border border-[#DFC896]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#16141C] text-[#F2DBA0] font-brand text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-3">Deskripsi Koleksi</th>
                      <th className="py-3 px-2 text-center">Qty</th>
                      <th className="py-3 px-3 text-right">Ritel Butik</th>
                      <th className="py-3 px-3 text-right">Privilege Kurasi</th>
                      <th className="py-3 px-3 text-right">Harga Kurasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7D7B2] bg-white">
                    {data.items.map((item, idx) => (
                      <tr key={`${item.archiveCode}-${idx}`}>
                        <td className="py-3 px-3 align-top">
                          <p className="font-serif-luxury font-bold text-sm text-[#141218]">
                            {item.description}
                          </p>
                          <p className="text-[11px] text-[#6B6475] mt-0.5">
                            {item.concentration} · Kode Arsip: {item.archiveCode}
                          </p>
                        </td>
                        <td className="py-3 px-2 text-center font-mono-tabular font-bold align-top">
                          {item.qty}
                        </td>
                        <td className="py-3 px-3 text-right font-mono-tabular line-through text-[#736D7C] whitespace-nowrap align-top">
                          {formatIDRCurrency(item.retailLineIDR)}
                        </td>
                        <td className="py-3 px-3 text-right text-[#166534] whitespace-nowrap align-top">
                          <span className="font-bold block">
                            Diskon {item.discountPct}%
                          </span>
                          <span className="font-mono-tabular text-[11px]">
                            -{formatIDRCurrency(item.discountIDR)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono-tabular font-bold text-[#141218] whitespace-nowrap align-top">
                          {formatIDRCurrency(item.curatedLineIDR)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Ledger */}
              <div className="flex flex-col items-end space-y-1.5 text-xs pt-2">
                <div className="w-full sm:w-[430px] flex justify-between text-[#4B4652]">
                  <span>Harga Ritel Butik Resmi (Pembanding)</span>
                  <span className="font-mono-tabular line-through text-[#6B6475]">
                    {formatIDRCurrency(data.retailTotalIDR)}
                  </span>
                </div>
                <div className="w-full sm:w-[430px] flex justify-between font-bold text-[#8F6A23]">
                  <span>
                    Privilege Kurasi VORVAN (Diskon {data.curationDiscountPct}%)
                  </span>
                  <span className="font-mono-tabular text-[#166534]">
                    - {formatIDRCurrency(data.curationDiscountIDR)}
                  </span>
                </div>
                <div className="w-full sm:w-[430px] flex justify-between font-semibold text-[#141218]">
                  <span>Subtotal Nilai Koleksi Terkurasi</span>
                  <span className="font-mono-tabular">
                    {formatIDRCurrency(data.itemsSubtotalIDR)}
                  </span>
                </div>
                {data.extraDiscountIDR > 0 && (
                  <div className="w-full sm:w-[430px] flex justify-between font-bold text-[#8F6A23]">
                    <span>Voucher Tambahan / Ekstra Privilese VIP</span>
                    <span className="font-mono-tabular text-[#166534]">
                      - {formatIDRCurrency(data.extraDiscountIDR)}
                    </span>
                  </div>
                )}
                <div className="w-full sm:w-[430px] flex justify-between text-[#4B4652]">
                  <span>Ongkos Kirim Berasuransi &amp; Packaging Protektif</span>
                  <span className="font-mono-tabular font-semibold text-[#166534]">
                    {data.shippingInsuranceIDR === 0
                      ? 'COMPLIMENTARY (Rp 0)'
                      : formatIDRCurrency(data.shippingInsuranceIDR)}
                  </span>
                </div>

                <div className="w-full sm:w-[430px] mt-2 px-4 py-3 rounded-xl bg-[#15131B] border-2 border-[#C5A059] flex items-center justify-between text-white">
                  <span className="font-brand text-xs font-bold uppercase tracking-[0.14em] text-[#F2DBA0]">
                    TOTAL TAGIHAN RESMI
                  </span>
                  <span className="font-mono-tabular text-base sm:text-lg font-extrabold text-white">
                    {formatIDRCurrency(data.grandTotalIDR)}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. FOOTER LEGAL & STEMPEL KURASI DIGITAL */}
            <footer className="pt-5 border-t-2 border-[#C5A059] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="space-y-2 text-[11px] text-[#332F3B] leading-relaxed flex-1">
                <p className="font-brand text-[10px] font-bold uppercase tracking-[0.16em] text-[#8F6A23]">
                  CATATAN LEGAL, OTENTISITAS KURASI &amp; GARANSI LAYANAN VORVAN
                </p>
                <p
                  className={`font-semibold ${
                    data.electronicAgreementTimestamp
                      ? 'text-[#166534]'
                      : 'text-[#7D5410]'
                  }`}
                >
                  {data.electronicAgreementTimestamp
                    ? `✓ Persetujuan Elektronik Pembeli Tercatat: ${data.electronicAgreementTimestamp}`
                    : 'Persetujuan Elektronik Pembeli: Menunggu centang S&K pada Portal Invoice VORVAN'}
                </p>
                <p>
                  <strong>1. Direct International Curation:</strong> Setiap
                  flacon dikurasi langsung dari arsip internasional resmi dengan
                  inspeksi segel Vault berlapis.
                </p>
                <p>
                  <strong>2. Garansi Unboxing 360° Tanpa Jeda (1×24 Jam):</strong>{' '}
                  Klaim kerusakan/ketidaksesuaian wajib disertai video unboxing
                  utuh 360° tanpa potongan dalam 1×24 jam sejak paket diterima.
                </p>
                <p>
                  <strong>3. Kebijakan Final Sale:</strong> Transaksi bersifat
                  Final Sale &amp; Non-Retur untuk preferensi aroma pribadi atau
                  pembatalan sepihak.
                </p>
              </div>

              {/* Stempel Kurasi Digital Bulat Emas */}
              <div className="shrink-0 mx-auto sm:mx-0">
                <div
                  className="w-32 h-32 rounded-full border-2 border-[#B88E3D] bg-[#C5A059]/10 flex flex-col items-center justify-center text-center p-2 -rotate-6 shadow-inner"
                  style={{
                    outline: '1.5px dashed #C5A059',
                    outlineOffset: '-6px',
                  }}
                  data-testid="official-pdf-digital-seal"
                >
                  <span className="font-brand text-[7px] font-bold uppercase tracking-[0.14em] text-[#7D5C1B] leading-tight">
                    VORVAN OFFICIAL VAULT
                  </span>
                  <span className="font-serif-luxury text-2xl font-bold text-[#9D7728] my-0.5">
                    V
                  </span>
                  <span className="font-brand text-[6.5px] font-bold uppercase tracking-[0.12em] text-[#7D5C1B] leading-tight inline-flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                    VERIFIED CURATION DOCUMENT
                  </span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};
