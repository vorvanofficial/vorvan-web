import { ConciergeEmailLead, CustomAdminOrder } from '../types/fragrance';
import {
  applyPaymentProofToOrders,
  buildSmartShareUrl,
  loadDeletedInvoiceIds,
  loadDeletedLeadEmails,
  loadPaymentProofsMap,
  markInvoiceIdDeleted,
  markLeadEmailDeleted,
  mergeCloudAndLocalOrder,
  normalizeInvoiceIdKey,
  reindexVisitorLeads,
  removePaymentProofRecord,
  saveDeletedInvoiceIds,
  savePaymentProofRecord,
  syncOrderDynamicResiFields,
  unmarkLeadEmailDeleted,
} from './businessRules';

export const FORMSUBMIT_GMAIL_ENDPOINT =
  'https://formsubmit.co/ajax/vorvanlifestyle@gmail.com';

export const VORVAN_EMAIL_WEBHOOK =
  'https://script.google.com/macros/s/AKfycbwZnH1EY8q-hV0o-E-Gz0DsbGQAOKs7v4VqwOiSYvEIjKykV_80TCzroPM95yVMEpwlCw/exec';

export const VORVAN_KVDB_SHARED_URL =
  'https://kvdb.io/A9x7VorvanVault2026Official/vorvan_state_v1';

export const VORVAN_RESTFUL_KV_URL =
  'https://api.restful-api.dev/objects/ff808181a09d98f701a1985bf76f018a';

export const VORVAN_CLOUD_SYNC_TOPIC =
  'https://ntfy.sh/vorvan_vault_sync_2026_v1';

export type CloudVaultPacket =
  | {
      kind: 'VORVAN_LEAD';
      lead: ConciergeEmailLead;
      ts: number;
    }
  | {
      kind: 'VORVAN_LEAD_DELETE';
      email: string;
      ts: number;
    }
  | {
      kind: 'VORVAN_ORDER_UPSERT';
      order: CustomAdminOrder;
      ts: number;
    }
  | {
      kind: 'VORVAN_ORDER_RESI_UPDATE';
      invoiceId: string;
      resi: string;
      trackingNumber: string;
      noResi: string;
      awbNumber: string;
      courier: string;
      shippingMethod: string;
      isCOD?: boolean;
      isDelivered?: boolean;
      trackingStage?: 1 | 2 | 3 | 4;
      shippingStage?: 1 | 2 | 3 | 4;
      status?: 'PENDING_PAYMENT' | 'PAID';
      resiInputAt?: number;
      resiUpdatedAt?: number;
      updatedAt?: number;
      updatedAtMs?: number;
      ts: number;
    }
  | {
      kind: 'VORVAN_ORDER_STATUS';
      invoiceId: string;
      status: 'PENDING_PAYMENT' | 'PAID';
      ts: number;
    }
  | {
      kind: 'VORVAN_ORDER_DELETE';
      invoiceId: string;
      ts: number;
    }
  | {
      kind: 'VORVAN_PAYMENT_PROOF';
      invoiceId: string;
      paymentProofUrl: string;
      uploadedAt: string;
      autoMarkPaid?: boolean;
      ts: number;
    }
  | {
      kind: 'VORVAN_PAYMENT_PROOF_CHUNK';
      invoiceId: string;
      uploadedAt: string;
      autoMarkPaid?: boolean;
      chunkIndex: number;
      totalChunks: number;
      chunkData: string;
      ts: number;
    };

export const VORVAN_CLEAN_OFFICIAL_DOMAIN = 'https://vorvanofficial.com';

/**
 * 1. Sends a new visitor email registration directly to VORVAN's official Gmail
 * (`vorvanlifestyle@gmail.com`) via FormSubmit AJAX HTTP POST.
 * Strips any query strings so Gmail spam filters never flag encrypted parameters.
 */
