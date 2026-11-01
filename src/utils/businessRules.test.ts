import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsAppInquiryUrl,
  calculateInvoiceTotals,
  filterFragrancesByBrandAndGender,
  formatIDRCurrency,
  lookupTrackingOrder,
  resolvePrivateInvoice,
  validateB2BInput,
  validateConciergeEmail,
  validatePreOrderInput,
} from './businessRules';
import { FRAGRANCE_CATALOG, LUXURY_BRAND_HOUSES } from '../data/catalog';

test('Catalog contains 31 Apex Prestige, 50 Urban Signatures, and covers all 19 luxury houses and 81 official fragrances with real bottle images', () => {
  const apex = FRAGRANCE_CATALOG.filter((f) => f.tier === 'apex_prestige');
  const urban = FRAGRANCE_CATALOG.filter((f) => f.tier === 'urban_signatures');
  assert.equal(apex.length, 31);
  assert.equal(urban.length, 50);
  assert.equal(LUXURY_BRAND_HOUSES.length, 19);
  assert.equal(FRAGRANCE_CATALOG.length, 81);

  const expectedBrands = [
    'louis-vuitton',
    'dior',
    'tom-ford',
    'ysl',
    'creed',
    'mfk',
    'le-labo',
    'celine',
    'chanel',
    'armani',
    'jpg',
    'versace',
    'byredo',
    'diptyque',
    'maison-margiela',
    'jo-malone',
    'prada',
    'gucci',
    'valentino',
  ] as const;

  for (const id of expectedBrands) {
    assert.ok(
      LUXURY_BRAND_HOUSES.some((h) => h.id === id),
      `Expected ${id} to be in LUXURY_BRAND_HOUSES`
    );
    const allForHouse = filterFragrancesByBrandAndGender(id, 'ALL');
    assert.ok(allForHouse.length >= 2, `House ${id} should have its official fragrances`);
  }

  for (const item of FRAGRANCE_CATALOG) {
    assert.ok(
      item.image.startsWith('https://fimgs.net/mdimg/perfume-thumbs/'),
      `${item.name} must have its official bottle image URL`
    );
    assert.ok(item.pyramid.top.length > 0, `${item.name} must have top notes`);
    assert.ok(item.pyramid.heart.length > 0, `${item.name} must have heart notes`);
    assert.ok(item.pyramid.base.length > 0, `${item.name} must have base notes`);
    assert.ok(item.volumes.length > 0, `${item.name} must have volume options`);
  }
});

test('filterFragrancesByBrandAndGender accurately filters Dior by GENTLEMAN, FEMME, and UNISEX', () => {
  const diorGentleman = filterFragrancesByBrandAndGender('dior', 'GENTLEMAN');
  const diorFemme = filterFragrancesByBrandAndGender('dior', 'FEMME');
  const diorUnisex = filterFragrancesByBrandAndGender('dior', 'UNISEX');

  assert.ok(diorGentleman.some((f) => f.name.includes('Sauvage')));
  assert.ok(diorFemme.some((f) => f.name.includes("J'adore")));
  assert.ok(diorUnisex.some((f) => f.name.includes('Oud Ispahan')));
});

test('validateConciergeEmail validates passwordless single-input email', () => {
  assert.equal(validateConciergeEmail('').valid, false);
  assert.equal(validateConciergeEmail('invalid-email').valid, false);

  const valid = validateConciergeEmail('  Client.VIP@Vorvan.id ');
  assert.equal(valid.valid, true);
  assert.equal(valid.normalizedEmail, 'client.vip@vorvan.id');
});

test('buildWhatsAppInquiryUrl embeds fragrance house, name, gender, volume, and registered client email', () => {
  const url = buildWhatsAppInquiryUrl(
    {
      house: 'Maison Francis Kurkdjian',
      name: 'Baccarat Rouge 540',
      concentration: 'Eau de Parfum',
      gender: 'UNISEX',
    },
    '70ml',
    'Segel Eropa',
    'vip@vorvan.id'
  );
  assert.ok(url.startsWith('https://wa.me/'));
  const decoded = decodeURIComponent(url);
  assert.ok(decoded.includes('Maison Francis Kurkdjian'));
  assert.ok(decoded.includes('Baccarat Rouge 540'));
  assert.ok(decoded.includes('Unisex'));
  assert.ok(decoded.includes('70ml'));
  assert.ok(decoded.includes('vip@vorvan.id'));
});

test('resolvePrivateInvoice supports INV-SAMPLE, INV-VRV-8829, and arbitrary invoice IDs', () => {
  const sample = resolvePrivateInvoice('INV-SAMPLE');
  assert.equal(sample.invoiceId, 'INV-SAMPLE');
  const sampleTotals = calculateInvoiceTotals(sample);
  assert.equal(sampleTotals.grandTotalIDR, 4850000 + 2350000 + 45000);

  const seeded = resolvePrivateInvoice('INV-VRV-8829');
  const totals = calculateInvoiceTotals(seeded);
  assert.equal(totals.grandTotalIDR, 7545000);
});

test('lookupTrackingOrder and form validators function deterministically', () => {
  const byId = lookupTrackingOrder('vrv-id-994021');
  assert.ok(byId);
  assert.equal(formatIDRCurrency(4850000), 'Rp 4.850.000');
  assert.equal(
    validatePreOrderInput({
      clientName: 'Budi Santoso',
      whatsappNumber: '081234567890',
      house: 'Xerjoff',
      fragranceName: '1861 Naxos',
    }).valid,
    true
  );
  assert.equal(
    validateB2BInput({
      companyName: 'PT Atelier Aroma Nusantara',
      contactPerson: 'Nadia Larasati',
      whatsappOrEmail: 'nadia@atelieraroma.id',
      city: 'Jakarta',
    }).valid,
    true
  );
});

test('computeParallaxOffset calculates smooth clamped vertical parallax shifts', async () => {
  const { computeParallaxOffset } = await import('./businessRules.ts');
  // Centered element in viewport -> 0px shift
  assert.equal(computeParallaxOffset(900, 250, 400, 0.2), 0);
  // Element below viewport center -> negative shift
  const shiftBelow = computeParallaxOffset(900, 550, 400, 0.2);
  assert.equal(shiftBelow, -60);
  // Element above viewport center -> positive shift
  const shiftAbove = computeParallaxOffset(900, -150, 400, 0.2);
  assert.equal(shiftAbove, 80);
  // Clamped to maxShiftPx
  const clamped = computeParallaxOffset(900, 2000, 400, 0.25, 88);
  assert.equal(clamped, -88);
});

