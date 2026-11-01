import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon,
  Lock,
  MessageCircle,
  QrCode,
  RefreshCw,
  Send,
  ShieldCheck,
  Truck,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  CustomAdminOrder,
  PrivateInvoice,
  VorvanSiteSettings,
} from '../types/fragrance';
import {
  applyPaymentProofToOrders,
  buildVerifiedLegalWhatsAppMessage,
  buildVerifiedLegalWhatsAppUrl,
  calculateInvoiceTotals,
  compressPaymentProofImage,
  formatIDRCurrency,
  formatLegalTimestampWIB,
  loadCustomAdminOrders,
  loadPaymentProofsMap,
  loadVorvanSettings,
  resolvePrivateInvoice,
  saveCustomAdminOrders,
  savePaymentProofRecord,
} from '../utils/businessRules';
import { pushCloudVaultPacket, sendPaymentProofWebhook } from '../utils/cloudSync';

interface AuthorizedPaymentChannel {
  id:
    | 'mandiri'
    | 'bni'
    | 'bri'
    | 'qris'
    | 'paypal'
    | 'visa'
    | 'mastercard'
    | 'cod';
  label: string;
  logoUrl?: string;
}

const AUTHORIZED_PAYMENT_CHANNELS: AuthorizedPaymentChannel[] = [
  {
    id: 'mandiri',
    label: 'Bank Mandiri',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/512px-Bank_Mandiri_logo_2016.svg.png',
  },
  {
    id: 'bni',
    label: 'Bank BNI',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/512px-BNI_logo.svg.png',
  },
  {
    id: 'bri',
    label: 'Bank BRI',
  },
  {
    id: 'qris',
    label: 'QRIS Instant',
  },
  {
    id: 'paypal',
    label: 'PayPal Resmi',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/512px-PayPal.svg.png',
  },
  {
    id: 'visa',
    label: 'VISA Resmi',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/512px-Visa_Inc._logo.svg.png',
  },
  {
    id: 'mastercard',
    label: 'Mastercard Resmi',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/512px-Mastercard-logo.svg.png',
  },
  {
    id: 'cod',
    label: 'COD • VIP HAND-DELIVERY',
  },
];

const MONOCHROME_CHAMPAGNE_FILTER_CLASS =
  '[filter:brightness(0)_invert(1)_sepia(0.25)_saturate(1.2)_hue-rotate(5deg)] opacity-85 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-300';

const renderGraphicSvgFallback = (id: AuthorizedPaymentChannel['id']) => {
  switch (id) {
    case 'mandiri':
      return (
        <svg
          viewBox="0 0 182 46"
          className={`h-5 sm:h-6 w-auto select-none ${MONOCHROME_CHAMPAGNE_FILTER_CLASS}`}
          role="img"
          aria-label="Bank Mandiri"
        >
          <path
            d="M108 11 C122 3, 141 3, 154 10 C164 15, 172 13, 179 6 C173 18, 160 21, 147 16 C135 11, 120 11, 108 17 Z"
            fill="#E5C87E"
          />
          <text
            x="4"
            y="35"
            fill="#E5C87E"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="26"
            letterSpacing="-0.6"
          >
            mandiri
          </text>
        </svg>
      );
    case 'bni':
      return (
        <svg
          viewBox="0 0 148 46"
          className={`h-5 sm:h-6 w-auto select-none ${MONOCHROME_CHAMPAGNE_FILTER_CLASS}`}
          role="img"
          aria-label="Bank BNI"
        >
          <rect
            x="3"
            y="8"
            width="37"
            height="30"
            rx="5"
            fill="none"
            stroke="#E5C87E"
            strokeWidth="2.4"
          />
          <text
            x="9"
            y="29"
            fill="#E5C87E"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="17"
          >
            46
          </text>
          <text
            x="48"
            y="34"
            fill="#E5C87E"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="30"
            letterSpacing="1"
          >
            BNI
          </text>
          <path
            d="M113 14 C124 10, 136 14, 144 25 C134 22, 123 22, 113 26 Z"
            fill="#E5C87E"
          />
        </svg>
      );
    case 'bri':
      return (
        <svg
          viewBox="0 0 184 46"
          className={`h-5 sm:h-6 w-auto select-none ${MONOCHROME_CHAMPAGNE_FILTER_CLASS}`}
          role="img"
          aria-label="Bank BRI"
        >
          <rect
            x="4"
            y="8"
            width="30"
            height="30"
            rx="6"
            fill="none"
            stroke="#E5C87E"
            strokeWidth="2.4"
          />
          <path
            d="M12 15 H21 C24 15 25.5 16.5 25.5 19 C25.5 21 24 22.2 22 22.6 C24.5 23 26 24.5 26 27 C26 29.8 24 31 20.5 31 H12 Z"
            fill="none"
            stroke="#E5C87E"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          <text
            x="42"
            y="32"
            fill="#E5C87E"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="24"
            letterSpacing="0.6"
          >
            BANK BRI
          </text>
        </svg>
      );
    case 'qris':
      return (
        <svg
          viewBox="0 0 216 46"
          className={`h-5 sm:h-6 w-auto select-none ${MONOCHROME_CHAMPAGNE_FILTER_CLASS}`}
          role="img"
          aria-label="QRIS Instant"
        >
          <rect
            x="4"
            y="9"
            width="11"
            height="11"
            rx="1.5"
            fill="none"
            stroke="#E5C87E"
            strokeWidth="2.2"
          />
          <rect x="7.7" y="12.7" width="3.6" height="3.6" fill="#E5C87E" />
          <rect
            x="20"
            y="9"
            width="11"
            height="11"
            rx="1.5"
            fill="none"
            stroke="#E5C87E"
            strokeWidth="2.2"
          />
          <rect x="23.7" y="12.7" width="3.6" height="3.6" fill="#E5C87E" />
          <rect
            x="4"
            y="25"
            width="11"
            height="11"
            rx="1.5"
            fill="none"
            stroke="#E5C87E"
            strokeWidth="2.2"
          />
          <rect x="7.7" y="28.7" width="3.6" height="3.6" fill="#E5C87E" />
          <rect x="20" y="25" width="5" height="5" fill="#E5C87E" />
          <rect x="26" y="31" width="5" height="5" fill="#E5C87E" />
          <text
            x="40"
            y="32"
            fill="#E5C87E"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="24"
            letterSpacing="0.6"
          >
            QRIS Instant
          </text>
        </svg>
      );
    case 'paypal':
      return (
        <svg
          viewBox="0 0 142 46"
          className={`h-5 sm:h-6 w-auto select-none ${MONOCHROME_CHAMPAGNE_FILTER_CLASS}`}
          role="img"
          aria-label="PayPal Resmi"
        >
          <path
            d="M9 9 H22 C28 9 31 12 30 18 C29 24 24 27 18 27 H13 L11 38 H4 L9 9 Z"
            fill="#E5C87E"
          />
          <path
            d="M17 15 H28 C33 15 36 18 35 23 C34 29 29 32 23 32 H19 L17 41 H12"
            fill="none"
            stroke="#E5C87E"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <text
            x="43"
            y="32"
            fill="#E5C87E"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="25"
          >
            PayPal
          </text>
        </svg>
      );
    case 'visa':
      return (
        <svg
          viewBox="0 0 100 46"
          className={`h-5 sm:h-6 w-auto select-none ${MONOCHROME_CHAMPAGNE_FILTER_CLASS}`}
          role="img"
          aria-label="VISA Resmi"
        >
          <path d="M6 11 L18 11 L23 22 L14 14 Z" fill="#E5C87E" />
          <text
            x="8"
            y="34"
            fill="#E5C87E"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="30"
            letterSpacing="1"
          >
            VISA
          </text>
        </svg>
      );
    case 'mastercard':
      return (
        <svg
          viewBox="0 0 158 46"
          className={`h-5 sm:h-6 w-auto select-none ${MONOCHROME_CHAMPAGNE_FILTER_CLASS}`}
          role="img"
          aria-label="Mastercard Resmi"
        >
          <circle cx="17" cy="23" r="12.5" fill="#E5C87E" />
          <circle
            cx="32"
            cy="23"
            r="12.5"
            fill="none"
            stroke="#E5C87E"
            strokeWidth="2.5"
          />
          <text
            x="52"
            y="28"
            fill="#E5C87E"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="800"
            fontSize="17"
            letterSpacing="-0.2"
          >
            mastercard
          </text>
        </svg>
      );
    default:
      return null;
  }
};