export async function sendVisitorLeadToGmail(params: {
  leadId: string;
  visitorEmail: string;
  triggeredByFragrance?: string;
  waktuDaftar?: string;
  sumberWeb?: string;
}): Promise<boolean> {
  const visitorEmail = params.visitorEmail.trim();
  const leadId = params.leadId.trim();
  const waktuDaftar =
    params.waktuDaftar || new Date().toLocaleString('id-ID');
  const rawSumber = (params.sumberWeb || VORVAN_CLEAN_OFFICIAL_DOMAIN).trim();
  const cleanSumberWeb = rawSumber.includes('?')
    ? rawSumber.split('?')[0]
    : rawSumber;

  try {
    const response = await fetch(FORMSUBMIT_GMAIL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: '🌟 VIP Lead Baru VORVAN: ' + visitorEmail,
        ID_Lead: leadId,
        Email_Klien: visitorEmail,
        Waktu_Daftar: waktuDaftar,
        Parfum_Diminati:
          params.triggeredByFragrance || 'Katalog Umum VORVAN',
        Sumber_Web: cleanSumberWeb,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Builds the official luxury HTML email template containing the `<a href="...">BUKA DOKUMEN & PEMBAYARAN</a>`
 * button with the full Auto-Open Invoice URL (`?v=...&inv=...&id=...`).
 */
export function buildBuyerInvoiceEmailHtmlTemplate(params: {
  buyerName: string;
  invNo: string;
  itemName: string;
  totalPrice: string;
  invoiceUrl: string;
}): string {
  const cleanInvNo = params.invNo.trim().toUpperCase();
  const cleanBuyerName = params.buyerName.trim();
  const cleanItemName = params.itemName.trim();
  const cleanTotalPrice = params.totalPrice.trim();
  const fullAutoOpenUrl = params.invoiceUrl.trim();

  return (
    `<div style="background-color:#0B0A0E;color:#FAF8F5;padding:32px 24px;font-family:Georgia,serif;border:1px solid #D4AF37;border-radius:16px;max-width:600px;margin:0 auto;">` +
    `<p style="color:#E5C87E;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px 0;">VORVAN OFFICIAL · PRIVATE CLIENT INVOICE</p>` +
    `<h2 style="color:#FFFFFF;font-size:24px;margin:0 0 16px 0;">Tagihan Privat #${cleanInvNo}</h2>` +
    `<p style="color:#E4E4E7;font-size:14px;line-height:1.6;">Yth. <strong>${cleanBuyerName}</strong>,</p>` +
    `<p style="color:#D4D4D8;font-size:14px;line-height:1.6;">Berikut dokumen resmi alokasi parfum Anda di VORVAN Vault:</p>` +
    `<div style="background-color:#14131B;border:1px solid rgba(212,175,55,0.4);border-radius:12px;padding:16px;margin:20px 0;">` +
    `<p style="margin:4px 0;color:#FAF8F5;font-size:14px;"><strong>Nomor Invoice:</strong> #${cleanInvNo}</p>` +
    `<p style="margin:4px 0;color:#E5C87E;font-size:14px;"><strong>Alokasi Parfum:</strong> ${cleanItemName}</p>` +
    `<p style="margin:8px 0 4px 0;color:#34D399;font-size:16px;"><strong>Total Tagihan Resmi: ${cleanTotalPrice}</strong></p>` +
    `</div>` +
    `<div style="text-align:center;margin:28px 0;">` +
    `<a href="${fullAutoOpenUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;background-color:#D4AF37;color:#0B0A0E;font-weight:bold;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-radius:10px;">BUKA DOKUMEN &amp; PEMBAYARAN</a>` +
    `</div>` +
    `<p style="margin:20px 0 0 0;padding-top:16px;border-top:1px solid rgba(212,175,55,0.25);color:#A1A1AA;font-size:11px;text-align:center;letter-spacing:1px;">VORVAN Official · Private Fragrance Curation &amp; Direct International Curation (https://vorvanofficial.com)</p>` +
    `</div>`
  );
}

/**
 * Sends an automatic backup of a newly created Admin Invoice & Resi to VORVAN's Gmail
 * (`vorvanlifestyle@gmail.com`) via FormSubmit AJAX, including the full Auto-Open Invoice URL.
 */
export async function sendAdminOrderBackupToGmail(
  order: CustomAdminOrder,
  invoiceSmartUrl?: string,
  _trackingSmartUrl?: string
): Promise<boolean> {
  const qty = Math.max(1, Math.round(order.quantity || 1));
  const extraDisc = Math.max(0, Math.round(order.extraDiscountIDR || 0));
  const grandTotal = Math.max(
    0,
    order.dealPriceIDR * qty - extraDisc + (order.shippingCostIDR || 0)
  );
  const qtySuffix = qty > 1 ? ` × ${qty} Flacon` : '';
  const resolvedInvoiceUrl =
    (invoiceSmartUrl || '').trim() ||
    buildSmartShareUrl(order, 'invoice', VORVAN_CLEAN_OFFICIAL_DOMAIN);

  try {
    const response = await fetch(FORMSUBMIT_GMAIL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: `🧾 Invoice Resmi VORVAN: ${order.invoiceId} (${order.buyerName})`,
        Nomor_Invoice_Resmi: order.invoiceId,
        Nama_Pembeli: order.buyerName,
        Parfum: `${order.house} — ${order.fragranceName} (${order.volume})${qtySuffix}`,
        Total_Tagihan: `Rp ${grandTotal.toLocaleString('id-ID')}`,
        Link_Buka_Dokumen_Pembayaran: resolvedInvoiceUrl,
        Website_Resmi: VORVAN_CLEAN_OFFICIAL_DOMAIN,
        Waktu_Terbit: order.createdAt,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fires an automatic HTTP POST to the official VORVAN Google Apps Script webhook
 * to immediately dispatch the luxury invoice email directly to the buyer's inbox.
 * Embeds the complete Auto-Open Invoice URL (`?v=...&inv=...&id=...`) on the
 * `<a href="...">BUKA DOKUMEN & PEMBAYARAN</a>` button so clicking the button
 * opens the full Invoice & Payment Instructions immediately without manual code entry.
 */
export async function sendBuyerInvoiceEmailWebhook(params: {
  buyerEmail: string;
  buyerName: string;
  invNo: string;
  itemName: string;
  totalPrice: string;
  invoiceUrl?: string;
  order?: CustomAdminOrder;
}): Promise<boolean> {
  const buyerEmail = params.buyerEmail.trim();
  if (!buyerEmail) return false;

  const cleanInvNo = params.invNo.trim().toUpperCase();
  const cleanBuyerName = params.buyerName.trim();
  const cleanItemName = params.itemName.trim();
  const cleanTotalPrice = params.totalPrice.trim();

  const rawUrl = (params.invoiceUrl || '').trim();
  const resolvedInvoiceUrl =
    rawUrl && (rawUrl.includes('?') || rawUrl.includes('#'))
      ? rawUrl
      : params.order
      ? buildSmartShareUrl(
          params.order,
          'invoice',
          rawUrl || VORVAN_CLEAN_OFFICIAL_DOMAIN
        )
      : `${rawUrl || VORVAN_CLEAN_OFFICIAL_DOMAIN}/?inv=${encodeURIComponent(
          cleanInvNo
        )}&id=${encodeURIComponent(cleanInvNo)}`;

  const htmlBody = buildBuyerInvoiceEmailHtmlTemplate({
    buyerName: cleanBuyerName,
    invNo: cleanInvNo,
    itemName: cleanItemName,
    totalPrice: cleanTotalPrice,
    invoiceUrl: resolvedInvoiceUrl,
  });

  try {
    await fetch(VORVAN_EMAIL_WEBHOOK, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        buyerEmail,
        buyerName: cleanBuyerName,
        invNo: cleanInvNo,
        itemName: cleanItemName,
        totalPrice: cleanTotalPrice,
        invoiceUrl: resolvedInvoiceUrl,
        websiteUrl: resolvedInvoiceUrl,
        buttonUrl: resolvedInvoiceUrl,
        buttonLabel: 'BUKA DOKUMEN & PEMBAYARAN',
        ctaButtonHtml: `<a href="${resolvedInvoiceUrl}" target="_blank" rel="noopener noreferrer">BUKA DOKUMEN &amp; PEMBAYARAN</a>`,
        htmlBody,
        emailSummary:
          `Nomor Invoice Resmi: #${cleanInvNo}\n` +
          `Pesanan Parfum: ${cleanItemName}\n` +
          `Total Tagihan: ${cleanTotalPrice}\n` +
          `Buka Dokumen & Pembayaran: ${resolvedInvoiceUrl}`,
      }),
    });
    return true;
  } catch (err) {
    console.warn('sendBuyerInvoiceEmailWebhook failed:', err);
    return false;
  }
}

/**
 * Fires an automated notification to the Google Apps Script webhook
 * when a buyer uploads their payment transfer proof.
 */
export async function sendPaymentProofWebhook(params: {
  invNo: string;
  buyerName: string;
  itemName?: string;
  totalPrice?: string;
  uploadedAt: string;
  autoMarkPaid?: boolean;
  hasProofImage: boolean;
}): Promise<boolean> {
  try {
    await fetch(VORVAN_EMAIL_WEBHOOK, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'PAYMENT_PROOF_UPLOADED',
        invNo: params.invNo.trim(),
        buyerName: params.buyerName.trim(),
        itemName: params.itemName || 'Parfum Niche VORVAN',
        totalPrice: params.totalPrice || '',
        uploadedAt: params.uploadedAt,
        status: params.autoMarkPaid ? 'PAID' : 'PENDING_VERIFICATION',
        hasProofImage: params.hasProofImage,
      }),
    });
    return true;
  } catch (err) {
    console.warn('sendPaymentProofWebhook failed:', err);
    return false;
  }
}

