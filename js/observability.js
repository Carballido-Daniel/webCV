// =========================================================
//  Observabilidad (RUM) con Grafana Faro — OpenTelemetry en el navegador
//  Envía a Grafana Cloud: sesiones, Web Vitals, tiempos de carga,
//  errores JS, navegador/SO/dispositivo, trazas OTel e interacciones.
// =========================================================
(() => {
  // ---- CONFIGURACIÓN -------------------------------------------------
  // Pega aquí la URL del collector que te da Grafana Cloud
  // (Frontend Observability → tu app → "Web SDK configuration").
  const FARO_URL = 'https://faro-collector-prod-eu-west-6.grafana.net/collect/f0e652111698bd8a39abb2a294188cbd';

  const APP = { name: 'webcv', version: '1.1.0' };
  const SDK_VERSION = '2.12.1';
  const SCRIPTS = [
    {
      src: `https://unpkg.com/@grafana/faro-web-sdk@${SDK_VERSION}/dist/bundle/faro-web-sdk.iife.js`,
      integrity: 'sha384-l6Jzfv+lACs+s0S3b/ZzFKwCcMSqlSIAZHSVmK7zGeHg62sjKQgKJFnTYmkqLNBr',
    },
    {
      src: `https://unpkg.com/@grafana/faro-web-tracing@${SDK_VERSION}/dist/bundle/faro-web-tracing.iife.js`,
      integrity: 'sha384-GYXsSpSw1wyk0NGU1Sr3ueuCEPoOJRkS9l2BMVi8U57POeJm+PgV9e8pFRufOoBs',
    },
  ];
  // ---------------------------------------------------------------------

  const isLocal = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  const forced = new URLSearchParams(location.search).has('faro'); // ?faro=1 para probar en local
  if (!FARO_URL || (isLocal && !forced)) return;

  const environment = isLocal ? 'development' : 'production';
  let faro = null;

  const loadScript = ({ src, integrity }) => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.integrity = integrity;
    s.crossOrigin = 'anonymous';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  // Los atributos de eventos en Faro deben ser strings
  const track = (name, attrs = {}) => {
    if (!faro) return;
    const clean = Object.fromEntries(Object.entries(attrs).map(([k, v]) => [k, String(v ?? '')]));
    faro.api.pushEvent(name, clean);
  };

  const deviceType = () => {
    const w = Math.min(screen.width, screen.height);
    const touch = matchMedia('(pointer: coarse)').matches;
    if (touch && w < 600) return 'mobile';
    if (touch) return 'tablet';
    return 'desktop';
  };

  const referrerHost = () => {
    try { return document.referrer ? new URL(document.referrer).hostname : 'directo'; }
    catch { return 'desconocido'; }
  };

  // ---- Visita ---------------------------------------------------------
  const trackPageView = () => track('page_view', {
    device_type: deviceType(),
    viewport: `${innerWidth}x${innerHeight}`,
    screen: `${screen.width}x${screen.height}`,
    lang: navigator.language,
    color_scheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    connection: navigator.connection?.effectiveType ?? 'unknown',
    referrer: referrerHost(),
  });

  // ---- Tiempos de carga (Navigation Timing) ---------------------------
  const trackPageLoad = () => {
    const nav = performance.getEntriesByType('navigation')[0];
    if (!nav || !faro) return;
    faro.api.pushMeasurement({
      type: 'page_load',
      values: {
        ttfb_ms: Math.round(nav.responseStart - nav.startTime),
        dom_ready_ms: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
        load_ms: Math.round(nav.loadEventEnd - nav.startTime),
        transfer_kb: Math.round((nav.transferSize || 0) / 1024),
      },
    });
  };

  // ---- Interacciones --------------------------------------------------
  const trackInteractions = () => {
    document.addEventListener('click', (e) => {
      const head = e.target.closest('.job__head');
      if (head) {
        const job = head.querySelector('.job__company')?.textContent.trim();
        track('job_toggle', { job, state: head.getAttribute('aria-expanded') === 'true' ? 'open' : 'close' });
        return;
      }
      if (e.target.closest('#toggle-all')) { track('cta_click', { target: 'expandir_todo' }); return; }

      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      let target = null;
      if (a.hasAttribute('download')) target = 'pdf';
      else if (href.includes('linkedin.com')) target = 'linkedin';
      else if (href.startsWith('mailto:')) target = 'email';
      else if (href === '#experiencia' && a.closest('.hero')) target = 'ver_experiencia';
      if (target) track('cta_click', { target });
    });

    // Hasta qué sección llega cada visitante (una vez por sección)
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && !seen.has(en.target.id)) {
          seen.add(en.target.id);
          track('section_view', { section: en.target.id });
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('main section[id]').forEach((s) => io.observe(s));
  };

  // ---- Arranque -------------------------------------------------------
  SCRIPTS.reduce((p, s) => p.then(() => loadScript(s)), Promise.resolve())
    .then(() => {
      const { initializeFaro, getWebInstrumentations } = window.GrafanaFaroWebSdk;
      const { TracingInstrumentation } = window.GrafanaFaroWebTracing;

      faro = initializeFaro({
        url: FARO_URL,
        app: { ...APP, environment },
        instrumentations: [
          ...getWebInstrumentations(),          // errores, Web Vitals, sesiones, vistas, rendimiento
          new TracingInstrumentation(),         // trazas OpenTelemetry (document load, fetch)
        ],
        ignoreErrors: [/^Script error\.?$/],    // errores opacos de scripts de terceros
      });

      trackPageView();
      if (document.readyState === 'complete') setTimeout(trackPageLoad, 0);
      else addEventListener('load', () => setTimeout(trackPageLoad, 0), { once: true });
      trackInteractions();
    })
    .catch(() => { /* si el CDN falla o un bloqueador lo impide, la web sigue funcionando */ });
})();
