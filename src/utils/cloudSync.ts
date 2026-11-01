import { ConciergeEmailLead, CustomAdminOrder } from '../types/fragrance';

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
 * Publishes a cross-device sync packet (Lead or Order) to the shared VORVAN Cloud Vault channel
 * so Incognito tabs and other devices can read it without sharing browser localStorage.
 */
export async function pushCloudVaultPacket(
  packet: CloudVaultPacket
): Promise<boolean> {
  try {
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
} | null> {
  const leadsByEmail = new Map<string, ConciergeEmailLead>();
  const ordersById = new Map<string, CustomAdminOrder>();
  const deletedInvoiceIds = new Set<string>();
  let fetchedAny = false;

  const registerLead = (lead: ConciergeEmailLead) => {
    if (!lead || !lead.email) return;
    const emailKey = lead.email.trim().toLowerCase();
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
              ordersById.set(ord.invoiceId.trim().toUpperCase(), ord);
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
            streamLeads.push(packet.lead);
          } else if (
            packet.kind === 'VORVAN_ORDER_UPSERT' &&
            packet.order?.invoiceId
          ) {
            const invKey = packet.order.invoiceId.trim().toUpperCase();
            deletedInvoiceIds.delete(invKey);
            ordersById.set(invKey, packet.order);
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
            packet.invoiceId
          ) {
            const invKey = packet.invoiceId.trim().toUpperCase();
            const existing = ordersById.get(invKey);
            if (existing) {
              ordersById.set(invKey, {
                ...existing,
                paymentProofUrl: packet.paymentProofUrl,
                paymentProofUploadedAt: packet.uploadedAt,
                status: packet.autoMarkPaid ? 'PAID' : existing.status,
              });
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
        leadsByEmail.set(key, l);
      }
    }
  } catch {
    // Ignore stream fetch error
  }

  if (!fetchedAny) return null;

  return {
    leads: Array.from(leadsByEmail.values()),
    orders: Array.from(ordersById.values()),
    deletedInvoiceIds,
  };
}

/**
 * Merges locally stored visitor email leads with cloud-synced leads without duplicates.
 */
export function mergeVisitorLeads(
  localLeads: ConciergeEmailLead[],
  cloudLeads: ConciergeEmailLead[]
): ConciergeEmailLead[] {
  const seenEmails = new Set<string>();
  const combined: ConciergeEmailLead[] = [];

  for (const lead of [...cloudLeads, ...localLeads]) {
    if (!lead || !lead.email) continue;
    const key = lead.email.trim().toLowerCase();
    if (seenEmails.has(key)) continue;
    seenEmails.add(key);
    combined.push(lead);
  }

  return combined;
}

/**
 * Merges locally stored custom admin orders with cloud-synced orders without duplicates.
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
        byInvoiceId.set(key, {
          ...local,
          ...ord,
          paymentProofUrl: ord.paymentProofUrl || local.paymentProofUrl,
          paymentProofUploadedAt:
            ord.paymentProofUploadedAt || local.paymentProofUploadedAt,
          status:
            ord.status === 'PAID' || local.status === 'PAID'
              ? 'PAID'
              : ord.status,
        });
      } else {
        byInvoiceId.set(key, ord);
      }
    }
  }

  return Array.from(byInvoiceId.values()).sort(
    (a, b) => (b.createdAtTimestampMs || 0) - (a.createdAtTimestampMs || 0)
  );
}