/**
 * Syncs the full shared JSON state (`{ invoices, leads, deletedIds }`)
 * to the fixed Cloud Key-Value endpoint (`https://kvdb.io/A9x7VorvanVault2026Official/vorvan_state_v1`)
 * and secondary backup store (`VORVAN_RESTFUL_KV_URL`) so Android, Laptop, and Incognito browsers stay 100% synchronized.
 */
export async function saveSharedCloudLeadsAndOrders(
  leads: ConciergeEmailLead[],
  orders: CustomAdminOrder[],
  explicitDeletedInvoiceIds?: Iterable<string>,
  explicitDeletedLeadEmails?: Iterable<string>
): Promise<boolean> {
  let anySuccess = false;

  const combinedDeletedInvoiceIds = loadDeletedInvoiceIds();
  if (explicitDeletedInvoiceIds) {
    for (const rawId of explicitDeletedInvoiceIds) {
      const clean = normalizeInvoiceIdKey(rawId);
      if (clean) combinedDeletedInvoiceIds.add(clean);
    }
    saveDeletedInvoiceIds(combinedDeletedInvoiceIds);
  }

  const combinedDeletedLeadEmails = loadDeletedLeadEmails();
  if (explicitDeletedLeadEmails) {
    for (const rawEmail of explicitDeletedLeadEmails) {
      const cleanEmail = (rawEmail || '').trim().toLowerCase();
      if (cleanEmail) {
        combinedDeletedLeadEmails.add(cleanEmail);
        markLeadEmailDeleted(cleanEmail);
      }
    }
  }

  // First pull existing cloud objects from BOTH KVDB and RESTful backup concurrently
  // so another device's concurrent invoice/resi/lead updates are preserved via Field-Level Smart Merge.
  const cloudExistingLeads: ConciergeEmailLead[] = [];
  let cloudExistingOrders: CustomAdminOrder[] = [];

  const absorbDeletedIds = (ids?: unknown) => {
    if (!Array.isArray(ids)) return;
    for (const id of ids) {
      if (typeof id === 'string') {
        const clean = normalizeInvoiceIdKey(id);
        if (clean) combinedDeletedInvoiceIds.add(clean);
      }
    }
  };

  const absorbDeletedEmails = (emails?: unknown) => {
    if (!Array.isArray(emails)) return;
    for (const email of emails) {
      if (typeof email === 'string') {
        const clean = email.trim().toLowerCase();
        if (clean) {
          combinedDeletedLeadEmails.add(clean);
          markLeadEmailDeleted(clean);
        }
      }
    }
  };

  const absorbOrders = (rawOrders?: unknown) => {
    if (!Array.isArray(rawOrders)) return;
    const validOrders = (rawOrders as CustomAdminOrder[]).filter(
      (o) =>
        o?.invoiceId &&
        !combinedDeletedInvoiceIds.has(normalizeInvoiceIdKey(o.invoiceId))
    );
    if (validOrders.length > 0) {
      cloudExistingOrders = mergeCustomAdminOrders(
        cloudExistingOrders,
        validOrders,
        combinedDeletedInvoiceIds
      );
    }
  };

  const [kvPreRes, restPreRes] = await Promise.allSettled([
    fetch(VORVAN_KVDB_SHARED_URL, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    }),
    fetch(VORVAN_RESTFUL_KV_URL, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    }),
  ]);

  if (kvPreRes.status === 'fulfilled' && kvPreRes.value.ok) {
    try {
      const kvJson = (await kvPreRes.value.json()) as
        | ConciergeEmailLead[]
        | {
            invoices?: CustomAdminOrder[];
            orders?: CustomAdminOrder[];
            leads?: ConciergeEmailLead[];
            deletedIds?: string[];
            deletedInvoiceIds?: string[];
            vorvan_deleted_invoice_ids?: string[];
            deletedLeadEmails?: string[];
          };
      if (Array.isArray(kvJson)) {
        cloudExistingLeads.push(...kvJson);
      } else if (kvJson && typeof kvJson === 'object') {
        absorbDeletedIds(kvJson.deletedIds);
        absorbDeletedIds(kvJson.deletedInvoiceIds);
        absorbDeletedIds(kvJson.vorvan_deleted_invoice_ids);
        absorbDeletedEmails(kvJson.deletedLeadEmails);
        if (Array.isArray(kvJson.leads)) {
          cloudExistingLeads.push(...kvJson.leads);
        }
        absorbOrders(kvJson.invoices);
        absorbOrders(kvJson.orders);
      }
    } catch {
      // Ignore KVDB JSON parse error
    }
  }

  if (restPreRes.status === 'fulfilled' && restPreRes.value.ok) {
    try {
      const restJson = (await restPreRes.value.json()) as {
        data?: {
          leads?: ConciergeEmailLead[];
          orders?: CustomAdminOrder[];
          invoices?: CustomAdminOrder[];
          vorvan_deleted_invoice_ids?: string[];
          deletedInvoiceIds?: string[];
          deletedIds?: string[];
          deletedLeadEmails?: string[];
        };
      };
      if (restJson?.data) {
        absorbDeletedIds(restJson.data.vorvan_deleted_invoice_ids);
        absorbDeletedIds(restJson.data.deletedInvoiceIds);
        absorbDeletedIds(restJson.data.deletedIds);
        absorbDeletedEmails(restJson.data.deletedLeadEmails);
        if (Array.isArray(restJson.data.leads)) {
          cloudExistingLeads.push(...restJson.data.leads);
        }
        absorbOrders(restJson.data.invoices);
        absorbOrders(restJson.data.orders);
      }
    } catch {
      // Ignore RESTful JSON parse error
    }
  }

  saveDeletedInvoiceIds(combinedDeletedInvoiceIds);

  const mergedLeadsPayload = mergeVisitorLeads(
    cloudExistingLeads,
    leads,
    combinedDeletedLeadEmails
  );
  const mergedOrdersPayload = mergeCustomAdminOrders(
    cloudExistingOrders,
    orders,
    combinedDeletedInvoiceIds
  ).filter(
    (o) =>
      o?.invoiceId &&
      !combinedDeletedInvoiceIds.has(normalizeInvoiceIdKey(o.invoiceId))
  );
  const deletedIdsArray = Array.from(combinedDeletedInvoiceIds);
  const deletedLeadEmailsArray = Array.from(combinedDeletedLeadEmails);
  const updatedAtIso = new Date().toISOString();

  // Execute PUT to primary KVDB state bucket (`{ invoices, leads, deletedIds }`) and secondary backup mirror in parallel
  const [kvPutRes, restPutRes] = await Promise.allSettled([
    fetch(VORVAN_KVDB_SHARED_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        invoices: mergedOrdersPayload,
        leads: mergedLeadsPayload,
        deletedIds: deletedIdsArray,
        deletedLeadEmails: deletedLeadEmailsArray,
        updatedAt: updatedAtIso,
      }),
    }),
    fetch(VORVAN_RESTFUL_KV_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: 'vorvan_leads_shared',
        data: {
          leads: mergedLeadsPayload,
          orders: mergedOrdersPayload,
          invoices: mergedOrdersPayload,
          vorvan_deleted_invoice_ids: deletedIdsArray,
          deletedInvoiceIds: deletedIdsArray,
          deletedIds: deletedIdsArray,
          deletedLeadEmails: deletedLeadEmailsArray,
          updatedAt: updatedAtIso,
        },
      }),
    }),
  ]);

  if (kvPutRes.status === 'fulfilled' && kvPutRes.value.ok) anySuccess = true;
  if (restPutRes.status === 'fulfilled' && restPutRes.value.ok) anySuccess = true;

  return anySuccess;
}