test('getTranslation resolves distinct international language dictionaries for ID, EN, FR, AR, and ZH', async () => {
  const { getTranslation, SUPPORTED_LOCALES } = await import(
    '../i18n/translations.ts'
  );
  assert.equal(SUPPORTED_LOCALES.length, 5);
  const idDict = getTranslation('ID');
  const enDict = getTranslation('EN');
  const frDict = getTranslation('FR');
  const arDict = getTranslation('AR');
  const zhDict = getTranslation('ZH');

  assert.notEqual(idDict.hero.headline, enDict.hero.headline);
  assert.notEqual(enDict.hero.headline, frDict.hero.headline);
  assert.notEqual(frDict.hero.headline, arDict.hero.headline);
  assert.notEqual(arDict.hero.headline, zhDict.hero.headline);
  assert.equal(enDict.footer.clientServicesTitle, 'Client Services');
  assert.equal(frDict.footer.clientServicesTitle, 'Services Clients');
});

test('Private Selection Tray helpers add, toggle, update quantities, and format multi-fragrance WhatsApp bundle URLs', async () => {
  const {
    togglePrivateTrayItem,
    isFragranceInPrivateTray,
    updatePrivateTrayQuantity,
    buildWhatsAppTrayInquiryUrl,
  } = await import('./businessRules.ts');

  const item1 = FRAGRANCE_CATALOG[0];
  const item2 = FRAGRANCE_CATALOG[1];

  // Add item 1 (70 ml)
  const step1 = togglePrivateTrayItem([], item1, '70 ml');
  assert.equal(step1.added, true);
  assert.equal(step1.nextItems.length, 1);
  assert.equal(
    isFragranceInPrivateTray(step1.nextItems, item1.id, '70 ml'),
    true
  );

  // Add item 2 (100 ml)
  const step2 = togglePrivateTrayItem(step1.nextItems, item2, '100 ml');
  assert.equal(step2.added, true);
  assert.equal(step2.nextItems.length, 2);

  // Increment quantity of item 1 to 2
  const step3 = updatePrivateTrayQuantity(
    step2.nextItems,
    step2.nextItems[0].key,
    1
  );
  assert.equal(step3[0].quantity, 2);

  // Build WhatsApp Bundle URL
  const waUrl = buildWhatsAppTrayInquiryUrl(
    step3,
    'Mohon sertakan gift box hitam VORVAN',
    'collector@vorvan.id'
  );
  const decoded = decodeURIComponent(waUrl);
  assert.ok(decoded.includes(item1.name));
  assert.ok(decoded.includes(item2.name));
  assert.ok(decoded.includes('× 2 flacon'));
  assert.ok(decoded.includes('collector@vorvan.id'));
  assert.ok(decoded.includes('Mohon sertakan gift box hitam VORVAN'));

  // Toggle item 1 again removes it
  const step4 = togglePrivateTrayItem(step3, item1, '70 ml');
  assert.equal(step4.added, false);
  assert.equal(step4.nextItems.length, 1);
});

test('Dual-Concierge Telegram VIP URL and Ultra-Short Smart Shareable Order URL (?v=...) encoding/decoding work accurately', async () => {
  const {
    buildTelegramInquiryUrl,
    buildSmartShareUrl,
    encodeSmartOrderParam,
    decodeSmartOrderParam,
    resolvePrivateInvoice,
    lookupTrackingOrder,
  } = await import('./businessRules.ts');

  const tgUrl = buildTelegramInquiryUrl(
    {
      house: 'Louis Vuitton',
      name: 'Ombre Nomade',
      concentration: 'Eau de Parfum',
      gender: 'UNISEX',
    },
    '100ml',
    'Segel Resmi',
    'vip@vorvan.id'
  );
  assert.ok(tgUrl.startsWith('https://t.me/vorvanofficial?text='));
  assert.ok(decodeURIComponent(tgUrl).includes('Ombre Nomade'));

  const customOrder = {
    invoiceId: 'INV-VRV-9750',
    trackingId: 'JNE-99887766',
    createdAt: '29 Okt 2026 · 19:00 WIB',
    buyerName: 'Bpk. Andrean Wijaya',
    buyerCity: 'Surabaya, Jawa Timur',
    house: 'Creed',
    fragranceName: 'Aventus',
    concentration: 'Eau de Parfum',
    volume: '100ml',
    batchCode: 'CRD-26A1',
    dealPriceIDR: 4350000,
    shippingMethod: 'JNE' as const,
    awbNumber: 'JNE-99887766',
    shippingStage: 3 as const,
    status: 'PAID' as const,
  };

  const encoded = encodeSmartOrderParam(customOrder);
  // Ensure the encoded token is ultra-short (< 100 chars, ~85% shorter than old >600 char JSON+URI encoding)
  assert.ok(
    encoded.length < 100,
    `Expected ultra-short token (<100 chars), got ${encoded.length}: ${encoded}`
  );
  assert.ok(!encoded.includes('%'), 'Base64url token should not contain URI percent-encoding');

  const shareInvoiceUrl = buildSmartShareUrl(
    customOrder,
    'invoice',
    'https://vorvan.id'
  );
  assert.ok(shareInvoiceUrl.startsWith('https://vorvan.id/pay/INV-VRV-9750?v='));

  const shareTrackUrl = buildSmartShareUrl(
    customOrder,
    'track',
    'https://vorvan.id'
  );
  assert.ok(shareTrackUrl.startsWith('https://vorvan.id/track/JNE-99887766?v='));

  const decoded = decodeSmartOrderParam(encoded);
  assert.ok(decoded);
  assert.equal(decoded.invoiceId, 'INV-VRV-9750');
  assert.equal(decoded.buyerName, 'Bpk. Andrean Wijaya');
  assert.equal(decoded.buyerCity, 'Surabaya, Jawa Timur');
  assert.equal(decoded.house, 'Creed');
  assert.equal(decoded.fragranceName, 'Aventus');
  assert.equal(decoded.dealPriceIDR, 4350000);
  assert.equal(decoded.status, 'PAID');
  assert.equal(decoded.awbNumber, 'JNE-99887766');

  const invoice = resolvePrivateInvoice('INV-VRV-9750', [], decoded);
  assert.equal(
    invoice.conciergeAdvisor,
    'VORVAN Official Concierge'
  );
  assert.equal(invoice.items[0].unitPriceIDR, 4350000);

  const track = lookupTrackingOrder('JNE-99887766', [], decoded);
  assert.ok(track);
  assert.equal(track.milestones.length, 4);
  assert.ok(
    track.milestones[0].title.includes(
      'Lolos QC Vault VORVAN (Inspeksi Fisik Botol & Fungsi Sprayer)'
    )
  );
});

