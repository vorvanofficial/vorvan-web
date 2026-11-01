import { ConciergeEmailLead, CustomAdminOrder } from '../types/fragrance';
import {
  applyPaymentProofToOrders,
  loadDeletedLeadEmails,
  loadPaymentProofsMap,
  markLeadEmailDeleted,
  reindexVisitorLeads,
  savePaymentProofRecord,
  unmarkLeadEmailDeleted,
} from './businessRules';

export const FORMSUBMIT_GMAIL_ENDPOINT =
  'https://formsubmit.co/ajax/vorvanlifestyle@gmail.com';

export const VORVAN_EMAIL_WEBHOOK =
  'https://script.google.com/macros/s/AKfycbwZnH1EY8q-hV0o-E-Gz0DsbGQAOKs7v4VqwOiSYvEIjKykV_80TCzroPM95yVMEpwlCw/exec';

export const VORVAN_KVDB_SHARED_URL =
  'https://kvdb.io/6Wa9pL2mX8nQ4vR7tY3kJc/vorvan_leads_shared';

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

/**
 * 1. Sends a new visitor email registration directly to VORVAN's official Gmail
 * (`vorvanlifestyle@gmail.com`) via FormSubmit AJAX HTTP POST.
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
  const sumberWeb =
    params.sumberWeb ||
    (typeof window !== 'undefined'
      ? window.location.href
      : 'https://vorvan-official.vercel.app');

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
        Sumber_Web: sumberWeb,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Sends an automatic backup of a newly created Admin Invoice & Resi to VORVAN's Gmail
 * (`vorvanlifestyle@gmail.com`) via FormSubmit AJAX.
 */