export const saveToCloud = saveSharedCloudLeadsAndOrders;

/**
 * Ensures `VORVAN_ORDER_UPSERT` packets stay well under ntfy.sh's 4KB inline message limit
 * by stripping large Base64 paymentProof strings (already synced via chunked proof packets
 * and RESTful KV) while preserving `status: 'PAID'`, `paymentProofUploadedAt`, Resi, and Stage 4.
 */
export function prepareCloudVaultPacketForTransport(
  packet: CloudVaultPacket
): CloudVaultPacket {
  if (packet.kind === 'VORVAN_ORDER_UPSERT' && packet.order) {
    const hasLargeProof =
      (packet.order.paymentProof && packet.order.paymentProof.length > 1200) ||
      (packet.order.paymentProofUrl &&
        packet.order.paymentProofUrl.length > 1200);
    if (hasLargeProof) {
      return {
        ...packet,
        order: {
          ...packet.order,
          paymentProof: undefined,
          paymentProofUrl: undefined,
        },
      };
    }
  }
  return packet;
}

/**
 * Publishes a cross-device sync packet (Lead, Order, Resi Update, or Payment Proof) to the shared VORVAN Cloud Vault channel
 * so Incognito tabs and other devices can read it without sharing browser localStorage.
 * Automatically splits Base64 payment proofs > 2400 chars into small chunks (< 3 KB) so ntfy.sh
 * keeps every packet inline as JSON messages.
 */
