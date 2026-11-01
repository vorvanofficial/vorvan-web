import { VORVAN_81_CATALOG } from './catalog';
import { VorvanSkuPricingEntry } from '../types/fragrance';

export type ConciergeMomentFilterKey =
  | 'ALL'
  | 'NIGHT_CAFE'
  | 'DATE_ATTRACT'
  | 'HOT_DAY'
  | 'OFFICE_AC'
  | 'SULTAN_GALA';

export type ConciergeGenderFilterKey = 'All' | 'Men' | 'Women' | 'Unisex';

export type ConciergeClimateCategory =
  | 'HOT_SAFE'
  | 'NIGHT_AC'
  | 'SULTAN_FORMAL';

export const CLIMATE_ADVICE_LABELS: Record<ConciergeClimateCategory, string> = {
  HOT_SAFE:
    '☀️ AMAN PANAS TERIK & KERINGAT (Makin kena angin makin segar)',
  NIGHT_AC:
    '🌙 SPESIALIS MALAM, NGEDATE & RUANGAN AC (Hindari panas terik siang bolong)',
  SULTAN_FORMAL:
    '👑 KHUSUS MALAM FORMAL, KONDANGAN & AC DINGIN',
};

export const CONCIERGE_MOMENT_BUTTONS: {
  key: ConciergeMomentFilterKey;
  label: string;
}[] = [
  { key: 'ALL', label: 'SEMUA (81)' },
  { key: 'NIGHT_CAFE', label: '🌙 Nongkrong Malam & Cafe' },
  { key: 'DATE_ATTRACT', label: '❤️ Ngedate & Pemikat' },
  { key: 'HOT_DAY', label: '☀️ Siang Panas & Keringetan' },
  { key: 'OFFICE_AC', label: '🏢 Kantor AC & Meeting' },
  { key: 'SULTAN_GALA', label: '👑 Acara Sultan & Kondangan' },
];

export interface ConciergeGuideSeedMeta {
  no: number;
  simpleNotes: string;
  searchKeywords: string;
  momentKeys: Exclude<ConciergeMomentFilterKey, 'ALL'>[];
  momentBadges: string[];
  climateCategory: ConciergeClimateCategory;
}

export interface ConciergeGuideEntry extends VorvanSkuPricingEntry {
  simpleNotes: string;
  searchKeywords: string;
  momentKeys: Exclude<ConciergeMomentFilterKey, 'ALL'>[];
  momentBadges: string[];
  climateCategory: ConciergeClimateCategory;
  climateAdvice: string;
}

