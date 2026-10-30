export type SupportedLocale = 'ID' | 'EN' | 'FR' | 'AR' | 'ZH';

export interface LocaleOption {
  code: SupportedLocale;
  label: string;
  nativeName: string;
  regionLabel: string;
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: 'ID', label: 'ID', nativeName: 'Bahasa Indonesia', regionLabel: 'Indonesia' },
  { code: 'EN', label: 'EN', nativeName: 'English', regionLabel: 'International' },
  { code: 'FR', label: 'FR', nativeName: 'Français', regionLabel: 'Paris · Grasse' },
  { code: 'AR', label: 'AR', nativeName: 'العربية', regionLabel: 'Dubai · Riyadh' },
  { code: 'ZH', label: 'ZH', nativeName: '中文 (繁/简)', regionLabel: 'Asia Pacific' },
];

export interface TranslationDictionary {
  nav: {
    showroom: string;
    preOrder: string;
    trackOrder: string;
    privateInvoice: string;
    returnPolicy: string;
    inquireWa: string;
    mobileHouses: string;
    mobileTrack: string;
    mobileInvoice: string;
  };
  splash: {
    vaultWhisper: string;
    scriptCrown: string;
    welcomeTitle: string;
    tagline: string;
    enterVaultBtn: string;
    bottomNote: string;
  };
  hero: {
    scriptCrown: string;
    kickerLeft: string;
    kickerRight: string;
    headline: string;
    narrativePrefix: string;
    narrativeMiddle: string;
    narrativePriceOnRequest: string;
    narrativeSuffix: string;
    ctaExploreHouses: string;
    ctaPrivateInvoice: string;
  };
  parallelImport: {
    scriptCrown: string;
    kicker: string;
    title: string;
    subtitle: string;
    pillars: {
      index: string;
      subtitle: string;
      title: string;
      description: string;
    }[];
  };
  ticker: {
    title: string;
    cities: string;
  };
  explorer: {
    scriptCrown: string;
    kicker: string;
    title: string;
    subtitle: string;
    activeMaison: string;
    allCollectionLabel: string;
    allCollectionSub: string;
    priceOnRequestNote: string;
    genderSubtitles: {
      GENTLEMAN: string;
      FEMME: string;
      UNISEX: string;
    };
  };
  card: {
    olfactoryDossier: string;
    olfactoryArchitecture: string;
    compactNotes: string;
    detailPyramid: string;
    openingAccord: string;
    coreIdentity: string;
    privateValuation: string;
    priceOnRequest: string;
    inquireViaWhatsapp: string;
  };
  tiers: {
    apexScript: string;
    apexKicker: string;
    apexTitle: string;
    apexSubtitle: string;
    urbanScript: string;
    urbanKicker: string;
    urbanTitle: string;
    urbanSubtitle: string;
  };
  invoiceBanner: {
    scriptCrown: string;
    kicker: string;
    title: string;
    description: string;
    openInvoiceBtn: string;
    trackOrderBtn: string;
  };
  preOrder: {
    kicker: string;
    title: string;
    description: string;
    estimatedLeadTime: string;
    quickSelect: string;
    b2bKicker: string;
    b2bTitle: string;
    b2bButton: string;
    formKicker: string;
    formTitle: string;
    clientNameLabel: string;
    whatsappLabel: string;
    houseLabel: string;
    variantLabel: string;
    volumeLabel: string;
    notesLabel: string;
    submitBtn: string;
    sendWaBtn: string;
  };
  returnPolicy: {
    kicker: string;
    title: string;
    subtitle: string;
    clausePrefix: string;
    deadlineTitle: string;
    deadlineDesc: string;
    understandBtn: string;
    clauses: {
      number: string;
      title: string;
      description: string;
    }[];
  };
  footer: {
    brandDescription: string;
    quickTrackTitle: string;
    quickTrackSubtitle: string;
    quickTrackBtn: string;
    clientServicesTitle: string;
    explore11Houses: string;
    apexShowcase: string;
    privateInvoiceLink: string;
    returnPolicyLink: string;
    conciergeB2bTitle: string;
    emailConciergeAccess: string;
    customerEmailLog: string;
    b2bWholesaleLink: string;
    contactConciergeWa: string;
    rightsReserved: string;
  };
}