test('Automated courier tracking helpers compute time-based stages, Binderbyte URLs, and official satellite links for JNE, J&T, SiCepat, Paxel, Anteraja, and COD', async () => {
  const {
    resolveCourierMetadata,
    computeAutoShippingStage,
    buildBinderbyteTrackUrl,
    buildTrackingFromCustomOrder,
  } = await import('./businessRules.ts');

  assert.equal(resolveCourierMetadata('JNE').binderbyteCode, 'jne');
  assert.equal(resolveCourierMetadata('J&T Express').binderbyteCode, 'jnt');
  assert.equal(resolveCourierMetadata('SiCepat').binderbyteCode, 'sicepat');
  assert.equal(resolveCourierMetadata('Paxel').binderbyteCode, 'paxel');
  assert.equal(resolveCourierMetadata('Anteraja').binderbyteCode, 'anteraja');
  assert.equal(
    resolveCourierMetadata('COD Kurir Internal VORVAN').isInternalCod,
    true
  );

  const apiEndpoint = buildBinderbyteTrackUrl(
    'TEST_KEY_123',
    'sicepat',
    'SCP-0049182731'
  );
  assert.equal(
    apiEndpoint,
    'https://api.binderbyte.com/v1/track?api_key=TEST_KEY_123&courier=sicepat&awb=SCP-0049182731'
  );

  const issuedAt = 1700000000000;
  const baseOrder = {
    invoiceId: 'INV-VRV-4020',
    trackingId: 'PX-8812901',
    createdAt: '29 Okt 2026 · 10:00 WIB',
    createdAtTimestampMs: issuedAt,
    buyerName: 'Ibu Clarissa',
    buyerCity: 'Jakarta Selatan',
    house: 'Maison Francis Kurkdjian',
    fragranceName: 'Baccarat Rouge 540 Extrait',
    concentration: 'Extrait de Parfum',
    volume: '70ml',
    batchCode: 'MFK-26A',
    dealPriceIDR: 4950000,
    shippingMethod: 'Paxel' as const,
    awbNumber: 'PX-8812901',
    status: 'PAID' as const,
  };

  // Immediately after issuance -> Stage 2 (QC Vault + Handed to Courier Manifest)
  assert.equal(computeAutoShippingStage(baseOrder, issuedAt + 2 * 60000), 2);
  // After 30 minutes -> Automatically Stage 3 (Inter-city Transit Hub)
  assert.equal(computeAutoShippingStage(baseOrder, issuedAt + 30 * 60000), 3);
  // After 4 hours -> Automatically Stage 4 (With Delivery Courier to Recipient)
  assert.equal(computeAutoShippingStage(baseOrder, issuedAt + 240 * 60000), 4);

  const trackAt4Hours = buildTrackingFromCustomOrder(
    baseOrder,
    issuedAt + 240 * 60000
  );
  assert.equal(trackAt4Hours.courierService, 'Paxel');
  assert.equal(
    trackAt4Hours.courierOfficialUrl,
    'https://paxel.co/id/lacak-kiriman'
  );
  assert.equal(trackAt4Hours.milestones[3].completed, true);
  assert.equal(trackAt4Hours.milestones[3].current, true);
});

test('loadVorvanSettings includes official Bank BRI credentials and auto-updates legacy localStorage entries', async () => {
  const { loadVorvanSettings, VORVAN_SETTINGS_STORAGE_KEY } = await import(
    './businessRules.ts'
  );
  const { DEFAULT_VORVAN_SETTINGS } = await import('../data/catalog.ts');

  assert.equal(DEFAULT_VORVAN_SETTINGS.briAccount, '001101186645501');
  assert.equal(DEFAULT_VORVAN_SETTINGS.briHolder, 'ALFANDI FIRMAN SYAH');
  assert.equal(DEFAULT_VORVAN_SETTINGS.briSwift, 'BRINIDJA');

  // Simulate legacy localStorage without BRI fields
  const mockStore: Record<string, string> = {
    [VORVAN_SETTINGS_STORAGE_KEY]: JSON.stringify({
      whatsappNumber: '628133866590',
      mandiriAccount: '1780011825615',
      bniAccount: '1812664893',
    }),
  };
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: {
      getItem: (k: string) => mockStore[k] || null,
      setItem: (k: string, v: string) => {
        mockStore[k] = v;
      },
    },
  };

  const loaded = loadVorvanSettings();
  assert.equal(loaded.briAccount, '001101186645501');
  assert.equal(loaded.briHolder, 'ALFANDI FIRMAN SYAH');
  assert.equal(loaded.briSwift, 'BRINIDJA');

  // Verify localStorage was automatically updated with BRI credentials
  const persisted = JSON.parse(mockStore[VORVAN_SETTINGS_STORAGE_KEY]);
  assert.equal(persisted.briAccount, '001101186645501');
  assert.equal(persisted.briHolder, 'ALFANDI FIRMAN SYAH');
  assert.equal(persisted.briSwift, 'BRINIDJA');

  delete (globalThis as unknown as { window?: unknown }).window;
});

test('VORVAN 81 SKU Official Pricing, Auto-Detect Shipping Zones, Cheat Sheet Filter, and Retail/Shipping Invoice Breakdown work deterministically', async () => {
  const {
    resolveVorvanSkuPricing,
    autoDetectShippingZoneByCity,
    filterVorvanCheatSheet,
    encodeSmartOrderParam,
    decodeSmartOrderParam,
    resolvePrivateInvoice,
    calculateInvoiceTotals,
  } = await import('./businessRules.ts');
  const { VORVAN_81_CATALOG } = await import('../data/catalog.ts');

  assert.equal(VORVAN_81_CATALOG.length, 81);
  assert.equal(VORVAN_81_CATALOG[0].name, 'Afternoon Swim');
  assert.equal(VORVAN_81_CATALOG[0].retail, 6500000);
  assert.equal(VORVAN_81_CATALOG[0].disc, 30);
  assert.equal(VORVAN_81_CATALOG[0].price, 4550000);

  const byIndex = resolveVorvanSkuPricing(0);
  assert.ok(byIndex);
  assert.equal(byIndex.price, 4550000);

  const byName = resolveVorvanSkuPricing('Baccarat Rouge 540 Extrait');
  assert.ok(byName);
  assert.equal(byName.retail, 7650000);
  assert.equal(byName.disc, 30);
  assert.equal(byName.price, 5355000);

  // Auto-detect shipping zones
  assert.equal(autoDetectShippingZoneByCity('Brebes, Jawa Tengah')?.zoneKey, 'FREE_VIP');
  assert.equal(autoDetectShippingZoneByCity('Brebes, Jawa Tengah')?.cost, 0);
  assert.equal(
    autoDetectShippingZoneByCity('Kebayoran Baru, Jakarta Selatan')?.zoneKey,
    'ZONA_1'
  );
  assert.equal(
    autoDetectShippingZoneByCity('Kebayoran Baru, Jakarta Selatan')?.cost,
    25000
  );
  assert.equal(autoDetectShippingZoneByCity('Denpasar, Bali')?.zoneKey, 'ZONA_2');
  assert.equal(autoDetectShippingZoneByCity('Denpasar, Bali')?.cost, 45000);
  assert.equal(autoDetectShippingZoneByCity('Makassar, Sulawesi')?.zoneKey, 'ZONA_3');
  assert.equal(autoDetectShippingZoneByCity('Makassar, Sulawesi')?.cost, 65000);
  assert.equal(autoDetectShippingZoneByCity('Jayapura, Papua')?.zoneKey, 'ZONA_4');
  assert.equal(autoDetectShippingZoneByCity('Jayapura, Papua')?.cost, 95000);

  // Cheat sheet filtering
  const tier1Only = filterVorvanCheatSheet('', '1');
  assert.ok(tier1Only.length > 0);
  assert.ok(tier1Only.every((item) => item.tier === 1));

  const searchAventus = filterVorvanCheatSheet('Aventus', 'ALL');
  assert.ok(searchAventus.some((item) => item.name.includes('Aventus')));

  // Smart URL roundtrip preserves shipping cost and auto-resolves retail price & discount %
  const orderWithShip = {
    invoiceId: 'INV-VRV-7711',
    trackingId: 'JNE-771122',
    createdAt: '31 Okt 2026 · 10:00 WIB',
    buyerName: 'Bpk. Raditya',
    buyerCity: 'Kebayoran Baru, Jakarta Selatan',
    house: 'Louis Vuitton',
    fragranceName: 'Afternoon Swim',
    concentration: 'Eau de Parfum',
    volume: '100ml',
    batchCode: 'LV-26A',
    dealPriceIDR: 4550000,
    retailPriceIDR: 6500000,
    discountPct: 30,
    shippingCostIDR: 25000,
    shippingLabel: 'Jawa & Jabodetabek (1 Kg + Asuransi Kargo)',
    shippingMethod: 'JNE' as const,
    awbNumber: 'JNE-771122',
    status: 'PENDING_PAYMENT' as const,
  };

  const token = encodeSmartOrderParam(orderWithShip);
  const decoded = decodeSmartOrderParam(token);
  assert.ok(decoded);
  assert.equal(decoded.dealPriceIDR, 4550000);
  assert.equal(decoded.retailPriceIDR, 6500000);
  assert.equal(decoded.discountPct, 30);
  assert.equal(decoded.shippingCostIDR, 25000);

  const invoice = resolvePrivateInvoice('INV-VRV-7711', [], decoded);
  assert.equal(invoice.retailPriceTotalIDR, 6500000);
  assert.equal(invoice.discountPct, 30);
  assert.equal(invoice.shippingInsuranceIDR, 25000);
  const totals = calculateInvoiceTotals(invoice);
  assert.equal(totals.grandTotalIDR, 4575000);
});

