import { jsPDF } from 'jspdf';
import { VORVAN_OFFICIAL_CIRCLE_LOGO_ASSET } from '../components/VorvanLogo';
import { CustomAdminOrder, PrivateInvoice } from '../types/fragrance';
import {
  buildInvoiceFromCustomOrder,
  calculateInvoiceTotals,
  formatIDRCurrency,
  hasValidCourierAwb,
  isCodShippingMethod,
  resolveArchiveRefCode,
  resolveCourierMetadata,
} from './businessRules';

export const PDF_RENDER_CONFIG = {
  scale: 4,
  useCORS: true,
  imageSmoothingQuality: 'high' as ImageSmoothingQuality,
  format: 'PNG' as const,
  quality: 1.0,
  logicalWidth: 794,
  logicalHeight: 1123,
};

export interface OfficialPdfInvoiceLineItem {
  description: string;
  brand: string;
  fragranceName: string;
  volume: string;
  concentration: string;
  archiveCode: string;
  qty: number;
  retailUnitIDR: number;
  retailLineIDR: number;
  discountPct: number;
  discountIDR: number;
  curatedLineIDR: number;
}

export interface OfficialPdfInvoiceData {
  invoiceId: string;
  filename: string;
  createdAt: string;
  expiresAt: string;
  conciergeEmail: string;
  isPaid: boolean;
  statusStampLabel: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerAddress: string;
  isCod: boolean;
  courierDisplay: string;
  shippingZoneLabel: string;
  resiDisplay: string;
  methodAndResiLine: string;
  items: OfficialPdfInvoiceLineItem[];
  retailTotalIDR: number;
  curationDiscountPct: number;
  curationDiscountIDR: number;
  itemsSubtotalIDR: number;
  extraDiscountIDR: number;
  shippingInsuranceIDR: number;
  grandTotalIDR: number;
  electronicAgreementTimestamp: string;
  paidTimestampLabel: string;
}

export function getOfficialInvoicePdfFilename(invoiceId: string): string {
  const safeId = (invoiceId || 'INV-VORVAN')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]+/g, '-');
  return `VORVAN-Official-Invoice-${safeId}.pdf`;
}

