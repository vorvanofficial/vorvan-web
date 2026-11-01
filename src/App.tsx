import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Compass,
  FileCheck2,
  Globe,
  Mail,
  MessageCircle,
  PackageSearch,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  CURATED_FRAGRANCE_HOUSES,
  FRAGRANCE_CATALOG,
  INITIAL_CONCIERGE_EMAIL_LEADS,
} from './data/catalog';
import {
  ConciergeEmailLead,
  CustomAdminOrder,
  FragranceItem,
  VorvanSiteSettings,
} from './types/fragrance';
import {
  buildSmartShareUrl,
  buildTelegramInquiryUrl,
  buildWhatsAppInquiryUrl,
  decodeSmartOrderParam,
  encodeSmartOrderParam,
  loadCustomAdminOrders,
  loadVorvanSettings,
  saveCustomAdminOrders,
  saveVorvanSettings,
} from './utils/businessRules';
import {
  mergeCustomAdminOrders,
  mergeVisitorLeads,
  pullCloudVaultState,
  pushCloudVaultPacket,
  sendAdminOrderBackupToGmail,
  sendVisitorLeadToGmail,
} from './utils/cloudSync';
import { VorvanCrestImage } from './components/VorvanLogo';
import { WelcomeSplashScreen } from './components/WelcomeSplashScreen';
import { FragranceCard } from './components/FragranceCard';
import { FragranceDossierModal } from './components/FragranceDossierModal';
import { BrandHierarchyExplorer } from './components/BrandHierarchyExplorer';
import {
  AdminEmailRegistryModal,
  EmailGatewayModal,
} from './components/EmailGatewayModal';
import { PrivateInvoiceView } from './components/PrivateInvoiceView';
import { OrderTrackingView } from './components/OrderTrackingView';
import { ReturnPolicyContent } from './components/ReturnPolicySection';
import {
  B2BWholesaleModal,
  PreOrderConciergeSection,
} from './components/PreOrderAndB2BSection';
import {
  LiquidLuxuryBackground,
  LuxuryScrollBubbles,
  ParallaxSectionBg,
  ScrollReveal,
} from './components/ScrollAnimations';
import {
  getTranslation,
  SUPPORTED_LOCALES,
  SupportedLocale,
} from './i18n/translations';

type ActiveRoute =
  | { view: 'showroom' }
  | { view: 'track'; query?: string; smartOrder?: CustomAdminOrder | null }
  | { view: 'invoice'; invoiceId: string; smartOrder?: CustomAdminOrder | null };

function parseCurrentLocation(): ActiveRoute {
  if (typeof window === 'undefined') return { view: 'showroom' };
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const encodedOrder = params.get('v') || params.get('order');
  const decodedSmartOrder = encodedOrder
    ? decodeSmartOrderParam(encodedOrder)
    : null;

  if (path.startsWith('/track')) {
    const pathTrackId = path.startsWith('/track/')
      ? decodeURIComponent(path.replace('/track/', '')).trim()
      : '';
    const code =
      params.get('resi') ||
      pathTrackId ||
      (decodedSmartOrder
        ? decodedSmartOrder.trackingId || decodedSmartOrder.awbNumber
        : '');
    return {
      view: 'track',
      query: code,
      smartOrder: decodedSmartOrder,
    };
  }

  if (path.startsWith('/pay/')) {
    const rawId = decodeURIComponent(path.replace('/pay/', '')).trim();
    return {
      view: 'invoice',
      invoiceId: rawId
        ? rawId.toUpperCase()
        : decodedSmartOrder?.invoiceId || '',
      smartOrder: decodedSmartOrder,
    };
  }

  if (path === '/pay') {
    return {
      view: 'invoice',
      invoiceId: decodedSmartOrder?.invoiceId || '',
      smartOrder: decodedSmartOrder,
    };
  }

  if (decodedSmartOrder) {
    return {
      view: 'invoice',
      invoiceId: decodedSmartOrder.invoiceId,
      smartOrder: decodedSmartOrder,
    };
  }

  return { view: 'showroom' };
}

function shouldShowSplashOnBoot(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (
    params.get('autostart') === '1' ||
    params.get('v') ||
    params.get('order')
  ) {
    return false;
  }
  if (
    window.location.pathname.startsWith('/pay') ||
    window.location.pathname.startsWith('/track')
  ) {
    return false;
  }
  return true;
}

const STORAGE_EMAIL_KEY = 'vorvan_concierge_client_email';
const STORAGE_LEADS_KEY = 'vorvan_concierge_leads_log';
const STORAGE_LOCALE_KEY = 'vorvan_international_locale';

/**
 * Viewport-Culled Hardware-Accelerated Ticker for Curated Fragrance Houses.
 * Avoids 13,000px+ GPU mega-textures so mobile pinch-zoom and scrolling stay at locked 60/120fps
 * and tiles are never evicted by the mobile browser compositor.
 */
