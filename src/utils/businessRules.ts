import {
  DEFAULT_VORVAN_SETTINGS,
  FRAGRANCE_CATALOG,
  PRIVATE_INVOICES_SEED,
  SHIPPING_ZONES,
  TRACKING_RECORDS_SEED,
  VORVAN_81_CATALOG,
  VORVAN_TELEGRAM_USERNAME,
  VORVAN_WHATSAPP_NUMBER,
} from '../data/catalog';
import {
  CONCIERGE_81_GUIDE,
  ConciergeGenderFilterKey,
  ConciergeGuideEntry,
  ConciergeMomentFilterKey,
} from '../data/conciergeGuide81';
import {
  BrandHouseId,
  ConciergeEmailLead,
  CustomAdminOrder,
  FragranceItem,
  GenderCategory,
  PrivateInvoice,
  PrivateTrayItem,
  ShippingMethodType,
  ShippingZoneKey,
  TrackingMilestone,
  TrackingRecord,
  VorvanSiteSettings,
  VorvanSkuPricingEntry,
} from '../types/fragrance';

export const VORVAN_SETTINGS_STORAGE_KEY = 'vorvan_site_settings_v1';
export const VORVAN_CUSTOM_ORDERS_STORAGE_KEY = 'vorvan_custom_admin_orders_v1';
export const VORVAN_DELETED_LEADS_STORAGE_KEY = 'vorvan_deleted_leads_v1';

export const COD_FACE_TO_FACE_STATUS_LABEL =
  '🤝 COD / Serah Terima Tatap Muka Langsung (Tanpa Resi Ekspedisi)';
export const PENDING_AWB_STATUS_LABEL =
  '⏳ Menunggu Pembayaran / Sedang Dikemas (Resi Belum Tersedia)';

const memoryDeletedLeadEmails = new Set<string>();

export function loadDeletedLeadEmails(): Set<string> {
  const result = new Set<string>(memoryDeletedLeadEmails);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(VORVAN_DELETED_LEADS_STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        if (Array.isArray(arr)) {
          for (const email of arr) {
            if (typeof email === 'string' && email.trim()) {
              result.add(email.trim().toLowerCase());
            }
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return result;
}

export function markLeadEmailDeleted(email: string): void {
  const clean = (email || '').trim().toLowerCase();
  if (!clean) return;
  memoryDeletedLeadEmails.add(clean);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const current = loadDeletedLeadEmails();
      current.add(clean);
      window.localStorage.setItem(
        VORVAN_DELETED_LEADS_STORAGE_KEY,
        JSON.stringify(Array.from(current))
      );
    }
  } catch {
    // ignore
  }
}

export function unmarkLeadEmailDeleted(email: string): void {
  const clean = (email || '').trim().toLowerCase();
  if (!clean) return;
  memoryDeletedLeadEmails.delete(clean);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const current = loadDeletedLeadEmails();
      current.delete(clean);
      window.localStorage.setItem(
        VORVAN_DELETED_LEADS_STORAGE_KEY,
        JSON.stringify(Array.from(current))
      );
    }
  } catch {
    // ignore
  }
}

/**
 * Deduplicates visitor email leads and re-indexes their IDs sequentially
 * with a consistent 3-digit format: `LEAD-VRV-001`, `LEAD-VRV-002`, `LEAD-VRV-003`, etc.
 * Never produces duplicate IDs or mixed 2-digit/3-digit formats.
 */
export function reindexVisitorLeads(
  leads: ConciergeEmailLead[],
  deletedEmails: Set<string> = loadDeletedLeadEmails()
): ConciergeEmailLead[] {
  const seenEmails = new Set<string>();
  const unique: ConciergeEmailLead[] = [];

  for (const lead of leads) {
    if (!lead || !lead.email) continue;
    const emailKey = lead.email.trim().toLowerCase();
    if (!emailKey || seenEmails.has(emailKey) || deletedEmails.has(emailKey)) {
      continue;
    }
    seenEmails.add(emailKey);
    unique.push({
      ...lead,
      email: emailKey,
    });
  }

  return unique.map((lead, idx) => ({
    ...lead,
    id: `LEAD-VRV-${String(idx + 1).padStart(3, '0')}`,
  }));
}

/**
 * Checks whether the shipping method is VORVAN's Face-to-Face Hand-Delivery COD
 * (pertemuan tatap muka langsung tanpa resi ekspedisi).
 */
export function isCodShippingMethod(
  shippingMethod?: string,
  awbNumber?: string
): boolean {
  const upperMethod = (shippingMethod || '').toUpperCase();
  const upperAwb = (awbNumber || '').trim().toUpperCase();
  return (
    upperMethod.includes('COD') ||
    upperMethod.includes('TATAP MUKA') ||
    upperMethod.includes('INTERNAL') ||
    upperAwb.startsWith('COD-')
  );
}

/**
 * Checks whether an expedition order has a valid AWB / Nomor Resi entered by Admin.
 * Returns false for COD (which is face-to-face) and false when AWB is still empty/pending.
 */
export function hasValidCourierAwb(order: {
  shippingMethod?: string;
  awbNumber?: string;
}): boolean {
  if (isCodShippingMethod(order.shippingMethod, order.awbNumber)) {
    return false;
  }
  const cleanAwb = (order.awbNumber || '').trim();
  return cleanAwb.length > 0;
}

export function loadVorvanSettings(): VorvanSiteSettings {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(VORVAN_SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<VorvanSiteSettings> & {
          briNumber?: string;
        };
        const resolvedBriAccount = (
          parsed.briAccount ||
          parsed.briNumber ||
          ''
        ).trim();
        const resolvedBriHolder = (parsed.briHolder || '').trim();
        const resolvedBriSwift = (parsed.briSwift || '').trim();

        const merged: VorvanSiteSettings = {
          ...DEFAULT_VORVAN_SETTINGS,
          ...parsed,
          briAccount: resolvedBriAccount || DEFAULT_VORVAN_SETTINGS.briAccount,
          briHolder: resolvedBriHolder || DEFAULT_VORVAN_SETTINGS.briHolder,
          briSwift: resolvedBriSwift || DEFAULT_VORVAN_SETTINGS.briSwift,
        };

        if (!resolvedBriAccount || !resolvedBriHolder || !resolvedBriSwift) {
          window.localStorage.setItem(
            VORVAN_SETTINGS_STORAGE_KEY,
            JSON.stringify(merged)
          );
        }

        return merged;
      }
    }
  } catch {
    // Fallback to default settings
  }
  return { ...DEFAULT_VORVAN_SETTINGS };
}

export function saveVorvanSettings(settings: VorvanSiteSettings): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        VORVAN_SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
      );
    }
  } catch {
    // Ignore storage errors
  }
}

export function loadCustomAdminOrders(): CustomAdminOrder[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(VORVAN_CUSTOM_ORDERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const proofsMap = loadPaymentProofsMap();
          return (parsed as CustomAdminOrder[]).map((o) => {
            const invKey = (o.invoiceId || '').trim().toUpperCase();
            const storedProof = proofsMap[invKey];
            const proofImg =
              o.paymentProof || o.paymentProofUrl || storedProof?.proofUrl;
            if (proofImg) {
              return {
                ...o,
                status: 'PAID' as const,
                paymentProof: proofImg,
                paymentProofUrl: proofImg,
                paymentProofUploadedAt:
                  o.paymentProofUploadedAt || storedProof?.uploadedAt,
                shippingStage: Math.min(
                  4,
                  Math.max(o.shippingStage || 2, 3)
                ) as 1 | 2 | 3 | 4,
              };
            }
            return o;
          });
        }
      }
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

export function saveCustomAdminOrders(orders: CustomAdminOrder[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        VORVAN_CUSTOM_ORDERS_STORAGE_KEY,
        JSON.stringify(orders)
      );
    }
  } catch {
    // Ignore storage errors
  }
}

export const VORVAN_PAYMENT_PROOFS_STORAGE_KEY = 'vorvan_payment_proofs_v1';

export interface PaymentProofRecord {
  proofUrl: string;
  uploadedAt: string;
  ts: number;
}

const memoryProofsMap: Record<string, PaymentProofRecord> = {};

export function loadPaymentProofsMap(): Record<string, PaymentProofRecord> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(VORVAN_PAYMENT_PROOFS_STORAGE_KEY);
      if (raw) {
        return { ...memoryProofsMap, ...JSON.parse(raw) };
      }
    }
  } catch {
    // ignore
  }
  return { ...memoryProofsMap };
}

export function savePaymentProofRecord(
  invoiceId: string,
  proofUrl: string,
  uploadedAt: string
): void {
  const cleanId = invoiceId.trim().toUpperCase();
  if (!cleanId) return;
  memoryProofsMap[cleanId] = {
    proofUrl,
    uploadedAt,
    ts: Date.now(),
  };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const current = loadPaymentProofsMap();
      current[cleanId] = {
        proofUrl,
        uploadedAt,
        ts: Date.now(),
      };
      window.localStorage.setItem(
        VORVAN_PAYMENT_PROOFS_STORAGE_KEY,
        JSON.stringify(current)
      );
    }
  } catch {
    // ignore
  }
}

export function removePaymentProofRecord(invoiceId: string): void {
  const cleanId = (invoiceId || '').trim().toUpperCase();
  if (!cleanId) return;
  delete memoryProofsMap[cleanId];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const current = loadPaymentProofsMap();
      delete current[cleanId];
      window.localStorage.setItem(
        VORVAN_PAYMENT_PROOFS_STORAGE_KEY,
        JSON.stringify(current)
      );
    }
  } catch {
    // ignore
  }
}