test('VORVAN Legal Shield Clickwrap Agreement timestamp and WhatsApp verification message preserve official WhatsApp number and exact legal paragraph', async () => {
  const {
    formatLegalTimestampWIB,
    buildVerifiedLegalWhatsAppMessage,
    buildVerifiedLegalWhatsAppUrl,
  } = await import('./businessRules.ts');
  const { VORVAN_WHATSAPP_NUMBER } = await import('../data/catalog.ts');

  const fixedDate = new Date('2026-10-31T08:30:15Z');
  const ts = formatLegalTimestampWIB(fixedDate);
  assert.ok(ts.endsWith(' WIB'));

  const msg = buildVerifiedLegalWhatsAppMessage({
    docNo: 'INV-VRV-8829',
    clientName: 'Bpk. Raditya Pratama',
    perfumeDesc: 'Maison Francis Kurkdjian — Baccarat Rouge 540 Extrait (70ml)',
    grandTotal: 'Rp 5.355.000',
    agreedTimestamp: '31 Okt 2026, 15.30.15 WIB',
  });

  assert.ok(
    msg.startsWith(
      'Halo VORVAN Official Concierge, saya ingin mengonfirmasi pembayaran untuk Private Invoice berikut:'
    )
  );
  assert.ok(!msg.includes('Andre Satria P'));
  assert.ok(
    msg.includes(
      '✅ [Persetujuan Layanan Elektronik Tercatat pada 31 Okt 2026, 15.30.15 WIB: Saya telah membaca dan menyetujui Ketentuan Layanan, Garansi Unboxing & Sprayer, Kebijakan Final Sale, serta Karakteristik Subjektif Aroma VORVAN].'
    )
  );
  assert.ok(!msg.includes('BCA'));
  assert.ok(!msg.includes('KUHPerdata'));

  const url = buildVerifiedLegalWhatsAppUrl({
    docNo: 'INV-VRV-8829',
    clientName: 'Bpk. Raditya Pratama',
    perfumeDesc: 'Maison Francis Kurkdjian — Baccarat Rouge 540 Extrait (70ml)',
    grandTotal: 'Rp 5.355.000',
    agreedTimestamp: '31 Okt 2026, 15.30.15 WIB',
  });

  assert.ok(url.startsWith(`https://wa.me/${VORVAN_WHATSAPP_NUMBER}?text=`));
});

test('Tab 4 Concierge Guide (Panduan 81 Parfum — Iklim Indonesia) filters by moment, gender, and Indonesian scent keywords and formats WA recommendation', async () => {
  const { filterConciergeGuide81, buildConciergeRecommendationWaText } =
    await import('./businessRules.ts');
  const { CONCIERGE_81_GUIDE } = await import('../data/conciergeGuide81.ts');

  assert.equal(CONCIERGE_81_GUIDE.length, 81);

  const allItems = filterConciergeGuide81('', 'ALL', 'All');
  assert.equal(allItems.length, 81);

  // Filter by moment
  const hotDayItems = filterConciergeGuide81('', 'HOT_DAY', 'All');
  assert.ok(hotDayItems.length > 0);
  assert.ok(hotDayItems.some((item) => item.name === 'Afternoon Swim'));
  assert.ok(hotDayItems.some((item) => item.name === 'Imagination'));

  const sultanItems = filterConciergeGuide81('', 'SULTAN_GALA', 'All');
  assert.ok(sultanItems.some((item) => item.name === 'Ombre Nomade'));
  assert.ok(
    sultanItems.some((item) => item.name === 'Baccarat Rouge 540 Extrait')
  );

  // Filter by gender + keyword ("vanilla")
  const menVanilla = filterConciergeGuide81('vanilla', 'ALL', 'Men');
  assert.ok(menVanilla.length > 0);
  assert.ok(menVanilla.every((item) => item.gender === 'Men'));
  assert.ok(
    menVanilla.some((item) => item.name.includes('Uomo Born in Roma Intense'))
  );

  // Format WA recommendation
  const ubirIntense = CONCIERGE_81_GUIDE.find((item) => item.no === 78)!;
  assert.equal(
    ubirIntense.simpleNotes,
    'Vanilla Bourbon hangat, Lavender bersih, & Smoky Vetiver maskulin'
  );
  assert.equal(
    ubirIntense.climateAdvice,
    '🌙 SPESIALIS MALAM, NGEDATE & RUANGAN AC (Hindari panas terik siang bolong)'
  );

  const waText = buildConciergeRecommendationWaText(ubirIntense);
  assert.ok(waText.includes('✨ *Rekomendasi Concierge VORVAN:*'));
  assert.ok(
    waText.includes(
      '• *Koleksi:* Valentino — Uomo Born in Roma Intense EDP (100ml)'
    )
  );
  assert.ok(
    waText.includes(
      '• *Karakter Aroma:* Vanilla Bourbon hangat, Lavender bersih, & Smoky Vetiver maskulin'
    )
  );
  assert.ok(waText.includes('• *Valuasi Resmi Butik:* ~Rp 2.650.000~'));
  assert.ok(
    waText.includes(
      '• *Harga Kurasi VORVAN (Hemat 23%):* *Rp 2.040.000* (Full-Size Sealed + Digital Certificate)'
    )
  );
});