const CuratedHousesTicker: React.FC = React.memo(() => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isPausedRef = useRef<boolean>(false);
  const offsetRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const count = CURATED_FRAGRANCE_HOUSES.length;
    const widths = new Float64Array(count);
    const starts = new Float64Array(count);
    const wasVisible = new Array<boolean>(count).fill(true);
    let totalWidth = 0;
    let viewportWidth = container.clientWidth || window.innerWidth || 390;

    const applyPositions = (forceAll = false) => {
      if (totalWidth <= 0) return;
      const currentOffset = offsetRef.current;

      for (let i = 0; i < count; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const w = widths[i];
        let x = (starts[i] - currentOffset) % totalWidth;
        if (x < -w) {
          x += totalWidth;
        }

        const isVisible = x <= viewportWidth + 120 && x + w >= -120;
        if (isVisible) {
          if (forceAll || !wasVisible[i]) {
            el.style.visibility = 'visible';
            wasVisible[i] = true;
          }
          el.style.transform = `translate3d(${x.toFixed(2)}px, 0px, 0px)`;
        } else if (forceAll || wasVisible[i]) {
          el.style.visibility = 'hidden';
          el.style.transform = 'translate3d(-9999px, 0px, 0px)';
          wasVisible[i] = false;
        }
      }
    };

    const measureLayout = () => {
      if (!container) return;
      viewportWidth = container.clientWidth || window.innerWidth || 390;
      let runningStart = 0;
      for (let i = 0; i < count; i++) {
        const el = itemRefs.current[i];
        const w = el ? el.offsetWidth || 310 : 310;
        widths[i] = w;
        starts[i] = runningStart;
        runningStart += w;
      }
      totalWidth = runningStart;
      if (totalWidth > 0) {
        offsetRef.current = offsetRef.current % totalWidth;
      }
      applyPositions(true);
    };

    measureLayout();

    if (typeof document !== 'undefined' && 'fonts' in document) {
      (document as Document & { fonts: FontFaceSet }).fonts.ready
        .then(() => {
          measureLayout();
        })
        .catch(() => {});
    }

    let rafId: number | null = null;
    let lastTime: number | null = null;
    const speedPxPerSec = 52;

    const tick = (now: number) => {
      const dt =
        lastTime !== null ? Math.min((now - lastTime) / 1000, 0.05) : 0;
      lastTime = now;

      if (!isPausedRef.current && totalWidth > 0 && dt > 0) {
        offsetRef.current =
          (offsetRef.current + dt * speedPxPerSec) % totalWidth;
        applyPositions(false);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    const handleResize = () => {
      measureLayout();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-testid="curated-houses-marquee"
      className="relative z-10 w-full overflow-hidden h-[56px] sm:h-[64px] select-none"
      onMouseEnter={() => {
        isPausedRef.current = true;
      }}
      onMouseLeave={() => {
        isPausedRef.current = false;
      }}
    >
      {CURATED_FRAGRANCE_HOUSES.map((brand, idx) => (
        <div
          key={brand.name}
          ref={(el) => {
            itemRefs.current[idx] = el;
          }}
          className="absolute top-0 left-0 h-full flex items-center gap-14 sm:gap-16 pr-14 sm:pr-16 shrink-0 group will-change-transform"
          style={{
            transform: 'translate3d(0px, 0px, 0px)',
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="flex flex-col items-center justify-center text-center opacity-90 hover:opacity-100 transition-opacity">
            <span className="font-brand text-base sm:text-xl tracking-[0.26em] text-[#F5E6B8] whitespace-nowrap">
              {brand.name}
            </span>
            <span className="font-latin-italic text-xs tracking-widest text-[#D8BE82] mt-1 whitespace-nowrap">
              {brand.origin} · {brand.est}
            </span>
          </div>
          <span
            className="w-1.5 h-1.5 rotate-45 bg-[#D4AF37]/70 inline-block shrink-0"
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  );
});

export default function App() {
  const [route, setRoute] = useState<ActiveRoute>(() => parseCurrentLocation());
  const [showSplash, setShowSplash] = useState<boolean>(() =>
    shouldShowSplashOnBoot()
  );
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // International Language State
  const [locale, setLocale] = useState<SupportedLocale>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LOCALE_KEY) as SupportedLocale;
      if (saved && SUPPORTED_LOCALES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'ID';
  });

  const t = getTranslation(locale);

  // Concierge Passwordless Email Gateway State
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_EMAIL_KEY) || null;
    } catch {
      return null;
    }
  });
  const [emailLeads, setEmailLeads] = useState<ConciergeEmailLead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LEADS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CONCIERGE_EMAIL_LEADS;
  });
  const [emailGatewayOpen, setEmailGatewayOpen] = useState<boolean>(false);
  const [pendingInquiry, setPendingInquiry] = useState<{
    fragrance: FragranceItem;
    volume: string;
  } | null>(null);
  const [emailToastMessage, setEmailToastMessage] = useState<string | null>(
    null
  );
  const [adminLogModalOpen, setAdminLogModalOpen] = useState<boolean>(false);

  // Dynamic Site Settings & Custom Admin Orders
  const [siteSettings, setSiteSettings] = useState<VorvanSiteSettings>(() =>
    loadVorvanSettings()
  );
  const [customOrders, setCustomOrders] = useState<CustomAdminOrder[]>(() =>
    loadCustomAdminOrders()
  );

  // Secret 5x Logo Tap Detector for Admin Console
  const logoTapCountRef = useRef<number>(0);
  const logoTapTimerRef = useRef<number | null>(null);

  const handleLogoSecretTap = (e: React.MouseEvent) => {
    e.preventDefault();
    logoTapCountRef.current += 1;
    if (logoTapTimerRef.current) {
      window.clearTimeout(logoTapTimerRef.current);
    }
    if (logoTapCountRef.current >= 5) {
      logoTapCountRef.current = 0;
      setAdminLogModalOpen(true);
      return;
    }
    logoTapTimerRef.current = window.setTimeout(() => {
      logoTapCountRef.current = 0;
    }, 2200);
    navigateToShowroom();
  };

  // Modals state
  const [selectedDossier, setSelectedDossier] = useState<{
    fragrance: FragranceItem;
    volume: string;
  } | null>(null);
  const [returnPolicyModalOpen, setReturnPolicyModalOpen] =
    useState<boolean>(false);
  const [b2bModalOpen, setB2BModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseCurrentLocation());
    };
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const nextScrolled = window.scrollY > 24;
        setIsScrolled((prev) => (prev !== nextScrolled ? nextScrolled : prev));
      });
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Cross-device & Incognito Cloud Sync function (pulls leads & orders from shared Cloud Vault)
  const syncFromCloudVault = React.useCallback(async () => {
    const cloudData = await pullCloudVaultState();
    if (!cloudData) return;

    if (cloudData.leads.length > 0) {
      setEmailLeads((prev) => {
        const merged = mergeVisitorLeads(prev, cloudData.leads);
        try {
          localStorage.setItem(STORAGE_LEADS_KEY, JSON.stringify(merged));
        } catch {
          // ignore
        }
        return merged;
      });
    }

    if (cloudData.orders.length > 0 || cloudData.deletedInvoiceIds.size > 0) {
      setCustomOrders((prev) => {
        const merged = mergeCustomAdminOrders(
          prev,
          cloudData.orders,
          cloudData.deletedInvoiceIds
        );
        saveCustomAdminOrders(merged);
        return merged;
      });
    }
  }, []);

  // Sync on boot, when opening Admin Console, or when visiting Invoice/Tracking views
  useEffect(() => {
    void syncFromCloudVault();
  }, [syncFromCloudVault, adminLogModalOpen, route.view]);

  // Cache order locally when opened via `?v=...` Smart URL while keeping `?v=...` intact in the address bar for Incognito / cross-device copy-paste
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (route.view === 'invoice' || route.view === 'track') {
      const smartOrd = route.smartOrder;
      if (smartOrd) {
        setCustomOrders((prev) => {
          const exists = prev.some(
            (o) =>
              o.invoiceId.toUpperCase() === smartOrd.invoiceId.toUpperCase()
          );
          const next = exists
            ? prev.map((o) =>
                o.invoiceId.toUpperCase() === smartOrd.invoiceId.toUpperCase()
                  ? smartOrd
                  : o
              )
            : [smartOrd, ...prev];
          saveCustomAdminOrders(next);
          return next;
        });

        const token = encodeSmartOrderParam(smartOrd);
        if (route.view === 'invoice') {
          const cleanInvId = (
            route.invoiceId ||
            smartOrd.invoiceId ||
            ''
          ).toUpperCase();
          if (cleanInvId && token) {
            window.history.replaceState(
              null,
              '',
              `/pay/${cleanInvId}?v=${encodeURIComponent(token)}`
            );
          }
        } else if (route.view === 'track') {
          const cleanTrackId = (
            route.query ||
            smartOrd.trackingId ||
            smartOrd.awbNumber ||
            ''
          ).trim();
          if (cleanTrackId && token) {
            window.history.replaceState(
              null,
              '',
              `/track/${encodeURIComponent(cleanTrackId)}?v=${encodeURIComponent(
                token
              )}`
            );
          }
        }
      }
    }
  }, [route]);

  const handleChangeLocale = (nextLocale: SupportedLocale) => {
    setLocale(nextLocale);
    try {
      localStorage.setItem(STORAGE_LOCALE_KEY, nextLocale);
    } catch {
      // ignore
    }
  };

  const navigateToShowroom = (sectionHash?: string) => {
    window.history.pushState({}, '', sectionHash ? `/#${sectionHash}` : '/');
    setRoute({ view: 'showroom' });
    if (sectionHash) {
      setTimeout(() => {
        const el = document.getElementById(sectionHash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 40);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToInvoice = (
    invoiceId: string = '',
    smartOrder?: CustomAdminOrder | null
  ) => {
    const cleanId = invoiceId.trim().toUpperCase();
    const matchedOrder =
      smartOrder ||
      customOrders.find(
        (o) =>
          o.invoiceId.toUpperCase() === cleanId ||
          o.awbNumber.toUpperCase() === cleanId ||
          o.trackingId.toUpperCase() === cleanId
      ) ||
      null;
    const token = matchedOrder ? encodeSmartOrderParam(matchedOrder) : '';
    const nextUrl = cleanId
      ? `/pay/${cleanId}${token ? `?v=${encodeURIComponent(token)}` : ''}`
      : '/pay';
    window.history.pushState({}, '', nextUrl);
    setRoute({ view: 'invoice', invoiceId: cleanId, smartOrder: matchedOrder });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToTrack = (
    trackingQuery: string = '',
    smartOrder?: CustomAdminOrder | null
  ) => {
    const clean = trackingQuery.trim().toUpperCase();
    const matchedOrder =
      smartOrder ||
      customOrders.find(
        (o) =>
          o.awbNumber.toUpperCase() === clean ||
          o.invoiceId.toUpperCase() === clean ||
          o.trackingId.toUpperCase() === clean
      ) ||
      null;
    const token = matchedOrder ? encodeSmartOrderParam(matchedOrder) : '';
    const nextUrl = clean
      ? `/track/${encodeURIComponent(clean)}${
          token ? `?v=${encodeURIComponent(token)}` : ''
        }`
      : '/track';
    window.history.pushState({}, '', nextUrl);
    setRoute({ view: 'track', query: clean, smartOrder: matchedOrder });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerInquiry = (
    fragrance: FragranceItem,
    selectedVolume: string
  ) => {
    if (!registeredEmail) {
      setPendingInquiry({ fragrance, volume: selectedVolume });
      setEmailGatewayOpen(true);
      return;
    }
    const waUrl = buildWhatsAppInquiryUrl(
      fragrance,
      selectedVolume,
      undefined,
      registeredEmail
    );
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEmailRegistered = (normalizedEmail: string) => {
    setRegisteredEmail(normalizedEmail);
    try {
      localStorage.setItem(STORAGE_EMAIL_KEY, normalizedEmail);
    } catch {
      // ignore
    }

    const waktuDaftar = new Date().toLocaleString('id-ID');
    const leadId = `LEAD-VRV-0${emailLeads.length + 1}`;
    const fragranceContext = pendingInquiry
      ? `${pendingInquiry.fragrance.house} — ${pendingInquiry.fragrance.name} (${pendingInquiry.volume})`
      : 'Akses Concierge Katalog';

    const newLead: ConciergeEmailLead = {
      id: leadId,
      email: normalizedEmail,
      registeredAt: `${waktuDaftar} WIB`,
      triggeredByFragrance: fragranceContext,
      syncedToVorvanMail: true,
    };

    const updatedLeads = mergeVisitorLeads(emailLeads, [newLead]);
    setEmailLeads(updatedLeads);
    try {
      localStorage.setItem(STORAGE_LEADS_KEY, JSON.stringify(updatedLeads));
    } catch {
      // ignore
    }

    // 1. Real HTTP POST to vorvanlifestyle@gmail.com via FormSubmit AJAX
    void sendVisitorLeadToGmail({
      leadId,
      visitorEmail: normalizedEmail,
      triggeredByFragrance: fragranceContext,
      waktuDaftar,
      sumberWeb:
        typeof window !== 'undefined'
          ? window.location.href
          : 'https://vorvan-official.vercel.app',
    });

    // 2. Sync to shared VORVAN Cloud Vault so Admin Tab 3 sees it across devices & Incognito tabs
    void pushCloudVaultPacket({
      kind: 'VORVAN_LEAD',
      lead: newLead,
      ts: Date.now(),
    });

    setEmailGatewayOpen(false);
    setEmailToastMessage(
      `Email Anda telah terdaftar & terkirim ke ${siteSettings.conciergeEmail}`
    );
  };

  const handleUpdateSiteSettings = (nextSettings: VorvanSiteSettings) => {
    setSiteSettings(nextSettings);
    saveVorvanSettings(nextSettings);
  };

  const handleCreateCustomOrder = (newOrder: CustomAdminOrder) => {
    const updated = [
      newOrder,
      ...customOrders.filter(
        (o) => o.invoiceId.toUpperCase() !== newOrder.invoiceId.toUpperCase()
      ),
    ];
    setCustomOrders(updated);
    saveCustomAdminOrders(updated);

    // Sync to shared Cloud Vault for cross-device / Incognito lookup
    void pushCloudVaultPacket({
      kind: 'VORVAN_ORDER_UPSERT',
      order: newOrder,
      ts: Date.now(),
    });

    // Send real backup notification to vorvanlifestyle@gmail.com
    const invUrl = buildSmartShareUrl(newOrder, 'invoice');
    const trkUrl = buildSmartShareUrl(newOrder, 'track');
    void sendAdminOrderBackupToGmail(newOrder, invUrl, trkUrl);
  };

  const handleUpdateCustomOrderStage = (
    invoiceId: string,
    stage: 1 | 2 | 3 | 4
  ) => {
    const updated = customOrders.map((o) =>
      o.invoiceId === invoiceId ? { ...o, shippingStage: stage } : o
    );
    setCustomOrders(updated);
    saveCustomAdminOrders(updated);
  };

  const handleUpdateCustomOrderStatus = (
    invoiceId: string,
    status: 'PENDING_PAYMENT' | 'PAID'
  ) => {
    const updated = customOrders.map((o) =>
      o.invoiceId === invoiceId ? { ...o, status } : o
    );
    setCustomOrders(updated);
    saveCustomAdminOrders(updated);

    void pushCloudVaultPacket({
      kind: 'VORVAN_ORDER_STATUS',
      invoiceId,
      status,
      ts: Date.now(),
    });
  };

  const handleDeleteCustomOrder = (invoiceId: string) => {
    const updated = customOrders.filter((o) => o.invoiceId !== invoiceId);
    setCustomOrders(updated);
    saveCustomAdminOrders(updated);

    void pushCloudVaultPacket({
      kind: 'VORVAN_ORDER_DELETE',
      invoiceId,
      ts: Date.now(),
    });
  };

  const apexShowcaseIds = [
    'mfk-br540-extrait',
    'lv-ombre-nomade',
    'creed-aventus',
    'le-labo-santal-33',
  ];
  const urbanShowcaseIds = [
    'dior-sauvage-edp',
    'chanel-bleu-parfum',
    'ysl-libre-edp',
    'jpg-le-male-elixir',
  ];

  const apexFragrances = apexShowcaseIds
    .map((id) => FRAGRANCE_CATALOG.find((item) => item.id === id))
    .filter((item): item is FragranceItem => Boolean(item));

  const urbanFragrances = urbanShowcaseIds
    .map((id) => FRAGRANCE_CATALOG.find((item) => item.id === id))
    .filter((item): item is FragranceItem => Boolean(item));

  const rawWaDigits = siteSettings.whatsappNumber.replace(/\D/g, '');
  const normalizedWa = rawWaDigits.startsWith('0')
    ? `62${rawWaDigits.slice(1)}`
    : rawWaDigits || '628133866590';
  const cleanTelegram =
    siteSettings.telegramUsername.replace(/^@/, '') || 'vorvanofficial';

  const generalConciergeMessage =
    'Halo Concierge VORVAN, saya ingin berkonsultasi mengenai koleksi parfum Original Parallel Import (Privilege Efisiensi Valuasi 20%–30%) dan mengecek ketersediaan unit di Vault.';

  const generalConciergeWaUrl = `https://wa.me/${normalizedWa}?text=${encodeURIComponent(
    generalConciergeMessage
  )}`;
  const generalConciergeTgUrl = `https://t.me/${cleanTelegram}?text=${encodeURIComponent(
    generalConciergeMessage
  )}`;

  return (
    <div
      dir={locale === 'AR' ? 'rtl' : 'ltr'}
      className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#0B0A0E] text-[#FAF8F5] flex flex-col relative"
    >
      {/* 1. CINEMATIC WELCOME SPLASH SCREEN (EXTENDED 5.4s DURATION) */}
      <WelcomeSplashScreen
        isOpen={showSplash}
        onEnterVault={() => setShowSplash(false)}
        locale={locale}
      />

      {/* 2. LIQUID LUXURY DRIFTING MESH GRADIENT & EFFERVESCENT PERFUME BUBBLES */}
      <LiquidLuxuryBackground />
      <LuxuryScrollBubbles />

      {/* STRICT 3-ZONE TOP BAR CONTRACT WITH INTERNATIONAL LANGUAGE SELECTOR & DUAL-CONCIERGE */}
      <header
        className={`sticky top-0 z-40 w-full max-w-[100vw] transition-colors duration-200 ${
          isScrolled
            ? 'bg-[#0B0A0E]/92 backdrop-blur-md border-b border-[#D4AF37]/35'
            : 'bg-[#0B0A0E]/85 backdrop-blur-xs border-b border-[#D4AF37]/20'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-1.5 sm:gap-4 lg:gap-6 px-3 sm:px-6 lg:px-8 h-14 sm:h-16">
          {/* Zone 1: Single brand element with semi-gold wordmark — 5x Tap Opens Secret Admin Gate */}
          <div className="flex items-center justify-start shrink-0">
            <a
              href="/"
              onClick={handleLogoSecretTap}
              className="inline-flex items-center font-brand text-sm sm:text-lg lg:text-xl font-semibold tracking-[0.2em] sm:tracking-[0.28em] text-gold-shimmer whitespace-nowrap shrink-0 bg-transparent border-none select-none cursor-pointer"
              data-testid="vorvan-header-logo"
            >
              <span>VORVAN</span>
            </a>
          </div>

          {/* Zone 2: 5 concise single-line navigation links centered on Desktop */}
          <nav
            className="hidden lg:flex items-center justify-center gap-4 xl:gap-6 font-brand text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-300 shrink-0"
            aria-label="Primary Navigation"
          >
            <button
              type="button"
              onClick={() => navigateToShowroom('brand-hierarchy-explorer')}
              className={`font-brand text-[11px] font-medium uppercase tracking-[0.15em] hover:text-[#F5E6B8] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                route.view === 'showroom' ? 'text-[#E5C87E]' : ''
              }`}
            >
              {t.nav.showroom}
            </button>
            <button
              type="button"
              onClick={() => navigateToShowroom('preorder-concierge')}
              className="font-brand text-[11px] font-medium uppercase tracking-[0.15em] hover:text-[#F5E6B8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.preOrder}
            </button>
            <button
              type="button"
              onClick={() => navigateToTrack('')}
              className={`font-brand text-[11px] font-medium uppercase tracking-[0.15em] hover:text-[#F5E6B8] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                route.view === 'track'
                  ? 'text-[#E5C87E] underline underline-offset-8'
                  : ''
              }`}
            >
              {t.nav.trackOrder}
            </button>
            <button
              type="button"
              onClick={() => navigateToInvoice('')}
              className={`font-brand text-[11px] font-medium uppercase tracking-[0.15em] hover:text-[#F5E6B8] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                route.view === 'invoice'
                  ? 'text-[#E5C87E] underline underline-offset-8'
                  : ''
              }`}
            >
              {t.nav.privateInvoice}
            </button>
            <button
              type="button"
              onClick={() => setReturnPolicyModalOpen(true)}
              className="font-brand text-[11px] font-medium uppercase tracking-[0.15em] hover:text-[#F5E6B8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.returnPolicy}
            </button>
          </nav>

          {/* Zone 3: International Language Selector + Dual-Concierge (WhatsApp + Telegram VIP) */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">
            {/* Compact International Language Selector (Displays 🌐 ID) */}
            <div className="relative flex items-center gap-1 bg-[#14131B] border border-[#D4AF37]/45 rounded-lg px-2 sm:px-2.5 py-1.5">
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E5C87E] shrink-0" />
              <label htmlFor="vorvan-locale-select" className="sr-only">
                Pilih Bahasa Internasional
              </label>
              <select
                id="vorvan-locale-select"
                data-testid="language-selector"
                value={locale}
                onChange={(e) =>
                  handleChangeLocale(e.target.value as SupportedLocale)
                }
                aria-label="International Language Selector"
                className="bg-transparent font-brand text-[10px] sm:text-xs font-bold text-[#F5E6B8] uppercase tracking-wider outline-none cursor-pointer"
              >
                {SUPPORTED_LOCALES.map((loc) => (
                  <option
                    key={loc.code}
                    value={loc.code}
                    className="bg-[#111016] text-[#FAF8F5]"
                  >
                    {loc.code}
                  </option>
                ))}
              </select>
            </div>

            <a
              href={generalConciergeWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!registeredEmail) {
                  e.preventDefault();
                  setPendingInquiry(null);
                  setEmailGatewayOpen(true);
                }
              }}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg btn-luxury-gold font-brand text-[10px] sm:text-xs font-bold uppercase tracking-[0.06em] sm:tracking-[0.12em] transition-all whitespace-nowrap shrink-0 inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer"
              data-testid="header-concierge-cta"
            >
              <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-zinc-950" />
              <span>CONCIERGE WA</span>
            </a>

            <a
              href={generalConciergeTgUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!registeredEmail) {
                  e.preventDefault();
                  setPendingInquiry(null);
                  setEmailGatewayOpen(true);
                }
              }}
              className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-[#14131B] hover:bg-[#1E1C2A] border border-[#D4AF37]/45 text-[#F5E6B8] font-brand text-[10px] sm:text-xs font-semibold uppercase tracking-[0.06em] sm:tracking-[0.1em] transition-all whitespace-nowrap shrink-0 inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer"
              data-testid="header-telegram-cta"
              title="Telegram VIP @vorvanofficial"
            >
              <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-[#E5C87E]" />
              <span className="hidden sm:inline">TELEGRAM</span>
              <span className="sm:hidden">TG</span>
            </a>
          </div>
        </div>
      </header>

      {/* Email Registration Confirmation Notification Bar (No Public Admin Button) */}
      {emailToastMessage && (
        <div
          className="bg-[#14131B] border-b border-[#D4AF37]/40 px-4 py-3 text-xs animate-fade-up relative z-30"
          role="status"
          data-testid="email-registered-notification"
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{emailToastMessage}</span>
              {registeredEmail && (
                <span className="font-mono-tabular text-[#E5C87E]">
                  ({registeredEmail})
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {pendingInquiry && (
                <>
                  <a
                    href={buildWhatsAppInquiryUrl(
                      pendingInquiry.fragrance,
                      pendingInquiry.volume,
                      undefined,
                      registeredEmail || undefined
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F5E6B8] underline underline-offset-4 font-semibold uppercase tracking-widest inline-flex items-center gap-1"
                  >
                    <span>
                      WhatsApp ({pendingInquiry.fragrance.name})
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={buildTelegramInquiryUrl(
                      pendingInquiry.fragrance,
                      pendingInquiry.volume,
                      undefined,
                      registeredEmail || undefined
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E5C87E] underline underline-offset-4 font-semibold uppercase tracking-widest inline-flex items-center gap-1"
                  >
                    <span>
                      Telegram VIP (@{cleanTelegram})
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </>
              )}
              <button
                type="button"
                onClick={() => setEmailToastMessage(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                Tutup ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN VIEW ROUTER */}
      <main className="flex-1 relative z-10 w-full max-w-[100vw] overflow-x-hidden">
        {route.view === 'invoice' && (
          <PrivateInvoiceView
            invoiceId={route.invoiceId}
            smartOrder={route.smartOrder}
            customOrders={customOrders}
            settings={siteSettings}
            onSelectInvoiceId={(newId) => navigateToInvoice(newId)}
            onBackToCatalog={() => navigateToShowroom()}
            onOpenOrderTracking={(resi) =>
              navigateToTrack(resi, route.smartOrder)
            }
          />
        )}

        {route.view === 'track' && (
          <OrderTrackingView
            initialQuery={route.query}
            smartOrder={route.smartOrder}
            customOrders={customOrders}
            settings={siteSettings}
            onBackToCatalog={() => navigateToShowroom()}
            onOpenInvoice={(invId) => navigateToInvoice(invId, route.smartOrder)}
          />
        )}

        {route.view === 'showroom' && (
          <>
            {/* 1. HERO SECTION — RICH SEMI-GOLD PARALLAX FILIGREE, CENTERED PRECISION & CALLIGRAPHIC LATIN */}
            <section className="relative overflow-hidden border-b border-[#D4AF37]/25 py-16 sm:py-24 lg:py-28">
              <ParallaxSectionBg
                speed={0.22}
                tone="champagne"
                watermarkText="I · HAUTE PARFUMERIE"
                align="center"
                testId="parallax-bg-hero"
              />

              <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <ScrollReveal variant="scale" className="space-y-6">
                  {/* Calligraphic Latin Script Crown in Champagne Semi-Gold */}
                  <p className="font-latin-script text-3xl sm:text-4xl text-gold-champagne tracking-wide">
                    {t.hero.scriptCrown}
                  </p>

                  {/* Unboxed Editorial Kicker: ORIGINAL PARALLEL IMPORT LUXURY FRAGRANCE */}
                  <div
                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 font-brand text-[10px] sm:text-xs text-[#E5C87E] uppercase tracking-[0.22em] font-semibold text-center"
                    data-testid="hero-kicker-subtitle"
                  >
                    <span>{t.hero.kickerLeft}</span>
                    <span
                      aria-hidden="true"
                      className="hidden sm:inline text-[#D4AF37]"
                    >
                      •
                    </span>
                    <span className="text-[#FAF8F5]/90">
                      {t.hero.kickerRight}
                    </span>
                  </div>

                  {/* Main Editorial Headline with Semi-Gold Shimmer */}
                  <h1
                    className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-semibold text-gold-shimmer leading-[1.15] tracking-wide mx-auto"
                    style={{ textWrap: 'balance' }}
                    data-testid="hero-headline"
                  >
                    {t.hero.headline}
                  </h1>

                  {/* Flowing Classical Italic Narrative */}
                  <p className="font-latin-italic text-lg sm:text-xl text-zinc-200 max-w-2xl mx-auto leading-[1.75]">
                    {t.hero.narrativePrefix}
                    <strong className="font-brand text-[#E5C87E] font-semibold not-italic tracking-widest">
                      VORVAN
                    </strong>
                    {t.hero.narrativeMiddle}
                    <span className="text-[#F5E6B8] underline decoration-[#D4AF37]/70 underline-offset-4">
                      {t.hero.narrativePriceOnRequest}
                    </span>
                    {t.hero.narrativeSuffix}
                  </p>

                  {/* Symmetrical Mobile-First Action Buttons */}
                  <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 max-w-md sm:max-w-none mx-auto">
                    <button
                      type="button"
                      onClick={() =>
                        navigateToShowroom('brand-hierarchy-explorer')
                      }
                      className="w-full sm:w-auto min-h-[50px] px-7 py-3.5 rounded-xl btn-luxury-gold font-brand text-xs font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>{t.hero.ctaExploreHouses}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateToInvoice('')}
                      className="w-full sm:w-auto min-h-[50px] px-6 py-3.5 rounded-xl bg-[#14131B] hover:bg-[#1C1A26] text-[#F5E6B8] border border-[#D4AF37]/45 font-brand text-xs font-semibold uppercase tracking-[0.18em] transition-all active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <FileCheck2 className="w-4 h-4 text-[#E5C87E] shrink-0" />
                      <span>{t.hero.ctaPrivateInvoice}</span>
                    </button>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {/* 2. SECTION EDUKASI: THE PARALLEL IMPORT ADVANTAGE */}
            <section
              id="parallel-import-advantage"
              className="relative overflow-hidden py-16 sm:py-20 bg-[#100F15]/65 border-b border-[#D4AF37]/25"
              data-testid="parallel-import-section"
            >
              <ParallaxSectionBg
                speed={0.16}
                tone="champagne"
                watermarkText="II · L’ALLOCATION DIRECTE"
                align="left"
                testId="parallax-bg-parallel-import"
              />
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
                <ScrollReveal variant="up">
                  <div className="flex flex-col md:flex-row items-center md:items-end justify-between text-center md:text-left gap-5 pb-8 border-b border-[#D4AF37]/25">
                    <div className="space-y-1.5">
                      <p className="font-latin-script text-2xl sm:text-3xl text-gold-champagne">
                        {t.parallelImport.scriptCrown}
                      </p>
                      <p className="font-brand text-[10px] sm:text-xs uppercase tracking-[0.24em] text-[#D8BE82]">
                        {t.parallelImport.kicker}
                      </p>
                      <h2 className="font-serif-luxury text-3xl sm:text-4xl font-semibold text-white tracking-wide">
                        {t.parallelImport.title}
                      </h2>
                    </div>
                    <p className="font-latin-italic text-base sm:text-lg text-zinc-200 max-w-md leading-relaxed">
                      {t.parallelImport.subtitle}
                    </p>
                  </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  {t.parallelImport.pillars.map((pillar, idx) => {
                    const isValuationBox = idx === 2;
                    return (
                      <ScrollReveal
                        key={pillar.subtitle}
                        variant={
                          idx === 0 ? 'left' : idx === 1 ? 'up' : 'right'
                        }
                        delayMs={idx * 90}
                        className="h-full"
                      >
                        <div
                          className={`h-full p-6 sm:p-7 rounded-2xl border flex flex-col justify-between space-y-4 text-center sm:text-left animate-platinum-card ${
                            isValuationBox
                              ? 'border-[#C5A059]/40 bg-gradient-to-b from-[#17130C] to-[#0D0D0D]'
                              : 'bg-gradient-to-b from-[#16151E]/90 to-[#111017]/90 border-[#D4AF37]/30'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-center sm:justify-start font-brand text-[10px] uppercase tracking-[0.2em] text-[#D8BE82] border-b border-[#D4AF37]/20 pb-2.5">
                              <span>{pillar.subtitle}</span>
                            </div>
                            {isValuationBox && (
                              <div
                                className="pt-0.5 flex flex-col gap-1 items-center sm:items-start"
                                data-testid="parallel-import-valuation-highlight"
                              >
                                <span className="font-serif italic text-3xl md:text-4xl text-[#D4AF37] tracking-tight whitespace-nowrap">
                                  20% — 30%
                                </span>
                                <span className="text-[9px] tracking-[0.22em] text-[#C5A059]/80 uppercase">
                                  DI BAWAH VALUASI RITEL RESMI
                                </span>
                              </div>
                            )}
                            <h3 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#F5E6B8] tracking-wide">
                              {pillar.title}
                            </h3>
                            <p className="font-latin-italic text-base text-zinc-200/95 leading-[1.75]">
                              {pillar.description}
                            </p>
                          </div>
                        </div>
                      </ScrollReveal>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 3. BRAND SHOWCASE TICKER — CURATED FRAGRANCE HOUSES */}
            <section
              aria-label="Curated Fragrance Houses"
              className="relative py-10 bg-[#0A090E] border-b border-[#D4AF37]/25 overflow-hidden isolate"
            >
              <div
                aria-hidden="true"
                data-testid="parallax-bg-ticker"
                className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 45%, rgba(212, 175, 55, 0.11) 0%, rgba(63, 63, 70, 0.06) 45%, rgba(11, 10, 14, 0) 75%)',
                  }}
                />
                <div
                  className="absolute inset-0 opacity-[0.075]"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(229, 200, 126, 0.55) 1px, transparent 1px), linear-gradient(to bottom, rgba(229, 200, 126, 0.38) 1px, transparent 1px)',
                    backgroundSize: '96px 96px',
                  }}
                />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                <p className="font-brand text-[11px] uppercase tracking-[0.28em] text-[#E5C87E] font-semibold">
                  {t.ticker.title}
                </p>
                <span className="font-latin-italic text-sm tracking-widest text-[#D8BE82]">
                  {t.ticker.cities}
                </span>
              </div>

              <CuratedHousesTicker />
            </section>

            {/* 4. BRAND -> GENDER -> PARFUM INTERACTIVE HIERARCHY EXPLORER */}
            <BrandHierarchyExplorer
              registeredEmail={registeredEmail}
              locale={locale}
              onOpenDossier={(item, vol) =>
                setSelectedDossier({ fragrance: item, volume: vol })
              }
              onInquireFragrance={(item, vol) =>
                handleTriggerInquiry(item, vol)
              }
            />

            {/* 5A. CURATED SHOWROOM SECTION 1: APEX PRESTIGE (TIER 1) */}
            <section
              id="apex-prestige"
              className="relative overflow-hidden py-16 sm:py-20 border-b border-[#D4AF37]/20"
            >
              <ParallaxSectionBg
                speed={0.2}
                tone="champagne"
                watermarkText="IV · APEX PRESTIGE"
                align="left"
                testId="parallax-bg-apex"
              />
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollReveal variant="up">
                  <div className="flex flex-col md:flex-row items-center md:items-end justify-between text-center md:text-left gap-5 pb-10 border-b border-[#D4AF37]/25">
                    <div className="space-y-1.5">
                      <p className="font-latin-script text-2xl sm:text-3xl text-gold-champagne">
                        {t.tiers.apexScript}
                      </p>
                      <div className="flex items-center justify-center md:justify-start gap-2 font-brand text-[10px] sm:text-xs text-[#D8BE82] uppercase tracking-[0.24em]">
                        <span>{t.tiers.apexKicker}</span>
                      </div>
                      <h2 className="font-serif-luxury text-3xl sm:text-5xl font-semibold text-gold-shimmer tracking-wide">
                        {t.tiers.apexTitle}
                      </h2>
                    </div>
                    <p className="font-latin-italic text-base sm:text-lg text-zinc-200 max-w-md leading-relaxed">
                      {t.tiers.apexSubtitle}
                    </p>
                  </div>
                </ScrollReveal>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                  {apexFragrances.map((fragrance, idx) => (
                    <ScrollReveal
                      key={fragrance.id}
                      variant={idx % 2 === 0 ? 'up' : 'scale'}
                      delayMs={idx * 80}
                      className="h-full"
                    >
                      <FragranceCard
                        fragrance={fragrance}
                        registeredEmail={registeredEmail}
                        locale={locale}
                        onOpenDossier={(item, vol) =>
                          setSelectedDossier({ fragrance: item, volume: vol })
                        }
                        onInquireFragrance={(item, vol) =>
                          handleTriggerInquiry(item, vol)
                        }
                      />
                    </ScrollReveal>
                  ))}
                </div>

                <ScrollReveal variant="up" delayMs={240}>
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        navigateToShowroom('brand-hierarchy-explorer')
                      }
                      className="min-h-[50px] px-7 py-3.5 rounded-xl bg-[#14131B]/95 hover:bg-[#E5C87E] text-[#F5E6B8] hover:text-zinc-950 border border-[#D4AF37]/65 hover:border-[#F5E6B8] font-brand text-xs font-bold uppercase tracking-[0.18em] transition-all duration-300 shadow-[0_10px_28px_-10px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2.5 cursor-pointer"
                      data-testid="explore-all-houses-apex-btn"
                    >
                      <span>JELAJAHI SELURUH 81 KOLEKSI DI 19 HOUSES →</span>
                    </button>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {/* 5B. CURATED SHOWROOM SECTION 2: URBAN SIGNATURES (TIER 2) */}
            <section
              id="urban-signatures"
              className="relative overflow-hidden py-16 sm:py-20 bg-[#100F16]/65 border-t border-[#D4AF37]/25"
            >
              <ParallaxSectionBg
                speed={0.18}
                tone="silver"
                watermarkText="V · URBAN SIGNATURES"
                align="right"
                testId="parallax-bg-urban"
              />
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollReveal variant="up">
                  <div className="flex flex-col md:flex-row items-center md:items-end justify-between text-center md:text-left gap-5 pb-10 border-b border-[#D4AF37]/25">
                    <div className="space-y-1.5">
                      <p className="font-latin-script text-2xl sm:text-3xl text-gold-champagne">
                        {t.tiers.urbanScript}
                      </p>
                      <div className="flex items-center justify-center md:justify-start gap-2 font-brand text-[10px] sm:text-xs text-[#D8BE82] uppercase tracking-[0.24em]">
                        <span>{t.tiers.urbanKicker}</span>
                      </div>
                      <h2 className="font-serif-luxury text-3xl sm:text-5xl font-semibold text-gold-shimmer tracking-wide">
                        {t.tiers.urbanTitle}
                      </h2>
                    </div>
                    <p className="font-latin-italic text-base sm:text-lg text-zinc-200 max-w-md leading-relaxed">
                      {t.tiers.urbanSubtitle}
                    </p>
                  </div>
                </ScrollReveal>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                  {urbanFragrances.map((fragrance, idx) => (
                    <ScrollReveal
                      key={fragrance.id}
                      variant={idx % 2 === 0 ? 'up' : 'scale'}
                      delayMs={idx * 80}
                      className="h-full"
                    >
                      <FragranceCard
                        fragrance={fragrance}
                        registeredEmail={registeredEmail}
                        locale={locale}
                        onOpenDossier={(item, vol) =>
                          setSelectedDossier({ fragrance: item, volume: vol })
                        }
                        onInquireFragrance={(item, vol) =>
                          handleTriggerInquiry(item, vol)
                        }
                      />
                    </ScrollReveal>
                  ))}
                </div>

                <ScrollReveal variant="up" delayMs={240}>
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        navigateToShowroom('brand-hierarchy-explorer')
                      }
                      className="min-h-[50px] px-7 py-3.5 rounded-xl bg-[#14131B]/95 hover:bg-[#E5C87E] text-[#F5E6B8] hover:text-zinc-950 border border-[#D4AF37]/65 hover:border-[#F5E6B8] font-brand text-xs font-bold uppercase tracking-[0.18em] transition-all duration-300 shadow-[0_10px_28px_-10px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2.5 cursor-pointer"
                      data-testid="explore-all-houses-urban-btn"
                    >
                      <span>JELAJAHI SELURUH 81 KOLEKSI DI 19 HOUSES →</span>
                    </button>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {/* 6. PRIVATE INVOICE & SECURE WEB CHECKOUT BANNER */}
            <section className="relative overflow-hidden py-16 bg-[#0B0A0E]/65 border-t border-[#D4AF37]/25">
              <ParallaxSectionBg
                speed={0.15}
                tone="champagne"
                watermarkText="VI · TRANSACTION PRIVÉE"
                align="center"
                testId="parallax-bg-invoice-banner"
              />
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollReveal variant="scale">
                  <div className="p-6 sm:p-10 rounded-2xl bg-gradient-to-b from-[#16151E]/95 to-[#100F16]/95 border border-[#D4AF37]/40 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-center lg:text-left">
                    <div className="lg:col-span-8 space-y-3">
                      <p className="font-latin-script text-2xl sm:text-3xl text-gold-champagne">
                        {t.invoiceBanner.scriptCrown}
                      </p>
                      <div className="flex items-center justify-center lg:justify-start gap-2 font-brand text-[10px] sm:text-xs text-[#E5C87E] uppercase tracking-[0.24em]">
                        <span>{t.invoiceBanner.kicker}</span>
                      </div>
                      <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-white">
                        {t.invoiceBanner.title}
                      </h2>
                      <p className="font-latin-italic text-base text-zinc-200 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        {t.invoiceBanner.description}
                      </p>
                    </div>
                    <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => navigateToInvoice('')}
                        className="w-full min-h-[48px] py-3.5 px-5 rounded-xl btn-luxury-gold font-brand text-xs font-bold uppercase tracking-[0.18em] transition-all cursor-pointer"
                      >
                        {t.invoiceBanner.openInvoiceBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateToTrack('')}
                        className="w-full min-h-[48px] py-3 px-5 rounded-xl border border-[#D4AF37]/45 hover:border-[#F5E6B8] text-[#F5E6B8] hover:text-white font-brand text-xs font-semibold uppercase tracking-[0.18em] transition-colors cursor-pointer"
                      >
                        {t.invoiceBanner.trackOrderBtn}
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {/* 7. PRE-ORDER CONCIERGE (XERJOFF & AMOUAGE) */}
            <PreOrderConciergeSection
              onOpenB2BModal={() => setB2BModalOpen(true)}
              locale={locale}
            />

            {/* 8. RETURN POLICY & AUTHENTICITY GUARANTEE SECTION */}
            <ReturnPolicyContent isModal={false} locale={locale} />
          </>
        )}
      </main>

      {/* 9. FOOTER WITH STAGGERED SCROLL REVEAL, PARALLAX DEPTH & ARCHITECTURAL LUXURY CARDS */}
      <footer className="relative overflow-hidden bg-[#0B0A0E] border-t border-[#D4AF37]/35 pt-14 sm:pt-18 pb-24 lg:pb-14 text-sm z-10">
        <ParallaxSectionBg
          speed={0.12}
          tone="champagne"
          watermarkText="VORVAN · MAISON DE CONCIERGE"
          align="center"
          testId="parallax-bg-footer"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 text-center items-stretch">
            {/* Column 1: Brand Identity with Official VORVAN Transparent Logo */}
            <ScrollReveal
              variant="left"
              delayMs={0}
              className="lg:col-span-5 h-full"
            >
              <div className="h-full p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-[#14131C]/85 to-[#0D0C12]/85 border border-[#D4AF37]/25 flex flex-col items-center justify-center space-y-3">
                <div className="flex items-center justify-center bg-transparent border-none">
                  <VorvanCrestImage size="md" showTagline={true} />
                </div>
                <p className="font-latin-italic text-sm sm:text-[15px] text-zinc-300 leading-[1.75] max-w-sm mx-auto">
                  {t.footer.brandDescription}
                </p>
              </div>
            </ScrollReveal>

            {/* Column 2: Private Services (Layanan Klien) & Concierge/B2B — Centered Symmetrically */}
            <ScrollReveal
              variant="right"
              delayMs={120}
              className="lg:col-span-7 h-full"
            >
              <div className="h-full p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-[#14131C]/85 to-[#0D0C12]/85 border border-[#D4AF37]/25 grid grid-cols-1 sm:grid-cols-2 gap-7 sm:gap-5 text-xs text-center justify-items-center items-center w-full">
                <div className="space-y-3.5 flex flex-col items-center w-full pb-5 sm:pb-0 border-b sm:border-b-0 border-[#D4AF37]/15">
                  <p className="font-brand text-xs uppercase tracking-[0.22em] text-[#E5C87E] font-semibold">
                    {t.footer.clientServicesTitle}
                  </p>
                  <ul className="space-y-2.5 font-latin-italic text-sm sm:text-[15px] text-zinc-300 flex flex-col items-center">
                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          navigateToShowroom('brand-hierarchy-explorer')
                        }
                        className="hover:text-[#F5E6B8] transition-colors cursor-pointer text-center py-0.5"
                      >
                        {t.footer.explore11Houses}
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => navigateToShowroom('apex-prestige')}
                        className="hover:text-[#F5E6B8] transition-colors cursor-pointer text-center py-0.5"
                      >
                        {t.footer.apexShowcase}
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => navigateToInvoice('')}
                        className="hover:text-[#F5E6B8] transition-colors cursor-pointer text-center py-0.5"
                      >
                        {t.footer.privateInvoiceLink}
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setReturnPolicyModalOpen(true)}
                        className="hover:text-[#F5E6B8] transition-colors cursor-pointer text-center py-0.5"
                      >
                        {t.footer.returnPolicyLink}
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3.5 flex flex-col items-center w-full">
                  <p className="font-brand text-xs uppercase tracking-[0.22em] text-[#E5C87E] font-semibold">
                    {t.footer.conciergeB2bTitle}
                  </p>
                  <ul className="space-y-2.5 font-latin-italic text-sm sm:text-[15px] text-zinc-300 flex flex-col items-center">
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setPendingInquiry(null);
                          setEmailGatewayOpen(true);
                        }}
                        className="hover:text-[#F5E6B8] transition-colors cursor-pointer text-center inline-flex items-center justify-center gap-1.5 py-0.5"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#E5C87E] shrink-0" />
                        <span>{t.footer.emailConciergeAccess}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setB2BModalOpen(true)}
                        className="text-[#F5E6B8] hover:text-white font-semibold underline decoration-[#D4AF37]/70 underline-offset-4 transition-colors cursor-pointer text-center py-0.5"
                        data-testid="footer-b2b-link"
                      >
                        {t.footer.b2bWholesaleLink}
                      </button>
                    </li>
                    <li>
                      <a
                        href={generalConciergeWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#F5E6B8] transition-colors inline-flex items-center justify-center gap-1 py-0.5"
                        data-testid="footer-whatsapp-link"
                      >
                        <span>WhatsApp Concierge</span>
                        <ArrowUpRight className="w-3 h-3 text-[#E5C87E]" />
                      </a>
                    </li>
                    <li>
                      <a
                        href={generalConciergeTgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#F5E6B8] transition-colors inline-flex items-center justify-center gap-1 py-0.5"
                        data-testid="footer-telegram-link"
                      >
                        <span>Telegram VIP Concierge</span>
                        <ArrowUpRight className="w-3 h-3 text-[#E5C87E]" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal variant="up" delayMs={140}>
            <div className="mt-10 sm:mt-12 pt-7 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 font-latin-italic text-sm text-zinc-400 text-center">
              <p>
                © 2026 VORVAN — LIFESTYLE FOR EVERYONE. {t.footer.rightsReserved}
              </p>
              <p className="text-[#D8BE82]">
                Official Email: {siteSettings.conciergeEmail} · WhatsApp Concierge ·
                Telegram VIP Concierge
              </p>
            </div>
          </ScrollReveal>
        </div>
      </footer>

      {/* ERGONOMIC MOBILE THUMB-ZONE BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-[#0B0A0E] border-t border-[#D4AF37]/35 grid grid-cols-4 items-center px-2"
      >
        <button
          type="button"
          onClick={() => navigateToShowroom()}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 cursor-pointer ${
            route.view === 'showroom' ? 'text-[#E5C87E]' : 'text-zinc-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="font-brand text-[9px] uppercase tracking-[0.14em] truncate max-w-full">
            {t.nav.showroom}
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigateToShowroom('brand-hierarchy-explorer')}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-zinc-400 hover:text-[#E5C87E] cursor-pointer"
        >
          <Compass className="w-4 h-4" />
          <span className="font-brand text-[9px] uppercase tracking-[0.14em] truncate max-w-full">
            {t.nav.mobileHouses}
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigateToTrack('')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 cursor-pointer ${
            route.view === 'track' ? 'text-[#E5C87E]' : 'text-zinc-400'
          }`}
        >
          <PackageSearch className="w-4 h-4" />
          <span className="font-brand text-[9px] uppercase tracking-[0.14em] truncate max-w-full">
            {t.nav.mobileTrack}
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigateToInvoice('')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 cursor-pointer ${
            route.view === 'invoice' ? 'text-[#E5C87E]' : 'text-zinc-400'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span className="font-brand text-[9px] uppercase tracking-[0.14em] truncate max-w-full">
            {t.nav.mobileInvoice}
          </span>
        </button>
      </nav>

      {/* MODALS */}
      <FragranceDossierModal
        fragrance={selectedDossier?.fragrance || null}
        initialVolume={selectedDossier?.volume}
        registeredEmail={registeredEmail}
        onClose={() => setSelectedDossier(null)}
        onRequireEmailGateway={(frag, vol) => {
          setSelectedDossier(null);
          setPendingInquiry({ fragrance: frag, volume: vol });
          setEmailGatewayOpen(true);
        }}
      />

      <EmailGatewayModal
        isOpen={emailGatewayOpen}
        pendingFragrance={pendingInquiry}
        conciergeEmail={siteSettings.conciergeEmail}
        onClose={() => setEmailGatewayOpen(false)}
        onSuccessRegister={handleEmailRegistered}
      />

      <AdminEmailRegistryModal
        isOpen={adminLogModalOpen}
        leads={emailLeads}
        settings={siteSettings}
        customOrders={customOrders}
        onClose={() => setAdminLogModalOpen(false)}
        onUpdateSettings={handleUpdateSiteSettings}
        onCreateCustomOrder={handleCreateCustomOrder}
        onUpdateCustomOrderStage={handleUpdateCustomOrderStage}
        onUpdateCustomOrderStatus={handleUpdateCustomOrderStatus}
        onDeleteCustomOrder={handleDeleteCustomOrder}
        onOpenInvoicePreview={(invId, smartOrd) =>
          navigateToInvoice(invId, smartOrd)
        }
        onOpenTrackingPreview={(q, smartOrd) => navigateToTrack(q, smartOrd)}
        onSyncCloud={syncFromCloudVault}
      />

      {returnPolicyModalOpen && (
        <ReturnPolicyContent
          isModal={true}
          onClose={() => setReturnPolicyModalOpen(false)}
          locale={locale}
        />
      )}

      <B2BWholesaleModal
        isOpen={b2bModalOpen}
        onClose={() => setB2BModalOpen(false)}
      />
    </div>
  );
}