const CONCIERGE_81_META: Record<number, Omit<ConciergeGuideSeedMeta, 'no'>> = {
  // 1. LV (Louis Vuitton)
  1: {
    simpleNotes:
      'Perasan Jeruk Sisilia segar, Bergamot dingin, Mandarin berair, & Ambergris laut mewah',
    searchKeywords: 'jeruk citrus segar pantai panas keringat bersih mewah',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC',
      '❤️ Ngedate Siang / Liburan',
    ],
    climateCategory: 'HOT_SAFE',
  },
  2: {
    simpleNotes:
      'Kayu Oud Assam pekat, Asap Dupa Arab mewah, Raspberry manis gelap, & Kulit Birch',
    searchKeywords: 'oud gaharu asap manis kayu sultan arab kondangan malam',
    momentKeys: ['SULTAN_GALA', 'NIGHT_CAFE'],
    momentBadges: [
      '👑 Acara Sultan & Kondangan',
      '🌙 Malam Formal / Gala',
      '🏢 Ruangan Full AC Dingin',
    ],
    climateCategory: 'SULTAN_FORMAL',
  },
  3: {
    simpleNotes:
      'Bunga Mawar Centifolia mewah, Kayu Oud hangat, Ambergris, & Lada Hitam elegan',
    searchKeywords: 'mawar rose oud gaharu sultan mewah kondangan malam',
    momentKeys: ['SULTAN_GALA', 'DATE_ATTRACT', 'NIGHT_CAFE'],
    momentBadges: [
      '👑 Acara Sultan & Kondangan',
      '❤️ Dinner Romantis Mewah',
      '🌙 Malam Formal',
    ],
    climateCategory: 'SULTAN_FORMAL',
  },
  4: {
    simpleNotes:
      'Teh Hitam Cina mewah, Jeruk Citron segar, Sabun bersih elegan, & Kayu Manis tipis',
    searchKeywords: 'teh jeruk sabun bersih segar citrus kantor panas',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Raja Kantor & Meeting',
      '❤️ Pemikat Clean Look',
    ],
    climateCategory: 'HOT_SAFE',
  },
  5: {
    simpleNotes:
      'Jeruk Bali (Grapefruit) segar, Jahe hangat tipis, Air Laut bersih, & Amber maskulin',
    searchKeywords: 'jeruk jahe segar maskulin bersih kantor panas',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC & Eksekutif',
      '❤️ Ngedate Maskulin Rapi',
    ],
    climateCategory: 'HOT_SAFE',
  },
  6: {
    simpleNotes:
      'Buah Leci manis segar, Bunga Peony mewah, Cokelat Kakao tipis, & Mawar Turki',
    searchKeywords: 'leci bunga mawar manis segar cewek romantis',
    momentKeys: ['DATE_ATTRACT', 'OFFICE_AC', 'HOT_DAY', 'SULTAN_GALA'],
    momentBadges: [
      '❤️ Pemikat & Ngedate',
      '☀️ Segar Seharian',
      '🏢 Kantor & Arisan Mewah',
    ],
    climateCategory: 'HOT_SAFE',
  },
  7: {
    simpleNotes:
      'Bunga Iris bangsawan lembut, Mawar Grasse romantis, & Musk bedak mewah memikat',
    searchKeywords: 'bunga mawar iris bedak lembut segar mewah cewek',
    momentKeys: ['DATE_ATTRACT', 'OFFICE_AC', 'SULTAN_GALA'],
    momentBadges: [
      '❤️ Ngedate Romantis',
      '🏢 Kantor AC',
      '👑 Acara Kondangan Siang/Malam',
    ],
    climateCategory: 'HOT_SAFE',
  },
  8: {
    simpleNotes:
      'Tiga jenis Bunga Mawar segar berembun, Buah Persik lembut, & Kayu Cedar bersih',
    searchKeywords: 'mawar rose bunga segar lembut bersih siang kantor',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC',
      '❤️ Ngedate Siang & Brunch',
    ],
    climateCategory: 'HOT_SAFE',
  },

  // 2. DIOR
  9: {
    simpleNotes:
      'Jeruk Bergamot segar pedas, Lada Sichuan, Ambroxan maskulin, & Vanilla tipis hangat',
    searchKeywords: 'jeruk pedas segar ambroxan vanilla maskulin buaya pemikat',
    momentKeys: ['HOT_DAY', 'NIGHT_CAFE', 'DATE_ATTRACT', 'OFFICE_AC'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '❤️ Ngedate / Pemikat Cewek',
      '🌙 Nongkrong Malam',
      '🏢 Kantor AC',
    ],
    climateCategory: 'HOT_SAFE',
  },
  10: {
    simpleNotes:
      'Jeruk Bergamot Calabria ekstra segar, Lada hitam tajam, & Ambroxan bersih semerbak',
    searchKeywords: 'jeruk segar pedas bersih siang panas olahraga nongkrong',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'NIGHT_CAFE', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor & Outdoor',
      '🌙 Nongkrong Malam',
    ],
    climateCategory: 'HOT_SAFE',
  },
  11: {
    simpleNotes:
      'Jaket Kulit maskulin klasik, Daun Violet hangat, Pala rempah, & Kayu Cedar',
    searchKeywords: 'kulit leather rempah hangat dewasa malam maskulin',
    momentKeys: ['NIGHT_CAFE', 'OFFICE_AC'],
    momentBadges: [
      '🌙 Nongkrong Malam',
      '🏢 Kantor AC Dingin',
      '❤️ Karakter Pria Dewasa',
    ],
    climateCategory: 'NIGHT_AC',
  },
  12: {
    simpleNotes:
      'Buket Mawar Centifolia manis lembut, Buah Persik, Iris powdery, & Vanilla creamy',
    searchKeywords: 'mawar vanilla manis bunga cewek ngedate kantor segar',
    momentKeys: ['DATE_ATTRACT', 'OFFICE_AC', 'HOT_DAY'],
    momentBadges: [
      '❤️ Ngedate & Pemikat',
      '🏢 Kantor AC',
      '☀️ Aman Cuaca Siang',
    ],
    climateCategory: 'HOT_SAFE',
  },
  13: {
    simpleNotes:
      'Kelopak Mawar Grasse segar baru dipetik, Jeruk Bergamot, & Musk putih bersih',
    searchKeywords: 'mawar jeruk segar bersih bunga siang panas cewek',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC',
      '❤️ Ngedate Siang',
    ],
    climateCategory: 'HOT_SAFE',
  },
  14: {
    simpleNotes:
      'Bunga Peony pink lembut, Mawar Damaskus segar, Jeruk Mandarin, & Musk sejuk',
    searchKeywords: 'bunga peony mawar jeruk segar lembut cewek siang panas',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor & Kampus',
      '❤️ Ngedate Kalem Anggun',
    ],
    climateCategory: 'HOT_SAFE',
  },
  15: {
    simpleNotes:
      'Bunga Melati mewah, Ylang-Ylang keemasan, Buah Pir segar, & Mawar elegan',
    searchKeywords: 'melati bunga pir segar mewah kondangan kantor cewek',
    momentKeys: ['OFFICE_AC', 'SULTAN_GALA', 'DATE_ATTRACT', 'HOT_DAY'],
    momentBadges: [
      '🏢 Kantor & Eksekutif',
      '👑 Kondangan & Pesta',
      '☀️ Aman Siang Hari',
    ],
    climateCategory: 'HOT_SAFE',
  },
  16: {
    simpleNotes:
      'Kayu Oud Timur Tengah mewah, Mawar Damaskus pekat, & Resin Labdanum hangat',
    searchKeywords: 'oud gaharu mawar timur tengah sultan kondangan malam',
    momentKeys: ['SULTAN_GALA', 'NIGHT_CAFE'],
    momentBadges: [
      '👑 Acara Sultan & Kondangan',
      '🌙 Malam Formal',
      '🏢 Ruangan AC Dingin',
    ],
    climateCategory: 'SULTAN_FORMAL',
  },
  17: {
    simpleNotes:
      'Ekstrak Oud pekat kerajaan, Mawar merah gelap, Rempah Jintan & Cengkeh mewah',
    searchKeywords: 'oud gaharu mawar rempah sultan kondangan malam pekat',
    momentKeys: ['SULTAN_GALA', 'NIGHT_CAFE'],
    momentBadges: [
      '👑 Acara Sultan & Kondangan',
      '🌙 Gala Dinner Malam',
      '🏢 Khusus AC Dingin',
    ],
    climateCategory: 'SULTAN_FORMAL',
  },

  // 3. Tom Ford
  18: {
    simpleNotes:
      'Jaket Kulit Hitam mewah, Rempah Kapulaga hangat, Melati malam, & Amber smoky',
    searchKeywords: 'kulit leather rempah hangat maskulin malam cafe moge',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT', 'SULTAN_GALA'],
    momentBadges: [
      '🌙 Nongkrong Malam',
      '❤️ Pemikat Pria Badboy Mewah',
      '👑 Acara Malam & Lounge',
    ],
    climateCategory: 'NIGHT_AC',
  },
  19: {
    simpleNotes:
      'Kulit Hitam halus elegan, Daun Violet segar, Melati putih, & Kayu Cedar berwibawa',
    searchKeywords: 'kulit leather halus mewah malam kantor ac ngedate',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT', 'OFFICE_AC', 'SULTAN_GALA'],
    momentBadges: [
      '🌙 Nongkrong Malam',
      '❤️ Ngedate Mewah',
      '🏢 Ruang Meeting Full AC',
    ],
    climateCategory: 'NIGHT_AC',
  },
  20: {
    simpleNotes:
      'Kelapa creamy mewah pantai, Jeruk Bergamot segar, Kacang Pistachio, & Bunga Melati',
    searchKeywords: 'kelapa coconut jeruk segar pantai liburan mewah siang',
    momentKeys: ['HOT_DAY', 'DATE_ATTRACT', 'OFFICE_AC'],
    momentBadges: [
      '☀️ Tahan Panas & Resort Pantai',
      '❤️ Ngedate Sore / Beach Club',
      '🏢 Kantor AC',
    ],
    climateCategory: 'HOT_SAFE',
  },
  21: {
    simpleNotes:
      'Tiga Mawar langka, Lada Sichuan pedas hangat, Kunyit, & Kacang Tonka manis',
    searchKeywords: 'mawar rose manis pedas hangat malam ngedate kondangan',
    momentKeys: ['DATE_ATTRACT', 'NIGHT_CAFE', 'SULTAN_GALA'],
    momentBadges: [
      '❤️ Ngedate Malam Mewah',
      '👑 Kondangan & Pesta',
      '🌙 Lounge & Cafe Malam',
    ],
    climateCategory: 'NIGHT_AC',
  },
  22: {
    simpleNotes:
      'Kayu Gaharu (Oud) halus bersih, Kayu Cendana, Kapulaga hangat, & Vanilla tipis',
    searchKeywords: 'oud kayu cendana vanilla hangat rapi kantor ac malam',
    momentKeys: ['OFFICE_AC', 'NIGHT_CAFE', 'DATE_ATTRACT', 'SULTAN_GALA'],
    momentBadges: [
      '🏢 Raja Meeting & CEO AC',
      '🌙 Nongkrong Malam',
      '❤️ Ngedate Elegan',
      '👑 Acara Formal',
    ],
    climateCategory: 'NIGHT_AC',
  },
  23: {
    simpleNotes:
      'Daun Tembakau manis mewah, Vanilla pekat hangat, Cokelat Kakao, & Buah Kering',
    searchKeywords: 'vanilla tembakau manis hangat coklat malam ngedate sultan',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT', 'SULTAN_GALA'],
    momentBadges: [
      '🌙 Nongkrong Malam',
      '❤️ Ngedate / Pemikat',
      '👑 Acara Sultan & Malam Dingin',
    ],
    climateCategory: 'NIGHT_AC',
  },
  24: {
    simpleNotes:
      'Buah Ceri Hitam manis menggoda, Liqueur Ceri, Kacang Almond, & Vanilla hangat',
    searchKeywords: 'ceri cherry manis vanilla almond ngedate pemikat malam',
    momentKeys: ['DATE_ATTRACT', 'NIGHT_CAFE', 'SULTAN_GALA'],
    momentBadges: [
      '❤️ Spesialis Ngedate & Pemikat',
      '🌙 Nongkrong Malam & Lounge',
      '👑 Pesta Malam',
    ],
    climateCategory: 'NIGHT_AC',
  },
  25: {
    simpleNotes:
      'Lavender aromatik, Almond pahit manis, Kulit mewah, & Kacang Tonka creamy',
    searchKeywords: 'kulit almond vanilla manis lavender malam sultan cafe',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT', 'SULTAN_GALA'],
    momentBadges: [
      '🌙 Nongkrong Malam',
      '❤️ Pemikat Berkelas',
      '👑 Acara Sultan & VIP Lounge',
    ],
    climateCategory: 'NIGHT_AC',
  },
  26: {
    simpleNotes:
      'Jeruk Neroli Italia super segar, Lemon Sisilia, Mandarin, & Bunga Jeruk bersih',
    searchKeywords: 'jeruk lemon citrus segar bersih panas keringat siang',
    momentKeys: ['HOT_DAY', 'OFFICE_AC'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor & Siang Hari',
      '☀️ Segar Habis Mandi',
    ],
    climateCategory: 'HOT_SAFE',
  },

  // 4. YSL
  27: {
    simpleNotes:
      'Apel Hijau renyah segar, Jeruk Bergamot, Daun Sage bersih, & Kayu Amber maskulin',
    searchKeywords: 'apel jeruk segar manis tipis bersih kantor panas ngedate',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT', 'NIGHT_CAFE'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC',
      '❤️ Ngedate / Pemikat Cewek',
      '🌙 Nongkrong Malam',
    ],
    climateCategory: 'HOT_SAFE',
  },
  28: {
    simpleNotes:
      'Bunga Jeruk Tunisia bersih segar, Bergamot cerah, & Kayu Patchouli modern rapi',
    searchKeywords: 'jeruk bunga segar bersih sabun kantor panas ngedate',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT', 'NIGHT_CAFE'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC & Daily',
      '❤️ Pemikat Clean Boy',
    ],
    climateCategory: 'HOT_SAFE',
  },
  29: {
    simpleNotes:
      'Lavender Prancis elegan, Bunga Jeruk manis, & Vanilla Madagaskar hangat mewah',
    searchKeywords: 'vanilla lavender bunga manis elegan cewek boss kantor malam',
    momentKeys: ['OFFICE_AC', 'DATE_ATTRACT', 'NIGHT_CAFE', 'SULTAN_GALA'],
    momentBadges: [
      '🏢 Kantor AC & Lady Boss',
      '❤️ Ngedate Mewah',
      '🌙 Nongkrong Malam & Kondangan',
    ],
    climateCategory: 'NIGHT_AC',
  },
  30: {
    simpleNotes:
      'Kopi Hitam hangat, Vanilla manis menggoda, Buah Pir segar, & Bunga Putih malam',
    searchKeywords: 'kopi coffee vanilla manis pemikat ngedate malam cafe cewek',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT'],
    momentBadges: [
      '🌙 Ratu Nongkrong Malam & Cafe',
      '❤️ Ngedate / Pemikat Cowok',
    ],
    climateCategory: 'NIGHT_AC',
  },

  // 5. CREED
  31: {
    simpleNotes:
      'Nanas Panggang segar berwibawa, Jeruk Bergamot, Kayu Birch smoky, & Ambergris',
    searchKeywords: 'nanas jeruk segar kayu smoky sultan kantor kondangan',
    momentKeys: ['OFFICE_AC', 'SULTAN_GALA', 'HOT_DAY', 'DATE_ATTRACT'],
    momentBadges: [
      '🏢 Raja Kantor & CEO',
      '👑 Acara Sultan & Kondangan',
      '☀️ Tahan Panas Terik',
      '❤️ Pemikat Berwibawa',
    ],
    climateCategory: 'HOT_SAFE',
  },
  32: {
    simpleNotes:
      'Jeruk Mandarin segar, Jahe dingin, Nanas ringan, & Musk bersih sporty mewah',
    searchKeywords: 'jeruk nanas segar panas keringat siang olahraga kantor',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC',
      '❤️ Ngedate Siang Segar',
    ],
    climateCategory: 'HOT_SAFE',
  },
  33: {
    simpleNotes:
      'Teh Hijau pegunungan sejuk, Jeruk Mandarin segar, Blackcurrant, & Musk dingin',
    searchKeywords: 'teh green tea jeruk segar dingin panas keringat kantor',
    momentKeys: ['HOT_DAY', 'OFFICE_AC'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC & Meeting',
      '☀️ Sejuk Seperti Air Pegunungan',
    ],
    climateCategory: 'HOT_SAFE',
  },
  34: {
    simpleNotes:
      'Buah Semangka & Citrus manis segar, Garam Laut dingin, & Ambergris kerajaan',
    searchKeywords: 'semangka jeruk laut segar manis tipis panas sultan siang',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'SULTAN_GALA', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC',
      '👑 Siang Formal Sultan',
    ],
    climateCategory: 'HOT_SAFE',
  },

  // 6. MFK
  35: {
    simpleNotes:
      'Gula Bakar (Cotton Candy) mewah, Kacang Almond, Saffron emas, & Kayu Ambergris',
    searchKeywords: 'manis gula almond saffron baccarat sultan kondangan malam',
    momentKeys: ['SULTAN_GALA', 'DATE_ATTRACT', 'NIGHT_CAFE'],
    momentBadges: [
      '👑 Acara Sultan & Kondangan',
      '❤️ Pemikat Kelas Atas',
      '🌙 Malam Formal & Lounge',
    ],
    climateCategory: 'SULTAN_FORMAL',
  },
  36: {
    simpleNotes:
      'Saffron hangat, Melati Mesir, Manis Kristal Gula mewah, & Kayu Cedar semerbak',
    searchKeywords: 'manis gula saffron melati baccarat sultan kondangan malam',
    momentKeys: ['SULTAN_GALA', 'DATE_ATTRACT', 'NIGHT_CAFE'],
    momentBadges: [
      '👑 Acara Sultan & Kondangan',
      '❤️ Ngedate Mewah',
      '🌙 Nongkrong Malam',
    ],
    climateCategory: 'SULTAN_FORMAL',
  },
  37: {
    simpleNotes:
      'Mawar Turki & Bulgaria pekat, Kayu Oud lembut, & Vanilla manis sehalus kain satin',
    searchKeywords: 'oud mawar vanilla manis sultan kondangan malam mewah',
    momentKeys: ['SULTAN_GALA', 'DATE_ATTRACT', 'NIGHT_CAFE'],
    momentBadges: [
      '👑 Acara Sultan & Kondangan',
      '❤️ Gala Dinner Romantis',
      '🌙 Malam Dingin / Full AC',
    ],
    climateCategory: 'SULTAN_FORMAL',
  },
  38: {
    simpleNotes:
      'Jeruk Lemon Sisilia, Bergamot segar, Bunga Putih, & Sabun Kemeja Putih bersih',
    searchKeywords: 'jeruk lemon sabun bersih segar panas keringat kantor',
    momentKeys: ['HOT_DAY', 'OFFICE_AC'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC & Dokter/Eksekutif',
    ],
    climateCategory: 'HOT_SAFE',
  },
  39: {
    simpleNotes:
      '400 Bunga Mawar Damaskus & Grasse segar berembun, Jeruk Calabria, & Violet lembut',
    searchKeywords: 'mawar rose jeruk segar bunga bersih siang kantor cewek',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC',
      '❤️ Ngedate Siang Anggun',
    ],
    climateCategory: 'HOT_SAFE',
  },

  // 7. Le Labo
  40: {
    simpleNotes:
      'Musk kulit bersih memikat (Ambroxan), Buah Pir renyah segar, & Melati tipis modern',
    searchKeywords: 'musk pir bersih segar kantor panas pemikat skin scent',
    momentKeys: ['OFFICE_AC', 'HOT_DAY', 'DATE_ATTRACT', 'NIGHT_CAFE'],
    momentBadges: [
      '🏢 Favorit Kantor & Kreatif',
      '☀️ Tahan Panas Terik',
      '❤️ Pemikat Jarak Dekat',
    ],
    climateCategory: 'HOT_SAFE',
  },
  41: {
    simpleNotes:
      'Kayu Cendana (Sandalwood) creamy, Kulit halus, Kapulaga rempah, & Bunga Iris',
    searchKeywords: 'kayu cendana kulit rempah cafe malam kantor ac artistik',
    momentKeys: ['NIGHT_CAFE', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '🌙 Nongkrong Malam & Cafe Senopati',
      '🏢 Kantor AC Dingin',
      '❤️ Ngedate Artistik',
    ],
    climateCategory: 'NIGHT_AC',
  },
  42: {
    simpleNotes:
      'Daun Teh Hitam pekat, Buah Ara (Fig) manis segar, Kayu Cedar, & Tembakau tipis',
    searchKeywords: 'teh hitam manis kayu malam cafe ngedate kantor ac',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT', 'OFFICE_AC'],
    momentBadges: [
      '🌙 Nongkrong Malam & Cafe',
      '❤️ Ngedate Intim',
      '🏢 Kantor AC',
    ],
    climateCategory: 'NIGHT_AC',
  },

  // 8. Celine
  43: {
    simpleNotes:
      'Jeruk Bergamot & Neroli cerah, Bedak mewah khas Paris, & Akar Wangi (Vetiver) rapi',
    searchKeywords: 'jeruk segar bersih bedak rapi kantor panas siang',
    momentKeys: ['OFFICE_AC', 'HOT_DAY', 'DATE_ATTRACT'],
    momentBadges: [
      '🏢 Kantor AC & Old Money',
      '☀️ Tahan Panas Terik',
      '❤️ Ngedate Rapi Berkelas',
    ],
    climateCategory: 'HOT_SAFE',
  },
  44: {
    simpleNotes:
      'Vanilla Putih lembut mewah, Bedak Iris Paris, Kayu Cedar hitam, & Musk hangat',
    searchKeywords: 'vanilla bedak iris manis halus malam kondangan sultan jas',
    momentKeys: ['SULTAN_GALA', 'DATE_ATTRACT', 'NIGHT_CAFE'],
    momentBadges: [
      '👑 Acara Sultan & Jas Formal',
      '❤️ Dinner Romantis Malam',
      '🌙 Lounge Full AC',
    ],
    climateCategory: 'SULTAN_FORMAL',
  },

  // 9. Chanel
  45: {
    simpleNotes:
      'Kulit Lemon segar, Kayu Cendana Kaledonia Baru creamy mewah, & Dupa tipis berwibawa',
    searchKeywords: 'jeruk lemon kayu cendana segar mewah kantor ngedate malam',
    momentKeys: ['OFFICE_AC', 'DATE_ATTRACT', 'NIGHT_CAFE', 'SULTAN_GALA'],
    momentBadges: [
      '🏢 Raja Kantor & Eksekutif',
      '❤️ Ngedate Mewah',
      '👑 Acara Formal & Malam',
    ],
    climateCategory: 'HOT_SAFE',
  },
  46: {
    simpleNotes:
      'Jeruk Grapefruit segar, Daun Mint dingin, Jahe, & Kayu Amber maskulin serbaguna',
    searchKeywords: 'jeruk mint segar bersih kantor panas ngedate malam',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT', 'NIGHT_CAFE'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC',
      '❤️ Ngedate / Pemikat Cewek',
      '🌙 Nongkrong Malam',
    ],
    climateCategory: 'HOT_SAFE',
  },
  47: {
    simpleNotes:
      'Perasan Lemon & Mint ekstra dingin segar, Lada Pink, & Kayu Cedar bersih sporty',
    searchKeywords: 'jeruk lemon mint segar panas keringat siang kantor',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor & Aktivitas Siang',
      '❤️ Ngedate Siang',
    ],
    climateCategory: 'HOT_SAFE',
  },
  48: {
    simpleNotes:
      'Jeruk Sisilia segar, Mawar & Melati mewah, Patchouli elegan, & Vanilla lembut',
    searchKeywords: 'jeruk mawar vanilla segar mewah kantor kondangan cewek',
    momentKeys: ['OFFICE_AC', 'DATE_ATTRACT', 'SULTAN_GALA', 'HOT_DAY'],
    momentBadges: [
      '🏢 Kantor AC & Wanita Karir',
      '❤️ Ngedate Mewah',
      '👑 Kondangan & Acara Formal',
    ],
    climateCategory: 'HOT_SAFE',
  },
  49: {
    simpleNotes:
      'Buah Quince & Grapefruit manis segar, Bunga Melati lembut, & Musk putih bersih',
    searchKeywords: 'jeruk buah bunga segar lembut bersih panas kantor cewek',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC',
      '❤️ Ngedate & Daily Cewek',
    ],
    climateCategory: 'HOT_SAFE',
  },
  50: {
    simpleNotes:
      'Jeruk Lemon Citron gemerlap super segar, Melati air, & Kayu Jati bersih',
    searchKeywords: 'jeruk lemon segar bersih panas keringat olahraga siang',
    momentKeys: ['HOT_DAY', 'OFFICE_AC'],
    momentBadges: [
      '☀️ Tahan Panas Terik & Keringat',
      '🏢 Kantor & Outdoor Siang',
    ],
    climateCategory: 'HOT_SAFE',
  },

  // 10. Armani
  51: {
    simpleNotes:
      'Air Laut dalam yang dingin segar, Jeruk Mandarin hijau, Lavender, & Mineral bersih',
    searchKeywords: 'laut segar jeruk dingin panas keringat siang kantor',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Raja Tahan Panas & Keringat',
      '🏢 Kantor AC & Lapangan',
      '❤️ Ngedate Siang',
    ],
    climateCategory: 'HOT_SAFE',
  },
  52: {
    simpleNotes:
      'Angin Laut segar, Jeruk Bergamot, Dupa (Incense) smoky maskulin, & Patchouli',
    searchKeywords: 'laut jeruk segar smoky maskulin kantor malam ngedate',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT', 'NIGHT_CAFE'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC',
      '❤️ Ngedate Malam & Siang',
    ],
    climateCategory: 'HOT_SAFE',
  },
  53: {
    simpleNotes:
      'Karamel Toffee manis hangat, Kayu Manis, Vanilla Bourbon pekat, & Kacang Chestnut',
    searchKeywords: 'vanilla karamel manis hangat kayu manis ngedate malam cafe',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT'],
    momentBadges: [
      '🌙 Nongkrong Malam & Cafe',
      '❤️ Raja Ngedate / Pemikat Cewek',
    ],
    climateCategory: 'NIGHT_AC',
  },

  // 11. JPG
  54: {
    simpleNotes:
      'Madu emas manis pekat, Vanilla hangat, Daun Tembakau lembut, & Lavender Mint',
    searchKeywords: 'vanilla madu manis tembakau mint ngedate malam pemikat',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT'],
    momentBadges: [
      '🌙 Nongkrong Malam & Club/Cafe',
      '❤️ Raja Pemikat Cewek (Sweet Beast)',
    ],
    climateCategory: 'NIGHT_AC',
  },
  55: {
    simpleNotes:
      'Kelapa creamy manis, Nanas segar tropis, Kacang Tonka hangat, & Kayu Cendana',
    searchKeywords: 'kelapa nanas manis vanilla tonka ngedate malam cafe',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT'],
    momentBadges: [
      '🌙 Nongkrong Malam',
      '❤️ Ngedate / Pemikat Tropis Manis',
    ],
    climateCategory: 'NIGHT_AC',
  },
  56: {
    simpleNotes:
      'Buah Raspberry manis susu, Bunga Tuberose & Melati semerbak menggoda',
    searchKeywords: 'manis susu buah bunga pemikat malam ngedate cewek',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT'],
    momentBadges: [
      '🌙 Nongkrong Malam',
      '❤️ Pemikat Cowok / Ngedate Malam',
    ],
    climateCategory: 'NIGHT_AC',
  },

  // 12. Versace
  57: {
    simpleNotes:
      'Daun Mint dingin, Apel Hijau segar, & Vanilla Kacang Tonka manis maskulin',
    searchKeywords: 'vanilla mint apel manis segar malam nongkrong ngedate',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT'],
    momentBadges: [
      '🌙 Nongkrong Malam & Party',
      '❤️ Ngedate / Pemikat Cewek',
    ],
    climateCategory: 'NIGHT_AC',
  },
  58: {
    simpleNotes:
      'Jeruk Mandarin merah pedas segar, Lada Hitam, Rosemary, & Vanilla Tonka hangat',
    searchKeywords: 'jeruk vanilla manis pedas hangat malam ngedate cafe',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT'],
    momentBadges: [
      '🌙 Nongkrong Malam & Cafe',
      '❤️ Ngedate / Pemikat Hangat',
    ],
    climateCategory: 'NIGHT_AC',
  },
  59: {
    simpleNotes:
      'Buah Delima & Yuzu dingin segar, Bunga Peony, Teratai air, & Musk bersih',
    searchKeywords: 'jeruk yuzu bunga segar bersih panas keringat siang cewek',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik & Keringat',
      '🏢 Kantor & Aktivitas Siang',
      '❤️ Ngedate Siang Segar',
    ],
    climateCategory: 'HOT_SAFE',
  },

  // 13. Byredo
  60: {
    simpleNotes:
      'Sabun Mewah & Sprei Hotel Bintang 5 baru dicuci, Mawar putih, & Musk bersih',
    searchKeywords: 'sabun bersih segar mawar putih panas keringat kantor',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC',
      '❤️ Wangi Habis Mandi Seharian',
    ],
    climateCategory: 'HOT_SAFE',
  },
  61: {
    simpleNotes:
      'Jeruk Lemon & Marigold cerah, Buah Manis segar, & Akar Wangi (Vetiver) bersih',
    searchKeywords: 'jeruk manis tipis segar bersih kantor panas siang',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC & Meeting',
      '❤️ Ngedate Ceria & Unik',
    ],
    climateCategory: 'HOT_SAFE',
  },
  62: {
    simpleNotes:
      'Jeruk Lemon segar, Buah Juniper, Jarum Pinus sejuk, & Vanilla tipis kayu cendana',
    searchKeywords: 'jeruk vanilla tipis kayu segar sejuk kantor panas',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC',
      '❤️ Ngedate Kalem Estetik',
    ],
    climateCategory: 'HOT_SAFE',
  },

  // 14. Diptyque
  63: {
    simpleNotes:
      'Musk lembut seperti kulit bayi habis mandi, Bunga Iris bedak mewah, & Lada Pink',
    searchKeywords: 'musk bedak sabun bersih lembut kantor ngedate siang',
    momentKeys: ['OFFICE_AC', 'DATE_ATTRACT', 'HOT_DAY'],
    momentBadges: [
      '🏢 Kantor AC',
      '❤️ Pemikat Jarak Dekat (Skin Scent)',
      '☀️ Aman Cuaca Siang',
    ],
    climateCategory: 'HOT_SAFE',
  },
  64: {
    simpleNotes:
      'Musk putih ringan, Jeruk Mandarin segar, Bunga Iris lembut, & Cotton bersih',
    searchKeywords: 'musk jeruk sabun bersih segar panas kantor siang',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC',
      '❤️ Ngedate Siang Bersih',
    ],
    climateCategory: 'HOT_SAFE',
  },
  65: {
    simpleNotes:
      'Buah Juniper segar dingin, Bunga Melati, Bedak mewah, & Kayu Cedar hangat rapi',
    searchKeywords: 'kayu bunga bedak segar rapi kantor cafe malam',
    momentKeys: ['OFFICE_AC', 'NIGHT_CAFE', 'DATE_ATTRACT', 'HOT_DAY'],
    momentBadges: [
      '🏢 Kantor AC & Meeting',
      '🌙 Nongkrong Cafe',
      '☀️ Aman Siang & Malam',
    ],
    climateCategory: 'HOT_SAFE',
  },

  // 15. Maison Margiela
  66: {
    simpleNotes:
      'Sprei Katun Putih bersih di pagi hari, Bunga Lily segar, Buah Pir, & Musk lembut',
    searchKeywords: 'sabun sprei bersih segar pir panas keringat kantor',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC & Santai',
      '❤️ Wangi Bersih Menenangkan',
    ],
    climateCategory: 'HOT_SAFE',
  },
  67: {
    simpleNotes:
      'Minuman Rum manis hangat, Daun Tembakau Cerutu lembut, & Vanilla Bean cozy',
    searchKeywords: 'vanilla tembakau rum manis hangat malam cafe ngedate',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT'],
    momentBadges: [
      '🌙 Raja Nongkrong Malam & Jazz Cafe',
      '❤️ Ngedate Malam Cozy',
    ],
    climateCategory: 'NIGHT_AC',
  },
  68: {
    simpleNotes:
      'Marshmallow panggang & Vanilla manis hangat, Kacang Chestnut, & Kayu bakar',
    searchKeywords: 'vanilla manis kayu bakar hangat malam hujan cafe ngedate',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT'],
    momentBadges: [
      '🌙 Nongkrong Malam & Cuaca Hujan',
      '❤️ Ngedate Hangat Manis',
    ],
    climateCategory: 'NIGHT_AC',
  },
  69: {
    simpleNotes:
      'Buah Pir manis segar, Bunga Lily of the Valley mekar, & Musk taman pagi hari',
    searchKeywords: 'pir bunga segar manis tipis panas siang kantor cewek',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC',
      '❤️ Ngedate Taman / Siang',
    ],
    climateCategory: 'HOT_SAFE',
  },

  // 16. Jo Malone
  70: {
    simpleNotes:
      'Buah Pir Inggris matang segar, Bunga Freesia putih bersih, & Mawar lembut',
    searchKeywords: 'pir bunga mawar segar bersih panas siang kantor cewek',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Favorit Kantor & Meeting',
      '❤️ Ngedate Siang Anggun',
    ],
    climateCategory: 'HOT_SAFE',
  },
  71: {
    simpleNotes:
      'Angin Pantai & Garam Laut segar, Daun Sage herbal bersih, & Jeruk Grapefruit',
    searchKeywords: 'laut garam jeruk segar bersih panas keringat kantor',
    momentKeys: ['HOT_DAY', 'OFFICE_AC'],
    momentBadges: [
      '☀️ Tahan Panas Terik & Keringat',
      '🏢 Kantor AC & Santai',
    ],
    climateCategory: 'HOT_SAFE',
  },

  // 17. Prada
  72: {
    simpleNotes:
      'Buah Pir & Tangerine segar, Bunga Neroli & Melati mewah, serta Bourbon Vanilla',
    searchKeywords: 'vanilla jeruk pir bunga manis segar ngedate kantor cewek',
    momentKeys: ['DATE_ATTRACT', 'OFFICE_AC', 'HOT_DAY', 'NIGHT_CAFE'],
    momentBadges: [
      '❤️ Pemikat & Ngedate',
      '🏢 Kantor AC',
      '☀️ Aman Siang & Malam',
    ],
    climateCategory: 'HOT_SAFE',
  },
  73: {
    simpleNotes:
      'Bunga Melati pekat, Amber hangat mewah, Lumut Oakmoss, & Vanilla manis intens',
    searchKeywords: 'vanilla melati manis hangat malam ngedate kondangan cewek',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT', 'SULTAN_GALA'],
    momentBadges: [
      '🌙 Nongkrong Malam',
      '❤️ Ngedate / Pemikat Intens',
      '👑 Acara Kondangan Malam',
    ],
    climateCategory: 'NIGHT_AC',
  },

  // 18. Gucci
  74: {
    simpleNotes:
      'Bunga Gardenia putih manis segar, Buah Pir, & Gula Merah (Brown Sugar) lembut',
    searchKeywords: 'bunga manis pir segar cewek ngedate siang kantor',
    momentKeys: ['DATE_ATTRACT', 'HOT_DAY', 'OFFICE_AC'],
    momentBadges: [
      '❤️ Ngedate Feminim Manis',
      '☀️ Aman Cuaca Siang',
      '🏢 Kantor AC',
    ],
    climateCategory: 'HOT_SAFE',
  },
  75: {
    simpleNotes:
      'Lavender Prancis bersih, Lemon Italia segar, Bunga Jeruk, & Kayu Cedar maskulin',
    searchKeywords: 'jeruk lemon lavender segar bersih kantor panas ngedate',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC',
      '❤️ Ngedate Rapi Maskulin',
    ],
    climateCategory: 'HOT_SAFE',
  },

  // 19. Valentino
  76: {
    simpleNotes:
      'Mineral Garam Laut segar, Daun Violet bersih, Jahe hangat tipis, & Kayu Vetiver',
    searchKeywords: 'segar laut jahe bersih maskulin panas kantor nongkrong',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'DATE_ATTRACT', 'NIGHT_CAFE'],
    momentBadges: [
      '☀️ Tahan Panas Terik',
      '🏢 Kantor AC',
      '❤️ Ngedate & Nongkrong',
    ],
    climateCategory: 'HOT_SAFE',
  },
  77: {
    simpleNotes:
      'Jeruk Bergamot Calabria segar, Biji Kopi panggang lembut, & Kayu Vetiver bersih',
    searchKeywords: 'jeruk kopi coffee segar manis tipis kantor nongkrong siang',
    momentKeys: ['HOT_DAY', 'OFFICE_AC', 'NIGHT_CAFE', 'DATE_ATTRACT'],
    momentBadges: [
      '☀️ Aman Siang Hari',
      '🏢 Kantor AC',
      '🌙 Nongkrong Cafe',
    ],
    climateCategory: 'HOT_SAFE',
  },
  78: {
    simpleNotes:
      'Vanilla Bourbon hangat, Lavender bersih, & Smoky Vetiver maskulin',
    searchKeywords: 'vanilla lavender manis hangat maskulin malam ngedate pemikat',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT'],
    momentBadges: [
      '🌙 Nongkrong Malam',
      '❤️ Ngedate / Pemikat Cewek',
      '🏢 Ruang AC Dingin',
    ],
    climateCategory: 'NIGHT_AC',
  },
  79: {
    simpleNotes:
      'Apel Merah manis segar, Daun Tembakau hangat, & Patchouli maskulin memikat',
    searchKeywords: 'apel manis tembakau hangat malam ngedate nongkrong pemikat',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT'],
    momentBadges: [
      '🌙 Nongkrong Malam & Cafe',
      '❤️ Ngedate / Pemikat Cewek',
    ],
    climateCategory: 'NIGHT_AC',
  },
  80: {
    simpleNotes:
      'Ekstra dosis Bourbon Vanilla pekat mewah, Liqueur Rum manis, & Melati malam',
    searchKeywords: 'vanilla manis pekat bunga malam ngedate kondangan cewek',
    momentKeys: ['NIGHT_CAFE', 'DATE_ATTRACT', 'SULTAN_GALA'],
    momentBadges: [
      '🌙 Nongkrong Malam',
      '❤️ Pemikat Manis Mewah',
      '👑 Pesta & Kondangan Malam',
    ],
    climateCategory: 'NIGHT_AC',
  },
  81: {
    simpleNotes:
      'Buah Blackcurrant segar, Tiga Bunga Melati mewah, & Bourbon Vanilla kayu kasmir',
    searchKeywords: 'vanilla melati buah manis segar ngedate kantor cewek',
    momentKeys: ['DATE_ATTRACT', 'OFFICE_AC', 'NIGHT_CAFE', 'HOT_DAY'],
    momentBadges: [
      '❤️ Ngedate & Pemikat',
      '🏢 Kantor AC',
      '🌙 Nongkrong Siang/Malam',
    ],
    climateCategory: 'HOT_SAFE',
  },
};

export const CONCIERGE_81_GUIDE: ConciergeGuideEntry[] = VORVAN_81_CATALOG.map(
  (sku) => {
    const meta = CONCIERGE_81_META[sku.no] || {
      simpleNotes: 'Komposisi aroma mewah khas Eropa dengan ketahanan tinggi',
      searchKeywords: 'mewah segar manis',
      momentKeys: ['OFFICE_AC', 'DATE_ATTRACT'],
      momentBadges: ['🏢 Kantor AC', '❤️ Ngedate Mewah'],
      climateCategory: 'HOT_SAFE' as ConciergeClimateCategory,
    };

    return {
      ...sku,
      simpleNotes: meta.simpleNotes,
      searchKeywords: meta.searchKeywords,
      momentKeys: meta.momentKeys,
      momentBadges: meta.momentBadges,
      climateCategory: meta.climateCategory,
      climateAdvice: CLIMATE_ADVICE_LABELS[meta.climateCategory],
    };
  }
);
