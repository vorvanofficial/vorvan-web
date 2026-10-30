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
    'VORVAN Official Concierge — Andre Satria P'
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





