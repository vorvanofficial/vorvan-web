export type TierId = 'apex_prestige' | 'urban_signatures' | 'atelier_archive';

export type GenderCategory = 'GENTLEMAN' | 'FEMME' | 'UNISEX';

export type BrandHouseId =
  | 'louis-vuitton'
  | 'dior'
  | 'tom-ford'
  | 'ysl'
  | 'creed'
  | 'mfk'
  | 'le-labo'
  | 'celine'
  | 'chanel'
  | 'armani'
  | 'jpg'
  | 'versace'
  | 'byredo'
  | 'diptyque'
  | 'maison-margiela'
  | 'jo-malone'
  | 'prada'
  | 'gucci'
  | 'valentino';

export interface BrandHouseInfo {
  id: BrandHouseId;
  name: string;
  shortName: string;
  origin: string;
  est: string;
  signaturePhilosophy: string;
}

export interface OlfactoryPyramid {
  top: string[];
  heart: string[];
  base: string[];
}

export interface FragranceItem {
  id: string;
  tier: TierId;
  brandId: BrandHouseId;
  gender: GenderCategory;
  house: string;
  name: string;
  image: string;
  concentration:
    | 'Extrait de Parfum'
    | 'Eau de Parfum'
    | 'Parfum'
    | 'Eau de Parfum Millésime'
    | 'Eau de Parfum Intense'
    | 'Eau de Toilette'
    | 'Cologne'
    | "Parfum D'Eau";
  volumes: string[];
  defaultVolume: string;
  origin: string;
  launchYear: number;
  perfumer: string;
  characterSummary: string;
  editorialDescription: string;
  sillage: 'Intimate' | 'Moderate' | 'Strong' | 'Enormous';
  longevity: string;
  seasonality: string;
  batchCode: string;
  availabilityStatus:
    | 'Vault Allocation Ready'
    | 'Limited Vault Stock'
    | 'Private Allocation';
  pyramid: OlfactoryPyramid;
  flaconStyle: {
    silhouette:
      | 'mfk_cube'
      | 'lelabo_apothecary'
      | 'creed_flask'
      | 'tomford_cylinder'
      | 'chanel_monolith'
      | 'dior_cylinder'
      | 'ysl_monolith'
      | 'jpg_torso'
      | 'lv_cylinder'
      | 'dior_couture'
      | 'chanel_couture'
      | 'byredo_dome'
      | 'diptyque_oval'
      | 'margiela_replica'
      | 'jomalone_column'
      | 'prada_triangle'
      | 'valentino_rockstud'
      | 'celine_prism'
      | 'gucci_flacon'
      | 'armani_flacon'
      | 'versace_medusa';
    glassTint: string;
    liquidHue: string;
    capFinish: string;
    labelAccent: string;
  };
}

export interface ConciergeEmailLead {
  id: string;
  email: string;
  registeredAt: string;
  triggeredByFragrance?: string;
  syncedToVorvanMail: boolean;
}

export interface PrivateInvoiceItem {
  sku: string;
  house: string;
  fragranceName: string;
  concentration: string;
  volume: string;
  batchCode: string;
  quantity: number;
  unitPriceIDR: number;
}

export interface PrivateInvoice {
  invoiceId: string;
  createdAt: string;
  expiresAt: string;
  buyerName: string;
  buyerPhoneMasked: string;
  buyerCity: string;
  conciergeAdvisor: string;
  status: 'PENDING_PAYMENT' | 'PAID' | 'EXPIRED';
  paidAt?: string;
  paymentMethodUsed?: string;
  shippingInsuranceIDR: number;
  woodenCratePackagingIDR: number;
  retailPriceTotalIDR?: number;
  discountPct?: number;
  shippingLabel?: string;
  items: PrivateInvoiceItem[];
  notes: string;
  paymentProof?: string;
  paymentProofUrl?: string;
  paymentProofUploadedAt?: string;
}

export interface TrackingMilestone {
  timestamp: string;
  location: string;
  title: string;
  detail: string;
  completed: boolean;
  current?: boolean;
}

export interface TrackingRecord {
  trackingId: string;
  invoiceId: string;
  recipientName: string;
  destination: string;
  courierService: string;
  awbNumber: string;
  fragranceSummary: string;
  statusLabel: string;
  estimatedArrival: string;
  vaultSealCode: string;
  boxInspectionNote: string;
  milestones: TrackingMilestone[];
  createdAtTimestampMs?: number;
  courierOfficialUrl?: string;
  binderbyteCourierCode?: string;
}

export interface PreOrderSubmission {
  id: string;
  clientName: string;
  whatsappNumber: string;
  house: string;
  fragranceName: string;
  volume: string;
  notes: string;
  submittedAt: string;
}

export interface B2BPartnerSubmission {
  id: string;
  companyName: string;
  contactPerson: string;
  whatsappOrEmail: string;
  city: string;
  partnershipTier:
    | 'B2B Boutique Wholesale'
    | 'Corporate Gifting & VIP Souvenir'
    | 'Private Collector Sourcing';
  estimatedMonthlyVolume: string;
  submittedAt: string;
}

export interface PrivateTrayItem {
  key: string;
  fragrance: FragranceItem;
  volume: string;
  quantity: number;
}

export interface VorvanSiteSettings {
  whatsappNumber: string;
  telegramUsername: string;
  conciergeEmail: string;
  mandiriAccount: string;
  mandiriHolder: string;
  mandiriSwift: string;
  bniAccount: string;
  bniHolder: string;
  bniSwift: string;
  briAccount: string;
  briHolder: string;
  briSwift: string;
  paypalQrUrl: string;
  binderbyteApiKey?: string;
  autoPaidOnProofUpload?: boolean;
}

export type ShippingMethodType =
  | 'JNE'
  | 'J&T Express'
  | 'SiCepat'
  | 'Paxel'
  | 'Anteraja'
  | 'COD Kurir Internal VORVAN'
  | 'Ekspedisi JNE'
  | 'Ekspedisi J&T'
  | 'Ekspedisi SiCepat'
  | 'Kurir Internal VORVAN - COD Antar Langsung';

export type ShippingZoneKey =
  | 'FREE_VIP'
  | 'ZONA_1'
  | 'ZONA_2'
  | 'ZONA_3'
  | 'ZONA_4';

export interface VorvanSkuPricingEntry {
  no: number;
  brand: string;
  name: string;
  gender: 'Men' | 'Women' | 'Unisex';
  size: string;
  retail: number;
  disc: number;
  cut: number;
  price: number;
  tier: 1 | 2 | 3 | 4 | 5;
}

export interface CustomAdminOrder {
  invoiceId: string;
  trackingId: string;
  createdAt: string;
  createdAtTimestampMs?: number;
  buyerName: string;
  buyerCity: string;
  house: string;
  fragranceName: string;
  concentration: string;
  volume: string;
  batchCode: string;
  dealPriceIDR: number;
  retailPriceIDR?: number;
  discountPct?: number;
  shippingCostIDR?: number;
  shippingLabel?: string;
  shippingMethod: ShippingMethodType;
  awbNumber: string;
  shippingStage?: 1 | 2 | 3 | 4;
  status: 'PENDING_PAYMENT' | 'PAID';
  buyerEmail?: string;
  buyerPhone?: string;
  paymentProof?: string;
  paymentProofUrl?: string;
  paymentProofUploadedAt?: string;
}