export async function pushCloudVaultPacket(
  packet: CloudVaultPacket
): Promise<boolean> {
  try {
    if (
      packet.kind === 'VORVAN_PAYMENT_PROOF' &&
      packet.paymentProofUrl &&
      packet.paymentProofUrl.length > 2400
    ) {
      const chunkSize = 2400;
      const totalChunks = Math.ceil(packet.paymentProofUrl.length / chunkSize);
      let allOk = true;
      for (let i = 0; i < totalChunks; i++) {
        const chunkData = packet.paymentProofUrl.slice(
          i * chunkSize,
          (i + 1) * chunkSize
        );
        const chunkPacket: CloudVaultPacket = {
          kind: 'VORVAN_PAYMENT_PROOF_CHUNK',
          invoiceId: packet.invoiceId,
          uploadedAt: packet.uploadedAt,
          autoMarkPaid: true,
          chunkIndex: i,
          totalChunks,
          chunkData,
          ts: packet.ts,
        };
        const res = await fetch(VORVAN_CLOUD_SYNC_TOPIC, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
          },
          body: JSON.stringify(chunkPacket),
        });
        if (!res.ok) allOk = false;
      }
      return allOk;
    }

    const outboundPacket = prepareCloudVaultPacketForTransport(packet);
    const res = await fetch(VORVAN_CLOUD_SYNC_TOPIC, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
      body: JSON.stringify(outboundPacket),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Pulls all cached cross-device Visitor Leads & Custom Admin Orders
 * from the Fixed Shared Cloud Key-Value Endpoints (`VORVAN_KVDB_SHARED_URL`, `VORVAN_RESTFUL_KV_URL`, and `VORVAN_CLOUD_SYNC_TOPIC`).
 */
export async function pullCloudVaultState(): Promise<{
  leads: ConciergeEmailLead[];
  orders: CustomAdminOrder[];
  deletedInvoiceIds: Set<string>;
  deletedLeadEmails: Set<string>;
} | null> {
  const leadsByEmail = new Map<string, ConciergeEmailLead>();
  const ordersById = new Map<string, CustomAdminOrder>();
  const deletedInvoiceIds = loadDeletedInvoiceIds();
  const deletedLeadEmails = loadDeletedLeadEmails();
  const proofsByInv = new Map<
    string,
    { proofUrl: string; uploadedAt: string }
  >();
  let fetchedAny = false;

  const registerLead = (lead: ConciergeEmailLead) => {
    if (!lead || !lead.email) return;
    const emailKey = lead.email.trim().toLowerCase();
    if (deletedLeadEmails.has(emailKey)) return;
    if (!leadsByEmail.has(emailKey)) {
      leadsByEmail.set(emailKey, lead);
    }
  };

  const registerOrderWithSmartMerge = (ord: CustomAdminOrder) => {
    if (!ord?.invoiceId) return;
    const invKey = normalizeInvoiceIdKey(ord.invoiceId);
    if (!invKey || deletedInvoiceIds.has(invKey)) return;
    const proofImg = ord.paymentProof || ord.paymentProofUrl;
    if (proofImg) {
      proofsByInv.set(invKey, {
        proofUrl: proofImg,
        uploadedAt: ord.paymentProofUploadedAt || 'Terverifikasi · WIB',
      });
      savePaymentProofRecord(
        invKey,
        proofImg,
        ord.paymentProofUploadedAt || 'Terverifikasi · WIB'
      );
    }
    const existing = ordersById.get(invKey);
    ordersById.set(
      invKey,
      existing
        ? mergeCloudAndLocalOrder(existing, ord)
        : syncOrderDynamicResiFields(ord)
    );
  };

  // 1. Fetch from Fixed KVDB Shared Endpoint (`GET https://kvdb.io/A9x7VorvanVault2026Official/vorvan_state_v1`) with `cache: 'no-store'`
  try {
    const kvRes = await fetch(VORVAN_KVDB_SHARED_URL, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (kvRes.ok) {
      const kvData = (await kvRes.json()) as
        | ConciergeEmailLead[]
        | {
            invoices?: CustomAdminOrder[];
            orders?: CustomAdminOrder[];
            leads?: ConciergeEmailLead[];
            deletedIds?: string[];
            deletedInvoiceIds?: string[];
            vorvan_deleted_invoice_ids?: string[];
            deletedLeadEmails?: string[];
          };
      if (Array.isArray(kvData)) {
        fetchedAny = true;
        for (const item of kvData) {
          if (item && typeof item.email === 'string') {
            registerLead(item as ConciergeEmailLead);
          }
        }
      } else if (kvData && typeof kvData === 'object') {
        fetchedAny = true;
        for (const idList of [
          kvData.deletedIds,
          kvData.deletedInvoiceIds,
          kvData.vorvan_deleted_invoice_ids,
        ]) {
          if (Array.isArray(idList)) {
            for (const rawId of idList) {
              const clean = normalizeInvoiceIdKey(rawId);
              if (clean) {
                deletedInvoiceIds.add(clean);
                markInvoiceIdDeleted(clean);
                removePaymentProofRecord(clean);
                ordersById.delete(clean);
                proofsByInv.delete(clean);
              }
            }
          }
        }
        if (Array.isArray(kvData.deletedLeadEmails)) {
          for (const rawEmail of kvData.deletedLeadEmails) {
            const cleanEmail = (rawEmail || '').trim().toLowerCase();
            if (cleanEmail) {
              deletedLeadEmails.add(cleanEmail);
              markLeadEmailDeleted(cleanEmail);
              leadsByEmail.delete(cleanEmail);
            }
          }
        }
        if (Array.isArray(kvData.leads)) {
          for (const lead of kvData.leads) {
            registerLead(lead);
          }
        }
        if (Array.isArray(kvData.invoices)) {
          for (const ord of kvData.invoices) {
            registerOrderWithSmartMerge(ord);
          }
        }
        if (Array.isArray(kvData.orders)) {
          for (const ord of kvData.orders) {
            registerOrderWithSmartMerge(ord);
          }
        }
      }
    }
  } catch {
    // Ignore KVDB error and fallback to next cloud store
  }

  // 2. Fetch from Fixed RESTful KV Object Endpoint
  try {
    const restRes = await fetch(VORVAN_RESTFUL_KV_URL, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (restRes.ok) {
      const restJson = (await restRes.json()) as {
        data?: {
          leads?: ConciergeEmailLead[];
          orders?: CustomAdminOrder[];
          invoices?: CustomAdminOrder[];
          vorvan_deleted_invoice_ids?: string[];
          deletedInvoiceIds?: string[];
          deletedIds?: string[];
          deletedLeadEmails?: string[];
        };
      };
      if (restJson?.data) {
        fetchedAny = true;
        for (const idList of [
          restJson.data.vorvan_deleted_invoice_ids,
          restJson.data.deletedInvoiceIds,
          restJson.data.deletedIds,
        ]) {
          if (Array.isArray(idList)) {
            for (const rawId of idList) {
              const clean = normalizeInvoiceIdKey(rawId);
              if (clean) {
                deletedInvoiceIds.add(clean);
                markInvoiceIdDeleted(clean);
                removePaymentProofRecord(clean);
                ordersById.delete(clean);
                proofsByInv.delete(clean);
              }
            }
          }
        }
        if (Array.isArray(restJson.data.deletedLeadEmails)) {
          for (const rawEmail of restJson.data.deletedLeadEmails) {
            const cleanEmail = (rawEmail || '').trim().toLowerCase();
            if (cleanEmail) {
              deletedLeadEmails.add(cleanEmail);
              markLeadEmailDeleted(cleanEmail);
              leadsByEmail.delete(cleanEmail);
            }
          }
        }
        if (Array.isArray(restJson.data.leads)) {
          for (const lead of restJson.data.leads) {
            registerLead(lead);
          }
        }
        if (Array.isArray(restJson.data.invoices)) {
          for (const ord of restJson.data.invoices) {
            registerOrderWithSmartMerge(ord);
          }
        }
        if (Array.isArray(restJson.data.orders)) {
          for (const ord of restJson.data.orders) {
            registerOrderWithSmartMerge(ord);
          }
        }
      }
    }
  } catch {
    // Ignore error and continue
  }

  // 3. Fetch real-time stream history from NTFY (`?poll=1&since=12h`)
  try {
    const res = await fetch(
      `${VORVAN_CLOUD_SYNC_TOPIC}/json?poll=1&since=12h`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Accept: 'application/x-ndjson, application/json, text/plain',
        },
      }
    );
    if (res.ok) {
      fetchedAny = true;
      const rawText = await res.text();
      const lines = rawText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const streamLeads: ConciergeEmailLead[] = [];
      const streamUpsertOrders: CustomAdminOrder[] = [];
      const streamResiUpdates: Extract<
        CloudVaultPacket,
        { kind: 'VORVAN_ORDER_RESI_UPDATE' }
      >[] = [];
      const streamStatusUpdates: {
        invoiceId: string;
        status: 'PENDING_PAYMENT' | 'PAID';
      }[] = [];
      const chunkCollector = new Map<
        string,
        {
          totalChunks: number;
          uploadedAt: string;
          chunks: Map<number, string>;
        }
      >();

      // Pass 1: Collect all delete tombstones first so deleted invoices are never resurrected by older stream packets
      for (const line of lines) {
        try {
          const outer = JSON.parse(line) as {
            event?: string;
            message?: string;
          };
          if (outer.event !== 'message' || !outer.message) continue;
          const packet = JSON.parse(outer.message) as CloudVaultPacket;
          if (!packet || typeof packet !== 'object' || !('kind' in packet)) {
            continue;
          }
          if (packet.kind === 'VORVAN_ORDER_DELETE' && packet.invoiceId) {
            const invKey = normalizeInvoiceIdKey(packet.invoiceId);
            if (invKey) {
              deletedInvoiceIds.add(invKey);
              markInvoiceIdDeleted(invKey);
              removePaymentProofRecord(invKey);
              ordersById.delete(invKey);
              proofsByInv.delete(invKey);
            }
          }
        } catch {
          // Ignore malformed lines
        }
      }

      // Pass 2: Process remaining stream packets while strictly filtering out deletedInvoiceIds
      for (const line of lines) {
        try {
          const outer = JSON.parse(line) as {
            event?: string;
            message?: string;
          };
          if (outer.event !== 'message' || !outer.message) continue;

          const packet = JSON.parse(outer.message) as CloudVaultPacket;
          if (!packet || typeof packet !== 'object' || !('kind' in packet)) {
            continue;
          }

          if (packet.kind === 'VORVAN_LEAD' && packet.lead?.email) {
            const emailKey = packet.lead.email.trim().toLowerCase();
            deletedLeadEmails.delete(emailKey);
            unmarkLeadEmailDeleted(emailKey);
            streamLeads.push(packet.lead);
          } else if (packet.kind === 'VORVAN_LEAD_DELETE' && packet.email) {
            const emailKey = packet.email.trim().toLowerCase();
            deletedLeadEmails.add(emailKey);
            markLeadEmailDeleted(emailKey);
            leadsByEmail.delete(emailKey);
            for (let i = streamLeads.length - 1; i >= 0; i--) {
              if (streamLeads[i].email.trim().toLowerCase() === emailKey) {
                streamLeads.splice(i, 1);
              }
            }
          } else if (
            packet.kind === 'VORVAN_ORDER_UPSERT' &&
            packet.order?.invoiceId
          ) {
            const invKey = normalizeInvoiceIdKey(packet.order.invoiceId);
            if (!invKey || deletedInvoiceIds.has(invKey)) continue;
            streamUpsertOrders.push(packet.order);
          } else if (
            packet.kind === 'VORVAN_ORDER_RESI_UPDATE' &&
            packet.invoiceId
          ) {
            const invKey = normalizeInvoiceIdKey(packet.invoiceId);
            if (!invKey || deletedInvoiceIds.has(invKey)) continue;
            streamResiUpdates.push(packet);
          } else if (
            packet.kind === 'VORVAN_ORDER_STATUS' &&
            packet.invoiceId
          ) {
            const invKey = normalizeInvoiceIdKey(packet.invoiceId);
            if (!invKey || deletedInvoiceIds.has(invKey)) continue;
            streamStatusUpdates.push({
              invoiceId: invKey,
              status: packet.status,
            });
          } else if (
            packet.kind === 'VORVAN_ORDER_DELETE' &&
            packet.invoiceId
          ) {
            const invKey = normalizeInvoiceIdKey(packet.invoiceId);
            if (invKey) {
              deletedInvoiceIds.add(invKey);
              markInvoiceIdDeleted(invKey);
              removePaymentProofRecord(invKey);
              ordersById.delete(invKey);
              proofsByInv.delete(invKey);
            }
          } else if (
            packet.kind === 'VORVAN_PAYMENT_PROOF' &&
            packet.invoiceId &&
            packet.paymentProofUrl
          ) {
            const invKey = normalizeInvoiceIdKey(packet.invoiceId);
            if (!invKey || deletedInvoiceIds.has(invKey)) continue;
            proofsByInv.set(invKey, {
              proofUrl: packet.paymentProofUrl,
              uploadedAt: packet.uploadedAt,
            });
            savePaymentProofRecord(
              invKey,
              packet.paymentProofUrl,
              packet.uploadedAt
            );
          } else if (
            packet.kind === 'VORVAN_PAYMENT_PROOF_CHUNK' &&
            packet.invoiceId &&
            typeof packet.chunkIndex === 'number' &&
            typeof packet.totalChunks === 'number'
          ) {
            const invKey = normalizeInvoiceIdKey(packet.invoiceId);
            if (!invKey || deletedInvoiceIds.has(invKey)) continue;
            const key = `${invKey}__${packet.ts}`;
            const entry = chunkCollector.get(key) || {
              totalChunks: packet.totalChunks,
              uploadedAt: packet.uploadedAt,
              chunks: new Map<number, string>(),
            };
            entry.chunks.set(packet.chunkIndex, packet.chunkData);
            chunkCollector.set(key, entry);
            if (entry.chunks.size === entry.totalChunks) {
              let fullProof = '';
              for (let i = 0; i < entry.totalChunks; i++) {
                fullProof += entry.chunks.get(i) || '';
              }
              proofsByInv.set(invKey, {
                proofUrl: fullProof,
                uploadedAt: entry.uploadedAt,
              });
              savePaymentProofRecord(invKey, fullProof, entry.uploadedAt);
            }
          }
        } catch {
          // Ignore malformed lines
        }
      }

      for (const ord of streamUpsertOrders) {
        const invKey = normalizeInvoiceIdKey(ord.invoiceId);
        if (!invKey || deletedInvoiceIds.has(invKey)) continue;
        const existing = ordersById.get(invKey);
        if (existing) {
          ordersById.set(invKey, mergeCloudAndLocalOrder(existing, ord));
        } else {
          ordersById.set(invKey, syncOrderDynamicResiFields(ord));
        }
      }

      streamResiUpdates.sort((a, b) => (a.ts || 0) - (b.ts || 0));
      for (const resiPkt of streamResiUpdates) {
        const invKey = normalizeInvoiceIdKey(resiPkt.invoiceId);
        if (!invKey || deletedInvoiceIds.has(invKey)) continue;
        const existing = ordersById.get(invKey);
        const cleanAwb = (resiPkt.resi || resiPkt.awbNumber || '').trim();
        const packetPartial: Partial<CustomAdminOrder> = {
          invoiceId: invKey,
          shippingMethod: (resiPkt.shippingMethod ||
            resiPkt.courier ||
            existing?.shippingMethod ||
            'J&T Express') as CustomAdminOrder['shippingMethod'],
          courier: (resiPkt.courier ||
            resiPkt.shippingMethod ||
            existing?.courier ||
            'J&T Express') as CustomAdminOrder['courier'],
          awbNumber: cleanAwb,
          resi: cleanAwb,
          trackingNumber: (resiPkt.trackingNumber || cleanAwb).trim(),
          noResi: (resiPkt.noResi || cleanAwb).trim(),
          trackingId: cleanAwb || existing?.trackingId || invKey,
          resiUpdatedAt: resiPkt.resiUpdatedAt ?? resiPkt.ts,
          updatedAt: resiPkt.updatedAt ?? resiPkt.ts,
          updatedAtMs: resiPkt.updatedAtMs ?? resiPkt.updatedAt ?? resiPkt.ts,
          status: resiPkt.status || existing?.status || 'PENDING_PAYMENT',
        };
        if (typeof resiPkt.isCOD === 'boolean') {
          packetPartial.isCOD = resiPkt.isCOD;
        }
        if (typeof resiPkt.isDelivered === 'boolean') {
          packetPartial.isDelivered = resiPkt.isDelivered;
          packetPartial.shippingStageOverride = resiPkt.isDelivered
            ? 4
            : existing?.shippingStageOverride || 'AUTO';
        }
        if (typeof resiPkt.resiInputAt === 'number') {
          packetPartial.resiInputAt = resiPkt.resiInputAt;
        }
        if (resiPkt.trackingStage ?? resiPkt.shippingStage) {
          const stg = resiPkt.trackingStage ?? resiPkt.shippingStage;
          packetPartial.trackingStage = stg;
          packetPartial.shippingStage = stg;
        }
        if (existing) {
          ordersById.set(
            invKey,
            mergeCloudAndLocalOrder(existing, {
              ...existing,
              ...packetPartial,
            })
          );
        } else {
          ordersById.set(
            invKey,
            syncOrderDynamicResiFields(packetPartial as CustomAdminOrder)
          );
        }
      }

      for (const st of streamStatusUpdates) {
        if (deletedInvoiceIds.has(st.invoiceId)) continue;
        const existing = ordersById.get(st.invoiceId);
        if (existing) {
          ordersById.set(st.invoiceId, {
            ...existing,
            status: st.status,
          });
        }
      }

      // Register newest stream leads first
      for (let i = streamLeads.length - 1; i >= 0; i--) {
        const l = streamLeads[i];
        const key = l.email.trim().toLowerCase();
        if (!deletedLeadEmails.has(key)) {
          leadsByEmail.set(key, l);
        }
      }
    }
  } catch {
    // Ignore stream fetch error
  }

  saveDeletedInvoiceIds(deletedInvoiceIds);

  if (!fetchedAny) return null;

  let currentOrders = Array.from(ordersById.values())
    .filter(
      (ord) =>
        ord?.invoiceId &&
        !deletedInvoiceIds.has(normalizeInvoiceIdKey(ord.invoiceId))
    )
    .map((ord) => syncOrderDynamicResiFields(ord));
  for (const [invKey, proofData] of proofsByInv.entries()) {
    if (deletedInvoiceIds.has(invKey)) continue;
    const applied = applyPaymentProofToOrders(
      currentOrders,
      invKey,
      proofData.proofUrl,
      proofData.uploadedAt
    );
    currentOrders = applied.updatedOrders;
  }

  return {
    leads: reindexVisitorLeads(
      Array.from(leadsByEmail.values()),
      deletedLeadEmails
    ),
    orders: currentOrders,
    deletedInvoiceIds,
    deletedLeadEmails,
  };
}

export const fetchFromCloud = pullCloudVaultState;

/**
 * Merges locally stored visitor email leads with cloud-synced leads without duplicates,
 * filters out deleted emails, and re-indexes sequentially (`LEAD-VRV-001`, `LEAD-VRV-002`, ...).
 */
export function mergeVisitorLeads(
  localLeads: ConciergeEmailLead[],
  cloudLeads: ConciergeEmailLead[],
  deletedEmails: Set<string> = loadDeletedLeadEmails()
): ConciergeEmailLead[] {
  return reindexVisitorLeads([...cloudLeads, ...localLeads], deletedEmails);
}

/**
 * Merges locally stored custom admin orders with cloud-synced orders without duplicates,
 * strictly filtering out any invoice ID present in `vorvan_deleted_invoice_ids` or `deletedInvoiceIds`.
 * Automatically promotes status to PAID and attaches paymentProof whenever a proof exists
 * in local orders, cloud orders, or paymentProofsMap.
 */
export function mergeCustomAdminOrders(
  localOrders: CustomAdminOrder[],
  cloudOrders: CustomAdminOrder[],
  deletedInvoiceIds: Set<string> = loadDeletedInvoiceIds()
): CustomAdminOrder[] {
  const effectiveDeletedIds = loadDeletedInvoiceIds();
  for (const rawId of deletedInvoiceIds) {
    const clean = normalizeInvoiceIdKey(rawId);
    if (clean) effectiveDeletedIds.add(clean);
  }

  const byInvoiceId = new Map<string, CustomAdminOrder>();

  for (const ord of localOrders) {
    if (!ord?.invoiceId) continue;
    const key = normalizeInvoiceIdKey(ord.invoiceId);
    if (key && !effectiveDeletedIds.has(key)) {
      byInvoiceId.set(key, syncOrderDynamicResiFields(ord));
    }
  }

  for (const ord of cloudOrders) {
    if (!ord?.invoiceId) continue;
    const key = normalizeInvoiceIdKey(ord.invoiceId);
    if (key && !effectiveDeletedIds.has(key)) {
      const local = byInvoiceId.get(key);
      if (local) {
        byInvoiceId.set(key, mergeCloudAndLocalOrder(local, ord));
      } else {
        const synced = syncOrderDynamicResiFields(ord);
        const proofImg = synced.paymentProof || synced.paymentProofUrl;
        byInvoiceId.set(key, {
          ...synced,
          paymentProof: proofImg,
          paymentProofUrl: proofImg,
          status: proofImg ? 'PAID' : synced.status,
        });
      }
    }
  }

  let mergedList = Array.from(byInvoiceId.values()).sort(
    (a, b) => (b.createdAtTimestampMs || 0) - (a.createdAtTimestampMs || 0)
  );

  // Also apply any proofs stored in local/memory paymentProofsMap
  const proofsMap = loadPaymentProofsMap();
  for (const [invKey, record] of Object.entries(proofsMap)) {
    const cleanKey = normalizeInvoiceIdKey(invKey);
    if (effectiveDeletedIds.has(cleanKey)) continue;
    if (record?.proofUrl) {
      const res = applyPaymentProofToOrders(
        mergedList,
        cleanKey,
        record.proofUrl,
        record.uploadedAt
      );
      mergedList = res.updatedOrders;
    }
  }

  return mergedList;
}