export function buildOfficialPdfInvoiceData(
  source: PrivateInvoice | CustomAdminOrder,
  options?: {
    conciergeEmail?: string;
    hasProofUploaded?: boolean;
    agreedTimestamp?: string;
  }
): OfficialPdfInvoiceData {
  const isCustomOrder =
    'house' in source && 'fragranceName' in source && !('items' in source);
  const invoice: PrivateInvoice = isCustomOrder
    ? buildInvoiceFromCustomOrder(source as CustomAdminOrder)
    : (source as PrivateInvoice);

  const rawCustom = isCustomOrder ? (source as CustomAdminOrder) : null;
  const totals = calculateInvoiceTotals(invoice);

  const hasProof = Boolean(
    options?.hasProofUploaded ||
      invoice.paymentProof ||
      invoice.paymentProofUrl ||
      rawCustom?.paymentProof ||
      rawCustom?.paymentProofUrl
  );
  const isPaid = invoice.status === 'PAID' || hasProof;
  const statusStampLabel = isPaid
    ? 'OFFICIAL PAID RECEIPT (LUNAS)'
    : 'PROFORMA INVOICE (MENUNGGU PEMBAYARAN)';

  const isCod =
    typeof invoice.isCOD === 'boolean'
      ? invoice.isCOD
      : Boolean(
          invoice.shippingMethod &&
            isCodShippingMethod(invoice.shippingMethod, invoice.awbNumber)
        );

  const courierMeta = resolveCourierMetadata(
    invoice.courier || invoice.shippingMethod || 'JNE',
    invoice.awbNumber || ''
  );

  const courierDisplay = isCod
    ? 'Kurir VIP COD Internal VORVAN'
    : `Ekspedisi ${courierMeta.displayName}`;

  const rawResi = (
    rawCustom
      ? hasValidCourierAwb(rawCustom)
        ? rawCustom.resi ||
          rawCustom.trackingNumber ||
          rawCustom.noResi ||
          rawCustom.awbNumber ||
          ''
        : ''
      : invoice.awbNumber || ''
  ).trim();

  const resiDisplay = isCod
    ? 'VIP COD Hand-Delivery (Tanpa Resi Ekspedisi)'
    : rawResi || 'Menunggu Input Nomor Resi';

  const methodAndResiLine = `${courierDisplay} — Resi: ${resiDisplay}`;

  const totalUnits = Math.max(
    1,
    invoice.items.reduce((acc, it) => acc + Math.max(1, it.quantity || 1), 0)
  );
  const retailTotalIDR =
    invoice.retailPriceTotalIDR &&
    invoice.retailPriceTotalIDR > totals.itemsSubtotalIDR
      ? invoice.retailPriceTotalIDR
      : Math.round(totals.itemsSubtotalIDR / 0.72);
  const curationDiscountIDR = Math.max(
    0,
    retailTotalIDR - totals.itemsSubtotalIDR
  );
  const curationDiscountPct =
    invoice.discountPct && invoice.discountPct > 0
      ? invoice.discountPct
      : retailTotalIDR > 0
      ? Math.round((curationDiscountIDR / retailTotalIDR) * 100)
      : 0;

  const lineItems: OfficialPdfInvoiceLineItem[] = invoice.items.map((item) => {
    const qty = Math.max(1, Math.round(item.quantity || 1));
    const curatedLineIDR = item.unitPriceIDR * qty;
    const shareRatio =
      totals.itemsSubtotalIDR > 0
        ? curatedLineIDR / totals.itemsSubtotalIDR
        : 1 / Math.max(1, invoice.items.length);
    const retailLineIDR = Math.max(
      curatedLineIDR,
      Math.round(retailTotalIDR * shareRatio)
    );
    const lineDiscIDR = Math.max(0, retailLineIDR - curatedLineIDR);
    const lineDiscPct =
      retailLineIDR > 0 ? Math.round((lineDiscIDR / retailLineIDR) * 100) : 0;
    const cleanVol = item.volume.toLowerCase().includes('ml')
      ? item.volume
      : `${item.volume}ml`;

    return {
      description: `${item.house} — ${item.fragranceName} (${cleanVol})`,
      brand: item.house,
      fragranceName: item.fragranceName,
      volume: cleanVol,
      concentration: item.concentration || 'Eau de Parfum',
      archiveCode: resolveArchiveRefCode(
        item.fragranceName,
        item.batchCode || item.sku
      ),
      qty,
      retailUnitIDR: Math.round(retailLineIDR / Math.max(1, totalUnits)),
      retailLineIDR,
      discountPct: invoice.discountPct || lineDiscPct,
      discountIDR: lineDiscIDR,
      curatedLineIDR,
    };
  });

  const cleanInvoiceId = invoice.invoiceId.trim().toUpperCase();
  const buyerPhone = (
    invoice.buyerPhone ||
    rawCustom?.buyerPhone ||
    invoice.buyerPhoneMasked ||
    'Tercatat di Vault Concierge'
  ).trim();
  const buyerEmail = (
    invoice.buyerEmail ||
    rawCustom?.buyerEmail ||
    'Private VIP Client Vault'
  ).trim();

  const agreedTime = (
    options?.agreedTimestamp ||
    invoice.codTermsAgreedAt ||
    ''
  ).trim();

  return {
    invoiceId: cleanInvoiceId,
    filename: getOfficialInvoicePdfFilename(cleanInvoiceId),
    createdAt: invoice.createdAt,
    expiresAt: invoice.expiresAt || '24 Jam Sejak Diterbitkan',
    conciergeEmail: (
      options?.conciergeEmail || 'vorvanlifestyle@gmail.com'
    ).trim(),
    isPaid,
    statusStampLabel,
    buyerName: invoice.buyerName,
    buyerPhone,
    buyerEmail,
    buyerAddress: invoice.buyerCity,
    isCod,
    courierDisplay,
    shippingZoneLabel:
      invoice.shippingLabel || 'Pengiriman Berasuransi & Double-Wall Thermal Box',
    resiDisplay,
    methodAndResiLine,
    items: lineItems,
    retailTotalIDR,
    curationDiscountPct,
    curationDiscountIDR,
    itemsSubtotalIDR: totals.itemsSubtotalIDR,
    extraDiscountIDR: totals.extraDiscountIDR,
    shippingInsuranceIDR: totals.protectionTotalIDR,
    grandTotalIDR: totals.grandTotalIDR,
    electronicAgreementTimestamp: agreedTime,
    paidTimestampLabel:
      invoice.paymentProofUploadedAt || invoice.paidAt || '',
  };
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [''];
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function loadOfficialVorvanLogoImage(): Promise<HTMLImageElement | null> {
  if (typeof Image === 'undefined') return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = VORVAN_OFFICIAL_CIRCLE_LOGO_ASSET;
  });
}