const PaymentChannelLogoBadge: React.FC<{
  channel: AuthorizedPaymentChannel;
}> = ({ channel }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (channel.id === 'cod') {
    return (
      <div
        className="group bg-[#14110C] border border-[#C5A059]/30 hover:border-[#C5A059]/60 rounded-lg px-5 py-2.5 h-11 sm:h-12 flex items-center justify-center gap-2.5 shrink-0 transition-all duration-300"
        data-testid="payment-logo-badge-cod"
      >
        <svg
          viewBox="0 0 36 36"
          className="h-5 sm:h-6 w-5 sm:w-6 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity duration-300"
          role="img"
          aria-label="COD VIP Hand-Delivery Emblem"
        >
          <defs>
            <linearGradient
              id="codGoldShieldGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FFF3C4" />
              <stop offset="45%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#9A7418" />
            </linearGradient>
          </defs>
          <path
            d="M18 3 L30 7.5 V17.5 C30 25.2 24.8 30.8 18 33 C11.2 30.8 6 25.2 6 17.5 V7.5 L18 3 Z"
            fill="url(#codGoldShieldGrad)"
            stroke="#FFF3C4"
            strokeWidth="1.2"
          />
          <path
            d="M18 6.2 L27 9.6 V17.2 C27 23.1 23.1 27.6 18 29.5 C12.9 27.6 9 23.1 9 17.2 V9.6 L18 6.2 Z"
            fill="#14110C"
          />
          <path
            d="M13.5 18.2 L16.7 21.4 L23 14.8"
            fill="none"
            stroke="url(#codGoldShieldGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-brand text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] bg-gradient-to-r from-[#FFF3C4] via-[#E5C87E] to-[#D4AF37] bg-clip-text text-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          COD • VIP HAND-DELIVERY
        </span>
      </div>
    );
  }

  return (
    <div
      className="group bg-[#14110C] border border-[#C5A059]/30 hover:border-[#C5A059]/60 rounded-lg px-5 py-2.5 h-11 sm:h-12 flex items-center justify-center shrink-0 transition-all duration-300"
      data-testid={`payment-logo-badge-${channel.id}`}
    >
      {channel.logoUrl && (
        <img
          src={channel.logoUrl}
          alt={channel.label}
          referrerPolicy="no-referrer"
          loading="eager"
          onError={() => setImgFailed(true)}
          className={
            imgFailed
              ? 'hidden'
              : `h-5 sm:h-6 w-auto max-w-[120px] object-contain select-none ${MONOCHROME_CHAMPAGNE_FILTER_CLASS}`
          }
        />
      )}
      {(imgFailed || !channel.logoUrl) && renderGraphicSvgFallback(channel.id)}
    </div>
  );
};

interface PrivateInvoiceViewProps {
  invoiceId: string;
  smartOrder?: CustomAdminOrder | null;
  customOrders?: CustomAdminOrder[];
  settings?: VorvanSiteSettings;
  onBackToCatalog: () => void;
  onSelectInvoiceId: (id: string) => void;
  onOpenOrderTracking: (trackingOrInvoiceId: string) => void;
  onUploadPaymentProof?: (
    invoiceId: string,
    proofBase64: string,
    uploadedAt: string
  ) => void;
}