test('FormSubmit AJAX Gmail delivery and Cross-Device/Incognito Cloud Sync helpers format payload and merge leads & orders without duplicates', async () => {
  const {
    FORMSUBMIT_GMAIL_ENDPOINT,
    sendVisitorLeadToGmail,
    mergeVisitorLeads,
    mergeCustomAdminOrders,
  } = await import('./cloudSync.ts');

  assert.equal(
    FORMSUBMIT_GMAIL_ENDPOINT,
    'https://formsubmit.co/ajax/vorvanlifestyle@gmail.com'
  );

  let capturedUrl = '';
  let capturedBody: Record<string, string> = {};
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    capturedUrl = String(input);
    capturedBody = JSON.parse(String(init?.body || '{}'));
    return { ok: true } as Response;
  }) as typeof fetch;

  try {
    const ok = await sendVisitorLeadToGmail({
      leadId: 'LEAD-VRV-03',
      visitorEmail: 'vip.buyer@gmail.com',
      waktuDaftar: '1/11/2026, 12.00.00',
      sumberWeb: 'https://vorvan-official.vercel.app/',
    });
    assert.equal(ok, true);
    assert.equal(
      capturedUrl,
      'https://formsubmit.co/ajax/vorvanlifestyle@gmail.com'
    );
    assert.equal(
      capturedBody._subject,
      '🌟 VIP Lead Baru VORVAN: vip.buyer@gmail.com'
    );
    assert.equal(capturedBody.ID_Lead, 'LEAD-VRV-03');
    assert.equal(capturedBody.Email_Klien, 'vip.buyer@gmail.com');
    assert.equal(capturedBody.Waktu_Daftar, '1/11/2026, 12.00.00');
    assert.equal(capturedBody.Sumber_Web, 'https://vorvan-official.vercel.app/');
  } finally {
    globalThis.fetch = originalFetch;
  }

  const mergedLeads = mergeVisitorLeads(
    [
      {
        id: 'LEAD-VRV-01',
        email: 'raditya@capital.co.id',
        registeredAt: '26 Okt 2026',
        syncedToVorvanMail: true,
      },
    ],
    [
      {
        id: 'LEAD-VRV-02',
        email: 'incognito.user@gmail.com',
        registeredAt: '1 Nov 2026',
        syncedToVorvanMail: true,
      },
      {
        id: 'LEAD-VRV-01-DUP',
        email: 'RADITYA@capital.co.id',
        registeredAt: '26 Okt 2026',
        syncedToVorvanMail: true,
      },
    ]
  );
  assert.equal(mergedLeads.length, 2);
  assert.equal(mergedLeads[0].email, 'incognito.user@gmail.com');

  const mergedOrders = mergeCustomAdminOrders(
    [],
    [
      {
        invoiceId: 'INV-VRV-9991',
        trackingId: 'JNE9991',
        createdAt: '01 Nov 2026 · 12:00 WIB',
        createdAtTimestampMs: 1700000000000,
        buyerName: 'Bpk. Dimas',
        buyerCity: 'Surabaya',
        house: 'LV (Louis Vuitton)',
        fragranceName: 'Imagination',
        concentration: 'Eau de Parfum',
        volume: '100ml',
        batchCode: 'LV-99',
        dealPriceIDR: 4550000,
        shippingMethod: 'JNE',
        awbNumber: 'JNE9991',
        status: 'PENDING_PAYMENT',
      },
    ]
  );
  assert.equal(mergedOrders.length, 1);
  assert.equal(mergedOrders[0].invoiceId, 'INV-VRV-9991');
});

