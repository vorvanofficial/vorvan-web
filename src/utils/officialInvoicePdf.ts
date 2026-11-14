import { jsPDF } from 'jspdf';
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

function drawVorvanMonogramCrest(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
) {
  ctx.save();
  // Dark espresso/onyx medallion core
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#15131B';
  ctx.fill();

  // Outer antique gold ring
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#C5A059';
  ctx.stroke();

  // Inner fine champagne ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 7, 0, Math.PI * 2);
  ctx.lineWidth = 1.25;
  ctx.strokeStyle = '#E6CA82';
  ctx.stroke();

  // Monogram "V"
  ctx.fillStyle = '#F2DBA0';
  ctx.font = `bold ${Math.round(radius * 1.15)}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('V', cx, cy + 2);
  ctx.restore();
}

function drawDigitalVaultSeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-6 * Math.PI) / 180);

  // Outer seal circle
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(197, 160, 89, 0.08)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#B88E3D';
  ctx.stroke();

  // Inner dashed circle
  ctx.save();
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.arc(0, 0, radius - 10, 0, Math.PI * 2);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#C5A059';
  ctx.stroke();
  ctx.restore();

  // Innermost solid ring
  ctx.beginPath();
  ctx.arc(0, 0, radius - 17, 0, Math.PI * 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#D4AF37';
  ctx.stroke();

  // Seal Texts
  ctx.fillStyle = '#7D5C1B';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('VORVAN OFFICIAL VAULT', 0, -40);

  ctx.font = 'bold 40px Georgia, "Times New Roman", serif';
  ctx.fillStyle = '#9D7728';
  ctx.fillText('V', 0, -2);

  ctx.fillStyle = '#7D5C1B';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('VERIFIED CURATION', 0, 32);
  ctx.fillText('DOCUMENT', 0, 48);

  ctx.restore();
}

/**
 * Renders the Official A4 VORVAN Luxury Boutique Invoice onto a crisp high-DPI HTML5 Canvas
 * (1654 x 2339 px — ISO 210mm x 297mm A4 at 200 DPI) using hex colors exclusively
 * for 100% reliability on Android, iOS, and Desktop browsers.
 */
export function renderOfficialInvoiceCanvas(
  data: OfficialPdfInvoiceData
): HTMLCanvasElement {
  const W = 1654;
  const H = 2339;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable.');
  }

  // 1. Luxury Warm Ivory Paper Background + Subtle Gold Frame
  ctx.fillStyle = '#FCF9F2';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#C5A059';
  ctx.lineWidth = 3;
  ctx.strokeRect(42, 42, W - 84, H - 84);

  ctx.strokeStyle = '#E4CFA0';
  ctx.lineWidth = 1.25;
  ctx.strokeRect(54, 54, W - 108, H - 108);

  const marginX = 94;
  const contentW = W - marginX * 2;

  // 2. KOP SURAT RESMI (HEADER)
  drawVorvanMonogramCrest(ctx, marginX + 54, 146, 52);

  ctx.fillStyle = '#141218';
  ctx.font = 'bold 34px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'left';
  ctx.fillText('VORVAN — LA MAISON DE HAUTE PARFUMERIE', marginX + 132, 126);

  ctx.fillStyle = '#8F6A23';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText(
    'PRIVATE FRAGRANCE CURATION · DIRECT INTERNATIONAL ARCHIVE',
    marginX + 132,
    160
  );

  ctx.fillStyle = '#4B4652';
  ctx.font = '17px Arial, sans-serif';
  ctx.fillText(
    `Official Portal: www.vorvanofficial.com  |  Concierge: ${
      data.conciergeEmail || 'vorvanlifestyle@gmail.com'
    }`,
    marginX + 132,
    190
  );

  // Double gold hairline divider under Kop Surat
  ctx.strokeStyle = '#C5A059';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(marginX, 230);
  ctx.lineTo(W - marginX, 230);
  ctx.stroke();

  ctx.strokeStyle = '#E5D1A2';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(marginX, 238);
  ctx.lineTo(W - marginX, 238);
  ctx.stroke();

  // 3. METADATA DOKUMEN & STATUS STEMPEL
  let y = 285;
  ctx.fillStyle = '#8F6A23';
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('DOKUMEN TAGIHAN RESMI (OFFICIAL INVOICE)', marginX, y);

  y += 42;
  ctx.fillStyle = '#141218';
  ctx.font = 'bold 34px "Courier New", monospace';
  ctx.fillText(`#${data.invoiceId}`, marginX, y);

  y += 32;
  ctx.fillStyle = '#3F3B47';
  ctx.font = '18px Arial, sans-serif';
  ctx.fillText(`Tanggal Terbit : ${data.createdAt}`, marginX, y);
  y += 28;
  ctx.fillText(`Berlaku Hingga : ${data.expiresAt}`, marginX, y);

  // Right-side Status Stamp Badge
  const badgeW = 590;
  const badgeH = 92;
  const badgeX = W - marginX - badgeW;
  const badgeY = 272;

  ctx.save();
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 12);
  ctx.fillStyle = data.isPaid ? '#ECFDF3' : '#FEF8EA';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = data.isPaid ? '#1E7E4C' : '#C5922C';
  ctx.stroke();

  drawRoundedRect(ctx, badgeX + 6, badgeY + 6, badgeW - 12, badgeH - 12, 8);
  ctx.lineWidth = 1;
  ctx.strokeStyle = data.isPaid ? '#74C69D' : '#E2BE6F';
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = data.isPaid ? '#135E38' : '#7D5410';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText('STATUS OTORISASI DOKUMEN', badgeX + badgeW / 2, badgeY + 32);
  ctx.font = 'bold 21px Arial, sans-serif';
  ctx.fillText(data.statusStampLabel, badgeX + badgeW / 2, badgeY + 64);
  ctx.restore();

  // 4. DATA KLIEN & LOGISTIK (2 SIDE-BY-SIDE CARDS)
  y = 420;
  const boxGap = 28;
  const boxW = (contentW - boxGap) / 2;

  // Compute wrapped address height cleanly
  ctx.font = '18px Arial, sans-serif';
  const addressLines = wrapCanvasText(ctx, data.buyerAddress, boxW - 48);
  const courierLines = wrapCanvasText(
    ctx,
    data.shippingZoneLabel,
    boxW - 48
  );
  const resiLines = wrapCanvasText(ctx, data.resiDisplay, boxW - 48);

  const leftCardContentHeight = 164 + addressLines.length * 26;
  const rightCardContentHeight =
    152 + courierLines.length * 24 + resiLines.length * 26;
  const cardH = Math.max(250, leftCardContentHeight, rightCardContentHeight);

  // Left Box: Diterbitkan Untuk
  drawRoundedRect(ctx, marginX, y, boxW, cardH, 12);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#DFC896';
  ctx.stroke();

  let ly = y + 36;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#8F6A23';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillText('DITERBITKAN UNTUK (PRIVATE BUYER)', marginX + 24, ly);

  ly += 14;
  ctx.strokeStyle = '#EFE3C6';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(marginX + 24, ly);
  ctx.lineTo(marginX + boxW - 24, ly);
  ctx.stroke();

  ly += 34;
  ctx.fillStyle = '#141218';
  ctx.font = 'bold 23px Georgia, "Times New Roman", serif';
  ctx.fillText(data.buyerName, marginX + 24, ly);

  ly += 30;
  ctx.fillStyle = '#3F3B47';
  ctx.font = '17px Arial, sans-serif';
  ctx.fillText(`WhatsApp : ${data.buyerPhone}`, marginX + 24, ly);

  ly += 26;
  ctx.fillText(`Email        : ${data.buyerEmail}`, marginX + 24, ly);

  ly += 32;
  ctx.fillStyle = '#8F6A23';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText('ALAMAT PENGIRIMAN:', marginX + 24, ly);

  ly += 25;
  ctx.fillStyle = '#1F1D26';
  ctx.font = '18px Arial, sans-serif';
  for (const line of addressLines) {
    ctx.fillText(line, marginX + 24, ly);
    ly += 25;
  }

  // Right Box: Metode Pengiriman & Nomor Resi
  const rightX = marginX + boxW + boxGap;
  drawRoundedRect(ctx, rightX, y, boxW, cardH, 12);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#DFC896';
  ctx.stroke();

  let ry = y + 36;
  ctx.fillStyle = '#8F6A23';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillText('METODE PENGIRIMAN & LOGISTIK RESMI', rightX + 24, ry);

  ry += 14;
  ctx.strokeStyle = '#EFE3C6';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rightX + 24, ry);
  ctx.lineTo(rightX + boxW - 24, ry);
  ctx.stroke();

  ry += 34;
  ctx.fillStyle = '#141218';
  ctx.font = 'bold 21px Georgia, "Times New Roman", serif';
  ctx.fillText(data.courierDisplay, rightX + 24, ry);

  ry += 28;
  ctx.fillStyle = '#4B4652';
  ctx.font = '17px Arial, sans-serif';
  for (const line of courierLines) {
    ctx.fillText(line, rightX + 24, ry);
    ry += 24;
  }

  ry += 16;
  ctx.fillStyle = '#8F6A23';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText('NOMOR RESI PENGIRIMAN:', rightX + 24, ry);

  ry += 28;
  ctx.fillStyle = '#141218';
  ctx.font = 'bold 19px "Courier New", monospace';
  for (const line of resiLines) {
    ctx.fillText(line, rightX + 24, ry);
    ry += 26;
  }

  // 5. TABEL RINCIAN VALUASI RESMI
  y = y + cardH + 42;
  ctx.fillStyle = '#141218';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('RINCIAN VALUASI & ALOKASI KOLEKSI RESMI', marginX, y);

  y += 18;
  const tableHeaderH = 54;
  drawRoundedRect(ctx, marginX, y, contentW, tableHeaderH, 8);
  ctx.fillStyle = '#16141C';
  ctx.fill();

  const colDescX = marginX + 22;
  const colQtyX = marginX + 700;
  const colRetailX = marginX + 940;
  const colDiscX = marginX + 1200;
  const colNetX = W - marginX - 22;

  ctx.fillStyle = '#F2DBA0';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('DESKRIPSI KOLEKSI', colDescX, y + 33);
  ctx.textAlign = 'center';
  ctx.fillText('QTY', colQtyX, y + 33);
  ctx.textAlign = 'right';
  ctx.fillText('RITEL BUTIK', colRetailX, y + 33);
  ctx.fillText('PRIVILEGE KURASI', colDiscX, y + 33);
  ctx.fillText('HARGA KURASI', colNetX, y + 33);

  y += tableHeaderH + 4;

  for (const item of data.items) {
    const descLines = wrapCanvasText(ctx, item.description, 610);
    const rowH = Math.max(92, 48 + descLines.length * 26);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(marginX, y, contentW, rowH);
    ctx.strokeStyle = '#E7D7B2';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(marginX, y + rowH);
    ctx.lineTo(W - marginX, y + rowH);
    ctx.stroke();

    let iy = y + 34;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#141218';
    ctx.font = 'bold 20px Georgia, "Times New Roman", serif';
    for (const dLine of descLines) {
      ctx.fillText(dLine, colDescX, iy);
      iy += 25;
    }
    ctx.fillStyle = '#6B6475';
    ctx.font = '15px Arial, sans-serif';
    ctx.fillText(
      `${item.concentration} · Kode Arsip: ${item.archiveCode}`,
      colDescX,
      iy + 2
    );

    // Qty
    ctx.textAlign = 'center';
    ctx.fillStyle = '#141218';
    ctx.font = 'bold 19px "Courier New", monospace';
    ctx.fillText(`${item.qty}`, colQtyX, y + 40);

    // Retail Price
    ctx.textAlign = 'right';
    ctx.fillStyle = '#736D7C';
    ctx.font = '18px "Courier New", monospace';
    const retailStr = formatIDRCurrency(item.retailLineIDR);
    ctx.fillText(retailStr, colRetailX, y + 40);
    const rWidth = ctx.measureText(retailStr).width;
    ctx.strokeStyle = '#9992A3';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(colRetailX - rWidth, y + 34);
    ctx.lineTo(colRetailX, y + 34);
    ctx.stroke();

    // Privilege Kurasi VORVAN
    ctx.fillStyle = '#166534';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText(`Diskon ${item.discountPct}%`, colDiscX, y + 34);
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText(`-${formatIDRCurrency(item.discountIDR)}`, colDiscX, y + 58);

    // Curated Price
    ctx.fillStyle = '#141218';
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillText(formatIDRCurrency(item.curatedLineIDR), colNetX, y + 40);

    y += rowH;
  }

  // Summary Breakdown Block (Right-Aligned Luxury Ledger)
  y += 28;
  const ledgerW = 790;
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
    ctx.font = `${isBold ? 'bold ' : ''}18px Arial, sans-serif`;
    ctx.fillText(label, ledgerX + 16, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = valueColor;
    ctx.font = `${isBold ? 'bold ' : ''}19px "Courier New", monospace`;
    ctx.fillText(value, W - marginX - 16, y);
    y += 34;
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
  y += 6;
  drawRoundedRect(ctx, ledgerX, y, ledgerW, 74, 10);
  ctx.fillStyle = '#15131B';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#C5A059';
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#F2DBA0';
  ctx.font = 'bold 19px Arial, sans-serif';
  ctx.fillText('TOTAL TAGIHAN RESMI', ledgerX + 24, y + 44);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillText(formatIDRCurrency(data.grandTotalIDR), W - marginX - 24, y + 46);

  // 6. FOOTER LEGAL & STEMPEL KURASI DIGITAL (BAWAH DOKUMEN)
  const footerTopY = Math.max(y + 120, H - 520);
  ctx.strokeStyle = '#C5A059';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(marginX, footerTopY);
  ctx.lineTo(W - marginX, footerTopY);
  ctx.stroke();

  const legalMaxW = contentW - 260;
  let fy = footerTopY + 42;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#8F6A23';
  ctx.font = 'bold 17px Arial, sans-serif';
  ctx.fillText(
    'CATATAN LEGAL, OTENTISITAS KURASI & GARANSI LAYANAN VORVAN',
    marginX,
    fy
  );

  fy += 32;
  const agreementText = data.electronicAgreementTimestamp
    ? `Persetujuan Elektronik Pembeli: Tercatat SAH pada ${data.electronicAgreementTimestamp}`
    : 'Persetujuan Elektronik Pembeli: Menunggu centang persetujuan Syarat & Ketentuan pada Portal Invoice VORVAN';
  ctx.fillStyle = data.electronicAgreementTimestamp ? '#166534' : '#6B4E16';
  ctx.font = 'bold 17px Arial, sans-serif';
  for (const line of wrapCanvasText(ctx, agreementText, legalMaxW)) {
    ctx.fillText(line, marginX, fy);
    fy += 25;
  }

  fy += 10;
  const legalClauses = [
    '1. Direct International Curation: Setiap unit dikurasi langsung dari jalur arsip internasional resmi dengan inspeksi segel Vault berlapis & pengecekan fisik menyeluruh sebelum pengiriman.',
    '2. Garansi Unboxing 360° Tanpa Jeda (1x24 Jam): Klaim kerusakan fisik, kebocoran botol, atau ketidaksesuaian pesanan wajib disertai rekaman video unboxing utuh 360° tanpa jeda/potongan sejak segel paket dibuka dalam batas waktu 1x24 jam.',
    '3. Kebijakan Final Sale: Demi higienitas dan integritas koleksi mewah, seluruh transaksi bersifat Final Sale & Non-Retur untuk perubahan pikiran maupun penilaian selera aroma yang bersifat subjektif.',
  ];

  ctx.fillStyle = '#332F3B';
  ctx.font = '16px Arial, sans-serif';
  for (const clause of legalClauses) {
    const wrapped = wrapCanvasText(ctx, clause, legalMaxW);
    for (const line of wrapped) {
      ctx.fillText(line, marginX, fy);
      fy += 23;
    }
    fy += 8;
  }

  // Digital Seal on the right
  drawDigitalVaultSeal(ctx, W - marginX - 110, footerTopY + 175, 96);

  // Bottom signature / authenticity line
  ctx.textAlign = 'center';
  ctx.fillStyle = '#8F6A23';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText(
    'VORVAN OFFICIAL VAULT · VERIFIED CURATION DOCUMENT · WWW.VORVANOFFICIAL.COM',
    W / 2,
    H - 82
  );

  return canvas;
}

/**
 * Generates and downloads a real A4 PDF file named `VORVAN-Official-Invoice-[NOMOR_INVOICE].pdf`
 * across Android, iOS, and Desktop browsers.
 */
export async function downloadOfficialPdfInvoice(
  data: OfficialPdfInvoiceData
): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  const canvas = renderOfficialInvoiceCanvas(data);
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  pdf.save(data.filename);
  return true;
}