/**
 * Strictly finds the target invoice in `orders` by exact unique `invoiceId` (or its exact AWB/trackingId),
 * sets status to `PAID` (LUNAS), advances `shippingStage`, and attaches the compressed `paymentProof` Base64 string.
 * Never modifies or marks PAID any other customer's invoice.
 */
export function applyPaymentProofToOrders(
  orders: CustomAdminOrder[],
  invoiceId: string,
  proofBase64: string,
  uploadedAt: string
): {
  updatedOrders: CustomAdminOrder[];
  matchedInvoiceIds: string[];
} {
  const cleanId = (invoiceId || '').trim().toUpperCase();
  if (!cleanId || !proofBase64) {
    return {
      updatedOrders: orders,
      matchedInvoiceIds: [],
    };
  }

  savePaymentProofRecord(cleanId, proofBase64, uploadedAt);

  const matchedIndexes = new Set<number>();

  // Strict exact match by unique invoiceId (or exact AWB/trackingId of that order)
  orders.forEach((o, idx) => {
    const oInv = (o.invoiceId || '').trim().toUpperCase();
    const oAwb = (o.awbNumber || '').trim().toUpperCase();
    const oTrk = (o.trackingId || '').trim().toUpperCase();
    if (oInv === cleanId || oAwb === cleanId || oTrk === cleanId) {
      matchedIndexes.add(idx);
    }
  });

  const matchedInvoiceIds: string[] = [];
  const updatedOrders = orders.map((o, idx) => {
    if (!matchedIndexes.has(idx)) return o;
    const nextStage = Math.min(
      4,
      Math.max((o.shippingStage || 2) + 1, 3)
    ) as 1 | 2 | 3 | 4;
    matchedInvoiceIds.push(o.invoiceId);
    savePaymentProofRecord(o.invoiceId, proofBase64, uploadedAt);
    return {
      ...o,
      status: 'PAID' as const,
      paymentProof: proofBase64,
      paymentProofUrl: proofBase64,
      paymentProofUploadedAt: uploadedAt,
      shippingStage: nextStage,
    };
  });

  return {
    updatedOrders,
    matchedInvoiceIds,
  };
}

/**
 * Compresses an uploaded payment transfer proof image using HTML5 Canvas (max-width: 400px, JPEG quality: 0.5)
 * to produce a compact Base64 data URL that persists cleanly across localStorage and Cloud Sync.
 */
export function compressPaymentProofImage(
  file: File,
  maxWidth: number = 400,
  quality: number = 0.5
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || (file.type && !file.type.startsWith('image/'))) {
      reject(new Error('File yang diunggah harus berupa file gambar (JPG/PNG).'));
      return;
    }
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memproses file gambar.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        // Fill white background for transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function formatInquiryMessage(
  fragrance: Pick<FragranceItem, 'house' | 'name' | 'concentration'> & {
    gender?: GenderCategory;
    defaultVolume?: string;
  },
  selectedVolume?: string,
  customNote?: string,
  registeredEmail?: string
): string {
  const volumeLabel = selectedVolume || fragrance.defaultVolume || '100ml';
  const genderLabel =
    fragrance.gender === 'GENTLEMAN'
      ? 'Gentleman (Men)'
      : fragrance.gender === 'FEMME'
      ? 'Femme (Women)'
      : fragrance.gender === 'UNISEX'
      ? 'Unisex'
      : 'Luxury Collection';
  const emailPart = registeredEmail?.trim()
    ? `\n• Email Klien Terdaftar: ${registeredEmail.trim()}`
    : '';
  const extraPart = customNote?.trim()
    ? `\n• Catatan Khusus: ${customNote.trim()}`
    : '';
  return (
    `Halo Concierge VORVAN, saya tertarik untuk mengecek ketersediaan & penawaran harga privat (Private Quotation) untuk koleksi berikut:\n\n` +
    `• Merk: ${fragrance.house}\n` +
    `• Tipe Parfum: ${fragrance.name} (${fragrance.concentration})\n` +
    `• Gender: ${genderLabel}\n` +
    `• Ukuran: ${volumeLabel}${emailPart}${extraPart}\n\n` +
    `Mohon informasi alokasi stok dan penawaran terbaiknya (Privilege Efisiensi Valuasi 20%–30%). Terima kasih.`
  );
}

/**
 * Generates an official WhatsApp inquiry link with an automated luxury concierge message
 * containing the selected fragrance name, house, concentration, volume, and registered client email.
 */