export async function sendAdminOrderBackupToGmail(
  order: CustomAdminOrder,
  invoiceSmartUrl: string,
  trackingSmartUrl: string
): Promise<boolean> {
  try {
    const response = await fetch(FORMSUBMIT_GMAIL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: `🧾 Invoice & Resi Baru VORVAN: ${order.invoiceId} (${order.buyerName})`,
        Kode_Invoice: order.invoiceId,
        Nomor_Resi_AWB: order.awbNumber,
        Kurir_Ekspedisi: order.shippingMethod,
        Nama_Pembeli: order.buyerName,
        Kota_Tujuan: order.buyerCity,
        Parfum: `${order.house} — ${order.fragranceName} (${order.volume})`,
        Harga_VORVAN: `Rp ${order.dealPriceIDR.toLocaleString('id-ID')}`,
        Ongkir: `Rp ${(order.shippingCostIDR || 0).toLocaleString('id-ID')}`,
        Status_Bayar: order.status,
        Link_Tagihan_Pembeli: invoiceSmartUrl,
        Link_Cek_Resi_Pembeli: trackingSmartUrl,
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
 */
export async function sendBuyerInvoiceEmailWebhook(params: {
  buyerEmail: string;
  buyerName: string;
  invNo: string;
  itemName: string;
  totalPrice: string;
  invoiceUrl: string;
}): Promise<boolean> {
  const buyerEmail = params.buyerEmail.trim();
  if (!buyerEmail) return false;

  try {
    await fetch(VORVAN_EMAIL_WEBHOOK, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        buyerEmail,
        buyerName: params.buyerName.trim(),
        invNo: params.invNo.trim(),
        itemName: params.itemName.trim(),
        totalPrice: params.totalPrice.trim(),
        invoiceUrl: params.invoiceUrl.trim(),
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
 * Syncs the full shared JSON array of visitor email leads & custom orders
 * to Fixed Shared Cloud Key-Value Endpoints (`VORVAN_KVDB_SHARED_URL` & `VORVAN_RESTFUL_KV_URL`)
 * so Incognito tabs and other devices share the exact same Tab 3 database.
 */
export async function saveSharedCloudLeadsAndOrders(
  leads: ConciergeEmailLead[],
  orders: CustomAdminOrder[]
): Promise<boolean> {
  let anySuccess = false;

  // 1. Fixed KVDB Shared Endpoint (PUT JSON array of leads)
  try {
    const kvRes = await fetch(VORVAN_KVDB_SHARED_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(leads),
    });
    if (kvRes.ok) anySuccess = true;
  } catch {
    // Ignore and continue to secondary fixed KV endpoint
  }

  // 2. Fixed RESTful Cloud KV Object Endpoint (PUT full { leads, orders } JSON)
  try {
    // First pull existing cloud object so an Incognito tab with fresh localStorage never overwrites older cloud leads
    let cloudExistingLeads: ConciergeEmailLead[] = [];
    let cloudExistingOrders: CustomAdminOrder[] = [];
    try {
      const getRes = await fetch(VORVAN_RESTFUL_KV_URL, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (getRes.ok) {
        const json = (await getRes.json()) as {
          data?: {
            leads?: ConciergeEmailLead[];
            orders?: CustomAdminOrder[];
          };
        };
        if (Array.isArray(json?.data?.leads)) {
          cloudExistingLeads = json.data.leads;
        }
        if (Array.isArray(json?.data?.orders)) {
          cloudExistingOrders = json.data.orders;
        }
      }
    } catch {
      // ignore pre-fetch error
    }

    const mergedLeadsPayload = mergeVisitorLeads(cloudExistingLeads, leads);
    const mergedOrdersPayload = mergeCustomAdminOrders(
      cloudExistingOrders,
      orders
    );

    const putRes = await fetch(VORVAN_RESTFUL_KV_URL, {
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
          updatedAt: new Date().toISOString(),
        },
      }),
    });
    if (putRes.ok) anySuccess = true;
  } catch {
    // Ignore network error
  }

  return anySuccess;
}

/**
 * Publishes a cross-device sync packet (Lead, Order, or Payment Proof) to the shared VORVAN Cloud Vault channel
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

    const res = await fetch(VORVAN_CLOUD_SYNC_TOPIC, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
      body: JSON.stringify(packet),
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
  const deletedInvoiceIds = new Set<string>();
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

  // 1. Fetch from Fixed KVDB Shared Endpoint (`GET https://kvdb.io/6Wa9pL2mX8nQ4vR7tY3kJc/vorvan_leads_shared`)
  try {
    const kvRes = await fetch(VORVAN_KVDB_SHARED_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (kvRes.ok) {
      const kvData = await kvRes.json();
      if (Array.isArray(kvData)) {
        fetchedAny = true;
        for (const item of kvData) {
          if (item && typeof item.email === 'string') {
            registerLead(item as ConciergeEmailLead);
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
      headers: { Accept: 'application/json' },
    });
    if (restRes.ok) {
      const restJson = (await restRes.json()) as {
        data?: {
          leads?: ConciergeEmailLead[];
          orders?: CustomAdminOrder[];
        };
      };
      if (restJson?.data) {
        fetchedAny = true;
        if (Array.isArray(restJson.data.leads)) {
          for (const lead of restJson.data.leads) {
            registerLead(lead);
          }
        }
        if (Array.isArray(restJson.data.orders)) {
          for (const ord of restJson.data.orders) {
            if (ord?.invoiceId) {
              const invKey = ord.invoiceId.trim().toUpperCase();
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
              ordersById.set(invKey, ord);
            }
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
      const chunkCollector = new Map<
        string,
        {
          totalChunks: number;
          uploadedAt: string;
          chunks: Map<number, string>;
        }
      >();

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
            const invKey = packet.order.invoiceId.trim().toUpperCase();
            deletedInvoiceIds.delete(invKey);
            const existing = ordersById.get(invKey);
            const proofImg =
              packet.order.paymentProof ||
              packet.order.paymentProofUrl ||
              existing?.paymentProof ||
              existing?.paymentProofUrl;
            ordersById.set(invKey, {
              ...packet.order,
              status:
                proofImg || existing?.status === 'PAID'
                  ? 'PAID'
                  : packet.order.status,
              paymentProof: proofImg,
              paymentProofUrl: proofImg,
              paymentProofUploadedAt:
                packet.order.paymentProofUploadedAt ||
                existing?.paymentProofUploadedAt,
            });
          } else if (
            packet.kind === 'VORVAN_ORDER_STATUS' &&
            packet.invoiceId
          ) {
            const invKey = packet.invoiceId.trim().toUpperCase();
            const existing = ordersById.get(invKey);
            if (existing) {
              ordersById.set(invKey, {
                ...existing,
                status: packet.status,
              });
            }
          } else if (
            packet.kind === 'VORVAN_ORDER_DELETE' &&
            packet.invoiceId
          ) {
            const invKey = packet.invoiceId.trim().toUpperCase();
            deletedInvoiceIds.add(invKey);
            ordersById.delete(invKey);
          } else if (
            packet.kind === 'VORVAN_PAYMENT_PROOF' &&
            packet.invoiceId &&
            packet.paymentProofUrl
          ) {
            const invKey = packet.invoiceId.trim().toUpperCase();
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
            const key = `${packet.invoiceId.trim().toUpperCase()}__${packet.ts}`;
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
              const invKey = packet.invoiceId.trim().toUpperCase();
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

  if (!fetchedAny) return null;

  let currentOrders = Array.from(ordersById.values());
  for (const [invKey, proofData] of proofsByInv.entries()) {
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
 * Merges locally stored custom admin orders with cloud-synced orders without duplicates.
 * Automatically promotes status to PAID and attaches paymentProof whenever a proof exists
 * in local orders, cloud orders, or paymentProofsMap.
 */
export function mergeCustomAdminOrders(
  localOrders: CustomAdminOrder[],
  cloudOrders: CustomAdminOrder[],
  deletedInvoiceIds: Set<string> = new Set()
): CustomAdminOrder[] {
  const byInvoiceId = new Map<string, CustomAdminOrder>();

  for (const ord of localOrders) {
    if (!ord?.invoiceId) continue;
    const key = ord.invoiceId.trim().toUpperCase();
    if (!deletedInvoiceIds.has(key)) {
      byInvoiceId.set(key, ord);
    }
  }

  for (const ord of cloudOrders) {
    if (!ord?.invoiceId) continue;
    const key = ord.invoiceId.trim().toUpperCase();
    if (!deletedInvoiceIds.has(key)) {
      const local = byInvoiceId.get(key);
      if (local) {
        const mergedProof =
          ord.paymentProof ||
          ord.paymentProofUrl ||
          local.paymentProof ||
          local.paymentProofUrl;
        const isPaid =
          Boolean(mergedProof) ||
          ord.status === 'PAID' ||
          local.status === 'PAID';
        const mergedStage = Math.min(
          4,
          Math.max(
            local.shippingStage || 2,
            ord.shippingStage || 2,
            mergedProof ? 3 : 2
          )
        ) as 1 | 2 | 3 | 4;

        byInvoiceId.set(key, {
          ...local,
          ...ord,
          paymentProof: mergedProof,
          paymentProofUrl: mergedProof,
          paymentProofUploadedAt:
            ord.paymentProofUploadedAt || local.paymentProofUploadedAt,
          status: isPaid ? 'PAID' : ord.status,
          shippingStage: mergedStage,
        });
      } else {
        const proofImg = ord.paymentProof || ord.paymentProofUrl;
        byInvoiceId.set(key, {
          ...ord,
          paymentProof: proofImg,
          paymentProofUrl: proofImg,
          status: proofImg ? 'PAID' : ord.status,
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
    if (record?.proofUrl) {
      const res = applyPaymentProofToOrders(
        mergedList,
        invKey,
        record.proofUrl,
        record.uploadedAt
      );
      mergedList = res.updatedOrders;
    }
  }

  return mergedList;
}
