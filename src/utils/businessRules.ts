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
  BrandHouseId,
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
          return parsed;
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
  if (upper.includes('COD') || upper.includes('INTERNAL')) return 'COD';
  if (upper.includes('J&T') || upper.includes('JNT')) return 'JNT';
  if (upper.includes('SICEPAT') || upper === 'SCP') return 'SCP';
  if (upper.includes('PAXEL') || upper === 'PXL') return 'PXL';
  if (upper.includes('ANTERAJA') || upper === 'ANT') return 'ANT';
  return 'JNE';
}

function decodeCourierShort(code: string): ShippingMethodType {
  const clean = (code || '').trim().toUpperCase();
  if (clean === '5' || clean === 'COD' || clean.includes('INTERNAL')) {
    return 'COD Kurir Internal VORVAN';
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
  const awb = sanitize(order.awbNumber || order.trackingId);
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
          const awbNumber =
            (rawAwb || '').trim() ||
            (shippingMethod.includes('COD')
              ? `COD-VRV-${invTrim}`
              : `VRV-RESI-${invTrim}`);

          const cleanCity = (rawCity || 'Indonesia').trim();
          const detectedZone = autoDetectShippingZoneByCity(cleanCity);
          const shippingCostIDR =
            shipKPart !== undefined && shipKPart !== ''
              ? Math.max(0, Math.round((Number(shipKPart) || 0) * 1000))
              : shippingMethod.includes('COD')
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
            trackingId: awbNumber,
            createdAt: 'Terverifikasi · WIB',
            buyerName: rawBuyer.trim(),
            buyerCity: cleanCity,
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
 * Generates an ultra-short Smart Shareable URL (`?v=...`) for WhatsApp/Telegram.
 */
export function buildSmartShareUrl(
  order: CustomAdminOrder,
  mode: 'invoice' | 'track',
  originOverride?: string
): string {
  const token = encodeSmartOrderParam(order);
  const origin =
    originOverride ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://vorvan.id');
  if (mode === 'invoice') {
    return `${origin}/pay/${order.invoiceId.trim().toUpperCase()}?v=${token}`;
  }
  const trackCode = (order.trackingId || order.awbNumber || order.invoiceId).trim();
  return `${origin}/track/${encodeURIComponent(trackCode)}?v=${token}`;
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

  const detectedZone = autoDetectShippingZoneByCity(order.buyerCity);
  const shippingInsuranceIDR =
    typeof order.shippingCostIDR === 'number'
      ? order.shippingCostIDR
      : order.shippingMethod.includes('COD')
      ? 0
      : detectedZone?.cost ?? 0;

  const shippingLabel =
    order.shippingLabel ||
    detectedZone?.label ||
    (shippingInsuranceIDR === 0
      ? SHIPPING_ZONES.FREE_VIP.label
      : 'Pengiriman Berasuransi & Double-Wall Thermal Box');

  return {
    invoiceId: order.invoiceId.toUpperCase(),
    createdAt: order.createdAt || 'Hari Ini · WIB',
    expiresAt: '24 Jam Sejak Diterbitkan',
    buyerName: order.buyerName,
    buyerPhoneMasked: 'Private VIP Client',
    buyerCity: order.buyerCity,
    conciergeAdvisor: 'VORVAN Official Concierge — Andre Satria P',
    status: order.status || 'PENDING_PAYMENT',
    paidAt: order.status === 'PAID' ? order.createdAt : undefined,
    paymentMethodUsed:
      order.status === 'PAID' ? 'Terverifikasi Concierge VORVAN' : undefined,
    shippingInsuranceIDR,
    woodenCratePackagingIDR: 0,
    retailPriceTotalIDR,
    discountPct,
    shippingLabel,
    notes: `Metode Pengiriman: ${order.shippingMethod} (Resi: ${order.awbNumber}). Dilengkapi garansi klaim video unboxing utuh tanpa jeda.`,
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
 * for JNE, J&T Express, SiCepat, Paxel, Anteraja, or COD Kurir Internal VORVAN.
 */
export function resolveCourierMetadata(
  shippingMethod: string,
  awbNumber: string = ''
): CourierIntegrationMetadata {
  const upper = shippingMethod.toUpperCase();
  const cleanAwb = awbNumber.trim();

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

  if (upper.includes('ANTERAJA')) {
    return {
      displayName: 'Anteraja',
      binderbyteCode: 'anteraja',
      officialTrackUrl: 'https://anteraja.id/tracking',
      portalLabel: 'Portal Pelacakan Resmi Anteraja',
      isInternalCod: false,
    };
  }

  if (upper.includes('COD') || upper.includes('INTERNAL')) {
    const waMsg = `Halo Concierge VORVAN, mohon update posisi live Kurir Internal COD untuk Nomor Resi ${cleanAwb || 'VIP-COD'}.`;
    return {
      displayName: 'COD Kurir Internal VORVAN',
      binderbyteCode: '',
      officialTrackUrl: `https://wa.me/${VORVAN_WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`,
      portalLabel: 'Koordinat Live Kurir Internal VORVAN (WhatsApp VIP)',
      isInternalCod: true,
    };
  }

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
 */
export function computeAutoShippingStage(
  order: CustomAdminOrder,
  nowMs: number = Date.now()
): 1 | 2 | 3 | 4 {
  const issuedAtMs = order.createdAtTimestampMs || nowMs;
  const elapsedMinutes = Math.max(0, (nowMs - issuedAtMs) / 60000);

  let autoStage: 1 | 2 | 3 | 4 = 2;
  if (elapsedMinutes >= 180) {
    autoStage = 4;
  } else if (elapsedMinutes >= 15) {
    autoStage = 3;
  } else if (order.awbNumber && order.awbNumber.trim().length > 0) {
    autoStage = 2;
  } else {
    autoStage = 1;
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
  const stage = computeAutoShippingStage(order, nowMs);
  const courierMeta = resolveCourierMetadata(
    order.shippingMethod,
    order.awbNumber
  );
  const baseMs = order.createdAtTimestampMs || nowMs;

  const tStage1 = order.createdAtTimestampMs
    ? formatWibDateTimeFromMs(baseMs)
    : order.createdAt;
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
    estimatedArrival: courierMeta.isInternalCod
      ? 'Pengantaran Langsung Tim Internal VORVAN (Hari Ini)'
      : `Terintegrasi Manifest Resmi ${courierMeta.displayName}`,
    vaultSealCode: `SEAL-${order.invoiceId.toUpperCase()}`,
    boxInspectionNote:
      'WAJIB VIDEO UNBOXING UTUH TANPA JEDA sejak paket masih tersegel untuk klaim garansi botol pecah atau semprotan/atomizer macet pabrik.',
    milestones,
    createdAtTimestampMs: order.createdAtTimestampMs,
    courierOfficialUrl: courierMeta.officialTrackUrl,
    binderbyteCourierCode: courierMeta.binderbyteCode,
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

  if (
    smartOrder &&
    (!normalized || smartOrder.invoiceId.toUpperCase() === normalized)
  ) {
    return buildInvoiceFromCustomOrder(smartOrder);
  }

  const ordersList = customOrders ?? loadCustomAdminOrders();
  const matchedCustom = ordersList.find(
    (o) =>
      o.invoiceId.toUpperCase() === normalized ||
      o.awbNumber.toUpperCase() === normalized
  );
  if (matchedCustom) {
    return buildInvoiceFromCustomOrder(matchedCustom);
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
    return {
      ...seed,
      retailPriceTotalIDR: seed.retailPriceTotalIDR ?? retailSum,
      discountPct: seed.discountPct ?? discPct,
      shippingLabel:
        seed.shippingLabel ||
        detectedZone?.label ||
        'Pengiriman Berasuransi & Double-Wall Thermal Box',
    };
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

  return {
    invoiceId: normalized,
    createdAt: '26 Okt 2026 · 15:00 WIB',
    expiresAt: '27 Okt 2026 · 15:00 WIB',
    buyerName: `Private Client (${normalized})`,
    buyerPhoneMasked: '+62 813-••••-6590',
    buyerCity: 'Jakarta, Indonesia',
    conciergeAdvisor: 'VORVAN Official Concierge — Andre Satria P',
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
  };
}

/**
 * Looks up a shipment tracking record by Tracking ID, AWB Number, or Invoice ID.
 */
export function lookupTrackingOrder(
  query: string,
  customOrders?: CustomAdminOrder[],
  smartOrder?: CustomAdminOrder | null
): TrackingRecord | null {
  const clean = query.trim().toUpperCase();

  if (
    smartOrder &&
    (!clean ||
      smartOrder.awbNumber.toUpperCase() === clean ||
      smartOrder.invoiceId.toUpperCase() === clean ||
      smartOrder.trackingId.toUpperCase() === clean)
  ) {
    return buildTrackingFromCustomOrder(smartOrder);
  }

  if (!clean) return null;

  const ordersList = customOrders ?? loadCustomAdminOrders();
  const matchedCustom = ordersList.find(
    (o) =>
      o.awbNumber.toUpperCase() === clean ||
      o.invoiceId.toUpperCase() === clean ||
      o.trackingId.toUpperCase() === clean
  );
  if (matchedCustom) {
    return buildTrackingFromCustomOrder(matchedCustom);
  }

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

  return (
    `Halo VORVAN Official Concierge — Andre Satria P, saya ingin mengonfirmasi pembayaran untuk Private Invoice berikut:\n\n` +
    `• Kode Tagihan: ${docNo}\n` +
    `• Nama Klien: ${clientName}\n` +
    unitLine +
    `• Total Tagihan: ${grandTotal}\n` +
    `• Metode Pembayaran: ${paymentMethodLabel}\n\n` +
    `✅ [Persetujuan Layanan Elektronik Tercatat pada ${agreedTimestamp}: Saya telah membaca dan menyetujui Ketentuan Layanan, Garansi Unboxing & Sprayer, Kebijakan Final Sale, serta Karakteristik Subjektif Aroma VORVAN].\n\n` +
    `Berikut saya lampirkan bukti pembayarannya. Terima kasih.`
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