function drawVorvanMonogramCrest(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  logoImg?: HTMLImageElement | null
) {
  ctx.save();
  // Pure obsidian black core matching official logo background seamlessly
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#000000';
  ctx.fill();

  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 2.5, 0, Math.PI * 2);
    ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = PDF_RENDER_CONFIG.imageSmoothingQuality;
    const drawSize = radius * 2.22;
    ctx.drawImage(
      logoImg,
      cx - drawSize / 2,
      cy - drawSize / 2,
      drawSize,
      drawSize
    );
    ctx.restore();
  } else {
    // Fallback monogram crest if offline asset fails
    ctx.fillStyle = '#F2DBA0';
    ctx.font = `bold ${Math.round(radius * 0.9)}px Georgia, "Times New Roman", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('V', cx, cy - 3);
    ctx.font = 'bold 5.5px Arial, sans-serif';
    ctx.fillText('VORVAN', cx, cy + radius * 0.45);
  }

  // Outer antique gold circular rim
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#C5A059';
  ctx.stroke();

  // Inner fine champagne ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2);
  ctx.lineWidth = 0.7;
  ctx.strokeStyle = '#E6CA82';
  ctx.stroke();

  ctx.restore();
}

/**
 * Luxury Concentric Vault Seal (130x130px logical footprint at radius=65 with generous inner padding
 * so all centered lines sit cleanly inside the double rings without touching any border).
 */
function drawDigitalVaultSeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius = 65
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-5 * Math.PI) / 180);

  // Outer seal circle
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#FCF7EB';
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#B88E3D';
  ctx.stroke();

  // Inner dashed concentric circle with generous inner clearance (padding ~18px)
  ctx.save();
  ctx.setLineDash([3, 2.5]);
  ctx.beginPath();
  ctx.arc(0, 0, radius - 6, 0, Math.PI * 2);
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = '#C5A059';
  ctx.stroke();
  ctx.restore();

  // Innermost thin solid ring
  ctx.beginPath();
  ctx.arc(0, 0, radius - 9.5, 0, Math.PI * 2);
  ctx.lineWidth = 0.6;
  ctx.strokeStyle = '#D4AF37';
  ctx.stroke();

  const innerLineHalfW = 36;

  // Baris Atas (small, gold)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#9A7222';
  ctx.font = 'bold 5.5px Arial, sans-serif';
  ctx.fillText('★ VORVAN OFFICIAL VAULT ★', 0, -21);

  // Top & Bottom Horizontal Hairlines framing "VERIFIED"
  ctx.strokeStyle = '#C5A059';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-innerLineHalfW, -11);
  ctx.lineTo(innerLineHalfW, -11);
  ctx.moveTo(-innerLineHalfW, 8);
  ctx.lineTo(innerLineHalfW, 8);
  ctx.stroke();

  // Tengah (Bold VERIFIED)
  ctx.fillStyle = '#8A6216';
  ctx.font = 'bold 12px Georgia, "Times New Roman", serif';
  ctx.fillText('VERIFIED', 0, -1);

  // Bawah Tengah
  ctx.fillStyle = '#7D5C1B';
  ctx.font = 'bold 6.3px Arial, sans-serif';
  ctx.fillText('CURATION DOCUMENT', 0, 16);

  // Bawah (small)
  ctx.fillStyle = '#9A7222';
  ctx.font = 'bold 5.4px Arial, sans-serif';
  ctx.fillText('VORVANOFFICIAL.COM', 0, 26);

  ctx.restore();
}

/**
 * Renders the Official A4 VORVAN Luxury Boutique Invoice onto an Ultra-HD HTML5 Canvas
 * (`scale: 4` -> 3176 x 4492 px lossless backing store over 794 x 1123 logical A4 units)
 * for crystal-clear zoomable quality on Android, iOS, and Desktop browsers.
 */
export function renderOfficialInvoiceCanvas(
  data: OfficialPdfInvoiceData,
  logoImg?: HTMLImageElement | null
): HTMLCanvasElement {
  const W = PDF_RENDER_CONFIG.logicalWidth;
  const H = PDF_RENDER_CONFIG.logicalHeight;
  const scale = PDF_RENDER_CONFIG.scale;

  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = H * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable.');
  }

  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = PDF_RENDER_CONFIG.imageSmoothingQuality;

  // 1. Luxury Warm Ivory Paper Background + Subtle Gold Frame
  ctx.fillStyle = '#FCF9F2';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#C5A059';
  ctx.lineWidth = 1.6;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  ctx.strokeStyle = '#E4CFA0';
  ctx.lineWidth = 0.7;
  ctx.strokeRect(26, 26, W - 52, H - 52);

  const marginX = 46;
  const contentW = W - marginX * 2;

  // 2. KOP SURAT RESMI (HEADER) WITH OFFICIAL VORVAN CIRCULAR EMBLEM LOGO
  drawVorvanMonogramCrest(ctx, marginX + 34, 72, 34, logoImg);

  ctx.fillStyle = '#141218';
  ctx.font = 'bold 17.5px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'left';
  ctx.fillText('VORVAN — LA MAISON DE HAUTE PARFUMERIE', marginX + 82, 58);

  ctx.fillStyle = '#8F6A23';
  ctx.font = 'bold 9.2px Arial, sans-serif';
  ctx.fillText(
    'PRIVATE FRAGRANCE CURATION · DIRECT INTERNATIONAL ARCHIVE',
    marginX + 82,
    76
  );

  ctx.fillStyle = '#4B4652';
  ctx.font = '9px Arial, sans-serif';
  ctx.fillText(
    `Official Portal: www.vorvanofficial.com  |  Concierge: ${
      data.conciergeEmail || 'vorvanlifestyle@gmail.com'
    }`,
    marginX + 82,
    92
  );

  // Double gold hairline divider under Kop Surat
  ctx.strokeStyle = '#C5A059';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(marginX, 118);
  ctx.lineTo(W - marginX, 118);
  ctx.stroke();

  ctx.strokeStyle = '#E5D1A2';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(marginX, 122);
  ctx.lineTo(W - marginX, 122);
  ctx.stroke();

  // 3. METADATA DOKUMEN & STATUS STEMPEL
  let y = 144;
  ctx.fillStyle = '#8F6A23';
  ctx.font = 'bold 8.5px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('DOKUMEN TAGIHAN RESMI (OFFICIAL INVOICE)', marginX, y);

  y += 22;
  ctx.fillStyle = '#141218';
  ctx.font = 'bold 18px "Courier New", monospace';
  ctx.fillText(`#${data.invoiceId}`, marginX, y);

  y += 16;
  ctx.fillStyle = '#3F3B47';
  ctx.font = '9.5px Arial, sans-serif';
  ctx.fillText(`Tanggal Terbit : ${data.createdAt}`, marginX, y);
  y += 14;
  ctx.fillText(`Berlaku Hingga : ${data.expiresAt}`, marginX, y);

  // Right-side Status Stamp Badge
  const badgeW = 285;
  const badgeH = 48;
  const badgeX = W - marginX - badgeW;
  const badgeY = 136;

  ctx.save();
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 7);
  ctx.fillStyle = data.isPaid ? '#ECFDF3' : '#FEF8EA';
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = data.isPaid ? '#1E7E4C' : '#C5922C';
  ctx.stroke();

  drawRoundedRect(ctx, badgeX + 3.5, badgeY + 3.5, badgeW - 7, badgeH - 7, 5);
  ctx.lineWidth = 0.6;
  ctx.strokeStyle = data.isPaid ? '#74C69D' : '#E2BE6F';
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = data.isPaid ? '#135E38' : '#7D5410';
  ctx.font = 'bold 7.5px Arial, sans-serif';
  ctx.fillText('STATUS OTORISASI DOKUMEN', badgeX + badgeW / 2, badgeY + 17);
  ctx.font = 'bold 10.5px Arial, sans-serif';
  ctx.fillText(data.statusStampLabel, badgeX + badgeW / 2, badgeY + 34);
  ctx.restore();

  // 4. DATA KLIEN & LOGISTIK (2 SIDE-BY-SIDE CARDS)
  y = 212;
  const boxGap = 14;
  const boxW = (contentW - boxGap) / 2;

  ctx.font = '9.2px Arial, sans-serif';
  const addressLines = wrapCanvasText(ctx, data.buyerAddress, boxW - 24);
  const courierLines = wrapCanvasText(
    ctx,
    data.shippingZoneLabel,
    boxW - 24
  );
  const resiLines = wrapCanvasText(ctx, data.resiDisplay, boxW - 24);

  const leftCardContentHeight = 86 + addressLines.length * 13;
  const rightCardContentHeight =
    82 + courierLines.length * 12.5 + resiLines.length * 13;
  const cardH = Math.max(128, leftCardContentHeight, rightCardContentHeight);

  // Left Box: Diterbitkan Untuk
  drawRoundedRect(ctx, marginX, y, boxW, cardH, 7);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = '#DFC896';
  ctx.stroke();

  let ly = y + 18;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#8F6A23';
  ctx.font = 'bold 8px Arial, sans-serif';
  ctx.fillText('DITERBITKAN UNTUK (PRIVATE BUYER)', marginX + 12, ly);

  ly += 7;
  ctx.strokeStyle = '#EFE3C6';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(marginX + 12, ly);
  ctx.lineTo(marginX + boxW - 12, ly);
  ctx.stroke();

  ly += 17;
  ctx.fillStyle = '#141218';
  ctx.font = 'bold 12px Georgia, "Times New Roman", serif';
  ctx.fillText(data.buyerName, marginX + 12, ly);

  ly += 15;
  ctx.fillStyle = '#3F3B47';
  ctx.font = '9px Arial, sans-serif';
  ctx.fillText(`WhatsApp : ${data.buyerPhone}`, marginX + 12, ly);

  ly += 13;
  ctx.fillText(`Email        : ${data.buyerEmail}`, marginX + 12, ly);

  ly += 16;
  ctx.fillStyle = '#8F6A23';
  ctx.font = 'bold 7.5px Arial, sans-serif';
  ctx.fillText('ALAMAT PENGIRIMAN:', marginX + 12, ly);

  ly += 13;
  ctx.fillStyle = '#1F1D26';
  ctx.font = '9.2px Arial, sans-serif';
  for (const line of addressLines) {
    ctx.fillText(line, marginX + 12, ly);
    ly += 12.5;
  }

  // Right Box: Metode Pengiriman & Nomor Resi
  const rightX = marginX + boxW + boxGap;
  drawRoundedRect(ctx, rightX, y, boxW, cardH, 7);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = '#DFC896';
  ctx.stroke();

  let ry = y + 18;
  ctx.fillStyle = '#8F6A23';
  ctx.font = 'bold 8px Arial, sans-serif';
  ctx.fillText('METODE PENGIRIMAN & LOGISTIK RESMI', rightX + 12, ry);

  ry += 7;
  ctx.strokeStyle = '#EFE3C6';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(rightX + 12, ry);
  ctx.lineTo(rightX + boxW - 12, ry);
  ctx.stroke();

  ry += 17;
  ctx.fillStyle = '#141218';
  ctx.font = 'bold 11px Georgia, "Times New Roman", serif';
  ctx.fillText(data.courierDisplay, rightX + 12, ry);

  ry += 14;
  ctx.fillStyle = '#4B4652';
  ctx.font = '9px Arial, sans-serif';
  for (const line of courierLines) {
    ctx.fillText(line, rightX + 12, ry);
    ry += 12;
  }

  ry += 9;
  ctx.fillStyle = '#8F6A23';
  ctx.font = 'bold 7.5px Arial, sans-serif';
  ctx.fillText('NOMOR RESI PENGIRIMAN:', rightX + 12, ry);

  ry += 14;
  ctx.fillStyle = '#141218';
  ctx.font = 'bold 9.8px "Courier New", monospace';
  for (const line of resiLines) {
    ctx.fillText(line, rightX + 12, ry);
    ry += 13;
  }

  // 5. TABEL RINCIAN VALUASI RESMI
  y = y + cardH + 22;
  ctx.fillStyle = '#141218';
  ctx.font = 'bold 9.5px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('RINCIAN VALUASI & ALOKASI KOLEKSI RESMI', marginX, y);

  y += 9;
  const tableHeaderH = 28;
  drawRoundedRect(ctx, marginX, y, contentW, tableHeaderH, 5);
  ctx.fillStyle = '#16141C';
  ctx.fill();

  const colDescX = marginX + 12;
  const colQtyX = marginX + 340;
  const colRetailX = marginX + 455;
  const colDiscX = marginX + 580;
  const colNetX = W - marginX - 12;

  ctx.fillStyle = '#F2DBA0';
  ctx.font = 'bold 8px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('DESKRIPSI KOLEKSI', colDescX, y + 17);
  ctx.textAlign = 'center';
  ctx.fillText('QTY', colQtyX, y + 17);
  ctx.textAlign = 'right';
  ctx.fillText('RITEL BUTIK', colRetailX, y + 17);
  ctx.fillText('PRIVILEGE KURASI', colDiscX, y + 17);
  ctx.fillText('HARGA KURASI', colNetX, y + 17);

  y += tableHeaderH + 2;

  for (const item of data.items) {
    const descLines = wrapCanvasText(ctx, item.description, 295);
    const rowH = Math.max(46, 24 + descLines.length * 13);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(marginX, y, contentW, rowH);
    ctx.strokeStyle = '#E7D7B2';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(marginX, y + rowH);
    ctx.lineTo(W - marginX, y + rowH);
    ctx.stroke();

    let iy = y + 17;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#141218';
    ctx.font = 'bold 10.5px Georgia, "Times New Roman", serif';
    for (const dLine of descLines) {
      ctx.fillText(dLine, colDescX, iy);
      iy += 12.5;
    }
    ctx.fillStyle = '#6B6475';
    ctx.font = '8px Arial, sans-serif';
    ctx.fillText(
      `${item.concentration} · Kode Arsip: ${item.archiveCode}`,
      colDescX,
      iy + 1
    );

    // Qty
    ctx.textAlign = 'center';
    ctx.fillStyle = '#141218';
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.fillText(`${item.qty}`, colQtyX, y + 21);

    // Retail Price
    ctx.textAlign = 'right';
    ctx.fillStyle = '#736D7C';
    ctx.font = '9.2px "Courier New", monospace';
    const retailStr = formatIDRCurrency(item.retailLineIDR);
    ctx.fillText(retailStr, colRetailX, y + 21);
    const rWidth = ctx.measureText(retailStr).width;
    ctx.strokeStyle = '#9992A3';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(colRetailX - rWidth, y + 18);
    ctx.lineTo(colRetailX, y + 18);
    ctx.stroke();

    // Privilege Kurasi VORVAN
    ctx.fillStyle = '#166534';
    ctx.font = 'bold 8.5px Arial, sans-serif';
    ctx.fillText(`Diskon ${item.discountPct}%`, colDiscX, y + 17);
    ctx.font = '8.5px "Courier New", monospace';
    ctx.fillText(`-${formatIDRCurrency(item.discountIDR)}`, colDiscX, y + 29);

    // Curated Price
    ctx.fillStyle = '#141218';
    ctx.font = 'bold 10.5px "Courier New", monospace';
    ctx.fillText(formatIDRCurrency(item.curatedLineIDR), colNetX, y + 21);

    y += rowH;
  }

  // Summary Breakdown Block (Right-Aligned Luxury Ledger)
  y += 16;
  const ledgerW = 385;
  const ledgerX = W - marginX - ledgerW;

  const drawLedgerRow = (
    label: string,
    value: string,
    valueColor = '#141218',
    labelColor = '#4B4652',
    isBold = false
  ) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = labelColor;
    ctx.font = `${isBold ? 'bold ' : ''}9.2px Arial, sans-serif`;
    ctx.fillText(label, ledgerX + 8, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = valueColor;
    ctx.font = `${isBold ? 'bold ' : ''}9.8px "Courier New", monospace`;
    ctx.fillText(value, W - marginX - 8, y);
    y += 17;
  };

  drawLedgerRow(
    'Harga Ritel Butik Resmi (Pembanding)',
    formatIDRCurrency(data.retailTotalIDR),
    '#6B6475',
    '#4B4652'
  );
  drawLedgerRow(
    `Privilege Kurasi VORVAN (Diskon ${data.curationDiscountPct}%)`,
    `- ${formatIDRCurrency(data.curationDiscountIDR)}`,
    '#166534',
    '#8F6A23',
    true
  );
  drawLedgerRow(
    'Subtotal Nilai Koleksi Terkurasi',
    formatIDRCurrency(data.itemsSubtotalIDR),
    '#141218',
    '#141218',
    true
  );
  if (data.extraDiscountIDR > 0) {
    drawLedgerRow(
      'Voucher Tambahan / Ekstra Privilese VIP',
      `- ${formatIDRCurrency(data.extraDiscountIDR)}`,
      '#166534',
      '#8F6A23',
      true
    );
  }
  drawLedgerRow(
    'Ongkos Kirim Berasuransi & Packaging Protektif',
    data.shippingInsuranceIDR === 0
      ? 'COMPLIMENTARY (Rp 0)'
      : formatIDRCurrency(data.shippingInsuranceIDR),
    data.shippingInsuranceIDR === 0 ? '#166534' : '#141218',
    '#4B4652'
  );

  // Grand Total Highlight Bar
  y += 4;
  drawRoundedRect(ctx, ledgerX, y, ledgerW, 38, 6);
  ctx.fillStyle = '#15131B';
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = '#C5A059';
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#F2DBA0';
  ctx.font = 'bold 10px Arial, sans-serif';
  ctx.fillText('TOTAL TAGIHAN RESMI', ledgerX + 12, y + 22);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14.5px "Courier New", monospace';
  ctx.fillText(formatIDRCurrency(data.grandTotalIDR), W - marginX - 12, y + 23);

  // 6. FOOTER LEGAL & STEMPEL KURASI DIGITAL (BAWAH DOKUMEN)
  const footerTopY = Math.max(y + 62, H - 256);
  ctx.strokeStyle = '#C5A059';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(marginX, footerTopY);
  ctx.lineTo(W - marginX, footerTopY);
  ctx.stroke();

  const sealRadius = 65; // Exact 130x130px logical diameter Luxury Concentric Vault Seal
  const legalMaxW = contentW - (sealRadius * 2 + 28);
  let fy = footerTopY + 22;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#8F6A23';
  ctx.font = 'bold 9px Arial, sans-serif';
  ctx.fillText(
    'CATATAN LEGAL, STANDAR KURASI & GARANSI LAYANAN VORVAN',
    marginX,
    fy
  );

  fy += 17;
  const agreementText = data.electronicAgreementTimestamp
    ? `Persetujuan Elektronik Pembeli: Tercatat SAH pada ${data.electronicAgreementTimestamp}`
    : 'Persetujuan Elektronik Pembeli: Menunggu centang persetujuan Syarat & Ketentuan pada Portal Invoice VORVAN';
  ctx.fillStyle = data.electronicAgreementTimestamp ? '#166534' : '#6B4E16';
  ctx.font = 'bold 8.8px Arial, sans-serif';
  for (const line of wrapCanvasText(ctx, agreementText, legalMaxW)) {
    ctx.fillText(line, marginX, fy);
    fy += 13;
  }

  fy += 6;
  const legalClauses = [
    '1. Direct International Curation: Setiap unit dikurasi langsung dari jalur arsip internasional resmi dengan inspeksi segel Vault berlapis & pengecekan fisik menyeluruh sebelum pengiriman.',
    '2. Garansi Unboxing 360° Tanpa Jeda (1x24 Jam): Klaim kerusakan fisik, kebocoran botol, atau ketidaksesuaian pesanan wajib disertai rekaman video unboxing utuh 360° tanpa jeda/potongan sejak segel paket dibuka dalam batas waktu 1x24 jam.',
    '3. Kebijakan Final Sale: Demi higienitas dan integritas koleksi mewah, seluruh transaksi bersifat Final Sale & Non-Retur untuk perubahan pikiran maupun penilaian selera aroma yang bersifat subjektif.',
  ];

  ctx.fillStyle = '#332F3B';
  ctx.font = '8.3px Arial, sans-serif';
  for (const clause of legalClauses) {
    const wrapped = wrapCanvasText(ctx, clause, legalMaxW);
    for (const line of wrapped) {
      ctx.fillText(line, marginX, fy);
      fy += 12;
    }
    fy += 4;
  }

  // Symmetric 130x130 Luxury Concentric Vault Seal on the right
  drawDigitalVaultSeal(
    ctx,
    W - marginX - sealRadius - 4,
    footerTopY + 95,
    sealRadius
  );

  // Bottom signature / authenticity line
  ctx.textAlign = 'center';
  ctx.fillStyle = '#8F6A23';
  ctx.font = 'bold 7.5px Arial, sans-serif';
  ctx.fillText(
    'VORVAN OFFICIAL VAULT · VERIFIED CURATION DOCUMENT · WWW.VORVANOFFICIAL.COM',
    W / 2,
    H - 40
  );

  return canvas;
}

/**
 * Generates and downloads an Ultra-HD lossless PNG-embedded A4 PDF (`scale: 4`, >300 DPI)
 * named `VORVAN-Official-Invoice-[NOMOR_INVOICE].pdf` across Android, iOS, and Desktop browsers.
 */
export async function downloadOfficialPdfInvoice(
  data: OfficialPdfInvoiceData
): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  const logoImg = await loadOfficialVorvanLogoImage();
  const canvas = renderOfficialInvoiceCanvas(data, logoImg);
  const imgData = canvas.toDataURL('image/png', PDF_RENDER_CONFIG.quality);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: false,
  });

  pdf.addImage(
    imgData,
    PDF_RENDER_CONFIG.format,
    0,
    0,
    210,
    297,
    undefined,
    'NONE'
  );
  pdf.save(data.filename);
  return true;
}