export const PrivateInvoiceView: React.FC<PrivateInvoiceViewProps> = ({
  invoiceId,
  smartOrder,
  customOrders,
  settings,
  onBackToCatalog,
  onSelectInvoiceId,
  onOpenOrderTracking,
  onUploadPaymentProof,
}) => {
  const activeSettings = settings || loadVorvanSettings();

  const [customIdInput, setCustomIdInput] = useState<string>(invoiceId || '');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(
    Boolean(invoiceId?.trim() || smartOrder)
  );
  const [activePaymentTab, setActivePaymentTab] = useState<
    'bank_transfer' | 'cod_hand_delivery' | 'international_paypal'
  >('bank_transfer');
  const [copiedAccountKey, setCopiedAccountKey] = useState<string | null>(null);
  const [paypalImgFailed, setPaypalImgFailed] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isLegalDetailOpen, setIsLegalDetailOpen] = useState<boolean>(false);
  const [isLegalAgreed, setIsLegalAgreed] = useState<boolean>(false);
  const [legalAgreedTimestamp, setLegalAgreedTimestamp] = useState<string>('');

  // Tahap 2 & 3: Upload Bukti Pembayaran state
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [paymentProofUploadedAt, setPaymentProofUploadedAt] = useState<string>('');
  const [isCompressingProof, setIsCompressingProof] = useState<boolean>(false);
  const [proofError, setProofError] = useState<string | null>(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (invoiceId?.trim() || smartOrder) {
      setCustomIdInput(invoiceId || smartOrder?.invoiceId || '');
      setIsUnlocked(true);
    } else {
      setCustomIdInput('');
      setIsUnlocked(false);
    }
  }, [invoiceId, smartOrder]);

  useEffect(() => {
    setPaypalImgFailed(false);
  }, [activeSettings.paypalQrUrl]);

  const effectiveCode =
    customIdInput.trim() || invoiceId.trim() || smartOrder?.invoiceId || 'INV-SAMPLE';

  useEffect(() => {
    setIsLegalAgreed(false);
    setLegalAgreedTimestamp('');
  }, [effectiveCode]);

  const baseInvoice: PrivateInvoice = resolvePrivateInvoice(
    effectiveCode,
    customOrders,
    smartOrder
  );

  // Synchronize payment proof if previously stored or attached to invoice
  useEffect(() => {
    const proofsMap = loadPaymentProofsMap();
    const stored =
      proofsMap[effectiveCode.toUpperCase()] ||
      proofsMap[baseInvoice.invoiceId.toUpperCase()];
    if (stored?.proofUrl) {
      setPaymentProofUrl(stored.proofUrl);
      setPaymentProofUploadedAt(stored.uploadedAt);
    } else if (baseInvoice.paymentProofUrl) {
      setPaymentProofUrl(baseInvoice.paymentProofUrl);
      setPaymentProofUploadedAt(baseInvoice.paymentProofUploadedAt || '');
    } else {
      setPaymentProofUrl('');
      setPaymentProofUploadedAt('');
    }
  }, [
    effectiveCode,
    baseInvoice.invoiceId,
    baseInvoice.paymentProofUrl,
    baseInvoice.paymentProofUploadedAt,
  ]);

  const totals = calculateInvoiceTotals(baseInvoice);

  const handleOpenInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customIdInput.trim().toUpperCase();
    if (!cleaned) {
      setInputError('Mohon masukkan Kode Tagihan Privat Anda terlebih dahulu.');
      return;
    }
    setInputError(null);
    onSelectInvoiceId(cleaned);
    setIsUnlocked(true);
  };

  const handleCopyAccount = (value: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopiedAccountKey(key);
    setTimeout(() => {
      setCopiedAccountKey((prev) => (prev === key ? null : prev));
    }, 2200);
  };

  const handleToggleLegalAgree = (checked: boolean) => {
    if (checked) {
      const nowWIB = formatLegalTimestampWIB(new Date());
      setIsLegalAgreed(true);
      setLegalAgreedTimestamp(nowWIB);
    } else {
      setIsLegalAgreed(false);
      setLegalAgreedTimestamp('');
    }
  };

  const rawWaDigits = activeSettings.whatsappNumber.replace(/\D/g, '');
  const normalizedWa = rawWaDigits.startsWith('0')
    ? `62${rawWaDigits.slice(1)}`
    : rawWaDigits || '628133866590';
  const cleanTelegram =
    activeSettings.telegramUsername.replace(/^@/, '') || 'vorvanofficial';

  const paymentMethodLabel =
    activePaymentTab === 'bank_transfer'
      ? 'Transfer Bank Resmi (Mandiri / BNI / BRI)'
      : activePaymentTab === 'cod_hand_delivery'
      ? 'COD / Private Hand-Delivery'
      : 'International Payment (PayPal / SWIFT)';

  const perfumeSummaryDesc = baseInvoice.items
    .map((item) => `${item.house} — ${item.fragranceName} (${item.volume})`)
    .join(', ');

  const effectiveTimestamp =
    legalAgreedTimestamp || formatLegalTimestampWIB(new Date());

  // Handle HTML5 Canvas image compression (max 400px, quality 0.5) & automatic PAID recording to Web Admin
  const handleProofFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofError(null);
    setIsCompressingProof(true);

    try {
      const compressed = await compressPaymentProofImage(file, 400, 0.5);
      const nowWIB = formatLegalTimestampWIB(new Date());
      setPaymentProofUrl(compressed);
      setPaymentProofUploadedAt(nowWIB);

      // 1. Save locally to payment proof records map
      savePaymentProofRecord(baseInvoice.invoiceId, compressed, nowWIB);

      // 2. Automatically match & update customOrders in localStorage (status -> PAID, paymentProof, shippingStage)
      const localOrders =
        customOrders && customOrders.length > 0
          ? customOrders
          : loadCustomAdminOrders();
      const itemFragNames = baseInvoice.items.map((it) => it.fragranceName);
      const { updatedOrders, matchedInvoiceIds } = applyPaymentProofToOrders(
        localOrders,
        baseInvoice.invoiceId,
        compressed,
        nowWIB,
        itemFragNames
      );
      saveCustomAdminOrders(updatedOrders);

      // 3. Inform parent App component to immediately update adminInvoices state & Cloud KV
      onUploadPaymentProof?.(baseInvoice.invoiceId, compressed, nowWIB);

      // 4. Send Cloud Vault Real-Time packet for invoiceId and any matched Admin order IDs
      const targetIds = Array.from(
        new Set([baseInvoice.invoiceId, ...matchedInvoiceIds])
      );
      for (const targetInvId of targetIds) {
        void pushCloudVaultPacket({
          kind: 'VORVAN_PAYMENT_PROOF',
          invoiceId: targetInvId,
          paymentProofUrl: compressed,
          uploadedAt: nowWIB,
          autoMarkPaid: true,
          ts: Date.now(),
        });
      }

      // 5. Fire Google Apps Script Webhook
      void sendPaymentProofWebhook({
        invNo: matchedInvoiceIds[0] || baseInvoice.invoiceId,
        buyerName: baseInvoice.buyerName,
        itemName: perfumeSummaryDesc,
        totalPrice: formatIDRCurrency(totals.grandTotalIDR),
        uploadedAt: nowWIB,
        autoMarkPaid: true,
        hasProofImage: true,
      });
    } catch (err) {
      setProofError(
        err instanceof Error
          ? err.message
          : 'Gagal memproses file gambar bukti bayar.'
      );
    } finally {
      setIsCompressingProof(false);
      e.target.value = '';
    }
  };

  const confirmationMessage = buildVerifiedLegalWhatsAppMessage({
    docNo: baseInvoice.invoiceId,
    clientName: baseInvoice.buyerName,
    perfumeDesc: perfumeSummaryDesc,
    grandTotal: formatIDRCurrency(totals.grandTotalIDR),
    paymentMethodLabel,
    agreedTimestamp: effectiveTimestamp,
    paymentProofUploadedAt: paymentProofUploadedAt || undefined,
  });

  const whatsappConfirmUrl = buildVerifiedLegalWhatsAppUrl(
    {
      docNo: baseInvoice.invoiceId,
      clientName: baseInvoice.buyerName,
      perfumeDesc: perfumeSummaryDesc,
      grandTotal: formatIDRCurrency(totals.grandTotalIDR),
      paymentMethodLabel,
      agreedTimestamp: effectiveTimestamp,
      paymentProofUploadedAt: paymentProofUploadedAt || undefined,
    },
    normalizedWa
  );
  const telegramConfirmUrl = `https://t.me/${cleanTelegram}?text=${encodeURIComponent(
    confirmationMessage
  )}`;

  // 3-STAGE GATE LOCK CONDITIONS:
  // Tahap 1: isPaymentUnlocked = false (Klausul belum dicentang -> Semua terkunci)
  // Tahap 2: isPaymentUnlocked = true, hasProof = false (Klausul dicentang, tapi bukti belum diupload -> Tab rekening & kotak upload terbuka, tombol konfirmasi TERKUNCI)
  // Tahap 3: isConfirmationUnlocked = true (Bukti terupload / status PAID -> Tombol konfirmasi AKTIF)
  const isPaymentUnlocked = baseInvoice.status === 'PAID' || isLegalAgreed;
  const hasProof = Boolean(paymentProofUrl) || baseInvoice.status === 'PAID';
  const isConfirmationUnlocked = isPaymentUnlocked && hasProof;

  return (
    <section
      className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
      aria-labelledby="private-invoice-heading"
    >
      {/* Top Bar */}
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
          <span>VORVAN ENCRYPTED PRIVATE SETTLEMENT</span>
        </div>
      </div>

      {/* CLEAN LOCKED INITIAL STATE: Kotak Input Kode Tagihan Elegan */}
      <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#16151F] via-[#111017] to-[#0C0B10] border border-[#D4AF37]/40 shadow-[0_18px_48px_-15px_rgba(0,0,0,0.85)] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-brand text-[10px] sm:text-xs uppercase tracking-[0.22em] text-[#E5C87E]">
              <Lock className="w-3.5 h-3.5 text-[#E5C87E]" />
              <span>AKSES DOKUMEN TAGIHAN PRIVAT VORVAN</span>
            </div>
            <h1
              id="private-invoice-heading"
              className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-white"
            >
              Masukkan Kode Private Invoice Anda
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300">
              Ketik kode tagihan resmi yang diterbitkan oleh Concierge VORVAN untuk
              membuka rincian pesanan &amp; instruksi pembayaran.
            </p>
          </div>

          <form
            onSubmit={handleOpenInvoiceSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto"
          >
            <input
              type="text"
              value={customIdInput}
              onChange={(e) => {
                setCustomIdInput(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="Ketik Kode Invoice (mis. INV-VRV-...)"
              className="w-full sm:w-64 px-4 py-3 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/40 focus:border-[#F5E6B8] text-xs sm:text-sm font-mono-tabular uppercase text-white placeholder:text-zinc-600 outline-none"
              aria-label="Masukkan nomor Private Invoice"
              data-testid="invoice-code-input"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl btn-luxury-gold text-zinc-950 font-brand text-xs font-bold uppercase tracking-[0.18em] cursor-pointer whitespace-nowrap shrink-0"
              data-testid="open-invoice-submit-btn"
            >
              BUKA TAGIHAN
            </button>
          </form>
        </div>

        {inputError && (
          <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/60 px-3.5 py-2.5 rounded-xl">
            {inputError}
          </p>
        )}
      </div>

      {/* AUTHORIZED PAYMENT & SETTLEMENT CHANNELS MARQUEE */}
      <div
        className="mt-5 py-4 px-4 rounded-2xl bg-gradient-to-r from-[#121118]/90 via-[#171520]/95 to-[#121118]/90 border border-[#D4AF37]/30 overflow-hidden"
        data-testid="invoice-payment-marquee"
      >
        <p className="font-brand text-[10px] uppercase tracking-[0.26em] text-[#D8BE82] text-center mb-3.5 font-semibold">
          AUTHORIZED PAYMENT &amp; SETTLEMENT CHANNELS
        </p>
        <div className="relative w-full overflow-hidden">
          <div className="animate-marquee flex items-center gap-5 sm:gap-7 px-4">
            {[0, 1].map((loopIdx) => (
              <React.Fragment key={`marquee-loop-${loopIdx}`}>
                {AUTHORIZED_PAYMENT_CHANNELS.map((channel) => (
                  <div
                    key={`${channel.id}-${loopIdx}`}
                    className="flex items-center gap-5 sm:gap-7 shrink-0"
                  >
                    <PaymentChannelLogoBadge channel={channel} />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/70 shrink-0 select-none"
                      aria-hidden="true"
                    />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* LOCKED PLACEHOLDER STATE vs UNLOCKED INVOICE DOSSIER */}
      {!isUnlocked ? (
        <div
          className="mt-8 p-10 sm:p-14 rounded-2xl bg-[#0E0D14]/90 border border-[#D4AF37]/25 text-center space-y-4"
          data-testid="invoice-locked-placeholder"
        >
          <div className="w-14 h-14 rounded-full bg-[#171521] border border-[#D4AF37]/40 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6 text-[#E5C87E]" />
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-white">
            Dokumen Tagihan Terkunci demi Privasi Klien
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Demi menjaga kerahasiaan data transaksi kolektor VORVAN, rincian
            tagihan hanya ditampilkan setelah Anda memasukkan Kode Tagihan
            Privat di atas dan menekan tombol{' '}
            <strong className="text-[#F5E6B8]">BUKA TAGIHAN</strong>, atau
            melalui tautan khusus yang dikirimkan oleh Concierge kami.
          </p>
        </div>
      ) : (
        /* UNLOCKED INVOICE DOSSIER */
        <div
          className="mt-8 bg-[#111115] border border-[#D4AF37]/40 rounded-2xl shadow-2xl overflow-hidden animate-fade-up"
          data-testid="invoice-unlocked-dossier"
        >
          {/* Header Banner */}
          <div className="p-6 sm:p-10 bg-gradient-to-b from-[#171621] to-[#111016] border-b border-[#D4AF37]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#E5C87E] uppercase tracking-[0.2em]">
                <FileText className="w-4 h-4 text-[#E5C87E] shrink-0" />
                <span className="whitespace-nowrap">
                  VORVAN PRIVATE CLIENT INVOICE
                </span>
              </div>
              <h2 className="mt-2 font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-semibold text-white leading-tight flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="whitespace-nowrap">Tagihan Privat</span>
                <span className="whitespace-nowrap text-[#F5E6B8]">
                  #{baseInvoice.invoiceId}
                </span>
              </h2>
              <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-2.5 gap-y-1 text-xs text-zinc-300">
                <span className="whitespace-nowrap">
                  Diterbitkan pada {baseInvoice.createdAt}
                </span>
                <span className="hidden sm:inline text-[#D4AF37]/60">·</span>
                <span className="whitespace-nowrap">
                  Berlaku hingga {baseInvoice.expiresAt}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2.5 shrink-0">
              {baseInvoice.status === 'PAID' ? (
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs font-bold uppercase tracking-[0.16em] whitespace-nowrap"
                  data-testid="invoice-status-badge"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>PAID · LUNAS TERVERIFIKASI</span>
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/50 border border-amber-500/50 text-amber-300 text-xs font-bold uppercase tracking-[0.16em] whitespace-nowrap"
                  data-testid="invoice-status-badge"
                >
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>MENUNGGU PEMBAYARAN</span>
                </span>
              )}
              <div className="text-[11px] sm:text-xs text-zinc-400 flex flex-col sm:flex-row sm:items-center md:justify-end gap-x-1.5 gap-y-0.5">
                <span className="whitespace-nowrap">Penanggung Jawab:</span>
                <strong className="text-[#F5E6B8] whitespace-nowrap">
                  VORVAN Official Concierge
                </strong>
              </div>
            </div>
          </div>

          {/* Client & Allocation Metadata */}
          <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-zinc-800/90 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#D8BE82] block">
                Ditujukan Kepada (Private Buyer)
              </span>
              <p className="text-base font-semibold text-white">
                {baseInvoice.buyerName}
              </p>
              <p className="text-zinc-300">{baseInvoice.buyerCity}</p>
            </div>

            <div className="space-y-1.5 md:text-right">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#D8BE82] block">
                Jaminan &amp; Otentikasi Vault
              </span>
              <p className="text-zinc-200 font-medium">
                100% Original Parallel Import · Segel Hologram VORVAN
              </p>
              <p className="text-zinc-400 leading-relaxed">{baseInvoice.notes}</p>
            </div>
          </div>

          {/* Itemized Flacon Table */}
          <div className="p-6 sm:p-10 border-b border-zinc-800/90">
            <h3 className="text-xs uppercase tracking-[0.22em] text-[#E5C87E] font-semibold mb-4">
              Rincian Alokasi Flacon Parfum
            </h3>

            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full min-w-[540px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400">
                    <th className="py-3 pr-4 whitespace-nowrap">
                      Deskripsi Koleksi
                    </th>
                    <th className="py-3 px-3 whitespace-nowrap">Ukuran</th>
                    <th className="py-3 px-3 whitespace-nowrap">Kode Batch</th>
                    <th className="py-3 px-3 text-center whitespace-nowrap">
                      Qty
                    </th>
                    <th className="py-3 pl-3 text-right whitespace-nowrap">
                      Harga Satuan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-sm">
                  {baseInvoice.items.map((item) => (
                    <tr key={item.sku}>
                      <td className="py-4 pr-4 min-w-[200px]">
                        <p className="font-semibold text-white whitespace-nowrap">
                          {item.house} — {item.fragranceName}
                        </p>
                        <p className="text-xs text-zinc-400 whitespace-nowrap">
                          {item.concentration} · SKU: {item.sku}
                        </p>
                      </td>
                      <td className="py-4 px-3 font-mono-tabular text-zinc-300 whitespace-nowrap">
                        {item.volume}
                      </td>
                      <td className="py-4 px-3 font-mono-tabular text-xs text-[#E5C87E] whitespace-nowrap">
                        {item.batchCode}
                      </td>
                      <td className="py-4 px-3 font-mono-tabular text-center text-zinc-300 whitespace-nowrap">
                        {item.quantity}
                      </td>
                      <td className="py-4 pl-3 font-mono-tabular text-right text-white font-medium whitespace-nowrap">
                        {formatIDRCurrency(item.unitPriceIDR * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown — Retail Valuation Comparison, Parallel Import Savings & Shipping Zone */}
            <div
              className="mt-6 pt-6 border-t border-zinc-800 flex flex-col items-end space-y-2.5 text-xs sm:text-[13px]"
              data-testid="invoice-pricing-summary"
            >
              {(baseInvoice.retailPriceTotalIDR || 0) >
                totals.itemsSubtotalIDR && (
                <>
                  <div className="w-full sm:w-[440px] flex items-center justify-between gap-4 text-zinc-400">
                    <span>Valuasi Ritel Resmi Butik (Indonesia)</span>
                    <span className="font-mono-tabular line-through text-zinc-500 whitespace-nowrap shrink-0">
                      {formatIDRCurrency(baseInvoice.retailPriceTotalIDR || 0)}
                    </span>
                  </div>
                  <div className="w-full sm:w-[440px] flex items-center justify-between gap-4 text-[#E5C87E] font-semibold">
                    <span>
                      Efisiensi Parallel Import VORVAN (Diskon{' '}
                      {baseInvoice.discountPct ||
                        Math.round(
                          (((baseInvoice.retailPriceTotalIDR || 0) -
                            totals.itemsSubtotalIDR) /
                            (baseInvoice.retailPriceTotalIDR || 1)) *
                            100
                        )}
                      %)
                    </span>
                    <span className="font-mono-tabular text-emerald-400 whitespace-nowrap shrink-0">
                      -{' '}
                      {formatIDRCurrency(
                        Math.max(
                          0,
                          (baseInvoice.retailPriceTotalIDR || 0) -
                            totals.itemsSubtotalIDR
                        )
                      )}
                    </span>
                  </div>
                </>
              )}

              <div className="w-full sm:w-[440px] flex items-center justify-between gap-4 text-zinc-200 font-semibold">
                <span>Subtotal Koleksi Parfum (Full-Size Sealed)</span>
                <span className="font-mono-tabular text-white whitespace-nowrap shrink-0">
                  {formatIDRCurrency(totals.itemsSubtotalIDR)}
                </span>
              </div>

              <div className="w-full sm:w-[440px] flex items-center justify-between gap-4 text-zinc-300">
                <span>
                  {baseInvoice.shippingLabel ||
                    'Pengiriman Berasuransi & Double-Wall Thermal Box'}
                </span>
                <span
                  className={`font-mono-tabular font-semibold whitespace-nowrap shrink-0 ${
                    totals.protectionTotalIDR === 0
                      ? 'text-emerald-400'
                      : 'text-zinc-200'
                  }`}
                >
                  {totals.protectionTotalIDR === 0
                    ? 'COMPLIMENTARY (Rp 0)'
                    : formatIDRCurrency(totals.protectionTotalIDR)}
                </span>
              </div>

              <div className="w-full sm:w-[440px] mt-1 p-3.5 rounded-xl bg-[#16151F] border border-[#D4AF37]/60 flex items-center justify-between gap-4 text-white">
                <span className="font-brand text-xs font-bold uppercase tracking-[0.14em] text-[#E5C87E]">
                  TOTAL NOMINAL DISEPAKATI
                </span>
                <span
                  className="font-mono-tabular text-lg sm:text-xl font-extrabold text-[#F5E6B8] whitespace-nowrap shrink-0"
                  data-testid="invoice-grand-total"
                >
                  {formatIDRCurrency(totals.grandTotalIDR)}
                </span>
              </div>
            </div>
          </div>

          {/* 3 OFFICIAL PAYMENT METHOD TABS */}
          <div className="p-6 sm:p-10 bg-[#0D0C12] space-y-8">
            <div className="space-y-2">
              <span className="font-brand text-[10px] uppercase tracking-[0.22em] text-[#E5C87E] block">
                OFFICIAL SETTLEMENT CHANNELS · VORVAN OFFICIAL CONCIERGE
              </span>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-white">
                Pilih Metode Pembayaran Resmi VORVAN
              </h3>
            </div>

            {/* VORVAN LEGAL SHIELD — MANDATORY CLICKWRAP AGREEMENT & ANTI-DISPUTE MODULE */}
            {baseInvoice.status !== 'PAID' && (
              <div id="vorvan-legal-shield" data-testid="vorvan-legal-shield">
                {/* Header Klausul */}
                <div className="vorvan-legal-header">
                  <span className="vorvan-legal-header-title">
                    ⚖️ Ketentuan Transaksi, Kebijakan Final Sale &amp; Pelepasan Klaim
                  </span>
                  <button
                    type="button"
                    id="btn-toggle-legal"
                    onClick={() => setIsLegalDetailOpen((prev) => !prev)}
                  >
                    {isLegalDetailOpen
                      ? 'Tutup Ringkasan ▴'
                      : 'Baca Klausul Lengkap ▾'}
                  </button>
                </div>

                {/* Isi 5 Klausul Hukum Anti-Gugat (Bisa di-scroll / dibuka penuh) */}
                <div
                  id="vorvan-legal-clauses"
                  className={isLegalDetailOpen ? 'expanded' : ''}
                >
                  <p className="vorvan-legal-clause-item">
                    <strong>
                      1. Status Kurasi Independen (Parallel Import Disclosure):
                    </strong>{' '}
                    Pembeli memahami dan menyetujui bahwa VORVAN beroperasi
                    sebagai kurator independen jalur Parallel Import (distribusi
                    langsung lintas negara non-afiliasi ritel mal lokal), di
                    mana efisiensi harga 20%–30% merupakan keuntungan langsung
                    dari pemangkasan rantai distribusi tersebut.
                  </p>
                  <p className="vorvan-legal-clause-item">
                    <strong>
                      2. Pelepasan Klaim Subjektif Aroma &amp; Perspektif Pribadi
                      (Olfactory Waiver):
                    </strong>{' '}
                    Persepsi terhadap aroma (<em>notes</em>), proyeksi (
                    <em>sillage</em>), ketahanan (<em>longevity</em>), variasi
                    karakter antar-batch produksi (<em>maceration</em>), maupun{' '}
                    <strong>
                      perspektif atau ekspektasi subjektif pribadi Pembeli BUKAN
                      merupakan cacat produk
                    </strong>
                    . Reaksi kimia parfum pada pH kulit dan suhu tubuh tiap
                    individu bersifat unik, sehingga{' '}
                    <strong>
                      VORVAN menolak segala bentuk klaim, komplain, retur,
                      refund, maupun gugatan yang didasarkan pada masalah aroma
                      atau penilaian subjektif pribadi
                    </strong>
                    .
                  </p>
                  <p className="vorvan-legal-clause-item">
                    <strong>
                      3. Kebijakan Final Sale (Non-Returnable &amp;
                      Non-Refundable):
                    </strong>{' '}
                    Demi standar higienitas, seluruh transaksi bersifat{' '}
                    <strong>FINAL SALE</strong>. Produk yang telah dibuka segel
                    plastiknya (<em>cellophane wrap</em>) atau telah
                    disemprotkan tidak dapat ditukar atau dikembalikan dengan
                    alasan apa pun.
                  </p>
                  <p className="vorvan-legal-clause-item">
                    <strong>
                      4. Garansi Pengiriman &amp; Fungsi Sprayer (Wajib Video
                      Unboxing):
                    </strong>{' '}
                    Garansi penggantian unit baru berlaku penuh apabila: (a)
                    botol pecah saat ekspedisi, (b) kendala fungsi semprotan
                    (sprayer/atomizer macet atau tidak dapat menyemprot saat
                    pertama kali dicoba), atau (c) kesalahan pengiriman varian
                    oleh tim VORVAN. Syarat klaim cukup melampirkan Video
                    Unboxing Tanpa Jeda/Edit (Uncut 360°) sejak paket masih
                    tersegel rapat hingga pengetesan semprotan pertama, maksimal
                    1x24 jam setelah status resi Delivered.
                  </p>
                  <p className="vorvan-legal-clause-item">
                    <strong>
                      5. Kesepakatan Layanan &amp; Kenyamanan Transaksi:
                    </strong>{' '}
                    Dengan mencentang kotak persetujuan di bawah ini dan
                    melanjutkan pembayaran, Pembeli menyatakan telah memahami
                    karakteristik produk serta menyetujui seluruh ketentuan
                    layanan, kebijakan Final Sale, dan prosedur garansi VORVAN
                    di atas secara sadar sebagai kesepakatan transaksi yang sah.
                  </p>
                </div>

                {/* Kotak Centang Persetujuan Wajib (Clickwrap) */}
                <label
                  htmlFor="vorvan-agree-checkbox"
                  className="vorvan-clickwrap-label"
                >
                  <input
                    type="checkbox"
                    id="vorvan-agree-checkbox"
                    checked={isLegalAgreed}
                    onChange={(e) => handleToggleLegalAgree(e.target.checked)}
                  />
                  <span className="vorvan-clickwrap-text">
                    SAYA TELAH MEMBACA, MEMAHAMI, DAN MENYETUJUI SECARA SADAR
                    SELURUH KETENTUAN FINAL SALE, KEBIJAKAN NON-RETUR, SERTA
                    PELEPASAN KLAIM SUBJEKTIF AROMA &amp; PERSPEKTIF PRIBADI
                    VORVAN DI ATAS.
                  </span>
                </label>

                {/* Log Timestamp Persetujuan */}
                {isLegalAgreed && legalAgreedTimestamp && (
                  <div id="vorvan-legal-timestamp-log">
                    ✓ Persetujuan Layanan Elektronik Tercatat:{' '}
                    {legalAgreedTimestamp}
                  </div>
                )}
              </div>
            )}

            {/* 3 Tabs Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3" role="tablist">
              <button
                type="button"
                role="tab"
                disabled={!isPaymentUnlocked}
                aria-selected={activePaymentTab === 'bank_transfer'}
                onClick={() =>
                  isPaymentUnlocked && setActivePaymentTab('bank_transfer')
                }
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  !isPaymentUnlocked
                    ? 'bg-zinc-900/80 text-zinc-400 border-zinc-700 cursor-not-allowed opacity-75'
                    : activePaymentTab === 'bank_transfer'
                    ? 'btn-luxury-gold text-zinc-950 font-bold shadow-lg cursor-pointer'
                    : 'bg-[#14131B] text-zinc-200 border-[#D4AF37]/30 hover:border-[#E5C87E] cursor-pointer'
                }`}
                data-testid="payment-tab-bank"
              >
                {!isPaymentUnlocked ? (
                  <Lock className="w-5 h-5 shrink-0 mt-0.5 text-zinc-400" />
                ) : (
                  <Building2 className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-brand text-[10px] uppercase tracking-wider">
                    TAB 1 · INDONESIA {!isPaymentUnlocked && '(TERKUNCI)'}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold mt-0.5">
                    TRANSFER BANK RESMI (INDONESIA)
                  </p>
                </div>
              </button>

              <button
                type="button"
                role="tab"
                disabled={!isPaymentUnlocked}
                aria-selected={activePaymentTab === 'cod_hand_delivery'}
                onClick={() =>
                  isPaymentUnlocked && setActivePaymentTab('cod_hand_delivery')
                }
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  !isPaymentUnlocked
                    ? 'bg-zinc-900/80 text-zinc-400 border-zinc-700 cursor-not-allowed opacity-75'
                    : activePaymentTab === 'cod_hand_delivery'
                    ? 'btn-luxury-gold text-zinc-950 font-bold shadow-lg cursor-pointer'
                    : 'bg-[#14131B] text-zinc-200 border-[#D4AF37]/30 hover:border-[#E5C87E] cursor-pointer'
                }`}
                data-testid="payment-tab-cod"
              >
                {!isPaymentUnlocked ? (
                  <Lock className="w-5 h-5 shrink-0 mt-0.5 text-zinc-400" />
                ) : (
                  <Truck className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-brand text-[10px] uppercase tracking-wider">
                    TAB 2 · PRIVATE COURIER {!isPaymentUnlocked && '(TERKUNCI)'}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold mt-0.5">
                    COD / PRIVATE HAND-DELIVERY (AREA TERDEKAT)
                  </p>
                </div>
              </button>

              <button
                type="button"
                role="tab"
                disabled={!isPaymentUnlocked}
                aria-selected={activePaymentTab === 'international_paypal'}
                onClick={() =>
                  isPaymentUnlocked &&
                  setActivePaymentTab('international_paypal')
                }
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  !isPaymentUnlocked
                    ? 'bg-zinc-900/80 text-zinc-400 border-zinc-700 cursor-not-allowed opacity-75'
                    : activePaymentTab === 'international_paypal'
                    ? 'btn-luxury-gold text-zinc-950 font-bold shadow-lg cursor-pointer'
                    : 'bg-[#14131B] text-zinc-200 border-[#D4AF37]/30 hover:border-[#E5C87E] cursor-pointer'
                }`}
                data-testid="payment-tab-international"
              >
                {!isPaymentUnlocked ? (
                  <Lock className="w-5 h-5 shrink-0 mt-0.5 text-zinc-400" />
                ) : (
                  <Globe className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-brand text-[10px] uppercase tracking-wider">
                    TAB 3 · GLOBAL SETTLEMENT{' '}
                    {!isPaymentUnlocked && '(TERKUNCI)'}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold mt-0.5">
                    INTERNATIONAL PAYMENT (PAYPAL QR &amp; SWIFT WIRE)
                  </p>
                </div>
              </button>
            </div>

            {!isPaymentUnlocked ? (
              <div
                id="vorvan-bank-locked-overlay"
                className="px-6 py-7 sm:px-10 sm:py-9 rounded-2xl bg-[#14131B] border border-dashed border-[#D4AF37]/45 text-center space-y-3"
                data-testid="payment-tabs-locked-banner"
              >
                <div className="w-11 h-11 rounded-full bg-[#1C1A29] border border-[#D4AF37]/40 flex items-center justify-center mx-auto">
                  <Lock className="w-5 h-5 text-[#E5C87E]" />
                </div>
                <p className="font-brand text-[11px] uppercase tracking-[0.18em] text-[#E5C87E] font-semibold">
                  Saluran Pembayaran &amp; Konfirmasi Terkunci
                </p>
                <p className="text-xs sm:text-sm text-zinc-200 font-normal max-w-lg mx-auto leading-relaxed">
                  Silakan centang kotak persetujuan Syarat &amp; Ketentuan di
                  atas terlebih dahulu untuk membuka{' '}
                  <strong className="text-[#F5E6B8]">
                    Tab 1, Tab 2 &amp; Tab 3
                  </strong>{' '}
                  (Nomor Rekening Resmi, QRIS, COD &amp; International Payment)
                  serta Tombol Konfirmasi Pembayaran.
                </p>
              </div>
            ) : (
              <>
                {/* TAB 1 CONTENT: TRANSFER BANK RESMI (INDONESIA) */}
                {activePaymentTab === 'bank_transfer' && (
              <div
                className="space-y-5 animate-fade-up"
                data-testid="payment-content-bank"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Bank Mandiri Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-[#171622] to-[#100F16] border border-[#D4AF37]/45 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
                        <span className="font-brand text-xs uppercase tracking-[0.2em] text-[#E5C87E] font-bold">
                          BANK MANDIRI (RESMI)
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Transfer Nasional
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400">Nomor Rekening:</p>
                        <p className="mt-1 font-mono-tabular text-xl sm:text-2xl font-bold text-white tracking-wider break-all">
                          {activeSettings.mandiriAccount}
                        </p>
                        <p className="mt-1.5 text-xs text-[#F5E6B8] font-medium">
                          a.n {activeSettings.mandiriHolder}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyAccount(
                          activeSettings.mandiriAccount,
                          'mandiri'
                        )
                      }
                      className="w-full py-2.5 px-4 rounded-xl bg-[#0B0A0E] hover:bg-[#1E1C2A] border border-[#D4AF37]/45 text-[#F5E6B8] font-brand text-[11px] font-semibold uppercase tracking-[0.16em] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      {copiedAccountKey === 'mandiri' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300">
                            Nomor Rekening Mandiri Tersalin!
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#E5C87E]" />
                          <span>Salin Nomor Rekening</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Bank BNI Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-[#171622] to-[#100F16] border border-[#D4AF37]/45 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
                        <span className="font-brand text-xs uppercase tracking-[0.2em] text-[#E5C87E] font-bold">
                          BANK BNI (RESMI)
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Transfer Nasional
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400">Nomor Rekening:</p>
                        <p className="mt-1 font-mono-tabular text-xl sm:text-2xl font-bold text-white tracking-wider break-all">
                          {activeSettings.bniAccount}
                        </p>
                        <p className="mt-1.5 text-xs text-[#F5E6B8] font-medium">
                          a.n {activeSettings.bniHolder}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyAccount(activeSettings.bniAccount, 'bni')
                      }
                      className="w-full py-2.5 px-4 rounded-xl bg-[#0B0A0E] hover:bg-[#1E1C2A] border border-[#D4AF37]/45 text-[#F5E6B8] font-brand text-[11px] font-semibold uppercase tracking-[0.16em] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      {copiedAccountKey === 'bni' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300">
                            Nomor Rekening BNI Tersalin!
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#E5C87E]" />
                          <span>Salin Nomor Rekening</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Bank BRI Card */}
                  <div
                    className="p-6 rounded-2xl bg-gradient-to-b from-[#171622] to-[#100F16] border border-[#D4AF37]/45 flex flex-col justify-between space-y-4"
                    data-testid="bank-card-bri"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
                        <span className="font-brand text-xs uppercase tracking-[0.2em] text-[#E5C87E] font-bold">
                          BANK BRI (RESMI)
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Transfer Nasional
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400">Nomor Rekening:</p>
                        <p className="mt-1 font-mono-tabular text-xl sm:text-2xl font-bold text-white tracking-wider break-all">
                          {activeSettings.briAccount}
                        </p>
                        <p className="mt-1.5 text-xs text-[#F5E6B8] font-medium">
                          a.n {activeSettings.briHolder}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyAccount(activeSettings.briAccount, 'bri')
                      }
                      data-testid="copy-bri-account-btn"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#0B0A0E] hover:bg-[#1E1C2A] border border-[#D4AF37]/45 text-[#F5E6B8] font-brand text-[11px] font-semibold uppercase tracking-[0.16em] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      {copiedAccountKey === 'bri' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300">
                            Nomor Rekening BRI Tersalin!
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#E5C87E]" />
                          <span>Salin Nomor Rekening</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Elegant QRIS Real-time Note */}
                <div className="p-4 sm:p-5 rounded-xl bg-[#14131B] border border-[#D4AF37]/35 flex items-start gap-3">
                  <QrCode className="w-5 h-5 text-[#E5C87E] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                    Untuk pembayaran menggunakan{' '}
                    <strong className="text-[#F5E6B8]">
                      QRIS Instan (masa aktif 2 menit)
                    </strong>
                    , silakan hubungi Concierge via WhatsApp/Telegram agar kode QR
                    diterbitkan secara real-time.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2 CONTENT: COD / PRIVATE HAND-DELIVERY (AREA TERDEKAT) */}
            {activePaymentTab === 'cod_hand_delivery' && (
              <div
                className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#171622] to-[#100F16] border border-[#D4AF37]/45 space-y-4 animate-fade-up"
                data-testid="payment-content-cod"
              >
                <div className="flex items-center gap-2.5 text-[#E5C87E] font-brand text-xs uppercase tracking-[0.2em] font-semibold">
                  <Truck className="w-5 h-5 text-[#E5C87E]" />
                  <span>LAYANAN KURIR INTERNAL VORVAN · SERAH TERIMA LANGSUNG</span>
                </div>
                <h4 className="font-serif-luxury text-2xl font-semibold text-white">
                  COD / Private Hand-Delivery (Khusus Jangkauan Area Terdekat)
                </h4>
                <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
                  Layanan pengantaran eksklusif langsung oleh tim internal VORVAN ke
                  lokasi Anda (khusus jangkauan area terdekat sesuai kesepakatan).
                  Anda dapat memeriksa fisik unit secara langsung dan melakukan
                  pembayaran saat serah terima.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#F5E6B8]">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#E5C87E]" />
                    Inspeksi Fisik Botol &amp; Batch Langsung di Tempat
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#E5C87E]" />
                    Pembayaran Saat Serah Terima Unit
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3 CONTENT: INTERNATIONAL PAYMENT (PAYPAL QR & SWIFT WIRE) */}
            {activePaymentTab === 'international_paypal' && (
              <div
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up"
                data-testid="payment-content-international"
              >
                {/* Left: PayPal QR Code */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-b from-[#171622] to-[#100F16] border border-[#D4AF37]/45 flex flex-col items-center text-center justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="font-brand text-[10px] uppercase tracking-[0.2em] text-[#E5C87E] font-semibold">
                      SCAN QR CODE PAYPAL RESMI
                    </span>
                    <h4 className="font-serif-luxury text-xl font-semibold text-white">
                      VORVAN PayPal Merchant
                    </h4>
                  </div>

                  {!paypalImgFailed ? (
                    <div className="p-3 rounded-2xl bg-white border-2 border-[#D4AF37] shadow-xl max-w-[230px] w-full">
                      <img
                        src={activeSettings.paypalQrUrl}
                        alt="QR Code PayPal Resmi VORVAN"
                        referrerPolicy="no-referrer"
                        onError={() => setPaypalImgFailed(true)}
                        className="w-full h-auto object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    /* Elegant Fallback Card for vorvanlifestyle@gmail.com */
                    <div className="w-full p-5 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/45 space-y-3 text-center">
                      <QrCode className="w-10 h-10 text-[#E5C87E] mx-auto" />
                      <p className="font-brand text-xs uppercase tracking-widest text-[#F5E6B8] font-bold">
                        OFFICIAL PAYPAL ACCOUNT
                      </p>
                      <p className="font-mono-tabular text-sm text-white break-all">
                        {activeSettings.conciergeEmail}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyAccount(
                            activeSettings.conciergeEmail,
                            'paypal-mail'
                          )
                        }
                        className="px-4 py-2 rounded-lg bg-[#161521] border border-[#D4AF37]/40 text-xs text-[#F5E6B8] cursor-pointer"
                      >
                        {copiedAccountKey === 'paypal-mail'
                          ? 'Email PayPal Tersalin!'
                          : 'Salin Email PayPal Resmi'}
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-zinc-300">
                    Akun PayPal Resmi:{' '}
                    <strong className="text-[#F5E6B8]">
                      {activeSettings.conciergeEmail}
                    </strong>
                  </p>
                </div>

                {/* Right: International Bank Wire (SWIFT) */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-gradient-to-b from-[#171622] to-[#100F16] border border-[#D4AF37]/45 space-y-5 flex flex-col justify-between">
                  <div className="space-y-1 border-b border-[#D4AF37]/20 pb-3">
                    <span className="font-brand text-[10px] uppercase tracking-[0.2em] text-[#E5C87E] font-semibold">
                      INTERNATIONAL BANK WIRE (SWIFT)
                    </span>
                    <h4 className="font-serif-luxury text-2xl font-semibold text-white">
                      Rekening Valas &amp; Transfer Internasional
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {/* Mandiri SWIFT */}
                    <div className="p-4 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-brand text-xs font-bold text-[#F5E6B8] uppercase tracking-wider">
                          Bank Mandiri
                        </p>
                        <p className="font-mono-tabular text-lg font-bold text-white">
                          {activeSettings.mandiriAccount}{' '}
                          <span className="text-xs font-normal text-zinc-300">
                            ({activeSettings.mandiriHolder})
                          </span>
                        </p>
                        <p className="font-mono-tabular text-xs text-[#E5C87E]">
                          SWIFT Code: <strong>{activeSettings.mandiriSwift}</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyAccount(
                            `${activeSettings.mandiriAccount} (SWIFT: ${activeSettings.mandiriSwift})`,
                            'swift-mandiri'
                          )
                        }
                        className="px-3.5 py-2 rounded-lg bg-[#161521] border border-[#D4AF37]/40 text-xs text-[#F5E6B8] cursor-pointer self-start sm:self-center shrink-0"
                      >
                        {copiedAccountKey === 'swift-mandiri'
                          ? 'Tersalin!'
                          : 'Salin Data SWIFT'}
                      </button>
                    </div>

                    {/* BNI SWIFT */}
                    <div className="p-4 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-brand text-xs font-bold text-[#F5E6B8] uppercase tracking-wider">
                          Bank BNI
                        </p>
                        <p className="font-mono-tabular text-lg font-bold text-white">
                          {activeSettings.bniAccount}{' '}
                          <span className="text-xs font-normal text-zinc-300">
                            ({activeSettings.bniHolder})
                          </span>
                        </p>
                        <p className="font-mono-tabular text-xs text-[#E5C87E]">
                          SWIFT Code: <strong>{activeSettings.bniSwift}</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyAccount(
                            `${activeSettings.bniAccount} (SWIFT: ${activeSettings.bniSwift})`,
                            'swift-bni'
                          )
                        }
                        className="px-3.5 py-2 rounded-lg bg-[#161521] border border-[#D4AF37]/40 text-xs text-[#F5E6B8] cursor-pointer self-start sm:self-center shrink-0"
                      >
                        {copiedAccountKey === 'swift-bni'
                          ? 'Tersalin!'
                          : 'Salin Data SWIFT'}
                      </button>
                    </div>

                    {/* BRI SWIFT */}
                    <div
                      className="p-4 rounded-xl bg-[#0B0A0E] border border-[#D4AF37]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      data-testid="swift-card-bri"
                    >
                      <div className="space-y-1">
                        <p className="font-brand text-xs font-bold text-[#F5E6B8] uppercase tracking-wider">
                          Bank BRI
                        </p>
                        <p className="font-mono-tabular text-lg font-bold text-white">
                          {activeSettings.briAccount}{' '}
                          <span className="text-xs font-normal text-zinc-300">
                            ({activeSettings.briHolder})
                          </span>
                        </p>
                        <p className="font-mono-tabular text-xs text-[#E5C87E]">
                          SWIFT Code: <strong>{activeSettings.briSwift}</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyAccount(
                            `${activeSettings.briAccount} (SWIFT: ${activeSettings.briSwift})`,
                            'swift-bri'
                          )
                        }
                        className="px-3.5 py-2 rounded-lg bg-[#161521] border border-[#D4AF37]/40 text-xs text-[#F5E6B8] cursor-pointer self-start sm:self-center shrink-0"
                      >
                        {copiedAccountKey === 'swift-bri'
                          ? 'Tersalin!'
                          : 'Salin Data SWIFT'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
              </>
            )}

            {/* TAHAP 2 & 3: KOTAK UPLOAD BUKTI PEMBAYARAN (WAJIB FOTO/SCREENSHOT TRANSFER) */}
            {isPaymentUnlocked && (
              <div
                className="p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-[#181622] via-[#121118] to-[#0D0C13] border border-[#D4AF37]/50 shadow-xl space-y-4 animate-fade-up"
                data-testid="payment-proof-upload-box"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4AF37]/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#221F2D] border border-[#D4AF37]/40 flex items-center justify-center text-[#E5C87E]">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-brand text-[10px] uppercase tracking-[0.2em] text-[#E5C87E] font-semibold">
                        TAHAP VERIFIKASI WAJIB · VORVAN VAULT
                      </p>
                      <h4 className="font-serif-luxury text-lg sm:text-xl font-semibold text-white">
                        📤 Upload Bukti Pembayaran (Wajib Foto/Screenshot Transfer)
                      </h4>
                    </div>
                  </div>

                  {hasProof && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold uppercase tracking-wider self-start sm:self-auto">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Bukti Terverifikasi</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Untuk membuka tombol <strong>Konfirmasi WhatsApp &amp; Telegram</strong> di bawah ini, silakan unggah foto struk ATM, bukti transfer m-banking, atau mutasi pembayaran Anda. File otomatis dikompresi ringan &amp; tersimpan langsung ke sistem Web Admin VORVAN.
                </p>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label
                      htmlFor="proof-upload-input"
                      className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border border-dashed transition-all cursor-pointer ${
                        isCompressingProof
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-500 cursor-wait'
                          : hasProof
                          ? 'bg-[#151E18] border-emerald-500/40 hover:border-emerald-400 text-emerald-300'
                          : 'bg-[#111017] border-[#D4AF37]/50 hover:border-[#F5E6B8] hover:bg-[#1A1824] text-[#F5E6B8]'
                      }`}
                    >
                      <input
                        id="proof-upload-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isCompressingProof}
                        onChange={handleProofFileChange}
                        data-testid="payment-proof-file-input"
                      />
                      {isCompressingProof ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#E5C87E]" />
                          <span className="text-xs font-semibold">Mengompres &amp; Menyimpan Bukti Transfer...</span>
                        </>
                      ) : hasProof ? (
                        <>
                          <UploadCloud className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-semibold">Ganti / Unggah Ulang Bukti Transfer Baru</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 text-[#E5C87E]" />
                          <span className="text-xs font-semibold uppercase font-brand tracking-wider">
                            Pilih Foto Struk / Screenshot Bukti Transfer
                          </span>
                        </>
                      )}
                    </label>

                    {paymentProofUrl && (
                      <button
                        type="button"
                        onClick={() => setIsProofModalOpen(true)}
                        className="px-4 py-3 rounded-xl bg-[#1C1A27] hover:bg-[#252233] border border-[#D4AF37]/40 text-[#F5E6B8] font-brand text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
                        data-testid="preview-proof-btn"
                      >
                        <Eye className="w-4 h-4 text-[#E5C87E]" />
                        <span>Lihat Bukti Bayar</span>
                      </button>
                    )}
                  </div>

                  {proofError && (
                    <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/60 px-3 py-2 rounded-lg">
                      {proofError}
                    </p>
                  )}

                  {paymentProofUrl && (
                    <div className="p-3 sm:p-4 rounded-xl bg-[#0F0E15] border border-emerald-500/30 flex items-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => setIsProofModalOpen(true)}
                        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-[#D4AF37]/40 group shrink-0 cursor-pointer"
                        title="Klik untuk melihat ukuran penuh"
                      >
                        <img
                          src={paymentProofUrl}
                          alt="Thumbnail Bukti Bayar"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </button>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Foto Bukti Transfer Siap Digunakan</span>
                        </p>
                        {paymentProofUploadedAt && (
                          <p className="text-[11px] text-zinc-400 truncate">
                            Waktu Unggah: <span className="text-[#E5C87E]">{paymentProofUploadedAt}</span>
                          </p>
                        )}
                        <p className="text-[10px] text-emerald-400/90 font-medium">
                          ✓ Tombol konfirmasi WhatsApp &amp; Telegram di bawah telah terbuka!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BOTTOM CONFIRMATION BUTTONS: 2 TOMBOL KONFIRMASI EMAS */}
            <div className="pt-6 border-t border-[#D4AF37]/30 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="font-brand text-xs uppercase tracking-[0.18em] text-[#F5E6B8] font-semibold">
                  Sudah Melakukan Pembayaran atau Siap Konfirmasi Pesanan?
                </p>
                <button
                  type="button"
                  onClick={() => onOpenOrderTracking(baseInvoice.invoiceId)}
                  className="text-xs text-[#E5C87E] hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  Lacak Status Resi Pengiriman →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!isPaymentUnlocked ? (
                  <button
                    type="button"
                    disabled
                    className="py-4 px-5 rounded-xl bg-zinc-800 text-zinc-400 border border-zinc-700 font-brand text-xs font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2.5 cursor-not-allowed opacity-75"
                    data-testid="confirm-payment-wa-btn"
                  >
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Konfirmasi Pembayaran via WhatsApp (Terkunci)</span>
                  </button>
                ) : !hasProof ? (
                  <button
                    type="button"
                    disabled
                    className="py-4 px-5 rounded-xl bg-zinc-900/90 text-zinc-400 border border-amber-600/40 font-brand text-xs font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-2.5 cursor-not-allowed opacity-85"
                    data-testid="confirm-payment-wa-btn"
                  >
                    <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>🔒 Upload Bukti Transfer Untuk Membuka Konfirmasi WA</span>
                  </button>
                ) : (
                  <a
                    href={whatsappConfirmUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-4 px-5 rounded-xl btn-luxury-gold text-zinc-950 font-brand text-xs font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2.5 shadow-lg cursor-pointer transition-transform hover:scale-[1.01]"
                    data-testid="confirm-payment-wa-btn"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>Konfirmasi Bukti Bayar via WhatsApp</span>
                    <ArrowUpRight className="w-4 h-4 shrink-0" />
                  </a>
                )}

                {!isPaymentUnlocked ? (
                  <button
                    type="button"
                    disabled
                    className="py-4 px-5 rounded-xl bg-zinc-800 text-zinc-400 border border-zinc-700 font-brand text-xs font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2.5 cursor-not-allowed opacity-75"
                    data-testid="confirm-payment-tg-btn"
                  >
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>
                      Konfirmasi Pembayaran via Telegram (@{cleanTelegram})
                      (Terkunci)
                    </span>
                  </button>
                ) : !hasProof ? (
                  <button
                    type="button"
                    disabled
                    className="py-4 px-5 rounded-xl bg-zinc-900/90 text-zinc-400 border border-amber-600/40 font-brand text-xs font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-2.5 cursor-not-allowed opacity-85"
                    data-testid="confirm-payment-tg-btn"
                  >
                    <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>🔒 Upload Bukti Transfer Untuk Membuka Konfirmasi Telegram</span>
                  </button>
                ) : (
                  <a
                    href={telegramConfirmUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-4 px-5 rounded-xl btn-luxury-gold text-zinc-950 font-brand text-xs font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2.5 shadow-lg cursor-pointer transition-transform hover:scale-[1.01]"
                    data-testid="confirm-payment-tg-btn"
                  >
                    <Send className="w-4 h-4 shrink-0" />
                    <span>
                      Konfirmasi Bukti Bayar via Telegram (@{cleanTelegram})
                    </span>
                    <ArrowUpRight className="w-4 h-4 shrink-0" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Proof Lightbox Modal */}
      {isProofModalOpen && paymentProofUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsProofModalOpen(false)}
          data-testid="proof-lightbox-modal"
        >
          <div
            className="relative max-w-2xl w-full bg-[#121118] border border-[#D4AF37]/50 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#E5C87E]" />
                <h4 className="font-brand text-xs font-bold uppercase tracking-wider text-white">
                  Foto Bukti Pembayaran #{baseInvoice.invoiceId}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsProofModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto flex items-center justify-center rounded-xl bg-[#09080E] p-2 border border-zinc-800">
              <img
                src={paymentProofUrl}
                alt={`Bukti Transfer ${baseInvoice.invoiceId}`}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <span>
                {paymentProofUploadedAt ? `Diunggah: ${paymentProofUploadedAt}` : ''}
              </span>
              <button
                type="button"
                onClick={() => setIsProofModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#1C1A27] hover:bg-[#252233] border border-[#D4AF37]/40 text-[#F5E6B8] font-brand text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
