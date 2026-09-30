/* Drishti3D · clickable wireframe prototype runtime.
   Offline, no dependencies. Handles: theme / viewport / annotation / language toggles
   (persisted in localStorage, every access wrapped in try/catch), the icon sprite,
   the prototype bar, the stylised town map, and small interactions. */
(function () {
  "use strict";

  /* ---------------- preferences (run before first paint) ---------------- */
  var KEY = "drishti3d.wireframes.prefs";
  var DEFAULTS = { theme: "field", viewport: "desktop", anno: "on", lang: "en" };
  function loadPrefs() {
    var p = {};
    try { p = JSON.parse(window.localStorage.getItem(KEY) || "{}") || {}; } catch (e) { p = {}; }
    var out = {};
    for (var k in DEFAULTS) out[k] = p[k] || DEFAULTS[k];
    /* optional overrides for shareable links, e.g. ?theme=analyst&viewport=phone */
    try {
      var q = new URLSearchParams(window.location.search);
      for (var k2 in DEFAULTS) if (q.get(k2)) out[k2] = q.get(k2);
    } catch (e) { /* ignore */ }
    return out;
  }
  function savePrefs() {
    try { window.localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* storage blocked: session-only */ }
  }
  var prefs = loadPrefs();
  var root = document.documentElement;
  function applyPrefs() {
    root.setAttribute("data-theme", prefs.theme);
    root.setAttribute("data-viewport", prefs.viewport);
    root.setAttribute("data-anno", prefs.anno);
    root.setAttribute("data-lang", prefs.lang);
  }
  applyPrefs();

  /* ---------------- screens ---------------- */
  var SCREENS = [
    { file: "index.html", n: "00", title: "Screen gallery" },
    { file: "01-missions.html", n: "01", title: "Missions list" },
    { file: "02-new-mission.html", n: "02", title: "New Mission" },
    { file: "03-ingest-check.html", n: "03", title: "Ingest Check" },
    { file: "04-processing.html", n: "04", title: "Processing" },
    { file: "05-viewer-3d.html", n: "05", title: "3D Viewer" },
    { file: "06-measure.html", n: "06", title: "Measurement tools" },
    { file: "07-accuracy-report.html", n: "07", title: "Accuracy Report" },
    { file: "08-export.html", n: "08", title: "Export dialog" },
    { file: "09-settings.html", n: "09", title: "Settings" },
    { file: "10-compare.html", n: "10", title: "Compare runs" },
    { file: "11-states.html", n: "11", title: "Empty, error & loading states" }
  ];

  /* ---------------- icons (Lucide-style, 24px grid, drawn for the wireframe) ---------------- */
  var ICONS = {
    logo: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><path d="M12 8.6l3 1.7v3.4l-3 1.7-3-1.7v-3.4z"/><path d="M12 12v3.4M12 12l3-1.7M12 12l-3-1.7"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    sliders: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
    wifioff: '<path d="M12 20h.01M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 5.2-2.7M19 12.9a10 10 0 0 0-2-1.4M2 8.8a15 15 0 0 1 4.2-2.6M10.7 5c4-.4 8.1.9 11.3 3.8"/><path d="m2 2 20 20"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
    disk: '<path d="M22 12H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/><path d="M6 16h.01M10 16h.01"/>',
    languages: '<path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4M12 17h.01"/>',
    xcircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    chevl: '<path d="m15 18-6-6 6-6"/>',
    chevr: '<path d="m9 18 6-6-6-6"/>',
    chevd: '<path d="m6 9 6 6 6-6"/>',
    arrowr: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    arrowl: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    copy: '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2"/>',
    layers: '<path d="M12.8 2.2a2 2 0 0 0-1.6 0L2.6 6.1a1 1 0 0 0 0 1.8l8.6 3.9a2 2 0 0 0 1.6 0l8.6-3.9a1 1 0 0 0 0-1.8Z"/><path d="m22 17.6-9.2 4.2a2 2 0 0 1-1.6 0L2 17.6M22 12.6l-9.2 4.2a2 2 0 0 1-1.6 0L2 12.6"/>',
    pointer: '<path d="M4 4l6.4 16 2.3-6.9 6.9-2.3z"/>',
    ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/>',
    height: '<path d="M12 2v20M8 18l4 4 4-4M8 6l4-4 4 4"/>',
    area: '<path d="M3.5 8.7c-.7.5-1 1.4-.7 2.2l2.8 8.7c.3.8 1 1.4 1.9 1.4h9.1c.9 0 1.6-.6 1.9-1.4l2.8-8.7c.3-.8 0-1.7-.7-2.2l-7.4-5.3a2.1 2.1 0 0 0-2.4 0Z"/>',
    volume: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
    profile: '<path d="M3 3v18h18"/><path d="M7 15c2-6 4-6 6-2s3 1 5-6"/>',
    crosshair: '<circle cx="12" cy="12" r="10"/><path d="M22 12h-4M6 12H2M12 6V2M12 22v-4"/>',
    box: '<path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
    columns: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/>',
    reset: '<path d="M3 12a9 9 0 1 0 9-9 9.8 9.8 0 0 0-6.7 2.7L3 8"/><path d="M3 3v5h5"/>',
    maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8"/>',
    map: '<path d="M14.1 5.9 9.9 3.8a2 2 0 0 0-1.8 0L3.6 6.1A1 1 0 0 0 3 7v12.8a1 1 0 0 0 1.4.9l3.7-1.9a2 2 0 0 1 1.8 0l4.2 2.1a2 2 0 0 0 1.8 0l4.5-2.3a1 1 0 0 0 .6-.9V4.2a1 1 0 0 0-1.4-.9l-3.7 1.9a2 2 0 0 1-1.8 0z"/><path d="M15 5.8v15M9 3.2v15"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    video: '<path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    radio: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9c3.9 3.9 3.9 10.2 0 14.1M4.9 19.1C1 15.2 1 8.9 4.9 5"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.8 9.8 0 0 1 6.7 2.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.8 9.8 0 0 1-6.7-2.7L3 16M8 16H3v5"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    tablet: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 17h.01"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M12 18h.01"/>',
    note: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    anchor: '<path d="M12 22V8M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    nav: '<path d="m3 11 19-9-9 19-2-8-8-2z"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    play: '<path d="M6 3l14 9-14 9V3z"/>',
    keyboard: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.7 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.5 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    usb: '<circle cx="10" cy="7" r="1"/><circle cx="4" cy="20" r="1"/><path d="M4.7 19.3 19 5M21 3l-3 1 2 2zM9.3 7.7 5 12l3 3M14 12l3 3-3 3"/>'
  };
  function icon(name, cls) {
    return '<svg class="ic' + (cls ? " " + cls : "") + '" aria-hidden="true" focusable="false"><use href="#i-' + name + '"/></svg>';
  }
  function injectSprite() {
    var s = '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">';
    for (var k in ICONS) s += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + ICONS[k] + "</symbol>";
    s += "</svg>";
    document.body.insertAdjacentHTML("afterbegin", s);
  }
  /* <i data-icon="ruler"></i> placeholders become inline icons */
  function expandIcons(scope) {
    var els = (scope || document).querySelectorAll("i[data-icon]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      el.outerHTML = icon(el.getAttribute("data-icon"), el.className || "");
    }
  }

  /* ---------------- i18n (EN / HI) for key labels ---------------- */
  var HI = {
    "nav.missions": "मिशन", "nav.settings": "सेटिंग्स", "mission.new": "नया मिशन",
    "mission.checkInputs": "इनपुट जाँचें", "upload.drop": "वीडियो यहाँ छोड़ें या ब्राउज़ करें",
    "upload.telemetry": "टेलीमेट्री (SRT/KLV)", "ingest.title": "इनपुट जाँच", "ingest.timeOffset": "समय अंतर",
    "ingest.frameQuality": "फ़्रेम गुणवत्ता", "ingest.usable2": "2 चेतावनियों के साथ उपयोग योग्य",
    "run.start": "प्रोसेसिंग शुरू करें", "run.cancel": "प्रोसेसिंग रद्द करें", "run.eta": "शेष समय",
    "tab.ingest": "इनपुट", "tab.processing": "प्रोसेसिंग", "tab.viewer": "3D व्यूअर", "tab.accuracy": "सटीकता", "tab.exports": "निर्यात",
    "stage.S0": "इनपुट और समन्वय", "stage.S1": "कीफ़्रेम चयन", "stage.S2": "मास्किंग और वर्गीकरण",
    "stage.S3": "कैमरा स्थिति आकलन", "stage.S4": "भू-संदर्भन और एंकरिंग", "stage.S5": "सघन पुनर्निर्माण और मेश",
    "stage.S6": "पूर्णता और वर्गीकरण", "stage.S7": "फ़ोटोरियल परत (वैकल्पिक)", "stage.S8": "निर्यात और टाइलिंग",
    "stage.S9": "गुणवत्ता जाँच और विश्वसनीयता", "stage.P": "लाइव पूर्वावलोकन",
    "viewer.open": "3D व्यूअर खोलें", "viewer.layers": "परतें", "layer.mesh": "मेश", "layer.pointCloud": "बिंदु मेघ",
    "layer.ortho": "ऑर्थोमोज़ेक", "layer.confidence": "विश्वसनीयता", "layer.semantic": "वर्ग (सिमेंटिक)",
    "conf.observedHigh": "प्रेक्षित – उच्च", "conf.observedLow": "प्रेक्षित – निम्न", "conf.inferred": "अनुमानित",
    "tool.select": "चयन", "tool.distance": "दूरी", "tool.height": "ऊँचाई", "tool.area": "क्षेत्रफल", "tool.volume": "आयतन",
    "tool.profile": "अनुप्रस्थ काट", "tool.pick": "निर्देशांक", "tool.clip": "क्लिपिंग बॉक्स", "tool.compare": "पहले/बाद तुलना", "tool.reset": "रीसेट",
    "measure.inferred": "अनुमानित सतह शामिल", "measure.how": "इसकी गणना कैसे होती है?",
    "accuracy.title": "सटीकता रिपोर्ट", "accuracy.bias": "पूर्वाग्रह (स्थिर त्रुटि)", "accuracy.noise": "यादृच्छिक त्रुटि",
    "accuracy.estimated": "अनुमानित: सत्यापित नहीं", "accuracy.checkpoints": "जाँच बिंदु",
    "export.title": "निर्यात", "common.warning": "चेतावनी", "common.cancel": "रद्द करें", "common.save": "सहेजें", "common.copy": "कॉपी करें",
    "common.example": "उदाहरण मान", "system.offline": "ऑफ़लाइन", "system.readOnly": "फ़ोन पर केवल देखने के लिए",
    "status.complete": "पूर्ण", "status.attention": "ध्यान दें", "status.queued": "कतार में", "status.running": "चल रहा है", "status.failed": "विफल",
    "preview.notMetric": "GPS से स्थापित, मापन योग्य नहीं",
    "class.building": "इमारत", "class.road": "सड़क", "class.vegetation": "वनस्पति", "class.water": "जल", "class.ground": "भूमि",
    "class.vehicle": "वाहन/व्यक्ति (मास्क)", "class.other": "अन्य"
  };
  function applyLang() {
    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i], k = el.getAttribute("data-i18n");
      if (!el.hasAttribute("data-en")) el.setAttribute("data-en", el.textContent);
      if (prefs.lang === "hi" && HI[k]) { el.textContent = HI[k]; el.setAttribute("lang", "hi"); }
      else { el.textContent = el.getAttribute("data-en"); el.removeAttribute("lang"); }
    }
    var lb = document.querySelectorAll("[data-action='lang']");
    for (var j = 0; j < lb.length; j++) lb[j].setAttribute("aria-label", prefs.lang === "hi" ? "Switch to English" : "हिंदी में बदलें");
    var seg = document.querySelectorAll("[data-lang-state]");
    for (var m = 0; m < seg.length; m++) seg[m].setAttribute("aria-pressed", String(seg[m].getAttribute("data-lang-state") === prefs.lang));
  }

  /* ---------------- prototype bar ---------------- */
  function buildProtobar() {
    var file = (location.pathname.split("/").pop() || "index.html");
    var idx = 0;
    for (var i = 0; i < SCREENS.length; i++) if (SCREENS[i].file === file) idx = i;
    var cur = SCREENS[idx], prev = SCREENS[idx - 1], next = SCREENS[idx + 1];
    var h = '<div class="protobar" role="region" aria-label="Prototype controls">' +
      '<span class="pb-title">Drishti3D · wireframes</span>' +
      '<span class="pb-screen">' + cur.n + " · " + cur.title + "</span>" +
      '<span class="pb-nav">' +
      (prev && prev.file !== "index.html" ? '<a href="' + prev.file + '">' + icon("chevl") + " " + prev.title + "</a>" : "") +
      '<a href="index.html">' + icon("grid") + " Gallery</a>" +
      (next ? '<a href="' + next.file + '">' + next.title + " " + icon("chevr") + "</a>" : "") +
      "</span><span class=\"spacer\"></span>" +
      '<span class="seg" role="group" aria-label="Theme">' +
      '<button type="button" data-set="theme:field">' + icon("moon") + "Field (dark)</button>" +
      '<button type="button" data-set="theme:analyst">' + icon("sun") + "Analyst (light)</button></span>" +
      '<span class="seg" role="group" aria-label="Viewport">' +
      '<button type="button" data-set="viewport:desktop">' + icon("monitor") + "Desktop</button>" +
      '<button type="button" data-set="viewport:tablet">' + icon("tablet") + "Tablet</button>" +
      '<button type="button" data-set="viewport:phone">' + icon("phone") + "Phone</button></span>" +
      '<span class="seg" role="group" aria-label="Language">' +
      '<button type="button" data-set="lang:en" data-lang-state="en">EN</button>' +
      '<button type="button" data-set="lang:hi" data-lang-state="hi" lang="hi">हि</button></span>' +
      '<span class="seg" role="group" aria-label="Annotations">' +
      '<button type="button" data-set="anno:toggle">' + icon("note") + "Notes</button></span>" +
      "</div>";
    document.body.insertAdjacentHTML("afterbegin", h);
  }
  function syncProtobar() {
    var bs = document.querySelectorAll(".protobar [data-set]");
    for (var i = 0; i < bs.length; i++) {
      var kv = bs[i].getAttribute("data-set").split(":");
      var on = kv[1] === "toggle" ? prefs[kv[0]] === "on" : prefs[kv[0]] === kv[1];
      bs[i].setAttribute("aria-pressed", String(on));
    }
    var tb = document.querySelectorAll("[data-action='theme'] use");
    for (var j = 0; j < tb.length; j++) tb[j].setAttribute("href", prefs.theme === "field" ? "#i-sun" : "#i-moon");
  }
  function setPref(k, v) {
    if (v === "toggle") v = prefs[k] === "on" ? "off" : "on";
    prefs[k] = v; applyPrefs(); savePrefs(); syncProtobar();
    if (k === "lang") applyLang();
  }

  /* ---------------- annotations ---------------- */
  function buildAnnotations() {
    var items = document.body.querySelectorAll("[data-anno]");
    var panelItems = document.querySelectorAll(".anno-panel li");
    for (var i = 0; i < items.length; i++) {
      var n = items[i].getAttribute("data-anno");
      var b = document.createElement("button");
      b.type = "button"; b.className = "anno-pin"; b.textContent = n;
      b.setAttribute("aria-label", "Annotation " + n);
      b.addEventListener("click", (function (num) {
        return function (e) {
          e.preventDefault(); e.stopPropagation();
          for (var j = 0; j < panelItems.length; j++) panelItems[j].classList.toggle("hl", j === num - 1);
          var li = panelItems[num - 1];
          if (li) li.scrollIntoView({ block: "nearest", behavior: "smooth" });
        };
      })(parseInt(n, 10)));
      items[i].appendChild(b);
    }
  }

  /* ---------------- stylised town map ---------------- */
  var uid = 0;
  // buildings: x, y, w, h (roof), ht (facade depth), conf roof/facade, cls
  var B = [
    [70, 110, 90, 60, 22, "h", "l"], [185, 100, 70, 80, 30, "h", "i"], [70, 200, 60, 50, 16, "h", "h"], [150, 205, 100, 52, 20, "h", "l"],
    [60, 380, 80, 70, 24, "h", "h"], [165, 390, 90, 55, 18, "l", "l"], [80, 480, 150, 50, 20, "h", "i"],
    [370, 95, 120, 70, 40, "h", "i"], [510, 110, 80, 60, 26, "h", "h"], [375, 195, 70, 60, 20, "h", "l"], [470, 200, 110, 50, 22, "h", "h"],
    [370, 380, 90, 80, 34, "h", "h"], [480, 385, 100, 60, 24, "h", "l"], [390, 490, 170, 50, 18, "l", "i"],
    [780, 80, 90, 60, 22, "l", "i"], [890, 70, 80, 90, 36, "l", "i"], [800, 180, 150, 55, 20, "h", "l"],
    [790, 370, 80, 70, 26, "h", "h"], [890, 380, 70, 60, 20, "h", "l"], [800, 470, 160, 60, 22, "l", "i"]
  ];
  var TREES = [[300, 60, 14], [322, 72, 11], [288, 90, 10], [610, 60, 16], [600, 90, 12], [625, 170, 13], [612, 450, 15], [598, 480, 12],
    [630, 520, 14], [270, 540, 13], [292, 560, 11], [700, 90, 12], [735, 470, 13], [742, 505, 10], [40, 300, 12], [960, 300, 11], [980, 560, 14], [30, 560, 13]];
  function townSVG(opt) {
    opt = opt || {};
    var id = "m" + (++uid);
    var vb = opt.view || "0 0 1000 600";
    var s = '<svg viewBox="' + vb + '" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + (opt.label || "Stylised placeholder of the 3D scene: a small town with a river, a bridge, roads, buildings and trees") + '">';
    s += "<defs>" +
      '<pattern id="' + id + 'h" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)"><rect width="8" height="8" style="fill:var(--conf-inf);fill-opacity:.3"/><rect width="3" height="8" style="fill:var(--conf-inf)"/></pattern>' +
      '<pattern id="' + id + 'v" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)"><rect width="6" height="6" style="fill:var(--cls-vehicle);fill-opacity:.3"/><rect width="2.5" height="6" style="fill:var(--cls-vehicle)"/></pattern>' +
      (opt.mosaic ? '<clipPath id="' + id + 'c"><path d="M0 390 L0 560 L240 520 L480 470 L660 400 L660 190 L480 250 L240 330 Z"/></clipPath>' : "") +
      "</defs>";
    s += '<rect class="m-ground" x="-500" y="-300" width="2000" height="1200"/>';
    var scene = "";
    // base (ortho-like)
    scene += '<g class="lyr-base">' +
      '<path class="m-field2" d="M20 20h230v60H20z M820 290h170v50H820z M20 590l0-40 200 0 0 40z"/>' +
      '<path d="M660 -20 C 620 120, 700 200, 660 300 S 640 480, 720 640" style="fill:none;stroke:var(--map-water);stroke-width:54;stroke-linecap:round"/>' +
      '<path class="m-road-edge" style="stroke-width:30" d="M-20 330 C 200 322, 420 318, 640 305 S 900 290, 1020 280"/>' +
      '<path class="m-road" style="stroke-width:22" d="M-20 330 C 200 322, 420 318, 640 305 S 900 290, 1020 280"/>' +
      '<path class="m-road-edge" style="stroke-width:18" d="M310 -20 C 318 150, 322 400, 330 620"/>' +
      '<path class="m-road" style="stroke-width:12" d="M310 -20 C 318 150, 322 400, 330 620"/>' +
      '<path class="m-road-edge" style="stroke-width:16" d="M740 300 C 760 200, 745 100, 770 -20 M750 300 C 760 420, 745 520, 760 620"/>' +
      '<path class="m-road" style="stroke-width:10" d="M740 300 C 760 200, 745 100, 770 -20 M750 300 C 760 420, 745 520, 760 620"/>' +
      '<path d="M612 292 L 700 287 M612 318 L 700 313" style="stroke:var(--text-muted);stroke-width:3"/>' +
      "</g>";
    // mesh (buildings + trees)
    var mesh = '<g class="lyr-mesh">';
    B.forEach(function (b) {
      mesh += '<path class="m-shadow" d="M' + (b[0] + b[2]) + " " + b[1] + " l" + b[4] * 0.8 + " " + b[4] * 0.4 + " v" + b[3] + " l" + (-b[4] * 0.8) + " " + b[4] * 0.6 + 'z"/>';
      mesh += '<rect class="m-wall" x="' + b[0] + '" y="' + (b[1] + b[3]) + '" width="' + b[2] + '" height="' + b[4] + '"/>';
      mesh += '<rect class="' + (b[2] > 100 ? "m-roof-2" : "m-roof") + '" x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '"/>';
      mesh += '<path d="M' + (b[0] + 6) + " " + (b[1] + b[3] / 2) + " h" + (b[2] - 12) + '" style="stroke:var(--map-road-edge);stroke-width:1;opacity:.6"/>';
    });
    TREES.forEach(function (t) {
      mesh += '<circle class="m-tree" cx="' + t[0] + '" cy="' + t[1] + '" r="' + t[2] + '"/><circle class="m-tree-2" cx="' + (t[0] - t[2] * 0.3) + '" cy="' + (t[1] - t[2] * 0.3) + '" r="' + t[2] * 0.5 + '"/>';
    });
    // vehicles
    mesh += '<rect x="120" y="322" width="18" height="9" rx="2" style="fill:var(--map-roof-2)"/><rect x="455" y="310" width="18" height="9" rx="2" style="fill:var(--map-roof-2)"/><rect x="880" y="286" width="18" height="9" rx="2" style="fill:var(--map-roof-2)"/>';
    mesh += "</g>";
    scene += mesh;
    // confidence overlay
    var conf = '<g class="lyr-conf">';
    conf += '<path class="c-low-f" style="fill-opacity:.22" d="M760 -20 H1020 V250 H760 Z M-20 460 H60 V620 H-20 Z M760 440 H1020 V620 H760 Z"/>';
    conf += '<path class="c-high-f" style="fill-opacity:.14" d="M-20 250 L760 180 L760 440 L-20 460 Z"/>';
    B.forEach(function (b) {
      conf += '<rect class="' + (b[5] === "h" ? "c-high-f" : "c-low-f") + '" x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '"/>';
      if (b[6] === "i") conf += '<rect x="' + b[0] + '" y="' + (b[1] + b[3]) + '" width="' + b[2] + '" height="' + b[4] + '" fill="url(#' + id + 'h)"/>';
      else conf += '<rect class="' + (b[6] === "h" ? "c-high-f" : "c-low-f") + '" x="' + b[0] + '" y="' + (b[1] + b[3]) + '" width="' + b[2] + '" height="' + b[4] + '"/>';
    });
    conf += "</g>";
    scene += conf;
    // semantic overlay
    var sem = '<g class="lyr-sem" style="opacity:.8">';
    sem += '<rect x="-500" y="-300" width="2000" height="1200" style="fill:var(--cls-ground);opacity:.45"/>';
    sem += '<path d="M660 -20 C 620 120, 700 200, 660 300 S 640 480, 720 640" style="fill:none;stroke:var(--cls-water);stroke-width:54"/>';
    sem += '<path d="M-20 330 C 200 322, 420 318, 640 305 S 900 290, 1020 280 M310 -20 C 318 150, 322 400, 330 620 M740 300 C 760 200, 745 100, 770 -20 M750 300 C 760 420, 745 520, 760 620" style="fill:none;stroke:var(--cls-road);stroke-width:20"/>';
    B.forEach(function (b) { sem += '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + (b[3] + b[4]) + '" style="fill:var(--cls-building)"/>'; });
    TREES.forEach(function (t) { sem += '<circle cx="' + t[0] + '" cy="' + t[1] + '" r="' + t[2] + '" style="fill:var(--cls-vegetation)"/>'; });
    sem += '<rect x="116" y="318" width="26" height="17" fill="url(#' + id + 'v)"/><rect x="451" y="306" width="26" height="17" fill="url(#' + id + 'v)"/><rect x="876" y="282" width="26" height="17" fill="url(#' + id + 'v)"/>';
    sem += '<rect x="20" y="20" width="230" height="60" style="fill:var(--cls-other);opacity:.8"/>';
    sem += "</g>";
    scene += sem;
    // checkpoints + residual vectors
    var cps = [[120, 300, 8, -4], [260, 350, -6, 5], [420, 290, 5, 6], [560, 350, -7, -3], [700, 250, 6, -6], [860, 330, -5, 4], [250, 170, 4, 7], [520, 460, -6, 5], [880, 440, 7, 3], [100, 460, -4, -6]];
    var cp = '<g class="lyr-cp">';
    cps.forEach(function (c, i) {
      cp += '<path class="c-res" d="M' + c[0] + " " + c[1] + " l" + c[2] * 4 + " " + c[3] * 4 + '"/>';
      cp += '<circle class="c-cp" cx="' + c[0] + '" cy="' + c[1] + '" r="7"/><path d="M' + (c[0] - 4) + " " + c[1] + "h8M" + c[0] + " " + (c[1] - 4) + 'v8" style="stroke:var(--text);stroke-width:1.5"/>';
      cp += '<text class="m-label-sm" x="' + (c[0] + 10) + '" y="' + (c[1] - 8) + '">CP' + String(i + 1).padStart(2, "0") + "</text>";
    });
    cp += "</g>";
    scene += cp;
    // flight track
    var trackD = "M30 470 C 250 420, 480 330, 650 280 S 900 200, 985 170";
    var tr = '<g class="lyr-track' + (opt.track ? " force" : "") + '"' + (opt.track ? ' style="display:inline"' : "") + ">";
    tr += '<path class="m-track-raw" d="M48 452 C 268 402, 498 312, 668 262 S 918 182, 1003 152" transform="translate(0,0)"/>';
    tr += '<path class="m-track" d="' + trackD + '"/>';
    for (var k = 0; k < 16; k++) {
      var tt = k / 15, x = 30 + tt * 955, y = 470 - tt * 300 + Math.sin(tt * Math.PI) * -20;
      tr += '<circle class="m-kf" cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="4"/>';
    }
    tr += '<circle cx="30" cy="470" r="9" style="fill:var(--ok);stroke:var(--surface);stroke-width:3"/><text class="m-label" x="44" y="494">start</text>';
    tr += '<circle cx="985" cy="170" r="9" style="fill:var(--danger);stroke:var(--surface);stroke-width:3"/><text class="m-label" x="935" y="150">end</text>';
    tr += "</g>";
    scene += tr;

    if (opt.offset) {
      s += '<g opacity=".4">' + scene + "</g>";
      s += '<g transform="translate(26,-17)" opacity=".85">' + scene + "</g>";
      s += '<path d="M-20 330 C 200 322, 420 318, 640 305 S 900 290, 1020 280" style="fill:none;stroke:var(--warn);stroke-width:2;stroke-dasharray:6 5"/>';
    } else if (opt.mosaic) {
      s += '<g opacity=".18">' + scene + "</g>";
      s += '<g clip-path="url(#' + id + 'c)">' + scene + "</g>";
      s += '<path d="M0 390 L0 560 L240 520 L480 470 L660 400 L660 190 L480 250 L240 330 Z" style="fill:none;stroke:var(--accent);stroke-width:2;stroke-dasharray:6 4"/>';
      s += '<circle cx="660" cy="295" r="10" style="fill:var(--accent);stroke:var(--surface);stroke-width:3"/><rect x="630" y="255" width="60" height="80" style="fill:none;stroke:var(--accent);stroke-width:2"/>';
      s += '<text class="m-label" x="700" y="300">current frame</text>';
    } else {
      s += scene;
    }
    if (opt.gpsTrack) {
      // Ingest check: raw GPS track coloured by altitude (single-hue ramp), dropout, keyframes, rejects
      var pts = [];
      for (var q = 0; q <= 40; q++) { var u = q / 40; pts.push([30 + u * 955, 470 - u * 300 + Math.sin(u * Math.PI) * -20 + Math.sin(u * 30) * 3]); }
      for (var r = 0; r < 40; r++) {
        if (r >= 18 && r <= 21) continue; // dropout
        var op = (0.35 + 0.65 * Math.abs(Math.sin(r / 9))).toFixed(2);
        s += '<path d="M' + pts[r][0].toFixed(1) + " " + pts[r][1].toFixed(1) + " L" + pts[r + 1][0].toFixed(1) + " " + pts[r + 1][1].toFixed(1) + '" style="stroke:var(--accent);stroke-opacity:' + op + ';stroke-width:6;stroke-linecap:round"/>';
      }
      s += '<path d="M' + pts[18][0] + " " + pts[18][1] + " L" + pts[22][0] + " " + pts[22][1] + '" style="stroke:var(--danger);stroke-width:3;stroke-dasharray:4 5"/>';
      s += '<text class="m-label" x="' + (pts[19][0] - 40) + '" y="' + (pts[19][1] - 22) + '">GPS dropout 12 s</text>';
      for (var d = 2; d < 40; d += 3) {
        if (d >= 18 && d <= 21) continue;
        s += '<path d="M' + pts[d][0].toFixed(0) + " " + (pts[d][1] - 7).toFixed(0) + " l6 7 -6 7 -6 -7z" + '" style="fill:var(--surface);stroke:var(--text);stroke-width:1.5"/>';
      }
      [[9, 14], [26, 30]].forEach(function (p) { var x0 = pts[p[0]][0], y0 = pts[p[0]][1] + 18; s += '<path d="M' + (x0 - 5) + " " + (y0 - 5) + "l10 10m0 -10l-10 10" + '" style="stroke:var(--warn);stroke-width:2.5"/>'; });
      s += '<circle cx="30" cy="470" r="9" style="fill:var(--ok);stroke:var(--surface);stroke-width:3"/><text class="m-label" x="44" y="494">start</text>';
      s += '<circle cx="985" cy="170" r="9" style="fill:var(--danger);stroke:var(--surface);stroke-width:3"/><text class="m-label" x="935" y="150">end</text>';
    }
    if (opt.diff) {
      s += '<g style="mix-blend-mode:normal;opacity:.75">' +
        '<rect x="-500" y="-300" width="2000" height="1200" style="fill:#F7F7F7;opacity:.25"/>' +
        '<ellipse cx="200" cy="180" rx="140" ry="80" style="fill:#92C5DE;opacity:.7"/><ellipse cx="480" cy="420" rx="160" ry="90" style="fill:#F4A582;opacity:.7"/>' +
        '<ellipse cx="880" cy="140" rx="120" ry="100" style="fill:#B2182B;opacity:.55"/><ellipse cx="120" cy="500" rx="100" ry="60" style="fill:#2166AC;opacity:.5"/>' +
        '<ellipse cx="660" cy="300" rx="50" ry="200" style="fill:#F7F7F7;opacity:.5"/></g>';
    }
    s += "</svg>";
    return s;
  }
  function renderMaps() {
    var els = document.querySelectorAll("[data-map]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i], v = el.getAttribute("data-map");
      el.innerHTML = townSVG({
        view: el.getAttribute("data-view") || undefined,
        track: v === "track",
        offset: v === "offset",
        mosaic: v === "mosaic",
        gpsTrack: v === "gps",
        diff: v === "diff",
        label: el.getAttribute("data-label") || undefined
      });
    }
  }

  /* ---------------- interactions ---------------- */
  function closestApp(el) { return (el && el.closest && el.closest(".app")) || document.querySelector(".app") || document.body; }
  function toast(msg, type, linkHref, linkText) {
    var app = closestApp(document.activeElement);
    var host = app.querySelector(".toasts");
    if (!host) { host = document.createElement("div"); host.className = "toasts"; host.setAttribute("aria-live", "polite"); app.style.position = "relative"; app.appendChild(host); }
    var map = { ok: "check", warn: "alert", danger: "xcircle", info: "info" };
    var t = document.createElement("div");
    t.className = "toast " + (type || "info");
    t.setAttribute("role", type === "danger" ? "alert" : "status");
    t.innerHTML = icon(map[type] || "info") + '<div><div>' + msg + "</div>" + (linkHref ? '<a href="' + linkHref + '">' + linkText + "</a>" : "") + '</div><button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Dismiss">' + icon("x") + "</button>";
    t.querySelector("button").addEventListener("click", function () { t.remove(); });
    host.appendChild(t);
    if (type === "ok" || type === "info" || !type) setTimeout(function () { if (t.parentNode) t.remove(); }, 6000);
  }

  function wire() {
    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-set],[data-action],[data-menu],[data-open-dialog],[data-close],[data-toast]") : null;
      // close open menus when clicking elsewhere
      var menus = document.querySelectorAll(".menu.open");
      for (var i = 0; i < menus.length; i++) if (!t || menus[i].previousElementSibling !== t) menus[i].classList.remove("open");
      if (!t) return;
      if (t.hasAttribute("data-set")) { var kv = t.getAttribute("data-set").split(":"); setPref(kv[0], kv[1]); return; }
      var a = t.getAttribute("data-action");
      if (a === "theme") { e.preventDefault(); setPref("theme", prefs.theme === "field" ? "analyst" : "field"); return; }
      if (a === "lang") { e.preventDefault(); setPref("lang", prefs.lang === "en" ? "hi" : "en"); return; }
      if (t.hasAttribute("data-menu")) {
        e.preventDefault();
        var m = t.nextElementSibling; if (m && m.classList.contains("menu")) { m.classList.toggle("open"); t.setAttribute("aria-expanded", String(m.classList.contains("open"))); }
        return;
      }
      if (t.hasAttribute("data-open-dialog")) {
        e.preventDefault();
        var d = document.getElementById(t.getAttribute("data-open-dialog"));
        if (d && d.showModal) d.showModal(); else if (d) d.setAttribute("open", "");
        return;
      }
      if (t.hasAttribute("data-close")) { var dl = t.closest("dialog"); if (dl) { e.preventDefault(); dl.close(); } }
      if (t.hasAttribute("data-toast")) {
        var parts = t.getAttribute("data-toast").split("|");
        toast(parts[0], parts[1], parts[2], parts[3]);
        if (t.tagName === "A" && t.getAttribute("href") === "#") e.preventDefault();
      }
    });

    // layer toggles
    document.addEventListener("change", function (e) {
      var inp = e.target;
      if (inp.hasAttribute && inp.hasAttribute("data-layer")) {
        var scope = inp.closest(".viewer") || document;
        var maps = scope.querySelectorAll(".map");
        var L = inp.getAttribute("data-layer");
        var cls = { conf: "show-conf", sem: "show-sem", track: "show-track", cp: "show-cp", mesh: "hide-mesh", ortho: "hide-ortho" }[L];
        var inverse = L === "mesh" || L === "ortho";
        for (var i = 0; i < maps.length; i++) maps[i].classList.toggle(cls, inverse ? !inp.checked : inp.checked);
        if ((L === "conf" || L === "sem") && inp.checked) {
          var other = scope.querySelector('[data-layer="' + (L === "conf" ? "sem" : "conf") + '"]');
          if (other && other.checked) { other.checked = false; other.dispatchEvent(new Event("change", { bubbles: true })); }
        }
        var sub = document.getElementById(inp.getAttribute("aria-controls") || "");
        if (sub) sub.hidden = !inp.checked;
        if (L === "splat-only") {}
      }
      if (inp.name === "cmpmode") {
        var cmp = document.querySelector(".compare");
        if (cmp) cmp.setAttribute("data-mode", inp.value);
      }
    });

    // simple tabs
    var tablists = document.querySelectorAll("[role='tablist']");
    for (var i = 0; i < tablists.length; i++) {
      (function (tl) {
        var tabs = tl.querySelectorAll("[role='tab']");
        function sel(tab) {
          for (var j = 0; j < tabs.length; j++) {
            var on = tabs[j] === tab;
            tabs[j].setAttribute("aria-selected", String(on));
            tabs[j].tabIndex = on ? 0 : -1;
            var p = document.getElementById(tabs[j].getAttribute("aria-controls"));
            if (p) p.hidden = !on;
          }
        }
        for (var j = 0; j < tabs.length; j++) {
          tabs[j].addEventListener("click", function () { sel(this); });
          tabs[j].addEventListener("keydown", function (e) {
            var arr = Array.prototype.slice.call(tabs), k = arr.indexOf(this);
            if (e.key === "ArrowRight") { e.preventDefault(); arr[(k + 1) % arr.length].focus(); sel(arr[(k + 1) % arr.length]); }
            if (e.key === "ArrowLeft") { e.preventDefault(); arr[(k - 1 + arr.length) % arr.length].focus(); sel(arr[(k - 1 + arr.length) % arr.length]); }
          });
        }
      })(tablists[i]);
    }

    // compare swipe
    var cmp = document.querySelector(".compare");
    if (cmp) {
      var range = document.getElementById("swipe");
      var setSplit = function (pct) { pct = Math.max(5, Math.min(95, pct)); cmp.style.setProperty("--split", pct + "%"); if (range) range.value = pct; };
      if (range) range.addEventListener("input", function () { setSplit(+range.value); });
      var handle = cmp.querySelector(".handle"), dragging = false;
      if (handle) {
        handle.addEventListener("pointerdown", function (e) { dragging = true; handle.setPointerCapture(e.pointerId); });
        handle.addEventListener("pointermove", function (e) { if (!dragging) return; var r = cmp.getBoundingClientRect(); setSplit((e.clientX - r.left) / r.width * 100); });
        handle.addEventListener("pointerup", function () { dragging = false; });
        handle.addEventListener("keydown", function (e) {
          var cur = parseFloat(getComputedStyle(cmp).getPropertyValue("--split")) || 50;
          if (e.key === "ArrowLeft") { e.preventDefault(); setSplit(cur - 5); }
          if (e.key === "ArrowRight") { e.preventDefault(); setSplit(cur + 5); }
        });
      }
    }

    // measurement tools (06-measure.html)
    var toolBtns = document.querySelectorAll("[data-tool-btn]");
    if (toolBtns.length) {
      var KEYS = { s: "select", d: "distance", h: "height", a: "area", v: "volume", p: "profile", c: "pick", b: "clip" };
      var setTool = function (name) {
        for (var i = 0; i < toolBtns.length; i++) toolBtns[i].setAttribute("aria-pressed", String(toolBtns[i].getAttribute("data-tool-btn") === name));
        var ps = document.querySelectorAll("[data-tool-panel]");
        for (var j = 0; j < ps.length; j++) ps[j].classList.toggle("on", ps[j].getAttribute("data-tool-panel") === name);
        var os = document.querySelectorAll(".overlay [data-tool]");
        for (var k = 0; k < os.length; k++) os[k].classList.toggle("on", os[k].getAttribute("data-tool").split(" ").indexOf(name) >= 0);
        var tbs = document.querySelectorAll(".toolbar [data-tool-btn]");
        for (var z = 0; z < tbs.length; z++) { var tn = tbs[z].getAttribute("data-tool-btn"); if (name === "splat" && tn !== "select" && tn !== "pick") tbs[z].setAttribute("aria-disabled", "true"); else tbs[z].removeAttribute("aria-disabled"); }
        var hints = document.querySelectorAll("[data-tool-hint]");
        for (var h = 0; h < hints.length; h++) hints[h].hidden = hints[h].getAttribute("data-tool-hint").split(" ").indexOf(name) < 0;
        var live = document.getElementById("measure-live");
        var card = document.querySelector('[data-tool-panel="' + name + '"] .m-val');
        if (live && card) live.textContent = name + ": " + card.textContent.trim();
      };
      for (var t = 0; t < toolBtns.length; t++) {
        toolBtns[t].addEventListener("click", function (e) {
          if (this.getAttribute("aria-disabled") === "true") { e.preventDefault(); return; }
          e.preventDefault();
          var n = this.getAttribute("data-tool-btn");
          try { history.replaceState(null, "", "#" + n); } catch (err) { location.hash = n; }
          setTool(n);
        });
      }
      document.addEventListener("keydown", function (e) {
        if (e.target.closest && e.target.closest("input,textarea,select,[contenteditable]")) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var n = KEYS[e.key.toLowerCase()];
        if (e.key === "Escape") n = "select";
        if (n && document.querySelector('[data-tool-btn="' + n + '"]')) { setTool(n); try { history.replaceState(null, "", "#" + n); } catch (err) {} }
      });
      var initial = (location.hash || "#distance").slice(1);
      if (!document.querySelector('[data-tool-btn="' + initial + '"]')) initial = "distance";
      setTool(initial);
    }
  }

  /* ---------------- boot ---------------- */
  function boot() {
    injectSprite();
    buildProtobar();
    expandIcons();
    renderMaps();
    buildAnnotations();
    applyLang();
    syncProtobar();
    wire();
    // initialise layer classes from checkbox state
    var ls = document.querySelectorAll("[data-layer]");
    for (var i = 0; i < ls.length; i++) ls[i].dispatchEvent(new Event("change", { bubbles: true }));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.Drishti3DWireframe = { icon: icon, toast: toast, townSVG: townSVG, screens: SCREENS };
})();