test('Tab 1 Admin: Buyer Email, Buyer Phone, 1-Click WhatsApp URL, and Email Webhook work seamlessly', async () => {
  const {
    encodeSmartOrderParam,
    decodeSmartOrderParam,
    normalizeIndonesianPhoneNumber,
    buildBuyerInvoiceWhatsAppUrl,
  } = await import('./businessRules.ts');
  const { VORVAN_EMAIL_WEBHOOK, sendBuyerInvoiceEmailWebhook } = await import(
    './cloudSync.ts'
  );

  // 1. Phone Normalizer
  assert.equal(normalizeIndonesianPhoneNumber('081234567890'), '6281234567890');
  assert.equal(normalizeIndonesianPhoneNumber('6281234567890'), '6281234567890');
  assert.equal(normalizeIndonesianPhoneNumber('+62 812-3456-7890'), '6281234567890');
  assert.equal(normalizeIndonesianPhoneNumber(''), '');

  // 2. CustomAdminOrder with buyerEmail and buyerPhone
  const orderWithContact = {
    invoiceId: 'INV-VRV-9011',
    trackingId: 'VRV-RESI-9011',
    createdAt: '01 Nov 2026 · 14:00 WIB',
    buyerName: 'Bpk. Hendra Wijaya',
    buyerCity: 'Kebayoran Baru, Jakarta Selatan',
    buyerEmail: 'hendra.wijaya@gmail.com',
    buyerPhone: '081298765432',
    house: 'Louis Vuitton',
    fragranceName: 'Afternoon Swim',
    concentration: 'Eau de Parfum',
    volume: '100ml',
    batchCode: 'VRV-9011',
    dealPriceIDR: 4550000,
    retailPriceIDR: 6500000,
    discountPct: 30,
    shippingCostIDR: 25000,
    shippingLabel: 'Jawa & Jabodetabek',
    shippingMethod: 'JNE' as const,
    awbNumber: 'JNE881920194',
    status: 'PENDING_PAYMENT' as const,
  };

  const token = encodeSmartOrderParam(orderWithContact);
  const decoded = decodeSmartOrderParam(token);
  assert.ok(decoded);
  assert.equal(decoded.buyerName, 'Bpk. Hendra Wijaya');
  assert.equal(decoded.buyerEmail, 'hendra.wijaya@gmail.com');
  assert.equal(decoded.buyerPhone, '081298765432');
  assert.equal(decoded.invoiceId, 'INV-VRV-9011');
  assert.equal(decoded.dealPriceIDR, 4550000);

  // 3. 1-Click WhatsApp URL Generation targeting buyer phone directly
  const waUrl = buildBuyerInvoiceWhatsAppUrl(orderWithContact, 'https://vorvan-official.vercel.app');
  assert.ok(waUrl.startsWith('https://wa.me/6281298765432?text='));
  const decodedMsg = decodeURIComponent(waUrl);
  assert.ok(decodedMsg.includes('Yth. Bpk. Hendra Wijaya'));
  assert.ok(decodedMsg.includes('#INV-VRV-9011'));
  assert.ok(decodedMsg.includes('Afternoon Swim'));
  assert.ok(decodedMsg.includes('Rp 4.575.000'));
  assert.ok(decodedMsg.includes('https://vorvan-official.vercel.app/pay/INV-VRV-9011?v='));
  assert.ok(decodedMsg.includes('https://vorvan-official.vercel.app/track/JNE881920194?v='));

  // 4. Official Google Apps Script Webhook
  assert.equal(
    VORVAN_EMAIL_WEBHOOK,
    'https://script.google.com/macros/s/AKfycbwZnH1EY8q-hV0o-E-Gz0DsbGQAOKs7v4VqwOiSYvEIjKykV_80TCzroPM95yVMEpwlCw/exec'
  );

  // Test webhook invoker with mock fetch
  let interceptedUrl = '';
  let interceptedMode = '';
  let interceptedBody: Record<string, string> = {};
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    interceptedUrl = String(input);
    interceptedMode = init?.mode || '';
    if (typeof init?.body === 'string') {
      interceptedBody = JSON.parse(init.body);
    }
    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
  }) as typeof fetch;

  try {
    const success = await sendBuyerInvoiceEmailWebhook({
      buyerEmail: 'hendra.wijaya@gmail.com',
      buyerName: 'Bpk. Hendra Wijaya',
      invNo: 'INV-VRV-9011',
      itemName: 'Afternoon Swim (100ml)',
      totalPrice: 'Rp 4.575.000',
      invoiceUrl: 'https://vorvan-official.vercel.app/pay/INV-VRV-9011?v=' + token,
    });
    assert.equal(success, true);
    assert.equal(interceptedUrl, VORVAN_EMAIL_WEBHOOK);
    assert.equal(interceptedMode, 'no-cors');
    assert.equal(interceptedBody.buyerEmail, 'hendra.wijaya@gmail.com');
    assert.equal(interceptedBody.buyerName, 'Bpk. Hendra Wijaya');
    assert.equal(interceptedBody.invNo, 'INV-VRV-9011');
    assert.equal(interceptedBody.itemName, 'Afternoon Swim (100ml)');
    assert.equal(interceptedBody.totalPrice, 'Rp 4.575.000');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('3-Stage Gate Payment Proof: Proof storage, WhatsApp confirmation format, and webhook trigger', async () => {
  const {
    savePaymentProofRecord,
    loadPaymentProofsMap,
    buildVerifiedLegalWhatsAppMessage,
    buildVerifiedLegalWhatsAppUrl,
    resolvePrivateInvoice,
  } = await import('./businessRules.ts');
  const { sendPaymentProofWebhook, VORVAN_EMAIL_WEBHOOK } = await import('./cloudSync.ts');

  // 1. Proof Storage in Local Map
  savePaymentProofRecord('INV-VRV-TEST88', 'data:image/jpeg;base64,/9j/testsample...', '01 Nov 2026 · 14:35 WIB');
  const proofsMap = loadPaymentProofsMap();
  assert.equal(proofsMap['INV-VRV-TEST88'].proofUrl, 'data:image/jpeg;base64,/9j/testsample...');
  assert.equal(proofsMap['INV-VRV-TEST88'].uploadedAt, '01 Nov 2026 · 14:35 WIB');

  // 2. Resolve Private Invoice attaches proof if in storage
  const inv = resolvePrivateInvoice('INV-VRV-TEST88');
  assert.equal(inv.paymentProofUrl, 'data:image/jpeg;base64,/9j/testsample...');
  assert.equal(inv.paymentProofUploadedAt, '01 Nov 2026 · 14:35 WIB');

  // 3. WhatsApp Message incorporates payment proof uploaded timestamp
  const waMsg = buildVerifiedLegalWhatsAppMessage({
    docNo: 'INV-VRV-TEST88',
    clientName: 'Bpk. Hendra Wijaya',
    perfumeDesc: 'Louis Vuitton — Afternoon Swim (100ml)',
    grandTotal: 'Rp 4.550.000',
    paymentMethodLabel: 'Transfer Bank Mandiri',
    agreedTimestamp: '01 Nov 2026 · 14:30 WIB',
    paymentProofUploadedAt: '01 Nov 2026 · 14:35 WIB',
  });

  assert.ok(waMsg.includes('TERUPLOAD & TEREKAM DI VAULT ADMIN (01 Nov 2026 · 14:35 WIB)'));
  assert.ok(waMsg.includes('Foto bukti transfer telah terunggah'));

  const waUrl = buildVerifiedLegalWhatsAppUrl(
    {
      docNo: 'INV-VRV-TEST88',
      clientName: 'Bpk. Hendra Wijaya',
      perfumeDesc: 'Louis Vuitton — Afternoon Swim (100ml)',
      grandTotal: 'Rp 4.550.000',
      paymentMethodLabel: 'Transfer Bank Mandiri',
      agreedTimestamp: '01 Nov 2026 · 14:30 WIB',
      paymentProofUploadedAt: '01 Nov 2026 · 14:35 WIB',
    },
    '628133866590'
  );
  assert.ok(waUrl.startsWith('https://wa.me/628133866590?text='));
  assert.ok(decodeURIComponent(waUrl).includes('TERUPLOAD & TEREKAM DI VAULT ADMIN'));

  // 4. Test Payment Proof Webhook with mock fetch
  let interceptedUrl = '';
  let interceptedBody: Record<string, unknown> = {};
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    interceptedUrl = String(input);
    if (typeof init?.body === 'string') {
      interceptedBody = JSON.parse(init.body);
    }
    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
  }) as typeof fetch;

  try {
    const success = await sendPaymentProofWebhook({
      invNo: 'INV-VRV-TEST88',
      buyerName: 'Bpk. Hendra Wijaya',
      itemName: 'Afternoon Swim (100ml)',
      totalPrice: 'Rp 4.550.000',
      uploadedAt: '01 Nov 2026 · 14:35 WIB',
      autoMarkPaid: true,
      hasProofImage: true,
    });
    assert.equal(success, true);
    assert.equal(interceptedUrl, VORVAN_EMAIL_WEBHOOK);
    assert.equal(interceptedBody.action, 'PAYMENT_PROOF_UPLOADED');
    assert.equal(interceptedBody.invNo, 'INV-VRV-TEST88');
    assert.equal(interceptedBody.status, 'PAID');
    assert.equal(interceptedBody.hasProofImage, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('getVorvanBaseDomain dynamically detects preview vs custom domain (.com / .id)', async () => {
  const { getVorvanBaseDomain, buildSmartShareUrl, buildBuyerInvoiceWhatsAppUrl } =
    await import('./businessRules.ts');

  // 1. SSR / fallback behavior
  assert.equal(getVorvanBaseDomain(), 'https://vorvan-official.vercel.app');

  // 2. Mocking AI Studio environment
  const originalWindow = globalThis.window;
  try {
    // Test AI Studio hostname
    globalThis.window = {
      location: {
        hostname: 'ais-dev-xcmczlfphkvyyzk747zp6h-17818997828.aistudio.google.com',
        origin: 'https://ais-dev-xcmczlfphkvyyzk747zp6h-17818997828.aistudio.google.com',
      },
    } as unknown as Window & typeof globalThis;
    assert.equal(getVorvanBaseDomain(), 'https://vorvan-official.vercel.app');

    // Test localhost
    globalThis.window = {
      location: {
        hostname: 'localhost',
        origin: 'http://localhost:3000',
      },
    } as unknown as Window & typeof globalThis;
    assert.equal(getVorvanBaseDomain(), 'https://vorvan-official.vercel.app');

    // Test googleusercontent
    globalThis.window = {
      location: {
        hostname: 'web-123456.googleusercontent.com',
        origin: 'https://web-123456.googleusercontent.com',
      },
    } as unknown as Window & typeof globalThis;
    assert.equal(getVorvanBaseDomain(), 'https://vorvan-official.vercel.app');

    // Test custom domain (.com / .id)
    globalThis.window = {
      location: {
        hostname: 'vorvan.id',
        origin: 'https://vorvan.id',
      },
    } as unknown as Window & typeof globalThis;
    assert.equal(getVorvanBaseDomain(), 'https://vorvan.id');

    // Test custom domain .com
    globalThis.window = {
      location: {
        hostname: 'www.vorvan-perfume.com',
        origin: 'https://www.vorvan-perfume.com',
      },
    } as unknown as Window & typeof globalThis;
    assert.equal(getVorvanBaseDomain(), 'https://www.vorvan-perfume.com');

    const sampleOrder = {
      invoiceId: 'INV-VRV-DOMAIN',
      trackingId: 'VRV-RESI-DOMAIN',
      createdAt: '01 Nov 2026',
      buyerName: 'Bpk. Andre',
      buyerCity: 'Jakarta',
      house: 'Louis Vuitton',
      fragranceName: 'Afternoon Swim',
      concentration: 'EDP',
      volume: '100ml',
      batchCode: 'LV-01',
      dealPriceIDR: 4550000,
      shippingMethod: 'JNE' as const,
      awbNumber: 'JNE991',
      status: 'PENDING_PAYMENT' as const,
    };

    const invUrl = buildSmartShareUrl(sampleOrder, 'invoice');
    assert.ok(invUrl.startsWith('https://www.vorvan-perfume.com/pay/INV-VRV-DOMAIN?v='));

    const waUrl = buildBuyerInvoiceWhatsAppUrl(sampleOrder);
    assert.ok(decodeURIComponent(waUrl).includes('https://www.vorvan-perfume.com/pay/INV-VRV-DOMAIN?v='));
  } finally {
    globalThis.window = originalWindow;
  }
});

test('applyPaymentProofToOrders strictly updates ONLY the exact matching invoiceId and never leaks paymentProof or PAID status to other customers', async () => {
  const {
    applyPaymentProofToOrders,
    removePaymentProofRecord,
    resolvePrivateInvoice,
  } = await import('./businessRules.ts');

  const firstCustomerOrder = {
    invoiceId: 'INV-VRV-8899',
    trackingId: 'JNE-8899',
    createdAt: '01 Nov 2026 · 14:00 WIB',
    buyerName: 'Bpk. Hendra',
    buyerCity: 'Surabaya',
    house: 'Creed',
    fragranceName: 'Aventus',
    concentration: 'Eau de Parfum',
    volume: '100ml',
    batchCode: 'CRD-88',
    dealPriceIDR: 4200000,
    shippingMethod: 'JNE' as const,
    awbNumber: 'JNE-8899',
    shippingStage: 2 as const,
    status: 'PENDING_PAYMENT' as const,
  };

  const secondCustomerNewOrder = {
    invoiceId: 'INV-VRV-9901',
    trackingId: 'JNE-9901',
    createdAt: '01 Nov 2026 · 15:00 WIB',
    buyerName: 'Ibu Clarissa',
    buyerCity: 'Jakarta',
    house: 'Creed',
    fragranceName: 'Aventus',
    concentration: 'Eau de Parfum',
    volume: '100ml',
    batchCode: 'CRD-89',
    dealPriceIDR: 4200000,
    shippingMethod: 'JNE' as const,
    awbNumber: 'JNE-9901',
    shippingStage: 2 as const,
    status: 'PENDING_PAYMENT' as const,
    paymentProof: null,
    paymentProofUrl: null,
    paymentProofUploadedAt: null,
  };

  removePaymentProofRecord('INV-VRV-8899');
  removePaymentProofRecord('INV-VRV-9901');
  removePaymentProofRecord('INV-SAMPLE');

  const fakeBase64Proof = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/';
  const uploadedTime = '01 Nov 2026 · 14:05:12 WIB';

  // 1. Upload proof for firstCustomerOrder (INV-VRV-8899) while secondCustomerNewOrder (INV-VRV-9901) is also in the list
  const exactRes = applyPaymentProofToOrders(
    [secondCustomerNewOrder, firstCustomerOrder],
    'INV-VRV-8899',
    fakeBase64Proof,
    uploadedTime
  );
  assert.deepEqual(exactRes.matchedInvoiceIds, ['INV-VRV-8899']);

  const updatedSecond = exactRes.updatedOrders.find(
    (o) => o.invoiceId === 'INV-VRV-9901'
  )!;
  const updatedFirst = exactRes.updatedOrders.find(
    (o) => o.invoiceId === 'INV-VRV-8899'
  )!;

  // First customer is PAID with proof
  assert.equal(updatedFirst.status, 'PAID');
  assert.equal(updatedFirst.paymentProof, fakeBase64Proof);
  assert.equal(updatedFirst.paymentProofUrl, fakeBase64Proof);
  assert.equal(updatedFirst.paymentProofUploadedAt, uploadedTime);
  assert.equal(updatedFirst.shippingStage, 3);

  // Second customer MUST remain PENDING_PAYMENT with null proof (no cross-customer bleed!)
  assert.equal(updatedSecond.status, 'PENDING_PAYMENT');
  assert.equal(updatedSecond.paymentProof, null);
  assert.equal(updatedSecond.paymentProofUrl, null);
  assert.equal(updatedSecond.paymentProofUploadedAt, null);

  // 2. Uploading on INV-SAMPLE must NEVER mark INV-VRV-9901 as PAID
  const sampleRes = applyPaymentProofToOrders(
    [secondCustomerNewOrder],
    'INV-SAMPLE',
    fakeBase64Proof,
    uploadedTime
  );
  assert.equal(sampleRes.matchedInvoiceIds.length, 0);
  assert.equal(sampleRes.updatedOrders[0].status, 'PENDING_PAYMENT');
  assert.equal(sampleRes.updatedOrders[0].paymentProof, null);

  // 3. resolvePrivateInvoice for secondCustomerNewOrder remains PENDING_PAYMENT with undefined proof
  const resolvedNewCustomer = resolvePrivateInvoice(
    'INV-VRV-9901',
    exactRes.updatedOrders,
    secondCustomerNewOrder
  );
  assert.equal(resolvedNewCustomer.status, 'PENDING_PAYMENT');
  assert.equal(resolvedNewCustomer.paymentProof, undefined);
  assert.equal(resolvedNewCustomer.paymentProofUrl, undefined);

  // 4. resolvePrivateInvoice for firstCustomerOrder is PAID with its proof
  const resolvedFirstCustomer = resolvePrivateInvoice(
    'INV-VRV-8899',
    exactRes.updatedOrders,
    firstCustomerOrder
  );
  assert.equal(resolvedFirstCustomer.status, 'PAID');
  assert.equal(resolvedFirstCustomer.paymentProof, fakeBase64Proof);
  assert.equal(resolvedFirstCustomer.paymentProofUrl, fakeBase64Proof);

  // Cleanup test records
  removePaymentProofRecord('INV-VRV-8899');
  removePaymentProofRecord('INV-VRV-9901');
  removePaymentProofRecord('INV-SAMPLE');
});

test('reindexVisitorLeads enforces sequential 3-digit IDs (LEAD-VRV-001..N) with zero duplicates, and Deferred AWB / COD Face-to-Face tracking statuses work accurately', async () => {
  const {
    reindexVisitorLeads,
    markLeadEmailDeleted,
    unmarkLeadEmailDeleted,
    buildTrackingFromCustomOrder,
    encodeSmartOrderParam,
    decodeSmartOrderParam,
    PENDING_AWB_STATUS_LABEL,
    COD_FACE_TO_FACE_STATUS_LABEL,
  } = await import('./businessRules.ts');

  // 1. Mixed legacy IDs (001, 03, duplicate 03) -> strictly LEAD-VRV-001, LEAD-VRV-002, LEAD-VRV-003, LEAD-VRV-004
  const messyLeads = [
    {
      id: 'LEAD-VRV-001',
      email: 'alexander.w@private-wealth.id',
      registeredAt: '27 Okt 2026 · 14:22 WIB',
      triggeredByFragrance: 'MFK — BR540 (70ml)',
      syncedToVorvanMail: true,
    },
    {
      id: 'LEAD-VRV-002',
      email: 'clarissa.tan@atelier-jakarta.com',
      registeredAt: '27 Okt 2026 · 15:08 WIB',
      triggeredByFragrance: 'LV — Ombre Nomade (100ml)',
      syncedToVorvanMail: true,
    },
    {
      id: 'LEAD-VRV-03',
      email: 'dummy1@gmail.com',
      registeredAt: '01 Nov 2026 · 10:00 WIB',
      triggeredByFragrance: 'Akses Concierge Katalog',
      syncedToVorvanMail: true,
    },
    {
      id: 'LEAD-VRV-03',
      email: 'dummy2@gmail.com',
      registeredAt: '01 Nov 2026 · 10:05 WIB',
      triggeredByFragrance: 'Akses Concierge Katalog',
      syncedToVorvanMail: true,
    },
  ];

  const indexed = reindexVisitorLeads(messyLeads);
  assert.equal(indexed.length, 4);
  assert.deepEqual(
    indexed.map((l) => l.id),
    ['LEAD-VRV-001', 'LEAD-VRV-002', 'LEAD-VRV-003', 'LEAD-VRV-004']
  );

  // Deleting dummy1@gmail.com re-indexes remaining leads cleanly to 001..003
  markLeadEmailDeleted('dummy1@gmail.com');
  const afterDelete = reindexVisitorLeads(messyLeads);
  assert.equal(afterDelete.length, 3);
  assert.deepEqual(
    afterDelete.map((l) => l.id),
    ['LEAD-VRV-001', 'LEAD-VRV-002', 'LEAD-VRV-003']
  );
  assert.equal(afterDelete[2].email, 'dummy2@gmail.com');
  unmarkLeadEmailDeleted('dummy1@gmail.com');

  // 2. Deferred AWB flow: New order created without AWB -> PENDING_AWB_STATUS_LABEL & isAwbPending: true
  const newOrderWithoutResi = {
    invoiceId: 'INV-VRV-7710',
    trackingId: 'INV-VRV-7710',
    createdAt: '01 Nov 2026 · 16:00 WIB',
    buyerName: 'Bpk. Dimas',
    buyerCity: 'Bandung, Jawa Barat',
    house: 'Dior',
    fragranceName: 'Sauvage Elixir',
    concentration: 'Parfum',
    volume: '60ml',
    batchCode: 'DR-60A',
    dealPriceIDR: 2650000,
    shippingMethod: 'JNE' as const,
    awbNumber: '',
    status: 'PENDING_PAYMENT' as const,
  };

  const trackBeforeResi = buildTrackingFromCustomOrder(newOrderWithoutResi);
  assert.equal(trackBeforeResi.isAwbPending, true);
  assert.equal(trackBeforeResi.isCodFaceToFace, false);
  assert.equal(trackBeforeResi.statusLabel, PENDING_AWB_STATUS_LABEL);

  // Smart token preserves empty AWB (never fabricates fake VRV-RESI-XXXX)
  const encodedPending = encodeSmartOrderParam(newOrderWithoutResi);
  const decodedPending = decodeSmartOrderParam(encodedPending);
  assert.ok(decodedPending);
  assert.equal(decodedPending.awbNumber, '');

  // After Admin inputs follow-up Resi via "✏️ Input / Edit Resi & Kurir" -> active expedition tracking
  const orderAfterFollowUpResi = {
    ...newOrderWithoutResi,
    shippingMethod: 'Pos Indonesia' as const,
    awbNumber: 'POS-9988112233',
    trackingId: 'POS-9988112233',
    status: 'PAID' as const,
  };
  const trackAfterResi = buildTrackingFromCustomOrder(orderAfterFollowUpResi);
  assert.equal(trackAfterResi.isAwbPending, false);
  assert.equal(trackAfterResi.isCodFaceToFace, false);
  assert.equal(trackAfterResi.awbNumber, 'POS-9988112233');
  assert.equal(trackAfterResi.binderbyteCourierCode, 'pos');

  // 3. Dedicated COD Face-to-Face Hand-Delivery -> COD_FACE_TO_FACE_STATUS_LABEL & isCodFaceToFace: true
  const codOrder = {
    ...newOrderWithoutResi,
    invoiceId: 'INV-VRV-7711',
    shippingMethod: 'COD / Tatap Muka' as const,
    awbNumber: '',
    status: 'PAID' as const,
  };
  const trackCod = buildTrackingFromCustomOrder(codOrder);
  assert.equal(trackCod.isCodFaceToFace, true);
  assert.equal(trackCod.isAwbPending, false);
  assert.equal(trackCod.statusLabel, COD_FACE_TO_FACE_STATUS_LABEL);
  assert.equal(trackCod.binderbyteCourierCode, '');
});

