/* ==========================================================================
   Ignis Leadership — site scripts
   Handles: cookie consent banner, gated GA4 loading, Calendly embed,
   and the lead-qualification form submission via Formspree.
   ========================================================================== */

/* ---------------------------------------------------------------------
   1) GOOGLE ANALYTICS 4
   GA only loads after the visitor accepts cookies (see consent logic
   below), so this stays compliant with UK/EU cookie rules by default.
   --------------------------------------------------------------------- */
var GA4_MEASUREMENT_ID = "G-F5LV9CKKTS";

function loadGA4(){
  if (window.__ga4Loaded) return;
  window.__ga4Loaded = true;
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_MEASUREMENT_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA4_MEASUREMENT_ID);
}

/* ---------------------------------------------------------------------
   2) COOKIE CONSENT BANNER
   Simple accept/decline banner. Choice is stored for 180 days.
   Analytics (GA4) is gated behind acceptance; essential site function
   (the enquiry form, Calendly) is not a tracking cookie and always works.
   --------------------------------------------------------------------- */
var COOKIE_NAME = "ignis_cookie_consent";

function getCookie(name){
  var match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, days){
  var expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires.toUTCString() + "; path=/; SameSite=Lax";
}

function initCookieBanner(){
  var banner = document.getElementById("cookie-banner");
  if (!banner) return;
  var consent = getCookie(COOKIE_NAME);

  if (consent === "accepted") {
    loadGA4();
  } else if (consent !== "declined") {
    // no prior choice recorded — show the banner
    window.setTimeout(function(){ banner.classList.add("visible"); }, 400);
  }

  var acceptBtn = document.getElementById("cookie-accept");
  var declineBtn = document.getElementById("cookie-decline");

  if (acceptBtn) {
    acceptBtn.addEventListener("click", function(){
      setCookie(COOKIE_NAME, "accepted", 180);
      banner.classList.remove("visible");
      loadGA4();
    });
  }
  if (declineBtn) {
    declineBtn.addEventListener("click", function(){
      setCookie(COOKIE_NAME, "declined", 180);
      banner.classList.remove("visible");
    });
  }
}

/* ---------------------------------------------------------------------
   3) CALENDLY — popup widget
   Every "Book a discovery call" button opens the Calendly scheduler
   in a popup overlay on the same page. The href is still set to the
   real Calendly link as a no-JS fallback.
   --------------------------------------------------------------------- */
var CALENDLY_URL = "https://calendly.com/yorik-tisseau-tmff/bid-capability-diagnostic";
var calendlyAssetsLoaded = false;

function loadCalendlyAssets(callback){
  if (calendlyAssetsLoaded) { if (callback) callback(); return; }
  calendlyAssetsLoaded = true;

  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://assets.calendly.com/assets/external/widget.css";
  document.head.appendChild(link);

  var script = document.createElement("script");
  script.src = "https://assets.calendly.com/assets/external/widget.js";
  script.async = true;
  script.onload = function(){ if (callback) callback(); };
  document.body.appendChild(script);
}

function openCalendlyPopup(){
  if (window.Calendly && window.Calendly.initPopupWidget) {
    window.Calendly.initPopupWidget({ url: CALENDLY_URL });
  } else {
    // Widget script hasn't finished loading yet — fall back to a new tab
    // rather than leaving the click with no effect.
    window.open(CALENDLY_URL, "_blank", "noopener");
  }
}

function initCalendly(){
  // Preload the popup assets as soon as the page is ready, so the first
  // click opens instantly instead of waiting on the network.
  loadCalendlyAssets();

  document.querySelectorAll("[data-calendly-link]").forEach(function(el){
    el.setAttribute("href", CALENDLY_URL);
    el.addEventListener("click", function(e){
      e.preventDefault();
      loadCalendlyAssets(openCalendlyPopup);
    });
  });
}

/* ---------------------------------------------------------------------
   3b) CALENDLY — inline widget
   Shown inside the qualification form's confirmation panel, so a lead
   who has just submitted their answers can book the diagnosis call
   immediately rather than being sent to a separate thank-you page.
   --------------------------------------------------------------------- */
var calendlyInlineInitialised = false;

function initCalendlyInlineEmbed(){
  var container = document.getElementById("calendly-inline-embed");
  if (!container) return;
  loadCalendlyAssets(function(){
    if (calendlyInlineInitialised) return;
    if (window.Calendly && window.Calendly.initInlineWidget) {
      window.Calendly.initInlineWidget({ url: CALENDLY_URL, parentElement: container });
      calendlyInlineInitialised = true;
    }
  });
}

/* ---------------------------------------------------------------------
   4) LEAD QUALIFICATION FORM — Formspree
   The form still degrades gracefully: without JS it posts normally
   and Formspree redirects back with its own thank-you page.
   --------------------------------------------------------------------- */
var FORMSPREE_ENDPOINT = "https://formspree.io/f/xbgrllwj";