export const TRANSLATIONS: Record<SupportedLocale, TranslationDictionary> = {
  ID: {
    nav: {
      showroom: 'Showroom',
      preOrder: 'Pre-Order',
      trackOrder: 'Lacak Resi',
      privateInvoice: 'Private Invoice',
      returnPolicy: 'Kebijakan Retur',
      inquireWa: 'Inquire via WhatsApp',
      mobileHouses: '19 Houses',
      mobileTrack: 'Cek Resi',
      mobileInvoice: 'Invoice',
    },
    splash: {
      vaultWhisper: 'PRIVATE OLFACTORY VAULT · MMXXVI',
      scriptCrown: 'La Maison de Haute Parfumerie',
      welcomeTitle: 'WELCOME TO VORVAN',
      tagline: 'LIFESTYLE FOR EVERYONE',
      enterVaultBtn: 'MASUKI VAULT EKSKLUSIF',
      bottomNote: 'ORIGINAL PARALLEL IMPORT LUXURY FRAGRANCE',
    },
    hero: {
      scriptCrown: 'La Collection Privée d’Europe',
      kickerLeft: 'ORIGINAL PARALLEL IMPORT LUXURY FRAGRANCE',
      kickerRight: 'LIFESTYLE FOR EVERYONE',
      headline:
        'Gerbang Eksklusif Menuju Mahakarya Wewangian Dunia Tanpa Batasan Ritel Konvensional.',
      narrativePrefix: 'Selamat datang di ruang kurasi privat ',
      narrativeMiddle:
        '. Kami menghadirkan mahakarya wewangian dari rumah mode dan atelier niche paling dihormati di Eropa melalui skema kuotasi privat (',
      narrativePriceOnRequest: 'Price on Request',
      narrativeSuffix:
        '), otentikasi batch berlapis, serta jaminan keaslian mutlak hingga ke tangan Anda.',
      ctaExploreHouses: 'Eksplorasi 19 Rumah Parfum',
      ctaPrivateInvoice: 'Buka Private Invoice',
    },
    parallelImport: {
      scriptCrown: 'L’Art de l’Importation Parallèle',
      kicker: 'EUROPEAN DIRECT ALLOCATION • TRANSPARENT SOURCING',
      title: 'The Parallel Import Advantage',
      subtitle:
        'Transparansi jalur pengadaan langsung dari distributor resmi Eropa yang memungkinkan kolektor menikmati keaslian mutlak dengan struktur valuasi yang rasional.',
      pillars: [
        {
          index: '01',
          subtitle: 'MEMOTONG JALUR DISTRIBUSI PANJANG',
          title: 'Arbitrase Rantai Pasok Global',
          description:
            'Mengakses alokasi langsung dari distributor resmi Eropa tanpa beban sewa butik mal mewah atau rantai perantara berlapis.',
        },
        {
          index: '02',
          subtitle: 'BATCH KURASI PILIHAN',
          title: 'Seleksi Batch Tanpa Kompromi',
          description:
            'Setiap flacon melewati verifikasi nomor batch produksi, segel pabrik, dan penyimpanan suhu terkontrol di dalam Vault VORVAN.',
        },
        {
          index: '03',
          subtitle: 'PRIVILEGE ARBITRASE 20% – 30%',
          title: 'Valuasi Rasional & Eksklusif',
          description:
            'Menghadirkan seluruh koleksi Original Parallel Import dari rumah mode dunia dengan selisih valuasi 20% hingga 30% di bawah harga ritel butik mal konvensional maupun situs resmi.',
        },
      ],
    },
    ticker: {
      title: 'CURATED FRAGRANCE HOUSES',
      cities: 'Paris · Grasse · Milan · London · Florence · New York · Stockholm',
    },
    explorer: {
      scriptCrown: 'La Navigation Olfactive Privée',
      kicker: 'BESPOKE OLFACTORY NAVIGATION · BRAND → GENDER → PARFUM',
      title: 'Eksplorasi Rumah Wewangian Dunia',
      subtitle:
        'Pilih rumah mode atau atelier niche pilihan Anda, tentukan karakter profil pemakai, dan temukan kurasi parfum lengkap dengan struktur piramida aromanya.',
      activeMaison: 'Maison Aktif',
      allCollectionLabel: 'SEMUA KOLEKSI',
      allCollectionSub: 'Seluruh kurasi maison pilihan Anda',
      priceOnRequestNote: 'Price on Request · Kuotasi Privat Concierge',
      genderSubtitles: {
        GENTLEMAN: 'Komposisi Maskulin, Kayu Mulia & Rempah Berwibawa',
        FEMME: 'Keanggunan Couture, Flora Grasse & Amber Sensual',
        UNISEX: 'Alkimia Artistik Tanpa Batas Gender',
      },
    },
    card: {
      olfactoryDossier: 'Olfactory Dossier',
      olfactoryArchitecture: 'Olfactory Architecture',
      compactNotes: 'Ringkas Notes',
      detailPyramid: 'Detail Piramida',
      openingAccord: 'Opening Accord',
      coreIdentity: 'Core Identity',
      privateValuation: 'Private Valuation',
      priceOnRequest: 'Price on Request',
      inquireViaWhatsapp: 'Tanya Penawaran via WhatsApp',
    },
    tiers: {
      apexScript: 'Les Extraits Souverains',
      apexKicker: '01. CURATED TIER I · HAUTE NICHE & ARTISANAL EXTRAITS',
      apexTitle: 'APEX PRESTIGE',
      apexSubtitle:
        'Empat pilar kemewahan olfaktori tertinggi dunia. Dirancang bagi kolektor yang menuntut komposisi bahan mentah langka, proyeksi tak terlupakan, dan prestise absolut.',
      urbanScript: 'L’Élégance Métropolitaine',
      urbanKicker: '02. CURATED TIER II · MODERN METROPOLITAN ICONS',
      urbanTitle: 'URBAN SIGNATURES',
      urbanSubtitle:
        'Klasik kontemporer dari rumah mode Eropa terkemuka. Karakter berwibawa dan serbaguna yang memancarkan karisma bersih dari ruang rapat hingga malam gala.',
    },
    invoiceBanner: {
      scriptCrown: 'Transaction Privée & Authentifiée',
      kicker: 'PRIVATE WEB CHECKOUT SYSTEM',
      title: 'Sudah Mendapatkan Penawaran Harga dari Concierge Kami?',
      description:
        'Bagi klien yang telah menyepakati penawaran dengan Concierge VORVAN, masukkan Kode Tagihan Privat Anda untuk menyelesaikan pembayaran via Transfer Bank Resmi (Mandiri / BNI), COD Antar Langsung, atau International Payment.',
      openInvoiceBtn: 'Buka Tagihan Privat',
      trackOrderBtn: 'Cek Status Pengiriman',
    },
    preOrder: {
      kicker: 'BESPOKE EUROPEAN & OMANI ALLOCATION',
      title: 'Pre-Order Concierge — Niche & High Perfumery',
      description:
        'Mencari mahakarya olfaktori langka di luar katalog reguler kami? Tim Private Sourcing VORVAN melayani pengadaan langsung untuk rumah parfum niche dunia seperti Xerjoff, Amouage, Parfums de Marly, dan Roja Parfums.',
      estimatedLeadTime: 'Estimasi Kedatangan:',
      quickSelect: 'Pilih Cepat:',
      b2bKicker: 'Kemitraan Korporat & Reseller Kurasi',
      b2bTitle: 'Butuh suplai partai besar (B2B Wholesale / Corporate VIP Gifting)?',
      b2bButton: 'Daftar B2B Wholesale',
      formKicker: 'Formulir Permintaan Alokasi Khusus',
      formTitle: 'Ajukan Pre-Order Niche Concierge',
      clientNameLabel: 'Nama Lengkap Klien *',
      whatsappLabel: 'Nomor WhatsApp Aktif *',
      houseLabel: 'Brand / House *',
      variantLabel: 'Varian Parfum *',
      volumeLabel: 'Ukuran Botol',
      notesLabel: 'Preferensi Batch / Catatan Khusus (Opsional)',
      submitBtn: 'Catat Permintaan Pre-Order',
      sendWaBtn: 'Kirim via WA',
    },
    returnPolicy: {
      kicker: 'VORVAN AUTHENTICITY & CLIENT PROTECTION CHARTER',
      title: 'Syarat, Ketentuan Pengiriman & Kebijakan Retur',
      subtitle:
        'Demi menjaga integritas produk parfum niche & desainer bernilai tinggi, setiap pengiriman dari Vault VORVAN tunduk pada protokol perlindungan ketat berikut.',
      clausePrefix: 'PASAL',
      deadlineTitle:
        'Batas Waktu Pelaporan Klaim: Maksimal 1×24 Jam Sejak Status Resi “Delivered”',
      deadlineDesc:
        'Kirimkan video unboxing utuh beserta foto kode segel hologram Vault langsung ke WhatsApp Concierge VORVAN.',
      understandBtn: 'Saya Memahami Ketentuan Ini',
      clauses: [
        {
          number: '01',
          title: 'Cakupan Klaim Retur (Botol Pecah atau Atomizer Macet Pabrik)',
          description:
            'Pengajuan retur atau penggantian unit baru (1-to-1 Vault Replacement) HANYA berlaku apabila produk diterima dalam kondisi botol kaca pecah selama ekspedisi atau mekanisme semprotan (atomizer/sprayer) macet total akibat cacat produksi pabrik.',
        },
        {
          number: '02',
          title: 'Kewajiban Video Unboxing Utuh Tanpa Jeda / Tanpa Cut',
          description:
            'Setiap pengajuan klaim WAJIB menyertakan rekaman video unboxing utuh (single continuous shot) tanpa jeda, tanpa penyuntingan, dimulai sejak paket ekspedisi masih tersegel utuh dari kurir hingga pengetesan semprotan pertama.',
        },
        {
          number: '03',
          title: 'Toleransi Kondisi Box Luar Akibat Transit Kargo Internasional',
          description:
            'Adanya lipatan halus (minor crease) pada kemasan karton luar akibat tekanan kargo udara internasional merupakan hal wajar dan bukan cacat produk selama segel utama dan flacon di dalamnya sempurna.',
        },
        {
          number: '04',
          title: 'Kebijakan Final Sale (Preferensi Aroma & Ketahanan Wangi)',
          description:
            'Seluruh transaksi bersifat FINAL SALE. Kami tidak menerima pengembalian dana atau tukar guling yang didasarkan pada ketidakcocokan selera aroma pribadi (blind-buy regret) atau persepsi subjektif terhadap ketahanan wangi.',
        },
      ],
    },
    footer: {
      brandDescription:
        'Butik kurasi parfum mewah & private olfactory concierge. Seluruh merek dagang dan nama rumah parfum adalah milik masing-masing pemegang hak cipta. VORVAN menjamin keaslian 100% setiap flacon yang keluar dari ruang penyimpanan kami.',
      quickTrackTitle: 'Lacak Pengiriman Cepat',
      quickTrackSubtitle:
        'Masukkan nomor resi VORVAN atau nomor Private Invoice Anda:',
      quickTrackBtn: 'Cek Resi',
      clientServicesTitle: 'Layanan Klien',
      explore11Houses: 'Eksplorasi 19 Rumah Parfum',
      apexShowcase: 'Apex Prestige Showcase',
      privateInvoiceLink: 'Private Invoice Resmi',
      returnPolicyLink: 'Kebijakan Retur & Klaim',
      conciergeB2bTitle: 'Concierge & B2B',
      emailConciergeAccess: 'Akses Email Concierge',
      customerEmailLog: 'Log Email Customer',
      b2bWholesaleLink: 'B2B Wholesale / Private Sourcing',
      contactConciergeWa: 'Hubungi Concierge WA',
      rightsReserved: 'All Rights Reserved.',
    },
  },
  EN: {
    nav: {
      showroom: 'Showroom',
      preOrder: 'Pre-Order',
      trackOrder: 'Track Order',
      privateInvoice: 'Private Invoice',
      returnPolicy: 'Return Policy',
      inquireWa: 'Inquire via WhatsApp',
      mobileHouses: '19 Houses',
      mobileTrack: 'Track',
      mobileInvoice: 'Invoice',
    },
    splash: {
      vaultWhisper: 'PRIVATE OLFACTORY VAULT · MMXXVI',
      scriptCrown: 'La Maison de Haute Parfumerie',
      welcomeTitle: 'WELCOME TO VORVAN',
      tagline: 'LIFESTYLE FOR EVERYONE',
      enterVaultBtn: 'ENTER PRIVATE VAULT',
      bottomNote: 'ORIGINAL PARALLEL IMPORT LUXURY FRAGRANCE',
    },
    hero: {
      scriptCrown: 'La Collection Privée d’Europe',
      kickerLeft: 'ORIGINAL PARALLEL IMPORT LUXURY FRAGRANCE',
      kickerRight: 'LIFESTYLE FOR EVERYONE',
      headline:
        'The Exclusive Gateway to World-Class Olfactory Masterpieces Beyond Conventional Retail.',
      narrativePrefix: 'Welcome to the private curation vault of ',
      narrativeMiddle:
        '. We source iconic creations from Europe’s most revered couture houses and niche ateliers through bespoke private quotation (',
      narrativePriceOnRequest: 'Price on Request',
      narrativeSuffix:
        '), multi-layer batch authentication, and absolute provenance guarantee.',
      ctaExploreHouses: 'Explore 19 Fragrance Houses',
      ctaPrivateInvoice: 'Open Private Invoice',
    },
    parallelImport: {
      scriptCrown: 'L’Art de l’Importation Parallèle',
      kicker: 'EUROPEAN DIRECT ALLOCATION • TRANSPARENT SOURCING',
      title: 'The Parallel Import Advantage',
      subtitle:
        'Direct European sourcing transparency enabling discerning collectors to acquire absolute provenance with a rational valuation structure.',
      pillars: [
        {
          index: '01',
          subtitle: 'BYPASSING BLOATED RETAIL CHAINS',
          title: 'Global Supply Arbitrage',
          description:
            'Direct allocation from authorized European distribution hubs without luxury shopping mall lease markups or middlemen.',
        },
        {
          index: '02',
          subtitle: 'CURATED PRODUCTION BATCHES',
          title: 'Uncompromising Batch Selection',
          description:
            'Every flacon undergoes batch code verification, factory seal inspection, and climate-controlled storage inside the VORVAN Vault.',
        },
        {
          index: '03',
          subtitle: 'PRIVILEGE ARBITRAGE 20% – 30%',
          title: 'Rational & Exclusive Valuation',
          description:
            'Presenting Original Parallel Import collections from world fashion houses with a 20% to 30% valuation differential below conventional mall boutiques and official websites.',
        },
      ],
    },
    ticker: {
      title: 'CURATED FRAGRANCE HOUSES',
      cities: 'Paris · Grasse · Milan · London · Florence · New York · Stockholm',
    },
    explorer: {
      scriptCrown: 'La Navigation Olfactive Privée',
      kicker: 'BESPOKE OLFACTORY NAVIGATION · BRAND → GENDER → PARFUM',
      title: 'Explore World Fragrance Houses',
      subtitle:
        'Select your preferred couture house or niche atelier, choose a wearer profile, and inspect our curated flacons with full olfactory pyramids.',
      activeMaison: 'Active Maison',
      allCollectionLabel: 'ALL COLLECTIONS',
      allCollectionSub: 'Complete curation for this maison',
      priceOnRequestNote: 'Price on Request · Private Concierge Quotation',
      genderSubtitles: {
        GENTLEMAN: 'Masculine Architecture, Noble Woods & Sovereign Spices',
        FEMME: 'Couture Grace, Grasse Florals & Sensual Amber',
        UNISEX: 'Artistic Alchemy Beyond Gender Boundaries',
      },
    },
    card: {
      olfactoryDossier: 'Olfactory Dossier',
      olfactoryArchitecture: 'Olfactory Architecture',
      compactNotes: 'Compact Notes',
      detailPyramid: 'Full Pyramid',
      openingAccord: 'Opening Accord',
      coreIdentity: 'Core Identity',
      privateValuation: 'Private Valuation',
      priceOnRequest: 'Price on Request',
      inquireViaWhatsapp: 'Inquire Offer via WhatsApp',
    },
    tiers: {
      apexScript: 'Les Extraits Souverains',
      apexKicker: '01. CURATED TIER I · HAUTE NICHE & ARTISANAL EXTRAITS',
      apexTitle: 'APEX PRESTIGE',
      apexSubtitle:
        'Four pillars of supreme olfactory luxury. Crafted for collectors demanding rare raw materials, unforgettable sillage, and absolute prestige.',
      urbanScript: 'L’Élégance Métropolitaine',
      urbanKicker: '02. CURATED TIER II · MODERN METROPOLITAN ICONS',
      urbanTitle: 'URBAN SIGNATURES',
      urbanSubtitle:
        'Contemporary classics from leading European fashion houses. Versatile, commanding signatures from boardroom to evening gala.',
    },
    invoiceBanner: {
      scriptCrown: 'Transaction Privée & Authentifiée',
      kicker: 'PRIVATE WEB CHECKOUT SYSTEM',
      title: 'Already Received a Bespoke Quotation from Our Concierge?',
      description:
        'Enter your dedicated Private Invoice code issued by VORVAN Official Concierge to settle via Official Bank Transfer (Mandiri / BNI), Private COD Hand-Delivery, or International PayPal & SWIFT.',
      openInvoiceBtn: 'Open Private Invoice',
      trackOrderBtn: 'Track Shipment Status',
    },
    preOrder: {
      kicker: 'BESPOKE EUROPEAN & OMANI ALLOCATION',
      title: 'Pre-Order Concierge — Niche & High Perfumery',
      description:
        'Seeking a rare olfactory masterpiece beyond our regular showroom? VORVAN Private Sourcing arranges direct boutique allocations from Xerjoff, Amouage, Parfums de Marly, and Roja Parfums.',
      estimatedLeadTime: 'Estimated Arrival:',
      quickSelect: 'Quick Select:',
      b2bKicker: 'Corporate & Curated Reseller Partnership',
      b2bTitle: 'Require volume allocation (B2B Wholesale / Corporate VIP Gifting)?',
      b2bButton: 'Register B2B Wholesale',
      formKicker: 'Bespoke Allocation Request Form',
      formTitle: 'Submit Niche Pre-Order Request',
      clientNameLabel: 'Client Full Name *',
      whatsappLabel: 'Active WhatsApp Number *',
      houseLabel: 'Brand / House *',
      variantLabel: 'Fragrance Variant *',
      volumeLabel: 'Bottle Size',
      notesLabel: 'Batch Preference / Special Notes (Optional)',
      submitBtn: 'Log Pre-Order Request',
      sendWaBtn: 'Send via WA',
    },
    returnPolicy: {
      kicker: 'VORVAN AUTHENTICITY & CLIENT PROTECTION CHARTER',
      title: 'Shipping Terms, Authenticity & Return Charter',
      subtitle:
        'To safeguard the integrity of high-value niche and designer flacons, every shipment from the VORVAN Vault adheres to the following protection protocol.',
      clausePrefix: 'CLAUSE',
      deadlineTitle:
        'Claim Reporting Window: Maximum 1×24 Hours After “Delivered” Status',
      deadlineDesc:
        'Submit your uncut unboxing video along with a photo of the Vault hologram seal code directly to VORVAN WhatsApp Concierge.',
      understandBtn: 'I Acknowledge This Charter',
      clauses: [
        {
          number: '01',
          title: 'Return Eligibility (Shattered Flacon or Factory Defective Atomizer)',
          description:
            '1-to-1 Vault Replacement applies EXCLUSIVELY if the glass flacon arrives shattered in transit or if the sprayer/atomizer is completely non-functional due to factory defect.',
        },
        {
          number: '02',
          title: 'Mandatory Continuous Uncut Unboxing Video',
          description:
            'Every claim MUST include a single continuous, unedited unboxing video starting from the sealed courier parcel showing the waybill, VORVAN hologram seal, and first spray test.',
        },
        {
          number: '03',
          title: 'International Air Cargo Outer Box Crease Tolerance',
          description:
            'Minor creases on outer cardboard packaging caused by international air cargo pressure or customs inspection are normal and not considered a defect provided the inner flacon is pristine.',
        },
        {
          number: '04',
          title: 'Final Sale Policy (Scent Preference & Subjective Longevity)',
          description:
            'All transactions are FINAL SALE. Returns or exchanges based on personal scent preference (blind-buy regret) or subjective skin chemistry performance are not accepted.',
        },
      ],
    },
    footer: {
      brandDescription:
        'Luxury fragrance curation boutique & private olfactory concierge. All trademarks belong to their respective owners. VORVAN guarantees 100% authenticity on every flacon leaving our vault.',
      quickTrackTitle: 'Quick Shipment Tracker',
      quickTrackSubtitle:
        'Enter your VORVAN waybill code or Private Invoice ID:',
      quickTrackBtn: 'Track',
      clientServicesTitle: 'Client Services',
      explore11Houses: 'Explore 19 Fragrance Houses',
      apexShowcase: 'Apex Prestige Showcase',
      privateInvoiceLink: 'Official Private Invoice',
      returnPolicyLink: 'Return Policy & Claims',
      conciergeB2bTitle: 'Concierge & B2B',
      emailConciergeAccess: 'Concierge Email Access',
      customerEmailLog: 'Client Email Log',
      b2bWholesaleLink: 'B2B Wholesale / Private Sourcing',
      contactConciergeWa: 'Contact WA Concierge',
      rightsReserved: 'All Rights Reserved.',
    },
  },
  FR: {
    nav: {
      showroom: 'Salon Privé',
      preOrder: 'Sur-Mesure',
      trackOrder: 'Suivi Colis',
      privateInvoice: 'Facture Privée',
      returnPolicy: 'Charte & Retours',
      inquireWa: 'Conciergerie WhatsApp',
      mobileHouses: '19 Maisons',
      mobileTrack: 'Suivi',
      mobileInvoice: 'Facture',
    },
    splash: {
      vaultWhisper: 'CAVEAU OLFACTIF PRIVÉ · MMXXVI',
      scriptCrown: 'La Maison de Haute Parfumerie',
      welcomeTitle: 'BIENVENUE CHEZ VORVAN',
      tagline: 'LIFESTYLE FOR EVERYONE',
      enterVaultBtn: 'ENTRER DANS LE SALON',
      bottomNote: 'HAUTE PARFUMERIE D’IMPORTATION PARALLÈLE AUTHENTIQUE',
    },
    hero: {
      scriptCrown: 'La Collection Privée d’Europe',
      kickerLeft: 'ORIGINAL PARALLEL IMPORT LUXURY FRAGRANCE',
      kickerRight: 'LIFESTYLE FOR EVERYONE',
      headline:
        'Le Sanctuaire Exclusif des Chefs-d’Œuvre de la Haute Parfumerie Mondiale.',
      narrativePrefix: 'Bienvenue dans le salon privé de ',
      narrativeMiddle:
        '. Nous réunissons les créations les plus nobles des maisons de couture et ateliers de niche européens sur cotation privée (',
      narrativePriceOnRequest: 'Prix sur Demande',
      narrativeSuffix:
        '), avec authentification stricte des lots et garantie d’origine absolue.',
      ctaExploreHouses: 'Explorer les 19 Maisons',
      ctaPrivateInvoice: 'Facture Privée',
    },
    parallelImport: {
      scriptCrown: 'L’Art de l’Importation Parallèle',
      kicker: 'ALLOCATION DIRECTE EUROPÉENNE · TRAÇABILITÉ TOTALE',
      title: 'L’Avantage de l’Importation Parallèle',
      subtitle:
        'Pourquoi les collectionisseurs avertis privilégient le circuit d’allocation directe européenne VORVAN.',
      pillars: [
        {
          index: '01',
          subtitle: 'CIRCUIT COURT INTERNATIONAL',
          title: 'Arbitrage de Distribution',
          description:
            'Accès direct aux allocations européennes sans les marges immobilières excessives des grands magasins.',
        },
        {
          index: '02',
          subtitle: 'SÉLECTION RIGOUREUSE DES LOTS',
          title: 'lots de Production Certifiés',
          description:
            'Chaque flacon est inspecté (code lot, scellé d’origine) et conservé à température contrôlée dans notre caveau.',
        },
        {
          index: '03',
          subtitle: 'PRIVILÈGE DE COTATION PRIVÉE',
          title: 'Valorisation Juste & Exclusive',
          description:
            'Des créations 100 % authentiques proposées à une valorisation confidentielle réservée aux connaisseurs.',
        },
      ],
    },
    ticker: {
      title: 'MAISONS DE HAUTE PARFUMERIE',
      cities: 'Paris · Grasse · Milan · Londres · Florence · New York · Stockholm',
    },
    explorer: {
      scriptCrown: 'La Navigation Olfactive Privée',
      kicker: 'NAVIGATION OLFACTIVE · MAISON → PROFIL → PARFUM',
      title: 'Explorer les Grandes Maisons',
      subtitle:
        'Sélectionnez votre maison de parfum, choisissez votre signature olfactive et découvrez la pyramide des notes.',
      activeMaison: 'Maison Active',
      allCollectionLabel: 'TOUTE LA COLLECTION',
      allCollectionSub: 'Toutes les créations de la maison',
      priceOnRequestNote: 'Prix sur Demande · Cotation Privée',
      genderSubtitles: {
        GENTLEMAN: 'Architecture Masculine, Bois Précieux & Épices Nobles',
        FEMME: 'Grâce Couture, Fleurs de Grasse & Ambre Sensuel',
        UNISEX: 'Alchimie Artistique Sans Frontières',
      },
    },
    card: {
      olfactoryDossier: 'Dossier Olfactif',
      olfactoryArchitecture: 'Architecture Olfactive',
      compactNotes: 'Réduire',
      detailPyramid: 'Détail Pyramide',
      openingAccord: 'Notes de Tête',
      coreIdentity: 'Notes de Cœur',
      privateValuation: 'Cotation Privée',
      priceOnRequest: 'Price on Request',
      inquireViaWhatsapp: 'Demander une Offre via WhatsApp',
    },
    tiers: {
      apexScript: 'Les Extraits Souverains',
      apexKicker: '01. SÉLECTION TIER I · HAUTE PARFUMERIE DE NICHE',
      apexTitle: 'APEX PRESTIGE',
      apexSubtitle:
        'Quatre piliers de la haute parfumerie mondiale aux matières premières rares et au sillage inoubliable.',
      urbanScript: 'L’Élégance Métropolitaine',
      urbanKicker: '02. SÉLECTION TIER II · ICÔNES CONTEMPORAINES',
      urbanTitle: 'URBAN SIGNATURES',
      urbanSubtitle:
        'Les grands classiques contemporains des maisons européennes, alliant charisme et élégance.',
    },
    invoiceBanner: {
      scriptCrown: 'Transaction Privée & Authentifiée',
      kicker: 'RÈGLEMENT PRIVÉ SÉCURISÉ',
      title: 'Vous Avez Reçu une Offre de Notre Conciergerie ?',
      description:
        'Réglez votre commande en toute sécurité via votre lien Facture Privée nominatif connecté à Midtrans Snap (QRIS & Compte Virtuel).',
      openInvoiceBtn: 'Ouvrir la Facture',
      trackOrderBtn: 'Suivre l’Expédition',
    },
    preOrder: {
      kicker: 'ALLOCATION SUR-MESURE EUROPE & OMAN',
      title: 'Conciergerie Pré-Commande — Parfumerie Rare',
      description:
        'Vous recherchez un flacon rare hors catalogue ? Notre équipe assure l’approvisionnement direct auprès de Xerjoff, Amouage, Parfums de Marly et Roja Parfums.',
      estimatedLeadTime: 'Délai Estimé :',
      quickSelect: 'Sélection Rapide :',
      b2bKicker: 'Partenariat B2B & Cadeaux d’Entreprise',
      b2bTitle: 'Besoin d’une allocation en volume (B2B Wholesale / VIP) ?',
      b2bButton: 'Programme B2B Wholesale',
      formKicker: 'Formulaire d’Allocation Spéciale',
      formTitle: 'Soumettre une Demande Sur-Mesure',
      clientNameLabel: 'Nom Complet du Client *',
      whatsappLabel: 'Numéro WhatsApp Actif *',
      houseLabel: 'Maison de Parfum *',
      variantLabel: 'Nom du Parfum *',
      volumeLabel: 'Contenance',
      notesLabel: 'Préférence de Lot / Notes (Optionnel)',
      submitBtn: 'Enregistrer la Pré-Commande',
      sendWaBtn: 'Envoyer via WA',
    },
    returnPolicy: {
      kicker: 'CHARTE D’AUTHENTICITÉ & PROTECTION VORVAN',
      title: 'Conditions d’Expédition & Charte de Retour',
      subtitle:
        'Chaque flacon expédié depuis le Caveau VORVAN est protégé par notre protocole de garantie.',
      clausePrefix: 'ARTICLE',
      deadlineTitle:
        'Délai de Déclaration : Maximum 24 Heures Après Réception',
      deadlineDesc:
        'Transmettez votre vidéo d’ouverture continue sans coupure ainsi que le code scellé hologramme à notre Conciergerie WhatsApp.',
      understandBtn: 'J’Accepte cette Charte',
      clauses: [
        {
          number: '01',
          title: 'Couverture de Remplacement (Flacon Brisé ou Vaporisateur Défectueux)',
          description:
            'Le remplacement 1-pour-1 s’applique uniquement en cas de bris de verre durant le transport ou de blocage mécanique d’origine du vaporisateur.',
        },
        {
          number: '02',
          title: 'Vidéo d’Ouverture Continue Sans Montage Obligatoire',
          description:
            'Toute réclamation doit être accompagnée d’une vidéo continue sans coupure depuis le colis scellé jusqu’au premier test de vaporisation.',
        },
        {
          number: '03',
          title: 'Tolérance d’Emballage Fret Aérien International',
          description:
            'De légères marques sur l’étui carton extérieur dues au transit aérien international sont normales tant que le flacon intérieur est intact.',
        },
        {
          number: '04',
          title: 'Vente Ferme et Définitive (Préférence Olfactive)',
          description:
            'Toutes les ventes sont définitives. Aucun retour n’est accepté pour convenance personnelle d’odeur ou tenue sur la peau.',
        },
      ],
    },
    footer: {
      brandDescription:
        'Boutique de haute parfumerie & conciergerie olfactive privée. VORVAN garantit l’authenticité à 100 % de chaque flacon.',
      quickTrackTitle: 'Suivi Rapide d’Expédition',
      quickTrackSubtitle:
        'Entrez votre numéro de suivi VORVAN ou Facture Privée :',
      quickTrackBtn: 'Suivre',
      clientServicesTitle: 'Services Clients',
      explore11Houses: 'Explorer les 19 Maisons',
      apexShowcase: 'Collection Apex Prestige',
      privateInvoiceLink: 'Facture Privée',
      returnPolicyLink: 'Charte de Retour & Garantie',
      conciergeB2bTitle: 'Conciergerie & B2B',
      emailConciergeAccess: 'Accès Email Conciergerie',
      customerEmailLog: 'Registre Emails Clients',
      b2bWholesaleLink: 'B2B Wholesale / Sourcing Privé',
      contactConciergeWa: 'Contacter Conciergerie WA',
      rightsReserved: 'Tous droits réservés.',
    },
  },
  AR: {
    nav: {
      showroom: 'المعرض الخاص',
      preOrder: 'طلب مسبق',
      trackOrder: 'تتبع الشحنة',
      privateInvoice: 'فاتورة خاصة',
      returnPolicy: 'سياسة الإرجاع',
      inquireWa: 'استفسر عبر واتساب',
      mobileHouses: '19 دار عطور',
      mobileTrack: 'تتبع',
      mobileInvoice: 'الفاتورة',
    },
    splash: {
      vaultWhisper: 'PRIVATE OLFACTORY VAULT · MMXXVI',
      scriptCrown: 'La Maison de Haute Parfumerie',
      welcomeTitle: 'WELCOME TO VORVAN',
      tagline: 'LIFESTYLE FOR EVERYONE',
      enterVaultBtn: 'دخول الخزينة الخاصة',
      bottomNote: 'ORIGINAL PARALLEL IMPORT LUXURY FRAGRANCE',
    },
    hero: {
      scriptCrown: 'La Collection Privée d’Europe',
      kickerLeft: 'ORIGINAL PARALLEL IMPORT LUXURY FRAGRANCE',
      kickerRight: 'LIFESTYLE FOR EVERYONE',
      headline:
        'بوابتك الحصرية إلى أرقى روائع العطور العالمية خارج حدود التجزئة التقليدية.',
      narrativePrefix: 'مرحباً بكم في المعرض الخاص لعلامة ',
      narrativeMiddle:
        '. نقدم أرقى العطور النيش والفاخرة من أعرق الدور الأوروبية عبر نظام التسعير الخاص (',
      narrativePriceOnRequest: 'السعر عند الطلب',
      narrativeSuffix:
        ') مع فحص دقيق لرموز الدفعات وضمان الأصالة الكاملة.',
      ctaExploreHouses: 'استكشف 19 دار عطور عالمية',
      ctaPrivateInvoice: 'فاتورة خاصة',
    },
    parallelImport: {
      scriptCrown: 'L’Art de l’Importation Parallèle',
      kicker: 'EUROPEAN DIRECT ALLOCATION · TRANSPARENT SOURCING',
      title: 'مزايا الاستيراد الموازي الأصلي',
      subtitle:
        'لماذا يختار جامعو العطور الفاخرة مسار التوريد الأوروبي المباشر لدى VORVAN.',
      pillars: [
        {
          index: '01',
          subtitle: 'تجاوز سلاسل التوزيع الطويلة',
          title: 'توريد مباشر من أوروبا',
          description:
            'الوصول المباشر إلى الموزعين المعتمدين في أوروبا دون تكاليف إيجارات المتاجر الفاخرة.',
        },
        {
          index: '02',
          subtitle: 'دفعات إنتاج منتقاة بعناية',
          title: 'فحص صارم لكل زجاجة',
          description:
            'يتم التحقق من رمز الدفعة وختم المصنع وحفظ العطور في درجة حرارة مثالية داخل خزينة VORVAN.',
        },
        {
          index: '03',
          subtitle: 'امتياز القيمة العادلة',
          title: 'تسعير خاص للنخبة',
          description:
            'عطور أصلية 100% بقيمة استثنائية مخصصة لعملائنا المميزين.',
        },
      ],
    },
    ticker: {
      title: 'دور العطور العالمية المختارة',
      cities: 'باريس · غراس · لندن · نيويورك · ستوكهولم',
    },
    explorer: {
      scriptCrown: 'La Navigation Olfactive Privée',
      kicker: 'تصفح العطور الفاخرة · الدار ← الفئة ← العطر',
      title: 'استكشاف دور العطور العالمية',
      subtitle:
        'اختر دار العطور المفضلة لديك، وحدد الفئة، واستعرض الهرم العطري الكامل لكل إصدار.',
      activeMaison: 'الدار المختارة',
      allCollectionLabel: 'جميع المجموعات',
      allCollectionSub: 'كافة إصدارات هذه الدار',
      priceOnRequestNote: 'السعر عند الطلب · عرض سعر خاص',
      genderSubtitles: {
        GENTLEMAN: 'تركيبات رجالية فاخرة من الأخشاب النبيلة والتوابل',
        FEMME: 'أناقة راقية من أزهار غراس والعنبر الساحر',
        UNISEX: 'إبداعات عطرية فنية للجنسين',
      },
    },
    card: {
      olfactoryDossier: 'ملف العطر',
      olfactoryArchitecture: 'الهرم العطري',
      compactNotes: 'طي النوتات',
      detailPyramid: 'تفاصيل الهرم',
      openingAccord: 'الافتتاحية',
      coreIdentity: 'قلب العطر',
      privateValuation: 'التقييم الخاص',
      priceOnRequest: 'Price on Request',
      inquireViaWhatsapp: 'اطلب عرض السعر عبر واتساب',
    },
    tiers: {
      apexScript: 'Les Extraits Souverains',
      apexKicker: '01. الفئة الأولى · عطور النيش الفاخرة',
      apexTitle: 'APEX PRESTIGE',
      apexSubtitle:
        'أربع ركائز من أرقى عطور النيش العالمية ذات المكونات النادرة والفوحان الاستثنائي.',
      urbanScript: 'L’Élégance Métropolitaine',
      urbanKicker: '02. الفئة الثانية · أيقونات العطور العصرية',
      urbanTitle: 'URBAN SIGNATURES',
      urbanSubtitle:
        'كلاسيكيات عصرية من أرقى دور الأزياء الأوروبية تجمع بين الجاذبية والحضور الواثق.',
    },
    invoiceBanner: {
      scriptCrown: 'Transaction Privée & Authentifiée',
      kicker: 'نظام الدفع الإلكتروني الخاص',
      title: 'هل حصلت على عرض سعر من مستشار العطور لدينا؟',
      description:
        'يمكنك إتمام عملية الدفع بأمان عبر رابط الفاتورة الخاصة باسمك عبر بوابة Midtrans Snap.',
      openInvoiceBtn: 'فتح الفاتورة',
      trackOrderBtn: 'تتبع الشحنة',
    },
    preOrder: {
      kicker: 'توريد خاص من أوروبا وعُمان',
      title: 'خدمة الطلب المسبق — عطور النيش النادرة',
      description:
        'هل تبحث عن عطر نادر؟ يوفر فريق VORVAN التوريد المباشر من Xerjoff و Amouage و Parfums de Marly و Roja Parfums.',
      estimatedLeadTime: 'مدة الوصول المتوقعة:',
      quickSelect: 'اختيار سريع:',
      b2bKicker: 'شراكات الأعمال وتوريد الجملة',
      b2bTitle: 'هل تحتاج إلى كميات تجارية (B2B Wholesale / هدايا كبار الشخصيات)؟',
      b2bButton: 'تسجيل شراكة B2B',
      formKicker: 'نموذج طلب التوريد الخاص',
      formTitle: 'تقديم طلب مسبق لعطر نيش',
      clientNameLabel: 'الاسم الكامل للعميل *',
      whatsappLabel: 'رقم واتساب الفعال *',
      houseLabel: 'دار العطور *',
      variantLabel: 'اسم العطر *',
      volumeLabel: 'حجم الزجاجة',
      notesLabel: 'ملاحظات إضافية (اختياري)',
      submitBtn: 'تسجيل الطلب المسبق',
      sendWaBtn: 'إرسال عبر واتساب',
    },
    returnPolicy: {
      kicker: 'ميثاق الأصالة وحماية العملاء لدى VORVAN',
      title: 'شروط الشحن وسياسة الاستبدال والضمان',
      subtitle:
        'تخضع كل شحنة تخرج من خزينة VORVAN لبروتوكول الحماية والضمان التالي.',
      clausePrefix: 'البند',
      deadlineTitle:
        'المهلة القصوى للإبلاغ: 24 ساعة من حالة "تم التسليم"',
      deadlineDesc:
        'يرجى إرسال فيديو فتح الصندوق كاملاً دون تقطيع مع صورة ختم الهولوغرام إلى واتساب VORVAN.',
      understandBtn: 'أوافق على هذه الشروط',
      clauses: [
        {
          number: '01',
          title: 'نطاق الضمان (انكسار الزجاجة أو عطل البخاخ المصنعي)',
          description:
            'يسري الاستبدال الفوري فقط في حال وصول الزجاجة مكسورة أثناء الشحن أو تعطل البخاخ المصنعي بالكامل.',
        },
        {
          number: '02',
          title: 'شرط فيديو فتح الصندوق المتواصل دون تقطيع',
          description:
            'يجب إرفاق فيديو واحد متواصل دون مونتاج يبدأ من الطرد المغلق حتى أول تجربة رش للعطر.',
        },
        {
          number: '03',
          title: 'تأثيرات الشحن الجوي الدولي على العلبة الخارجية',
          description:
            'الانثناءات الطفيفة على الكرتون الخارجي نتيجة الشحن الجوي الدولي طبيعية طالما أن الزجاجة الداخلية سليمة تماماً.',
        },
        {
          number: '04',
          title: 'سياسة البيع النهائي (تفضيل الرائحة والثبات)',
          description:
            'جميع المبيعات نهائية ولا يُقبل الإرجاع بناءً على الذوق الشخصي للرائحة.',
        },
      ],
    },
    footer: {
      brandDescription:
        'بوتيك عطور فاخرة ومستشار عطري خاص. تضمن VORVAN أصالة كل زجاجة بنسبة 100%.',
      quickTrackTitle: 'التتبع السريع للشحنات',
      quickTrackSubtitle: 'أدخل رقم تتبع الشحنة أو رقم الفاتورة الخاصة:',
      quickTrackBtn: 'تتبع',
      clientServicesTitle: 'خدمات العملاء',
      explore11Houses: 'استكشاف 19 دار عطور',
      apexShowcase: 'مجموعة Apex Prestige',
      privateInvoiceLink: 'فاتورة خاصة',
      returnPolicyLink: 'سياسة الضمان والإرجاع',
      conciergeB2bTitle: 'الكونسيرج والأعمال B2B',
      emailConciergeAccess: 'تسجيل البريد الإلكتروني',
      customerEmailLog: 'سجل بريد العملاء',
      b2bWholesaleLink: 'توريد الجملة B2B',
      contactConciergeWa: 'تواصل عبر واتساب',
      rightsReserved: 'جميع الحقوق محفوظة.',
    },
  },
  ZH: {
    nav: {
      showroom: '私人展厅',
      preOrder: '专属预订',
      trackOrder: '物流追踪',
      privateInvoice: '私人账单',
      returnPolicy: '退换保障',
      inquireWa: 'WhatsApp 专属询价',
      mobileHouses: '19大香氛世家',
      mobileTrack: '查快递',
      mobileInvoice: '私人账单',
    },
    splash: {
      vaultWhisper: 'PRIVATE OLFACTORY VAULT · MMXXVI',
      scriptCrown: 'La Maison de Haute Parfumerie',
      welcomeTitle: 'WELCOME TO VORVAN',
      tagline: 'LIFESTYLE FOR EVERYONE',
      enterVaultBtn: '进入私人香氛金库',
      bottomNote: 'ORIGINAL PARALLEL IMPORT LUXURY FRAGRANCE',
    },
    hero: {
      scriptCrown: 'La Collection Privée d’Europe',
      kickerLeft: 'ORIGINAL PARALLEL IMPORT LUXURY FRAGRANCE',
      kickerRight: 'LIFESTYLE FOR EVERYONE',
      headline: '突破传统零售界限，通往世界殿堂级高定香氛的私密之门。',
      narrativePrefix: '欢迎莅临 ',
      narrativeMiddle:
        ' 私人典藏展厅。我们甄选欧洲最具声望的高定品牌与沙龙香氛工坊，采用专属私密报价（',
      narrativePriceOnRequest: 'Price on Request · 尊享询价',
      narrativeSuffix: '）、多重批次防伪溯源与100%正品保障。',
      ctaExploreHouses: '探索 19 大高定香氛世家',
      ctaPrivateInvoice: '私人账单',
    },
    parallelImport: {
      scriptCrown: 'L’Art de l’Importation Parallèle',
      kicker: 'EUROPEAN DIRECT ALLOCATION · TRANSPARENT SOURCING',
      title: '官方平行进口的核心优势',
      subtitle:
        '为何全球资深香氛藏家青睐 VORVAN 欧洲直配平行进口渠道。',
      pillars: [
        {
          index: '01',
          subtitle: '省去冗长中间分销链条',
          title: '全球供应链套利优势',
          description:
            '直接对接欧洲官方授权分销枢纽，免去奢华百货专柜高昂店租溢价。',
        },
        {
          index: '02',
          subtitle: '严选黄金生产批次',
          title: '零妥协批次核验',
          description:
            '每一瓶香氛均经过批次码核验、原厂封膜检查，并储存于 VORVAN 恒温金库。',
        },
        {
          index: '03',
          subtitle: '私密询价特权',
          title: '理性且尊贵的藏家估值',
          description:
            '以极具竞争力的私人礼宾报价，奉上100%欧洲原装正品高定香氛。',
        },
      ],
    },
    ticker: {
      title: '殿堂级高定香氛世家',
      cities: '巴黎 · 格拉斯 · 伦敦 · 纽约 · 斯德哥尔摩',
    },
    explorer: {
      scriptCrown: 'La Navigation Olfactive Privée',
      kicker: 'BESPOKE OLFACTORY NAVIGATION · 品牌 → 格调 → 香氛',
      title: '探索世界殿堂级香氛世家',
      subtitle:
        '选择您心仪的高定时装屋或沙龙香氛工坊，筛选气质定位，鉴赏完整前中后调香氛金字塔。',
      activeMaison: '当前品牌',
      allCollectionLabel: '全部典藏系列',
      allCollectionSub: '展示该品牌旗下所有甄选香氛',
      priceOnRequestNote: 'Price on Request · 礼宾私密询价',
      genderSubtitles: {
        GENTLEMAN: '绅士风范 · 珍贵木质与威严辛香',
        FEMME: '高定优雅 · 格拉斯花卉与感性琥珀',
        UNISEX: '无界沙龙 · 超越性别的艺术炼金术',
      },
    },
    card: {
      olfactoryDossier: '香调档案',
      olfactoryArchitecture: '香氛金字塔结构',
      compactNotes: '收起香调',
      detailPyramid: '完整金字塔',
      openingAccord: '前调开篇',
      coreIdentity: '核心中调',
      privateValuation: '私人礼宾估值',
      priceOnRequest: 'Price on Request',
      inquireViaWhatsapp: '通过 WhatsApp 获取专属报价',
    },
    tiers: {
      apexScript: 'Les Extraits Souverains',
      apexKicker: '01. 殿堂级沙龙甄选 · HAUTE NICHE & EXTRAITS',
      apexTitle: 'APEX PRESTIGE',
      apexSubtitle:
        '世界高定香氛的四座巅峰之作。甄选珍稀天然原料，带来震撼留香与非凡气场。',
      urbanScript: 'L’Élégance Métropolitaine',
      urbanKicker: '02. 都会高定经典 · MODERN METROPOLITAN ICONS',
      urbanTitle: 'URBAN SIGNATURES',
      urbanSubtitle:
        '来自欧洲顶级时装屋的现代经典之作，从商务会议到晚宴盛典皆散发从容魅力。',
    },
    invoiceBanner: {
      scriptCrown: 'Transaction Privée & Authentifiée',
      kicker: 'PRIVATE WEB CHECKOUT SYSTEM',
      title: '已收到我们礼宾顾问发送的专属报价？',
      description:
        'VORVAN 礼宾部可为您生成专属实名 Private Invoice 账单链接，支持 Midtrans Snap (QRIS 与银行虚拟账户) 安全在线支付。',
      openInvoiceBtn: '打开专属账单',
      trackOrderBtn: '查询物流状态',
    },
    preOrder: {
      kicker: '欧洲与阿曼专属直配',
      title: 'Pre-Order 专属预订 — 珍稀沙龙香氛',
      description:
        '正在寻找常规展厅之外的罕见高定香氛？VORVAN 私人采购团队提供 Xerjoff、Amouage、Parfums de Marly 与 Roja Parfums 欧洲专柜直采服务。',
      estimatedLeadTime: '预计到货周期：',
      quickSelect: '快速选择：',
      b2bKicker: '企业定制与精品买手店合作',
      b2bTitle: '需要大宗采购配额 (B2B Wholesale / 企业 VIP 伴手礼)？',
      b2bButton: '申请 B2B 合作',
      formKicker: '专属配额申请表',
      formTitle: '提交高定沙龙香预订申请',
      clientNameLabel: '客户全名 *',
      whatsappLabel: 'WhatsApp 号码 *',
      houseLabel: '香氛品牌 *',
      variantLabel: '香氛名称 *',
      volumeLabel: '容量规格',
      notesLabel: '批次偏好 / 特殊备注（选填）',
      submitBtn: '登记预订申请',
      sendWaBtn: '通过 WA 发送',
    },
    returnPolicy: {
      kicker: 'VORVAN 正品保障与客户权益宪章',
      title: '国际运输条款与退换保障政策',
      subtitle:
        '为确保高价值沙龙及高定香氛的完好无损，所有自 VORVAN 金库发出的包裹均遵循以下保障协议。',
      clausePrefix: '条款',
      deadlineTitle: '理赔申报时效：物流显示“已签收”后 24 小时内',
      deadlineDesc:
        '请将完整无剪辑的开箱视频及金库防伪全息封条照片发送至 VORVAN WhatsApp 礼宾部。',
      understandBtn: '我已阅读并同意上述条款',
      clauses: [
        {
          number: '01',
          title: '退换适用范围（玻璃瓶身破裂或原厂喷头故障）',
          description:
            '1对1换新服务仅适用于运输途中玻璃瓶身破裂，或原厂喷头完全无法按压喷雾的机械制造瑕疵。',
        },
        {
          number: '02',
          title: '必须提供一镜到底无剪辑开箱视频',
          description:
            '所有理赔申请必须附带从快递外包装完好未拆封状态开始、展示面单与防伪封条直至首次喷雾测试的连续无剪辑视频。',
        },
        {
          number: '03',
          title: '国际航空货运外盒细微折痕说明',
          description:
            '因跨国航空货运气压或海关查验导致外层纸盒出现细微折痕属正常现象，只要内部塑封与香水瓶身完好均不属于质量瑕疵。',
        },
        {
          number: '04',
          title: '最终销售政策（个人气味偏好与留香感知）',
          description:
            '所有交易均为最终销售（FINAL SALE），恕不接受因个人气味喜好（盲买不合）或肤质差异导致的留香主观感知退换。',
        },
      ],
    },
    footer: {
      brandDescription:
        '高定奢华香氛买手精品店与私人气味礼宾部。VORVAN 承诺金库发出的每一瓶香氛均为 100% 原装正品。',
      quickTrackTitle: '快速物流追踪',
      quickTrackSubtitle: '输入您的 VORVAN 运单号或私人账单编号：',
      quickTrackBtn: '查询',
      clientServicesTitle: '客户服务',
      explore11Houses: '探索 19 大香氛世家',
      apexShowcase: 'Apex Prestige 典藏展厅',
      privateInvoiceLink: '私人账单',
      returnPolicyLink: '退换保障与理赔条款',
      conciergeB2bTitle: '礼宾部与 B2B 合作',
      emailConciergeAccess: '礼宾部邮箱登记',
      customerEmailLog: '客户邮箱档案',
      b2bWholesaleLink: 'B2B 批发 / 私人采购合作',
      contactConciergeWa: '联系 WhatsApp 礼宾部',
      rightsReserved: '版权所有.',
    },
  },
};

export function getTranslation(locale: SupportedLocale): TranslationDictionary {
  return TRANSLATIONS[locale] || TRANSLATIONS.ID;
}