export function buildWhatsAppInquiryUrl(
  fragrance: Pick<FragranceItem, 'house' | 'name' | 'concentration'> & {
    gender?: GenderCategory;
    defaultVolume?: string;
  },
  selectedVolume?: string,
  customNote?: string,
  registeredEmail?: string,
  overrideWaNumber?: string
): string {
  const message = formatInquiryMessage(
    fragrance,
    selectedVolume,
    customNote,
    registeredEmail
  );
  const rawWa = (
    overrideWaNumber ||
    loadVorvanSettings().whatsappNumber ||
    VORVAN_WHATSAPP_NUMBER
  ).replace(/\D/g, '');
  const normalizedWa = rawWa.startsWith('0')
    ? `62${rawWa.slice(1)}`
    : rawWa || VORVAN_WHATSAPP_NUMBER;

  return `https://wa.me/${normalizedWa}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates an official Telegram VIP Concierge inquiry link (@vorvanofficial) with pre-filled message text.
 */
export function buildTelegramInquiryUrl(
  fragrance: Pick<FragranceItem, 'house' | 'name' | 'concentration'> & {
    gender?: GenderCategory;
    defaultVolume?: string;
  },
  selectedVolume?: string,
  customNote?: string,
  registeredEmail?: string,
  overrideTelegramUsername?: string
): string {
  const message = formatInquiryMessage(
    fragrance,
    selectedVolume,
    customNote,
    registeredEmail
  );
  const cleanUser = (
    overrideTelegramUsername ||
    loadVorvanSettings().telegramUsername ||
    VORVAN_TELEGRAM_USERNAME
  )
    .trim()
    .replace(/^@/, '');

  return `https://t.me/${cleanUser}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a deterministic key for a fragrance + volume combination in the Private Selection Tray.
 */
export function buildPrivateTrayKey(
  fragranceId: string,
  volume: string
): string {
  return `${fragranceId.trim()}__${volume.trim()}`;
}

/**
 * Checks whether a specific fragrance + volume is currently in the Private Selection Tray.
 */
export function isFragranceInPrivateTray(
  items: PrivateTrayItem[],
  fragranceId: string,
  volume: string
): boolean {
  const targetKey = buildPrivateTrayKey(fragranceId, volume);
  return items.some((entry) => entry.key === targetKey);
}

/**
 * Toggles a fragrance + volume in the Private Selection Tray.
 * If already present, removes it; otherwise adds it with quantity = 1.
 */
export function togglePrivateTrayItem(
  items: PrivateTrayItem[],
  fragrance: FragranceItem,
  volume: string
): { nextItems: PrivateTrayItem[]; added: boolean } {
  const cleanVolume = volume.trim() || fragrance.defaultVolume;
  const key = buildPrivateTrayKey(fragrance.id, cleanVolume);
  const exists = items.some((entry) => entry.key === key);

  if (exists) {
    return {
      nextItems: items.filter((entry) => entry.key !== key),
      added: false,
    };
  }

  return {
    nextItems: [
      ...items,
      {
        key,
        fragrance,
        volume: cleanVolume,
        quantity: 1,
      },
    ],
    added: true,
  };
}

/**
 * Updates the quantity of an item in the Private Selection Tray by delta (+1 or -1).
 * If quantity drops to 0 or below, removes the item from the tray.
 */
export function updatePrivateTrayQuantity(
  items: PrivateTrayItem[],
  key: string,
  delta: number
): PrivateTrayItem[] {
  return items
    .map((entry) => {
      if (entry.key !== key) return entry;
      return {
        ...entry,
        quantity: entry.quantity + delta,
      };
    })
    .filter((entry) => entry.quantity > 0);
}

/**
 * Generates an official WhatsApp multi-fragrance bundle inquiry URL from the Private Selection Tray.
 */
export function buildWhatsAppTrayInquiryUrl(
  items: PrivateTrayItem[],
  clientNote?: string,
  registeredEmail?: string
): string {
  const totalFlacons = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemizedLines = items
    .map(
      (entry, idx) =>
        `${idx + 1}. ${entry.fragrance.house} — ${entry.fragrance.name} (${entry.fragrance.concentration}, ${entry.volume}) × ${entry.quantity} flacon [Batch #${entry.fragrance.batchCode}]`
    )
    .join('\n');

  const emailPart = registeredEmail?.trim()
    ? `\n• Email Klien Terdaftar: ${registeredEmail.trim()}`
    : '';
  const notePart = clientNote?.trim()
    ? `\n• Catatan Kurasi Klien: ${clientNote.trim()}`
    : '';

  const message =
    `Halo Concierge VORVAN, saya ingin meminta penawaran harga paket privat (Private Tray Bundle Quotation) untuk ${items.length} varian (${totalFlacons} flacon) berikut:\n\n` +
    `${itemizedLines}\n` +
    `${emailPart}${notePart}\n\n` +
    `Mohon informasi ketersediaan alokasi di Vault beserta estimasi penawaran paket terbaiknya. Terima kasih.`;

  return `https://wa.me/${VORVAN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Filters the VORVAN fragrance catalog by Brand House and optional Gender category
 * (GENTLEMAN, FEMME, UNISEX).
 */
export function filterFragrancesByBrandAndGender(
  brandId: BrandHouseId,
  gender: GenderCategory | 'ALL'
): FragranceItem[] {
  return FRAGRANCE_CATALOG.filter((item) => {
    if (item.brandId !== brandId) return false;
    if (gender === 'ALL') return true;
    return item.gender === gender;
  });
}

/**
 * Validates a single-field passwordless Concierge Email input.
 */
export function validateConciergeEmail(email: string): {
  valid: boolean;
  normalizedEmail: string;
  error?: string;
} {
  const clean = email.trim().toLowerCase();
  if (!clean) {
    return {
      valid: false,
      normalizedEmail: '',
      error: 'Mohon masukkan alamat email aktif Anda untuk membuka akses penawaran privat.',
    };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(clean)) {
    return {
      valid: false,
      normalizedEmail: clean,
      error: 'Format alamat email belum sesuai (contoh: nama@domain.com).',
    };
  }
  return {
    valid: true,
    normalizedEmail: clean,
  };
}

/**
 * Generates a WhatsApp link for Niche Pre-Order Concierge requests (e.g., Xerjoff, Amouage).
 */
export function buildPreOrderWhatsAppUrl(params: {
  clientName: string;
  house: string;
  fragranceName: string;
  volume: string;
  notes?: string;
}): string {
  const cleanName = params.clientName.trim();
  const cleanHouse = params.house.trim();
  const cleanFragrance = params.fragranceName.trim();
  const cleanVolume = params.volume.trim() || '100 ml';
  const noteLine = params.notes?.trim()
    ? `\n• Catatan Khusus: ${params.notes.trim()}`
    : '';

  const message =
    `Halo Concierge Pre-Order VORVAN, saya ingin mengajukan permintaan Private Sourcing / Pre-Order Niche:\n\n` +
    `• Nama Klien: ${cleanName}\n` +
    `• Fragrance House: ${cleanHouse}\n` +
    `• Nama Parfum: ${cleanFragrance} (${cleanVolume})${noteLine}\n\n` +
    `Mohon informasi estimasi waktu kedatangan kargo dan kuotasi harganya.`;

  return `https://wa.me/${VORVAN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Formats integer Rupiah values into clean Indonesian currency representation.
 */
export function formatIDRCurrency(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return rounded < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

/**
 * Calculates itemized subtotal and grand total for a Private Invoice.
 */
export function calculateInvoiceTotals(invoice: PrivateInvoice): {
  itemsSubtotalIDR: number;
  protectionTotalIDR: number;
  grandTotalIDR: number;
} {
  const itemsSubtotalIDR = invoice.items.reduce(
    (sum, item) => sum + item.unitPriceIDR * item.quantity,
    0
  );
  const protectionTotalIDR =
    invoice.shippingInsuranceIDR + invoice.woodenCratePackagingIDR;
  const grandTotalIDR = itemsSubtotalIDR + protectionTotalIDR;

  return {
    itemsSubtotalIDR,
    protectionTotalIDR,
    grandTotalIDR,
  };
}

function toBase64Url(raw: string): string {
  const bytes = new TextEncoder().encode(raw);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 =
    typeof window !== 'undefined' && typeof window.btoa === 'function'
      ? window.btoa(binary)
      : Buffer.from(bytes).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): string {
  const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    const binary = window.atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(padded, 'base64').toString('utf-8');
}

function encodeCourierShort(method: ShippingMethodType): string {
  const upper = (method || '').toUpperCase();
  if (
    upper.includes('COD') ||
    upper.includes('TATAP MUKA') ||
    upper.includes('INTERNAL')
  ) {
    return 'COD';
  }
  if (upper.includes('J&T') || upper.includes('JNT')) return 'JNT';
  if (upper.includes('SICEPAT') || upper === 'SCP') return 'SCP';
  if (upper.includes('PAXEL') || upper === 'PXL') return 'PXL';
  if (upper.includes('POS')) return 'POS';
  if (upper.includes('ANTERAJA') || upper === 'ANT') return 'ANT';
  return 'JNE';
}

function decodeCourierShort(code: string): ShippingMethodType {
  const clean = (code || '').trim().toUpperCase();
  if (
    clean === '5' ||
    clean === 'COD' ||
    clean.includes('TATAP MUKA') ||
    clean.includes('INTERNAL')
  ) {
    return 'COD / Tatap Muka';
  }
  if (clean === '1' || clean === 'JNT' || clean.includes('J&T')) {
    return 'J&T Express';
  }
  if (clean === '2' || clean === 'SCP' || clean.includes('SICEPAT')) {
    return 'SiCepat';
  }
  if (clean === '3' || clean === 'PXL' || clean.includes('PAXEL')) {
    return 'Paxel';
  }
  if (clean === '6' || clean === 'POS' || clean.includes('POS')) {
    return 'Pos Indonesia';
  }
  if (clean === '4' || clean === 'ANT' || clean.includes('ANTERAJA')) {
    return 'Anteraja';
  }
  return 'JNE';
}

/**
 * Encodes a CustomAdminOrder into an ultra-short pipe-delimited Base64url string for `?v=...`
 * Format: `invShort|fragIdx|priceInThousands|statusDigit|courierShort|awb|buyerName|buyerCity`
 * Example: `9750|0|3850|0|JNE|AWB|Nama|Kota`
 */
export function encodeSmartOrderParam(order: CustomAdminOrder): string {
  const sanitize = (val: string) => (val || '').replace(/\|/g, '/').trim();

  const rawInv = sanitize(order.invoiceId).toUpperCase();
  const invShort = rawInv.startsWith('INV-VRV-')
    ? rawInv.slice('INV-VRV-'.length)
    : rawInv;

  const exactIdx = FRAGRANCE_CATALOG.findIndex(
    (f) =>
      f.name.toLowerCase() === (order.fragranceName || '').trim().toLowerCase() &&
      f.house.toLowerCase() === (order.house || '').trim().toLowerCase()
  );
  const catalogIdx =
    exactIdx >= 0
      ? exactIdx
      : FRAGRANCE_CATALOG.findIndex(
          (f) =>
            f.name.toLowerCase() ===
            (order.fragranceName || '').trim().toLowerCase()
        );

  let fragField = '0';
  if (catalogIdx >= 0) {
    const item = FRAGRANCE_CATALOG[catalogIdx];
    const cleanVol = sanitize(order.volume || item.defaultVolume);
    const isDefaultVol =
      cleanVol.replace(/\s+/g, '').toLowerCase() ===
      item.defaultVolume.replace(/\s+/g, '').toLowerCase();
    fragField = isDefaultVol ? String(catalogIdx) : `${catalogIdx}:${cleanVol}`;
  } else {
    fragField = `~${sanitize(order.house)}~${sanitize(
      order.fragranceName
    )}~${sanitize(order.volume || '100ml')}`;
  }

  const priceK = Math.max(1, Math.round((order.dealPriceIDR || 0) / 1000));
  const priceField =
    typeof order.shippingCostIDR === 'number'
      ? `${priceK}:${Math.max(0, Math.round(order.shippingCostIDR / 1000))}`
      : String(priceK);
  const statusDigit = order.status === 'PAID' ? '1' : '0';
  const courierCode = encodeCourierShort(order.shippingMethod);
  const awb = isCodShippingMethod(order.shippingMethod, order.awbNumber)
    ? ''
    : sanitize(order.awbNumber || '');
  const buyer = sanitize(order.buyerName);
  const city = sanitize(order.buyerCity);

  const compactPipe = [
    invShort,
    fragField,
    priceField,
    statusDigit,
    courierCode,
    awb,
    buyer,
    city,
    sanitize(order.buyerEmail || ''),
    sanitize(order.buyerPhone || ''),
  ].join('|');

  return toBase64Url(compactPipe);
}

/**
 * Resolves official VORVAN 81 SKU pricing & discount metadata by catalog index (0..80),
 * fragrance ID, or brand/perfume name.
 */
export function resolveVorvanSkuPricing(
  catalogIdxOrIdOrName: number | string
): VorvanSkuPricingEntry | null {
  if (typeof catalogIdxOrIdOrName === 'number') {
    return VORVAN_81_CATALOG[catalogIdxOrIdOrName] || null;
  }

  const clean = (catalogIdxOrIdOrName || '').trim();
  if (!clean) return null;

  const byCatalogIdIdx = FRAGRANCE_CATALOG.findIndex((f) => f.id === clean);
  if (byCatalogIdIdx >= 0 && VORVAN_81_CATALOG[byCatalogIdIdx]) {
    return VORVAN_81_CATALOG[byCatalogIdIdx];
  }

  const lower = clean.toLowerCase();
  const exactMatch = VORVAN_81_CATALOG.find(
    (p) =>
      `${p.brand} - ${p.name}`.toLowerCase() === lower ||
      `${p.brand} — ${p.name}`.toLowerCase() === lower ||
      p.name.toLowerCase() === lower
  );
  if (exactMatch) return exactMatch;

  // Prefer catalog item whose name contains the query (e.g. "Baccarat Rouge 540 Extrait" -> "Baccarat Rouge 540 Extrait de Parfum")
  const byCatalogContainsIdx = FRAGRANCE_CATALOG.findIndex(
    (f) =>
      f.name.toLowerCase() === lower ||
      `${f.house} - ${f.name}`.toLowerCase() === lower ||
      `${f.house} — ${f.name}`.toLowerCase() === lower ||
      f.name.toLowerCase().includes(lower)
  );
  if (byCatalogContainsIdx >= 0 && VORVAN_81_CATALOG[byCatalogContainsIdx]) {
    return VORVAN_81_CATALOG[byCatalogContainsIdx];
  }

  const bySkuContains = VORVAN_81_CATALOG.find((p) =>
    p.name.toLowerCase().includes(lower)
  );
  if (bySkuContains) return bySkuContains;

  // Fallback: longest SKU name that is contained inside `lower`
  const reverseMatches = VORVAN_81_CATALOG.filter((p) =>
    lower.includes(p.name.toLowerCase())
  ).sort((a, b) => b.name.length - a.name.length);
  return reverseMatches[0] || null;
}

/**
 * Auto-detects the flat shipping zone & cost based on the buyer's city or address text.
 */
export function autoDetectShippingZoneByCity(addressText: string): {
  zoneKey: ShippingZoneKey;
  label: string;
  cost: number;
} | null {
  const txt = (addressText || '').toLowerCase().trim();
  if (!txt) return null;

  if (/brebes|tegal|slawi|pemalang|cod/.test(txt)) {
    return { zoneKey: 'FREE_VIP', ...SHIPPING_ZONES.FREE_VIP };
  }
  if (
    /jakarta|bogor|depok|tangerang|bekasi|bandung|semarang|solo|jogja|yogyakarta|surabaya|malang|cirebon|purwokerto|pekalongan|jawa/.test(
      txt
    )
  ) {
    return { zoneKey: 'ZONA_1', ...SHIPPING_ZONES.ZONA_1 };
  }
  if (
    /bali|denpasar|medan|palembang|lampung|pekanbaru|batam|padang|pontianak|balikpapan|samarinda|banjarmasin|sumatera|kalimantan/.test(
      txt
    )
  ) {
    return { zoneKey: 'ZONA_2', ...SHIPPING_ZONES.ZONA_2 };
  }
  if (/makassar|manado|palu|kendari|lombok|mataram|kupang|sulawesi|ntb|ntt/.test(txt)) {
    return { zoneKey: 'ZONA_3', ...SHIPPING_ZONES.ZONA_3 };
  }
  if (/ambon|ternate|jayapura|sorong|merauke|timika|maluku|papua/.test(txt)) {
    return { zoneKey: 'ZONA_4', ...SHIPPING_ZONES.ZONA_4 };
  }
  return null;
}

/**
 * Filters the 81 SKU Cheat Sheet by search query and tier (ALL, 1..5).
 */
export function filterVorvanCheatSheet(
  searchQuery: string = '',
  tierFilter: string = 'ALL'
): VorvanSkuPricingEntry[] {
  const q = (searchQuery || '').toLowerCase().trim();
  return VORVAN_81_CATALOG.filter((item) => {
    const matchText =
      !q ||
      `${item.brand} ${item.name} ${item.gender} ${item.size}`
        .toLowerCase()
        .includes(q);
    const matchTier =
      !tierFilter ||
      tierFilter === 'ALL' ||
      String(item.tier) === String(tierFilter);
    return matchText && matchTier;
  });
}

/**
 * Decodes an ultra-short Base64url `?v=...` parameter (or legacy `?order=...` JSON) back into a CustomAdminOrder.
 */
export function decodeSmartOrderParam(encoded: string): CustomAdminOrder | null {
  try {
    const clean = encoded.trim();
    if (!clean) return null;

    // 1. Try decoding compact pipe-delimited format (`invShort|fragIdx|priceK|status|courier|awb|name|city`)
    try {
      const rawPipe = fromBase64Url(clean);
      if (rawPipe.includes('|')) {
        const parts = rawPipe.split('|');
        if (parts.length >= 7) {
          const [
            rawInvShort,
            fragField,
            priceKStr,
            statusDigit,
            courierCode,
            rawAwb,
            rawBuyer,
            rawCity = 'Indonesia',
            rawEmail = '',
            rawPhone = '',
          ] = parts;

          const invTrim = (rawInvShort || '').trim().toUpperCase();
          if (!invTrim || !(rawBuyer || '').trim()) return null;

          const invoiceId = invTrim.startsWith('INV-')
            ? invTrim
            : `INV-VRV-${invTrim}`;

          let house = 'Louis Vuitton';
          let fragranceName = 'Afternoon Swim';
          let concentration = 'Eau de Parfum';
          let volume = '100ml';
          let batchCode = `VRV-${invTrim}`;
          let resolvedSku: VorvanSkuPricingEntry | null = null;

          if (fragField.startsWith('~')) {
            const customParts = fragField.slice(1).split('~');
            house = customParts[0] || 'VORVAN Private Selection';
            fragranceName = customParts[1] || 'Bespoke Fragrance';
            volume = customParts[2] || '100ml';
            resolvedSku = resolveVorvanSkuPricing(fragranceName);
          } else {
            const [idxPart, customVol] = fragField.split(':');
            const idx = parseInt(idxPart, 10);
            const safeIdx =
              !Number.isNaN(idx) && FRAGRANCE_CATALOG[idx] ? idx : 0;
            const item = FRAGRANCE_CATALOG[safeIdx];
            resolvedSku = resolveVorvanSkuPricing(safeIdx);
            if (item) {
              house = item.house;
              fragranceName = item.name;
              concentration = item.concentration;
              volume = customVol || resolvedSku?.size || item.defaultVolume;
              batchCode = item.batchCode;
            }
          }

          const [dealKPart, shipKPart] = (priceKStr || '').split(':');
          const dealPriceIDR = Math.round((Number(dealKPart) || 0) * 1000);
          const status: 'PENDING_PAYMENT' | 'PAID' =
            statusDigit === '1' ? 'PAID' : 'PENDING_PAYMENT';
          const shippingMethod = decodeCourierShort(courierCode);
          const isCod = isCodShippingMethod(shippingMethod, rawAwb);
          const awbNumber = isCod ? '' : (rawAwb || '').trim();

          const cleanCity = (rawCity || 'Indonesia').trim();
          const detectedZone = autoDetectShippingZoneByCity(cleanCity);
          const shippingCostIDR =
            shipKPart !== undefined && shipKPart !== ''
              ? Math.max(0, Math.round((Number(shipKPart) || 0) * 1000))
              : isCod
              ? 0
              : detectedZone?.cost ?? 0;

          const matchingZoneEntry = Object.values(SHIPPING_ZONES).find(
            (z) => z.cost === shippingCostIDR
          );
          const shippingLabel =
            detectedZone && detectedZone.cost === shippingCostIDR
              ? detectedZone.label
              : matchingZoneEntry?.label ||
                (shippingCostIDR === 0
                  ? SHIPPING_ZONES.FREE_VIP.label
                  : 'Pengiriman Berasuransi & Double-Wall Thermal Box');

          const finalDealPrice =
            dealPriceIDR > 0
              ? dealPriceIDR
              : resolvedSku?.price || 3850000;
          const retailPriceIDR =
            resolvedSku && resolvedSku.retail > finalDealPrice
              ? resolvedSku.retail
              : Math.round(finalDealPrice / 0.72);
          const discountPct =
            resolvedSku && resolvedSku.price === finalDealPrice
              ? resolvedSku.disc
              : Math.max(
                  1,
                  Math.round(
                    ((retailPriceIDR - finalDealPrice) / retailPriceIDR) * 100
                  )
                );

          return {
            invoiceId,
            trackingId: awbNumber || invoiceId,
            createdAt: 'Terverifikasi · WIB',
            buyerName: rawBuyer.trim(),
            buyerCity: cleanCity,
            buyerEmail: rawEmail.trim() || undefined,
            buyerPhone: rawPhone.trim() || undefined,
            house,
            fragranceName,
            concentration,
            volume,
            batchCode,
            dealPriceIDR: finalDealPrice,
            retailPriceIDR,
            discountPct,
            shippingCostIDR,
            shippingLabel,
            shippingMethod,
            awbNumber,
            status,
          };
        }
      }
    } catch {
      // Fallback to legacy JSON decoder below
    }

    // 2. Fallback: Legacy JSON + encodeURIComponent decoder
    let decodedUri = '';
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      decodedUri = window.atob(clean);
    } else {
      decodedUri = Buffer.from(clean, 'base64').toString('utf-8');
    }
    const json = decodeURIComponent(decodedUri);
    const parsed = JSON.parse(json) as CustomAdminOrder;
    if (parsed && parsed.invoiceId && parsed.buyerName) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Automatically detects the base domain for official invoice and tracking links.
 * When running in AI Studio, Google User Content, or local development, defaults to the official
 * production deployment (https://vorvan-official.vercel.app).
 * When running on custom domains (.com, .id, or custom production hosts), dynamically adopts window.location.origin.
 */
export function getVorvanBaseDomain(): string {
  if (typeof window === 'undefined') {
    return 'https://vorvan-official.vercel.app';
  }
  const hostname = window.location.hostname || '';
  return (
    hostname.includes('aistudio') ||
    hostname.includes('googleusercontent') ||
    hostname === 'localhost'
  )
    ? 'https://vorvan-official.vercel.app'
    : window.location.origin;
}

/**
 * Generates an ultra-short Smart Shareable URL (`?v=...`) for WhatsApp/Telegram.
 * Uses dynamic domain detection so moving to custom domains (.com / .id) works seamlessly.
 */
export function buildSmartShareUrl(
  order: CustomAdminOrder,
  mode: 'invoice' | 'track',
  originOverride?: string
): string {
  const token = encodeSmartOrderParam(order);
  const origin = originOverride || getVorvanBaseDomain();
  if (mode === 'invoice') {
    return `${origin}/pay/${order.invoiceId.trim().toUpperCase()}?v=${token}`;
  }
  const trackCode = (order.awbNumber || order.trackingId || order.invoiceId).trim();
  return `${origin}/track/${encodeURIComponent(trackCode)}?v=${token}`;
}

/**
 * Normalizes an Indonesian phone number to E.164 without plus (e.g., '0812...' -> '62812...').
 */
export function normalizeIndonesianPhoneNumber(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith('62')) {
    return digits;
  }
  return `62${digits}`;
}

/**
 * Generates an official luxury 1-Click WhatsApp link targeting the buyer's phone number directly
 * with a pre-filled luxury invoice greeting, item details, grand total, official invoice link,
 * and live tracking link using automatic domain detection.
 */
export function buildBuyerInvoiceWhatsAppUrl(
  order: CustomAdminOrder,
  originOverride?: string
): string {
  const baseDomain = originOverride || getVorvanBaseDomain();
  const invoiceUrl = buildSmartShareUrl(order, 'invoice', baseDomain);
  const trackUrl = buildSmartShareUrl(order, 'track', baseDomain);
  const grandTotal =
    order.dealPriceIDR + (order.shippingCostIDR || 0);
  const formattedTotal = formatIDRCurrency(grandTotal);

  const normalizedPhone = normalizeIndonesianPhoneNumber(order.buyerPhone || '');

  const isCod = isCodShippingMethod(order.shippingMethod, order.awbNumber);
  const hasAwb = hasValidCourierAwb(order);
  const shippingSummaryLine = isCod
    ? `• Metode Serah Terima: 🤝 COD / Serah Terima Tatap Muka Langsung (Tanpa Resi Ekspedisi)`
    : hasAwb
    ? `• Ekspedisi: ${order.shippingMethod} (AWB: ${order.awbNumber})`
    : `• Ekspedisi: ${order.shippingMethod} (Resi menyusul setelah pembayaran lunas & barang dikirim)`;

  const message =
    `Yth. ${order.buyerName},\n\n` +
    `Terima kasih telah mempercayakan alokasi parfum niche & koleksi eksklusif Anda kepada VORVAN.\n\n` +
    `Berikut rincian Tagihan Resmi Privat & Pengiriman Anda:\n` +
    `• Nomor Tagihan: #${order.invoiceId}\n` +
    `• Flacon Parfum: ${order.house} — ${order.fragranceName} (${order.volume})\n` +
    `• Total Tagihan: ${formattedTotal}\n` +
    `${shippingSummaryLine}\n\n` +
    `Silakan klik tautan resmi berikut untuk melihat dokumen tagihan, panduan pembayaran, dan jaminan keaslian:\n` +
    `👉 Link Tagihan Resmi: ${invoiceUrl}\n\n` +
    `Pantau status pesanan Anda secara langsung:\n` +
    `👉 Link Status Pesanan: ${trackUrl}\n\n` +
    `Hormat kami,\n` +
    `VORVAN Official Concierge\n` +
    `Haute Parfumerie & Olfactory Vault`;

  const phoneTarget = normalizedPhone || VORVAN_WHATSAPP_NUMBER;
  return `https://wa.me/${phoneTarget}?text=${encodeURIComponent(message)}`;
}

export function buildInvoiceFromCustomOrder(
  order: CustomAdminOrder
): PrivateInvoice {
  const skuPricing = resolveVorvanSkuPricing(order.fragranceName);
  const dealPrice = order.dealPriceIDR || skuPricing?.price || 3850000;
  const retailPriceTotalIDR =
    order.retailPriceIDR && order.retailPriceIDR > dealPrice
      ? order.retailPriceIDR
      : skuPricing && skuPricing.retail > dealPrice
      ? skuPricing.retail
      : Math.round(dealPrice / 0.72);
  const discountPct =
    order.discountPct && order.discountPct > 0
      ? order.discountPct
      : skuPricing && skuPricing.price === dealPrice
      ? skuPricing.disc
      : Math.max(
          1,
          Math.round(((retailPriceTotalIDR - dealPrice) / retailPriceTotalIDR) * 100)
        );

  const isCod = isCodShippingMethod(order.shippingMethod, order.awbNumber);
  const hasAwb = hasValidCourierAwb(order);
  const detectedZone = autoDetectShippingZoneByCity(order.buyerCity);
  const shippingInsuranceIDR =
    typeof order.shippingCostIDR === 'number'
      ? order.shippingCostIDR
      : isCod
      ? 0
      : detectedZone?.cost ?? 0;

  const shippingLabel =
    order.shippingLabel ||
    detectedZone?.label ||
    (shippingInsuranceIDR === 0
      ? SHIPPING_ZONES.FREE_VIP.label
      : 'Pengiriman Berasuransi & Double-Wall Thermal Box');

  const resolvedProof = order.paymentProof || order.paymentProofUrl;
  const resolvedStatus = resolvedProof ? 'PAID' : order.status || 'PENDING_PAYMENT';

  const shippingNoteText = isCod
    ? `Metode Penyerahan: ${COD_FACE_TO_FACE_STATUS_LABEL}.`
    : hasAwb
    ? `Metode Pengiriman: ${order.shippingMethod} (Resi: ${order.awbNumber}). Dilengkapi garansi klaim video unboxing utuh tanpa jeda.`
    : `Metode Pengiriman: ${order.shippingMethod} (Resi diisi menyusul setelah pembayaran lunas & barang dikirim). Dilengkapi garansi klaim video unboxing utuh tanpa jeda.`;

  return {
    invoiceId: order.invoiceId.toUpperCase(),
    createdAt: order.createdAt || 'Hari Ini · WIB',
    expiresAt: '24 Jam Sejak Diterbitkan',
    buyerName: order.buyerName,
    buyerPhoneMasked: 'Private VIP Client',
    buyerCity: order.buyerCity,
    conciergeAdvisor: 'VORVAN Official Concierge',
    status: resolvedStatus,
    paidAt:
      resolvedStatus === 'PAID'
        ? order.paymentProofUploadedAt || order.createdAt
        : undefined,
    paymentMethodUsed:
      resolvedStatus === 'PAID' ? 'Terverifikasi Concierge VORVAN' : undefined,
    shippingInsuranceIDR,
    woodenCratePackagingIDR: 0,
    retailPriceTotalIDR,
    discountPct,
    shippingLabel,
    paymentProof: resolvedProof,
    paymentProofUrl: resolvedProof,
    paymentProofUploadedAt: order.paymentProofUploadedAt,
    notes: shippingNoteText,
    items: [
      {
        sku: `VRV-${order.invoiceId.toUpperCase()}`,
        house: order.house,
        fragranceName: order.fragranceName,
        concentration: order.concentration || 'Eau de Parfum',
        volume: order.volume || skuPricing?.size || '100ml',
        batchCode: order.batchCode || 'VRV-AUTH',
        quantity: 1,
        unitPriceIDR: dealPrice,
      },
    ],
  };
}

export interface CourierIntegrationMetadata {
  displayName: string;
  binderbyteCode: string;
  officialTrackUrl: string;
  portalLabel: string;
  isInternalCod: boolean;
}

/**
 * Resolves official courier tracking portal link, Binderbyte courier code, and display label
 * for JNE, J&T Express, SiCepat, Paxel, Pos Indonesia, Anteraja, or COD / Tatap Muka.
 */
export function resolveCourierMetadata(
  shippingMethod: string,
  awbNumber: string = ''
): CourierIntegrationMetadata {
  const upper = (shippingMethod || '').toUpperCase();
  const cleanAwb = (awbNumber || '').trim();

  if (isCodShippingMethod(shippingMethod, awbNumber)) {
    const waMsg = `Halo VORVAN Official Concierge, saya ingin mengatur koordinasi jadwal COD / Serah Terima Tatap Muka Langsung untuk pesanan saya.`;
    return {
      displayName: 'COD / Tatap Muka Langsung',
      binderbyteCode: '',
      officialTrackUrl: `https://wa.me/${VORVAN_WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`,
      portalLabel: 'Koordinasi Jadwal Tatap Muka VORVAN (WhatsApp VIP)',
      isInternalCod: true,
    };
  }

  if (upper.includes('J&T') || upper.includes('JNT')) {
    return {
      displayName: 'J&T Express',
      binderbyteCode: 'jnt',
      officialTrackUrl: 'https://jet.co.id/track',
      portalLabel: 'Portal Pelacakan Resmi J&T Express',
      isInternalCod: false,
    };
  }

  if (upper.includes('SICEPAT')) {
    return {
      displayName: 'SiCepat',
      binderbyteCode: 'sicepat',
      officialTrackUrl: 'https://www.sicepat.com/checkAwb',
      portalLabel: 'Portal Pelacakan Resmi SiCepat Ekspres',
      isInternalCod: false,
    };
  }

  if (upper.includes('PAXEL')) {
    return {
      displayName: 'Paxel',
      binderbyteCode: 'paxel',
      officialTrackUrl: 'https://paxel.co/id/lacak-kiriman',
      portalLabel: 'Portal Pelacakan Resmi Paxel',
      isInternalCod: false,
    };
  }

  if (upper.includes('POS')) {
    return {
      displayName: 'Pos Indonesia',
      binderbyteCode: 'pos',
      officialTrackUrl: 'https://www.posindonesia.co.id/id/tracking',
      portalLabel: 'Portal Pelacakan Resmi Pos Indonesia',
      isInternalCod: false,
    };
  }

  if (upper.includes('ANTERAJA')) {
    return {
      displayName: 'Anteraja',
      binderbyteCode: 'anteraja',
      officialTrackUrl: 'https://anteraja.id/tracking',
      portalLabel: 'Portal Pelacakan Resmi Anteraja',
      isInternalCod: false,
    };
  }

  void cleanAwb;
  return {
    displayName: 'JNE',
    binderbyteCode: 'jne',
    officialTrackUrl: 'https://www.jne.co.id/id/tracking/trace',
    portalLabel: 'Portal Pelacakan Resmi JNE Express',
    isInternalCod: false,
  };
}

/**
 * Builds the Binderbyte real-time Indonesian courier tracking API endpoint URL.
 */
export function buildBinderbyteTrackUrl(
  apiKey: string,
  courierCode: string,
  awbNumber: string
): string {
  return `https://api.binderbyte.com/v1/track?api_key=${encodeURIComponent(
    apiKey.trim()
  )}&courier=${encodeURIComponent(
    courierCode.trim().toLowerCase()
  )}&awb=${encodeURIComponent(awbNumber.trim())}`;
}

function formatWibDateTimeFromMs(timestampMs: number): string {
  try {
    const d = new Date(timestampMs);
    const datePart = d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timePart = d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${datePart} · ${timePart} WIB`;
  } catch {
    return 'Terverifikasi Sistem · WIB';
  }
}

/**
 * Automatically computes the current shipping stage (1..4) based on elapsed time
 * since the AWB/order was issued by Admin — zero manual editing required.
 * Before AWB is filled (for non-COD orders), stays at Stage 1 (Menunggu Pembayaran / Sedang Dikemas).
 */
export function computeAutoShippingStage(
  order: CustomAdminOrder,
  nowMs: number = Date.now()
): 1 | 2 | 3 | 4 {
  if (isCodShippingMethod(order.shippingMethod, order.awbNumber)) {
    return order.status === 'PAID' || order.paymentProof ? 3 : 2;
  }

  if (!hasValidCourierAwb(order)) {
    return 1;
  }

  const issuedAtMs = order.createdAtTimestampMs || nowMs;
  const elapsedMinutes = Math.max(0, (nowMs - issuedAtMs) / 60000);

  let autoStage: 1 | 2 | 3 | 4 = 2;
  if (elapsedMinutes >= 180) {
    autoStage = 4;
  } else if (elapsedMinutes >= 15) {
    autoStage = 3;
  } else {
    autoStage = 2;
  }

  if (order.shippingStage && order.shippingStage > autoStage) {
    return order.shippingStage;
  }
  return autoStage;
}

export function buildTrackingFromCustomOrder(
  order: CustomAdminOrder,
  nowMs: number = Date.now()
): TrackingRecord {
  const isCod = isCodShippingMethod(order.shippingMethod, order.awbNumber);
  const hasAwb = hasValidCourierAwb(order);
  const stage = computeAutoShippingStage(order, nowMs);
  const courierMeta = resolveCourierMetadata(
    order.shippingMethod,
    order.awbNumber
  );
  const baseMs = order.createdAtTimestampMs || nowMs;
  const tStage1 = order.createdAtTimestampMs
    ? formatWibDateTimeFromMs(baseMs)
    : order.createdAt;

  // 1. Dedicated Face-to-Face COD Hand-Delivery Logic (No Expedition AWB)
  if (isCod) {
    const codMilestones: TrackingMilestone[] = [
      {
        timestamp: tStage1,
        location: 'VORVAN Climate-Controlled Vault',
        title: '1. Lolos QC Vault VORVAN (Inspeksi Fisik Botol & Batch Code)',
        detail: `Unit ${order.house} — ${order.fragranceName} (${order.volume}) telah melewati pemeriksaan fisik botol kaca, batch code, dan tekanan sprayer untuk penyerahan tatap muka.`,
        completed: true,
        current: false,
      },
      {
        timestamp: formatWibDateTimeFromMs(baseMs + 5 * 60000),
        location: `Titik Pertemuan VIP · ${order.buyerCity}`,
        title: '2. Koordinasi Jadwal Pertemuan Tatap Muka Langsung (Face-to-Face)',
        detail: `Transaksi ini menggunakan layanan COD / Serah Terima Tatap Muka Langsung bersama klien (${order.buyerName}) di ${order.buyerCity} tanpa menggunakan kurir paket ekspedisi.`,
        completed: true,
        current: order.status !== 'PAID' && !order.paymentProof,
      },
      {
        timestamp:
          order.status === 'PAID' || order.paymentProof
            ? order.paymentProofUploadedAt || formatWibDateTimeFromMs(nowMs)
            : 'Saat Pertemuan Tatap Muka',
        location: order.buyerCity,
        title: '3. Serah Terima Langsung & Inspeksi Bersama Klien',
        detail: `Penyerahan flacon parfum secara langsung (Hand-Delivery) dan pengecekan fisik unit bersama ${order.buyerName}.`,
        completed: Boolean(order.status === 'PAID' || order.paymentProof),
        current: Boolean(order.status === 'PAID' || order.paymentProof),
      },
    ];

    return {
      trackingId: order.invoiceId,
      invoiceId: order.invoiceId,
      recipientName: order.buyerName,
      destination: order.buyerCity,
      courierService: 'COD / Tatap Muka Langsung',
      awbNumber: 'Tanpa Resi Ekspedisi (Tatap Muka)',
      fragranceSummary: `${order.house} — ${order.fragranceName} (${order.volume})`,
      statusLabel: COD_FACE_TO_FACE_STATUS_LABEL,
      estimatedArrival: COD_FACE_TO_FACE_STATUS_LABEL,
      vaultSealCode: `SEAL-${order.invoiceId.toUpperCase()}`,
      boxInspectionNote:
        'Transaksi COD / Serah Terima Tatap Muka Langsung: Pemeriksaan keaslian botol, batch code, dan fungsi sprayer dilakukan secara langsung saat pertemuan.',
      milestones: codMilestones,
      createdAtTimestampMs: order.createdAtTimestampMs,
      courierOfficialUrl: courierMeta.officialTrackUrl,
      binderbyteCourierCode: '',
      isCodFaceToFace: true,
      isAwbPending: false,
    };
  }

  // 2. Expedition Order BEFORE Admin Inputs Follow-Up AWB (Resi Belum Tersedia)
  if (!hasAwb) {
    const pendingMilestones: TrackingMilestone[] = [
      {
        timestamp: tStage1,
        location: 'VORVAN Private Vault & Dispatch Desk',
        title:
          order.status === 'PAID' || order.paymentProof
            ? '1. Pembayaran Terverifikasi — Sedang Dikemas di QC Vault VORVAN'
            : '1. Invoice Diterbitkan — Menunggu Penyelesaian Pembayaran',
        detail:
          order.status === 'PAID' || order.paymentProof
            ? `Pembayaran untuk ${order.house} — ${order.fragranceName} (${order.volume}) telah diterima. Unit sedang dikemas dengan Double-Wall Thermal Box dan menunggu penyerahan ke ekspedisi ${courierMeta.displayName}.`
            : `Tagihan #${order.invoiceId} untuk ${order.house} — ${order.fragranceName} (${order.volume}) telah diterbitkan. Nomor resi ekspedisi ${courierMeta.displayName} akan diinput setelah pembayaran lunas dan paket dikirim.`,
        completed: true,
        current: true,
      },
      {
        timestamp: 'Menunggu Input Resi Admin',
        location: `Manifest ${courierMeta.displayName}`,
        title: '2. Penyerahan ke Ekspedisi & Penerbitan Nomor Resi Asli',
        detail:
          'Nomor resi ekspedisi akan muncul otomatis di halaman ini segera setelah paket dikirim dan resi diinput oleh Admin Concierge VORVAN.',
        completed: false,
        current: false,
      },
      {
        timestamp: 'Menunggu Pengiriman',
        location: `Transit Hub Antar-Kota → ${order.buyerCity}`,
        title: '3. Perjalanan Paket & Gudang Sortir Ekspedisi',
        detail: `Pelacakan perjalanan paket menuju ${order.buyerCity} akan aktif begitu Nomor Resi tersedia.`,
        completed: false,
        current: false,
      },
      {
        timestamp: 'Menunggu Pengiriman',
        location: order.buyerCity,
        title: '4. Pengantaran Kurir ke Alamat Penerima',
        detail: `Pengantaran oleh kurir ${courierMeta.displayName} menuju ${order.buyerName} (${order.buyerCity}).`,
        completed: false,
        current: false,
      },
    ];

    return {
      trackingId: order.invoiceId,
      invoiceId: order.invoiceId,
      recipientName: order.buyerName,
      destination: order.buyerCity,
      courierService: courierMeta.displayName,
      awbNumber: 'Belum Tersedia (Menunggu Pengiriman)',
      fragranceSummary: `${order.house} — ${order.fragranceName} (${order.volume})`,
      statusLabel: PENDING_AWB_STATUS_LABEL,
      estimatedArrival: PENDING_AWB_STATUS_LABEL,
      vaultSealCode: `SEAL-${order.invoiceId.toUpperCase()}`,
      boxInspectionNote:
        'WAJIB VIDEO UNBOXING UTUH TANPA JEDA sejak paket masih tersegel untuk klaim garansi botol pecah atau semprotan/atomizer macet pabrik.',
      milestones: pendingMilestones,
      createdAtTimestampMs: order.createdAtTimestampMs,
      courierOfficialUrl: courierMeta.officialTrackUrl,
      binderbyteCourierCode: '',
      isCodFaceToFace: false,
      isAwbPending: true,
    };
  }

  // 3. Expedition Order WITH Valid AWB Entered by Admin (Active Tracking)
  const tStage2 = order.createdAtTimestampMs
    ? formatWibDateTimeFromMs(baseMs + 4 * 60000)
    : order.createdAt;
  const tStage3 =
    stage >= 3
      ? formatWibDateTimeFromMs(baseMs + 15 * 60000)
      : 'Terjadwal Otomatis · Sorting Hub';
  const tStage4 =
    stage >= 4
      ? formatWibDateTimeFromMs(baseMs + 180 * 60000)
      : 'Terjadwal Otomatis · Kurir Pengantar';

  const stageLabels: Record<1 | 2 | 3 | 4, string> = {
    1: 'AUTO-TRACKING AKTIF — LOLOS QC VAULT VORVAN',
    2: `AUTO-TRACKING AKTIF — DISERAHKAN KE MANIFEST ${courierMeta.displayName.toUpperCase()}`,
    3: `AUTO-TRACKING AKTIF — TRANSIT HUB ANTAR-KOTA (${courierMeta.displayName.toUpperCase()})`,
    4: `AUTO-TRACKING AKTIF — MENUJU ALAMAT PENERIMA (${courierMeta.displayName.toUpperCase()})`,
  };

  const milestones: TrackingMilestone[] = [
    {
      timestamp: tStage1,
      location: 'VORVAN Climate-Controlled Vault',
      title: '1. Lolos QC Vault VORVAN (Inspeksi Fisik Botol & Fungsi Sprayer)',
      detail: `Unit ${order.house} — ${order.fragranceName} (${order.volume}) lolos pemeriksaan fisik botol kaca, keaslian batch code, dan fungsi tekanan sprayer.`,
      completed: stage >= 1,
      current: stage === 1,
    },
    {
      timestamp: tStage2,
      location: `Manifest ${courierMeta.displayName} · VORVAN Dispatch Hub`,
      title: '2. Diserahkan ke Manifest Kurir & Segel Wajib Video Unboxing',
      detail: `Dikemas berlapis pelindung aman, dipasang segel wajib video unboxing utuh, dan terdaftar otomatis pada manifest ${courierMeta.displayName} (AWB: ${order.awbNumber}).`,
      completed: stage >= 2,
      current: stage === 2,
    },
    {
      timestamp: tStage3,
      location: `Sorting Center & Transit Hub Antar-Kota → ${order.buyerCity}`,
      title: '3. Transit Hub Antar-Kota & Gudang Sortir Ekspedisi',
      detail: `Paket dipindai pada jaringan distribusi ${courierMeta.displayName} dan bergerak melintasi hub transit utama menuju ${order.buyerCity}.`,
      completed: stage >= 3,
      current: stage === 3,
    },
    {
      timestamp: tStage4,
      location: order.buyerCity,
      title: '4. Menuju Alamat Penerima (With Delivery Courier)',
      detail: `Pengantaran oleh kurir ${courierMeta.displayName} menuju alamat ${order.buyerName} (${order.buyerCity}). Wajib merekam video unboxing utuh tanpa jeda sejak paket masih tersegel.`,
      completed: stage >= 4,
      current: stage === 4,
    },
  ];

  return {
    trackingId: order.trackingId || order.awbNumber || order.invoiceId,
    invoiceId: order.invoiceId,
    recipientName: order.buyerName,
    destination: order.buyerCity,
    courierService: courierMeta.displayName,
    awbNumber: order.awbNumber,
    fragranceSummary: `${order.house} — ${order.fragranceName} (${order.volume})`,
    statusLabel: stageLabels[stage],
    estimatedArrival: `Terintegrasi Manifest Resmi ${courierMeta.displayName}`,
    vaultSealCode: `SEAL-${order.invoiceId.toUpperCase()}`,
    boxInspectionNote:
      'WAJIB VIDEO UNBOXING UTUH TANPA JEDA sejak paket masih tersegel untuk klaim garansi botol pecah atau semprotan/atomizer macet pabrik.',
    milestones,
    createdAtTimestampMs: order.createdAtTimestampMs,
    courierOfficialUrl: courierMeta.officialTrackUrl,
    binderbyteCourierCode: courierMeta.binderbyteCode,
    isCodFaceToFace: false,
    isAwbPending: false,
  };
}

/**
 * Resolves a Private Invoice by ID. Supports custom admin orders, smart URL orders,
 * seeded invoices (including INV-SAMPLE), and deterministic synthesis for any custom invoice ID.
 */
export function resolvePrivateInvoice(
  rawInvoiceId: string,
  customOrders?: CustomAdminOrder[],
  smartOrder?: CustomAdminOrder | null
): PrivateInvoice {
  const normalized = rawInvoiceId.trim().toUpperCase();

  const attachProof = (inv: PrivateInvoice): PrivateInvoice => {
    const invKey = inv.invoiceId.trim().toUpperCase();
    const proofs = loadPaymentProofsMap();
    const stored = proofs[invKey];
    const existingProof = inv.paymentProof || inv.paymentProofUrl;
    const finalProof = existingProof || stored?.proofUrl || undefined;
    if (finalProof) {
      return {
        ...inv,
        status: 'PAID',
        paidAt: inv.paidAt || stored?.uploadedAt || inv.createdAt,
        paymentMethodUsed:
          inv.paymentMethodUsed || 'Terverifikasi Concierge VORVAN',
        paymentProof: finalProof,
        paymentProofUrl: finalProof,
        paymentProofUploadedAt:
          inv.paymentProofUploadedAt || stored?.uploadedAt,
      };
    }
    return {
      ...inv,
      paymentProof: undefined,
      paymentProofUrl: undefined,
      paymentProofUploadedAt: undefined,
    };
  };

  const ordersList = customOrders ?? loadCustomAdminOrders();
  const matchedCustom = ordersList.find(
    (o) =>
      o.invoiceId.toUpperCase() === normalized ||
      o.awbNumber.toUpperCase() === normalized
  );
  if (matchedCustom) {
    return attachProof(buildInvoiceFromCustomOrder(matchedCustom));
  }

  if (
    smartOrder &&
    (!normalized || smartOrder.invoiceId.toUpperCase() === normalized)
  ) {
    return attachProof(buildInvoiceFromCustomOrder(smartOrder));
  }

  if (!normalized || PRIVATE_INVOICES_SEED[normalized]) {
    const seed = !normalized
      ? PRIVATE_INVOICES_SEED['INV-SAMPLE']
      : PRIVATE_INVOICES_SEED[normalized];
    const subtotal = seed.items.reduce(
      (sum, item) => sum + item.unitPriceIDR * item.quantity,
      0
    );
    const retailSum = seed.items.reduce((sum, item) => {
      const sku = resolveVorvanSkuPricing(item.fragranceName);
      const itemRetail =
        sku && sku.retail > item.unitPriceIDR
          ? sku.retail
          : Math.round(item.unitPriceIDR / 0.72);
      return sum + itemRetail * item.quantity;
    }, 0);
    const discPct =
      retailSum > subtotal
        ? Math.round(((retailSum - subtotal) / retailSum) * 100)
        : 28;
    const detectedZone = autoDetectShippingZoneByCity(seed.buyerCity);
    return attachProof({
      ...seed,
      retailPriceTotalIDR: seed.retailPriceTotalIDR ?? retailSum,
      discountPct: seed.discountPct ?? discPct,
      shippingLabel:
        seed.shippingLabel ||
        detectedZone?.label ||
        'Pengiriman Berasuransi & Double-Wall Thermal Box',
    });
  }

  const hash = Array.from(normalized).reduce(
    (acc, ch) => acc + ch.charCodeAt(0),
    0
  );
  const sampleIdx = hash % FRAGRANCE_CATALOG.length;
  const sampleFragrance = FRAGRANCE_CATALOG[sampleIdx];
  const sampleSku = resolveVorvanSkuPricing(sampleIdx);
  const basePrice =
    sampleSku?.price ||
    (sampleFragrance.tier === 'apex_prestige' ? 4650000 : 2550000);
  const retailPrice = sampleSku?.retail || Math.round(basePrice / 0.72);
  const discPct =
    sampleSku?.disc ||
    Math.round(((retailPrice - basePrice) / retailPrice) * 100);

  return attachProof({
    invoiceId: normalized,
    createdAt: '26 Okt 2026 · 15:00 WIB',
    expiresAt: '27 Okt 2026 · 15:00 WIB',
    buyerName: `Private Client (${normalized})`,
    buyerPhoneMasked: '+62 813-••••-6590',
    buyerCity: 'Jakarta, Indonesia',
    conciergeAdvisor: 'VORVAN Official Concierge',
    status: 'PENDING_PAYMENT',
    shippingInsuranceIDR: 25000,
    woodenCratePackagingIDR: 0,
    retailPriceTotalIDR: retailPrice,
    discountPct: discPct,
    shippingLabel: SHIPPING_ZONES.ZONA_1.label,
    notes:
      'Tagihan privat terenkripsi VORVAN. Dilengkapi proteksi klaim video unboxing utuh & jaminan keaslian batch.',
    items: [
      {
        sku: `VRV-${sampleFragrance.id.toUpperCase()}`,
        house: sampleFragrance.house,
        fragranceName: sampleFragrance.name,
        concentration: sampleFragrance.concentration,
        volume: sampleSku?.size || sampleFragrance.defaultVolume,
        batchCode: sampleFragrance.batchCode,
        quantity: 1,
        unitPriceIDR: basePrice,
      },
    ],
  });
}

/**
 * Looks up a shipment tracking record by Tracking ID, AWB Number, or Invoice ID.
 * Prioritizes customOrders (including follow-up AWB updates by Admin) before smartOrder fallback.
 */
export function lookupTrackingOrder(
  query: string,
  customOrders?: CustomAdminOrder[],
  smartOrder?: CustomAdminOrder | null
): TrackingRecord | null {
  const clean = query.trim().toUpperCase();

  const ordersList = customOrders ?? loadCustomAdminOrders();
  if (clean) {
    const matchedCustom = ordersList.find((o) => {
      const oAwb = (o.awbNumber || '').trim().toUpperCase();
      const oInv = (o.invoiceId || '').trim().toUpperCase();
      const oTrk = (o.trackingId || '').trim().toUpperCase();
      return (
        (oAwb.length > 0 && oAwb === clean) ||
        oInv === clean ||
        (oTrk.length > 0 && oTrk === clean)
      );
    });
    if (matchedCustom) {
      return buildTrackingFromCustomOrder(matchedCustom);
    }
  }

  if (
    smartOrder &&
    (!clean ||
      ((smartOrder.awbNumber || '').trim().toUpperCase() === clean &&
        clean.length > 0) ||
      (smartOrder.invoiceId || '').trim().toUpperCase() === clean ||
      ((smartOrder.trackingId || '').trim().toUpperCase() === clean &&
        clean.length > 0))
  ) {
    // Check if customOrders has an updated record for smartOrder.invoiceId (e.g., follow-up resi added)
    const updatedMatch = ordersList.find(
      (o) =>
        o.invoiceId.trim().toUpperCase() ===
        smartOrder.invoiceId.trim().toUpperCase()
    );
    return buildTrackingFromCustomOrder(updatedMatch || smartOrder);
  }

  if (!clean) return null;

  if (TRACKING_RECORDS_SEED[clean]) {
    return TRACKING_RECORDS_SEED[clean];
  }

  const byInvoiceOrAwb = Object.values(TRACKING_RECORDS_SEED).find(
    (record) =>
      record.invoiceId.toUpperCase() === clean ||
      record.awbNumber.toUpperCase() === clean
  );

  return byInvoiceOrAwb || null;
}

/**
 * Validates Pre-Order Concierge input fields.
 */
export function validatePreOrderInput(input: {
  clientName: string;
  whatsappNumber: string;
  house: string;
  fragranceName: string;
}): { valid: boolean; error?: string } {
  if (!input.clientName.trim() || input.clientName.trim().length < 2) {
    return {
      valid: false,
      error: 'Mohon masukkan nama lengkap Anda (minimal 2 karakter).',
    };
  }
  const digits = input.whatsappNumber.replace(/\D/g, '');
  if (digits.length < 9) {
    return {
      valid: false,
      error: 'Mohon masukkan nomor WhatsApp aktif yang valid (minimal 9 digit).',
    };
  }
  if (!input.house.trim()) {
    return {
      valid: false,
      error: 'Mohon pilih atau ketik nama Fragrance House.',
    };
  }
  if (!input.fragranceName.trim() || input.fragranceName.trim().length < 2) {
    return {
      valid: false,
      error: 'Mohon cantumkan nama varian parfum yang ingin dipesan.',
    };
  }
  return { valid: true };
}

/**
 * Validates B2B Wholesale / Private Sourcing registration form.
 */
export function validateB2BInput(input: {
  companyName: string;
  contactPerson: string;
  whatsappOrEmail: string;
  city: string;
}): { valid: boolean; error?: string } {
  if (!input.companyName.trim() || input.companyName.trim().length < 2) {
    return {
      valid: false,
      error: 'Nama perusahaan / entitas bisnis wajib diisi.',
    };
  }
  if (!input.contactPerson.trim() || input.contactPerson.trim().length < 2) {
    return {
      valid: false,
      error: 'Nama penanggung jawab (PIC) wajib diisi.',
    };
  }
  if (!input.whatsappOrEmail.trim() || input.whatsappOrEmail.trim().length < 5) {
    return {
      valid: false,
      error: 'Nomor WhatsApp bisnis atau alamat email resmi wajib diisi.',
    };
  }
  if (!input.city.trim()) {
    return { valid: false, error: 'Kota domisili operasional wajib diisi.' };
  }
  return { valid: true };
}

/**
 * Computes a clamped vertical parallax offset (in pixels) for editorial background layers
 * based on a section's bounding box relative to the viewport center.
 */
export function computeParallaxOffset(
  viewportHeight: number,
  elementTop: number,
  elementHeight: number,
  speed: number = 0.16,
  maxShiftPx: number = 88
): number {
  if (viewportHeight <= 0 || elementHeight <= 0 || speed === 0) {
    return 0;
  }
  const viewportCenter = viewportHeight / 2;
  const elementCenter = elementTop + elementHeight / 2;
  const deltaFromCenter = viewportHeight / 2 - elementCenter;
  const rawShift = deltaFromCenter * speed;
  const clamped = Math.max(-maxShiftPx, Math.min(maxShiftPx, rawShift));
  return Math.round(clamped * 100) / 100;
}

/**
 * Formats a Date into an Indonesian WIB electronic legal timestamp string.
 */
export function formatLegalTimestampWIB(date: Date = new Date()): string {
  return (
    date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' WIB'
  );
}

/**
 * Builds the verified electronic clickwrap WhatsApp confirmation message & URL
 * for the VORVAN Legal Shield module using the official VORVAN WhatsApp number.
 */
export function buildVerifiedLegalWhatsAppMessage(params: {
  docNo: string;
  clientName: string;
  perfumeDesc?: string;
  grandTotal: string;
  paymentMethodLabel?: string;
  agreedTimestamp: string;
  paymentProofUploadedAt?: string;
}): string {
  const docNo = params.docNo.trim() || '-';
  const clientName = params.clientName.trim() || '-';
  const grandTotal = params.grandTotal.trim() || '-';
  const paymentMethodLabel =
    params.paymentMethodLabel?.trim() ||
    'Transfer Bank Resmi (Mandiri / BNI / BRI)';
  const agreedTimestamp = params.agreedTimestamp.trim() || '-';
  const unitLine = params.perfumeDesc?.trim()
    ? `• Unit Kurasi: ${params.perfumeDesc.trim()}\n`
    : '';
  const proofLine = params.paymentProofUploadedAt?.trim()
    ? `• Bukti Transfer: [TERUPLOAD & TEREKAM DI VAULT ADMIN (${params.paymentProofUploadedAt.trim()})]\n`
    : '';

  return (
    `Halo VORVAN Official Concierge, saya ingin mengonfirmasi pembayaran untuk Private Invoice berikut:\n\n` +
    `• Kode Tagihan: ${docNo}\n` +
    `• Nama Klien: ${clientName}\n` +
    unitLine +
    `• Total Tagihan: ${grandTotal}\n` +
    `• Metode Pembayaran: ${paymentMethodLabel}\n` +
    proofLine +
    `\n` +
    `✅ [Persetujuan Layanan Elektronik Tercatat pada ${agreedTimestamp}: Saya telah membaca dan menyetujui Ketentuan Layanan, Garansi Unboxing & Sprayer, Kebijakan Final Sale, serta Karakteristik Subjektif Aroma VORVAN].\n\n` +
    `Foto bukti transfer telah terunggah pada sistem invoice resmi. Mohon verifikasi & proses pengiriman flacon parfum saya. Terima kasih.`
  );
}

export function buildVerifiedLegalWhatsAppUrl(
  params: {
    docNo: string;
    clientName: string;
    perfumeDesc?: string;
    grandTotal: string;
    paymentMethodLabel?: string;
    agreedTimestamp: string;
    paymentProofUploadedAt?: string;
  },
  waNumber: string = VORVAN_WHATSAPP_NUMBER
): string {
  const rawDigits = (waNumber || VORVAN_WHATSAPP_NUMBER).replace(/\D/g, '');
  const normalizedWa = rawDigits.startsWith('0')
    ? `62${rawDigits.slice(1)}`
    : rawDigits || VORVAN_WHATSAPP_NUMBER;
  const msg = buildVerifiedLegalWhatsAppMessage(params);
  return `https://wa.me/${normalizedWa}?text=${encodeURIComponent(msg)}`;
}

/**
 * Filters the 81 Indonesian Climate & Moment Concierge Guide entries
 * by moment/weather button, gender, and instant search query (brand, perfume name, scent notes, keywords).
 */
export function filterConciergeGuide81(
  query: string = '',
  momentFilter: ConciergeMomentFilterKey = 'ALL',
  genderFilter: ConciergeGenderFilterKey = 'All'
): ConciergeGuideEntry[] {
  const cleanQuery = query.trim().toLowerCase();
  const terms = cleanQuery ? cleanQuery.split(/\s+/).filter(Boolean) : [];

  return CONCIERGE_81_GUIDE.filter((item) => {
    if (momentFilter !== 'ALL' && !item.momentKeys.includes(momentFilter)) {
      return false;
    }
    if (genderFilter !== 'All' && item.gender !== genderFilter) {
      return false;
    }
    if (terms.length > 0) {
      const haystack = [
        item.brand,
        item.name,
        item.gender,
        item.size,
        item.simpleNotes,
        item.searchKeywords,
        item.momentBadges.join(' '),
        item.climateAdvice,
      ]
        .join(' ')
        .toLowerCase();

      return terms.every((t) => haystack.includes(t));
    }
    return true;
  });
}

/**
 * Formats the 1-Click WhatsApp Concierge Recommendation text for a buyer.
 */
export function buildConciergeRecommendationWaText(
  entry: ConciergeGuideEntry
): string {
  const formattedBadges = entry.momentBadges.map((b) => `[${b}]`).join(' ');
  const momentAndClimate = `${formattedBadges} — ${entry.climateAdvice}`;
  const formattedRetail = entry.retail.toLocaleString('id-ID');
  const formattedPrice = entry.price.toLocaleString('id-ID');

  return (
    `✨ *Rekomendasi Concierge VORVAN:*\n` +
    `• *Koleksi:* ${entry.brand} — ${entry.name} (${entry.size})\n` +
    `• *Karakter Aroma:* ${entry.simpleNotes}\n` +
    `• *Kecocokan Iklim & Momen:* ${momentAndClimate}\n` +
    `• *Valuasi Resmi Butik:* ~Rp ${formattedRetail}~\n` +
    `• *Harga Kurasi VORVAN (Hemat ${entry.disc}%):* *Rp ${formattedPrice}* (Full-Size Sealed + Digital Certificate)`
  );
}

