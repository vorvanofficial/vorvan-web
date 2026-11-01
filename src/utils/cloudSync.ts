import { ConciergeEmailLead, CustomAdminOrder } from '../types/fragrance';

export const FORMSUBMIT_GMAIL_ENDPOINT =
  'https://formsubmit.co/ajax/vorvanlifestyle@gmail.com';

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
 * Pulls all cached cross-device packets (Visitor Leads & Custom Admin Orders)
 * from the shared VORVAN Cloud Vault channel.
 */
export async function pullCloudVaultState(): Promise<{
  leads: ConciergeEmailLead[];
  orders: CustomAdminOrder[];
  deletedInvoiceIds: Set<string>;
} | null> {
  try {
    const res = await fetch(
      `${VORVAN_CLOUD_SYNC_TOPIC}/json?poll=1&since=all`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/x-ndjson, application/json, text/plain',
        },
      }
    );
    if (!res.ok) return null;

    const rawText = await res.text();
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const leadsByEmail = new Map<string, ConciergeEmailLead>();
    const ordersById = new Map<string, CustomAdminOrder>();
    const deletedInvoiceIds = new Set<string>();

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
          leadsByEmail.set(emailKey, packet.lead);
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
        }
      } catch {
        // Ignore malformed lines
      }
    }

    return {
      leads: Array.from(leadsByEmail.values()).reverse(),
      orders: Array.from(ordersById.values()).reverse(),
      deletedInvoiceIds,
    };
  } catch {
    return null;
  }
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

  // Re-index LEAD-VRV-0X if needed while preserving existing IDs
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
      byInvoiceId.set(key, ord);
    }
  }

  return Array.from(byInvoiceId.values()).sort(
    (a, b) => (b.createdAtTimestampMs || 0) - (a.createdAtTimestampMs || 0)
  );
}
