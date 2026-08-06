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
var GA4_MEASUREMENT_ID = "G-XVS1KT7XS8";

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
var CALENDLY_URL = "https://calendly.com/yorik-tisseau-tmff/demo";
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
   4) LEAD QUALIFICATION FORM — Formspree
   The form still degrades gracefully: without JS it posts normally
   and Formspree redirects back with its own thank-you page.
   --------------------------------------------------------------------- */
var FORMSPREE_ENDPOINT = "https://formspree.io/f/xbgrllwj";

function initForm(){
  var form = document.getElementById("qualify-form");
  if (!form) return;

  form.setAttribute("action", FORMSPREE_ENDPOINT);

  var statusEl = document.getElementById("form-status");
  var successPanel = document.getElementById("form-success");
  var contactCta = document.getElementById("contact-cta");
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
        // Reveal the thank-you panel (with its own "Book a discovery call"
        // CTA) in place of the form, rather than sending people to a
        // separate thank-you page.
        form.hidden = true;
        if (successPanel) successPanel.hidden = false;
        if (contactCta) contactCta.hidden = true;
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
      submitBtn.textContent = "Send my answers";
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
   6) ARCHITECTURE DIAGRAM — tap/click to enlarge in a lightbox
   The diagram is dense, so on small screens it's shown as a thumbnail
   that opens full-size (native resolution, pan/pinch-zoom) on tap.
   --------------------------------------------------------------------- */
function initLightbox(){
  var trigger = document.getElementById("architecture-trigger");
  var lightbox = document.getElementById("architecture-lightbox");
  var closeBtn = document.getElementById("architecture-lightbox-close");
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
}

document.addEventListener("DOMContentLoaded", function(){
  initCookieBanner();
  initCalendly();
  initForm();
  initMobileMenu();
  initLightbox();
});