// "Select all that apply" checkbox groups (challenges, tender value) need
// at least one box ticked, but a plain `required` attribute on one box
// would only force that specific box to be ticked. This keeps every box's
// required/validity state in sync so the browser blocks submission until
// at least one is checked, with a clear custom message, then clears the
// moment one is ticked.
function initCheckboxGroupValidation(form, fieldName, message){
  var boxes = form.querySelectorAll('input[name="' + fieldName + '"]');
  if (!boxes.length) return;

  function sync(){
    var anyChecked = Array.prototype.some.call(boxes, function(b){ return b.checked; });
    Array.prototype.forEach.call(boxes, function(b){
      b.required = !anyChecked;
      b.setCustomValidity(anyChecked ? "" : message);
    });
  }

  Array.prototype.forEach.call(boxes, function(b){
    b.addEventListener("change", sync);
  });
  sync();
}

function initForm(){
  var form = document.getElementById("qualify-form");
  if (!form) return;

  form.setAttribute("action", FORMSPREE_ENDPOINT);

  var statusEl = document.getElementById("form-status");
  var successPanel = document.getElementById("form-success");
  var submitBtn = form.querySelector("button[type=submit]");

  form.addEventListener("submit", function(e){
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      body: new FormData(form),
      headers: { "Accept": "application/json" }
    }).then(function(response){
      if (response.ok) {
        form.reset();
        // Reveal the confirmation panel (with its own embedded Calendly
        // scheduler) in place of the form, so the lead can book their
        // diagnosis straight away rather than landing on a dead end.
        form.hidden = true;
        if (successPanel) successPanel.hidden = false;
        initCalendlyInlineEmbed();
      } else {
        statusEl.textContent = "Something went wrong sending this. Please try again, or email us directly.";
        statusEl.className = "form-status error";
        statusEl.style.display = "block";
      }
    }).catch(function(){
      statusEl.textContent = "Something went wrong sending this. Please try again, or email us directly.";
      statusEl.className = "form-status error";
      statusEl.style.display = "block";
    }).finally(function(){
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit and choose a time";
    });
  });
}

/* ---------------------------------------------------------------------
   5) MOBILE MENU — hamburger toggle + full-screen overlay
   Only active at the mobile breakpoint (see assets/style.css); on wider
   screens the toggle is hidden and the overlay never displays.
   --------------------------------------------------------------------- */
function initMobileMenu(){
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  function closeMenu(){
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }
  function openMenu(){
    menu.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
  }

  toggle.addEventListener("click", function(){
    if (menu.classList.contains("open")) { closeMenu(); } else { openMenu(); }
  });

  menu.querySelectorAll("a").forEach(function(link){
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", function(){
    if (window.innerWidth > 640) closeMenu();
  });
}

/* ---------------------------------------------------------------------
   6) SCROLL-AWARE HEADER
   Keeps the navigation available without occupying the screen while the
   visitor is reading. It hides on downward movement, returns immediately
   on upward movement, and returns shortly after scrolling stops.
   --------------------------------------------------------------------- */
function initScrollAwareHeader(){
  var header = document.querySelector("body > header");
  if (!header) return;

  var lastY = Math.max(0, window.scrollY);
  var ticking = false;
  var revealTimer;

  function showHeader(){
    header.classList.remove("header-hidden");
  }

  function updateHeader(){
    var currentY = Math.max(0, window.scrollY);
    var delta = currentY - lastY;
    var menuOpen = document.body.classList.contains("menu-open");
    var headerFocused = header.contains(document.activeElement);

    if (currentY < 96 || menuOpen || headerFocused || delta < -2) {
      showHeader();
    } else if (delta > 2) {
      header.classList.add("header-hidden");
    }

    lastY = currentY;
    ticking = false;
  }

  window.addEventListener("scroll", function(){
    window.clearTimeout(revealTimer);
    revealTimer = window.setTimeout(showHeader, 700);
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  header.addEventListener("focusin", showHeader);
  header.addEventListener("pointerenter", showHeader);
}

/* ---------------------------------------------------------------------
   7) ARCHITECTURE DIAGRAM — tap/click to enlarge in a lightbox
   The diagram is dense, so on small screens it's shown as a thumbnail
   that opens full-size (native resolution, pan/pinch-zoom) on tap.
   --------------------------------------------------------------------- */
function initLightbox(){
  var pairs = [
    { trigger: "architecture-trigger", lightbox: "architecture-lightbox", close: "architecture-lightbox-close" },
    { trigger: "lifecycle-trigger", lightbox: "lifecycle-lightbox", close: "lifecycle-lightbox-close" }
  ];

  pairs.forEach(function(ids){
    var trigger = document.getElementById(ids.trigger);
    var lightbox = document.getElementById(ids.lightbox);
    var closeBtn = document.getElementById(ids.close);
    if (!trigger || !lightbox || !closeBtn) return;

    function openLightbox(){
      lightbox.classList.add("visible");
      document.body.classList.add("menu-open");
      closeBtn.focus();
    }
    function closeLightbox(){
      lightbox.classList.remove("visible");
      document.body.classList.remove("menu-open");
      trigger.focus();
    }

    trigger.addEventListener("click", openLightbox);
    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function(e){
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && lightbox.classList.contains("visible")) closeLightbox();
    });
  });
}

document.addEventListener("DOMContentLoaded", function(){
  initCookieBanner();
  initCalendly();
  initForm();
  initMobileMenu();
  initScrollAwareHeader();
  initLightbox();
});
