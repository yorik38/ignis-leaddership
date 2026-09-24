/* ==========================================================================
   Ignis Leadership: site scripts
   Handles: cookie consent banner, gated analytics loading, Calendly embed,
   and the lead-qualification form submission via HubSpot.
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
   2) HUBSPOT TRACKING
   HubSpot portal 149324702 loads alongside GA4 after analytics consent.
   --------------------------------------------------------------------- */
function loadHubSpotTracking(){
  if (window.__hubSpotTrackingLoaded) return;
  window.__hubSpotTrackingLoaded = true;
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.id = "hs-script-loader";
  s.async = true;
  s.defer = true;
  s.src = "https://js-eu1.hs-scripts.com/149324702.js";
  document.body.appendChild(s);
}

/* ---------------------------------------------------------------------
   3) COOKIE CONSENT BANNER
   Simple accept/decline banner. Choice is stored for 180 days.
   Analytics (GA4 and HubSpot) is gated behind acceptance; essential site function
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
  var consent = getCookie(COOKIE_NAME);
  var banner = document.getElementById("cookie-banner");

  if (consent === "accepted") {
    loadGA4();
    loadHubSpotTracking();
  }

  // Most pages are static documents, so add the shared consent banner when
  // the page does not already contain the homepage version.
  if (!banner && consent !== "accepted" && consent !== "declined") {
    banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.innerHTML = '<div class="cookie-inner"><p class="cookie-text">We use a small number of cookies to understand how this site is used. Essential cookies are always on; analytics cookies only run if you accept. See our <a href="/privacy">Privacy Policy</a> for details.</p><div class="cookie-actions"><button class="cookie-btn decline" id="cookie-decline">Decline</button><button class="cookie-btn accept" id="cookie-accept">Accept</button></div></div>';
    document.body.appendChild(banner);
  }

  if (!banner) return;

  if (consent !== "accepted" && consent !== "declined") {
    // no prior choice recorded; show the banner
    window.setTimeout(function(){ banner.classList.add("visible"); }, 400);
  }

  var acceptBtn = document.getElementById("cookie-accept");
  var declineBtn = document.getElementById("cookie-decline");

  if (acceptBtn) {
    acceptBtn.addEventListener("click", function(){
      setCookie(COOKIE_NAME, "accepted", 180);
      banner.classList.remove("visible");
      loadGA4();
      loadHubSpotTracking();
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
   4) CALENDLY: popup widget
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
    // Widget script hasn't finished loading yet; fall back to a new tab
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
   3b) CALENDLY: inline widget
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
   5) LEAD QUALIFICATION FORM: HubSpot
   The visible form stays fully on-brand while the serverless endpoint
   records the enquiry and source fields in HubSpot.
   --------------------------------------------------------------------- */
var CONTACT_ENDPOINT = "/api/contact";

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

function initServiceRouteSelection(){
  var routes = document.querySelectorAll("[data-service-interest]");
  var choices = document.querySelectorAll('input[name="service_interest"]');
  if (!choices.length) return;

  function selectService(requestedValue){
    Array.prototype.forEach.call(choices, function(choice){
      if (choice.value !== requestedValue) return;
      choice.checked = true;
      choice.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  Array.prototype.forEach.call(routes, function(route){
    route.addEventListener("click", function(){
      selectService(route.getAttribute("data-service-interest"));
    });
  });

  var requestedService = new URLSearchParams(window.location.search).get("service");
  if (requestedService) selectService(requestedService);
}

function initForm(){
  var form = document.getElementById("qualify-form");
  if (!form) return;

  form.setAttribute("action", CONTACT_ENDPOINT);

  var statusEl = document.getElementById("form-status");
  var successPanel = document.getElementById("form-success");
  var submitBtn = form.querySelector("button[type=submit]");
  var serviceChoices = form.querySelectorAll('input[name="service_interest"]');
  var serviceChoiceError = document.getElementById("service-choice-error");

  form.addEventListener("invalid", function(event){
    if (event.target && event.target.name === "service_interest" && serviceChoiceError) {
      serviceChoiceError.hidden = false;
    }
    statusEl.textContent = event.target && event.target.name === "service_interest"
      ? "Choose what you would like to discuss before sending."
      : "Complete the highlighted required field before sending.";
    statusEl.className = "form-status error";
    statusEl.style.display = "block";
  }, true);

  Array.prototype.forEach.call(serviceChoices, function(choice){
    choice.addEventListener("change", function(){
      if (serviceChoiceError) serviceChoiceError.hidden = true;
      statusEl.style.display = "none";
    });
  });

  form.addEventListener("submit", function(e){
    e.preventDefault();
    statusEl.style.display = "none";
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    var values = {};
    new FormData(form).forEach(function(value, key){
      if (Object.prototype.hasOwnProperty.call(values, key)) return;
      values[key] = value;
    });
    values.page_url = window.location.href;
    values.source = new URLSearchParams(window.location.search).get("utm_source") || "website";

    fetch(CONTACT_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(values),
      headers: { "Accept": "application/json", "Content-Type": "application/json" }
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
      submitBtn.textContent = "Start the conversation →";
    });
  });
}

/* ---------------------------------------------------------------------
   6) PRIMARY NAVIGATION
   Keep the same short navigation story across every static page. Older
   pages retain their source markup as a no-JavaScript fallback, while this
   shared layer prevents templates from drifting apart in normal use.
   --------------------------------------------------------------------- */
function initPrimaryNavigation(){
  var currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  var links = [
    { label: "How it works", href: "/forge", active: currentPath === "/forge" },
    { label: "Win or buy", href: "/win-or-buy", active: currentPath === "/win-or-buy" },
    { label: "Insights", href: "/insights", active: currentPath === "/insights" || currentPath.indexOf("/insights/") === 0 }
  ];

  document.querySelectorAll(".nav-links").forEach(function(nav){
    nav.innerHTML = links.map(function(link){
      return '<a href="' + link.href + '" class="navlink"' + (link.active ? ' aria-current="page"' : '') + '>' + link.label + '</a>';
    }).join("") + '<div class="nav-ctas"><a class="cta-link" href="/#contact">Start a conversation →</a></div>';
  });

  document.querySelectorAll(".mobile-menu-links").forEach(function(nav){
    nav.innerHTML = links.map(function(link){
      return '<a href="' + link.href + '" class="mobile-navlink"' + (link.active ? ' aria-current="page"' : '') + '>' + link.label + '</a>';
    }).join("");
  });

  document.querySelectorAll(".mobile-menu-cta").forEach(function(link){
    link.href = "/#contact";
    link.textContent = "Start a conversation →";
  });
}

/* ---------------------------------------------------------------------
   Legacy dropdown builders. These remain for archived markup but the
   simplified primary navigation no longer exposes either dropdown.
   --------------------------------------------------------------------- */
function initServicesNavigation(){
  var overviewHref = window.location.pathname === "/" ? "#services" : "/#services";
  var currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  var desktopServiceLink = document.querySelector('.nav-links > a.navlink[href="/#services"]:not([data-no-services-menu])');

  if (desktopServiceLink) {
    var dropdown = document.createElement("div");
    dropdown.className = "nav-dropdown";
    dropdown.innerHTML = '<button type="button" class="navlink nav-dropdown-trigger" aria-haspopup="true">Services <span aria-hidden="true">⌄</span></button><div class="nav-dropdown-menu nav-services-menu" data-nav-menu="services" aria-label="Service sections"><a class="nav-resource-hub" href="' + overviewHref + '"><strong>Services overview</strong><span>From commercial problem to adopted system.</span></a><a class="nav-resource-hub" href="/discovery"><strong>Commercial Discovery</strong><span>Find the one workflow worth fixing first.</span></a><a class="nav-resource-hub" href="/forge"><strong>FORGE</strong><span>A governed agentic system for bids and tenders.</span></a></div>';
    desktopServiceLink.replaceWith(dropdown);
    if (currentPath === "/discovery" || currentPath === "/forge") {
      dropdown.querySelector(".nav-dropdown-trigger").setAttribute("aria-current", "page");
      var currentService = dropdown.querySelector('a[href="' + currentPath + '"]');
      if (currentService) currentService.setAttribute("aria-current", "page");
    }
  }

  var mobileServiceLink = document.querySelector('.mobile-menu-links > a.mobile-navlink[href="/#services"]:not([data-no-services-menu])');
  if (mobileServiceLink) {
    var label = document.createElement("span");
    label.className = "mobile-navlink mobile-nav-group-label";
    label.textContent = "Services";

    var links = document.createElement("div");
    links.className = "mobile-resource-links mobile-service-links";
    links.setAttribute("aria-label", "Service sections");
    links.innerHTML = '<a href="' + overviewHref + '"><strong>Services overview</strong><span>From commercial problem to adopted system.</span></a><a href="/discovery"><strong>Commercial Discovery</strong><span>Find the one workflow worth fixing first.</span></a><a href="/forge"><strong>FORGE</strong><span>A governed agentic system for bids and tenders.</span></a>';

    mobileServiceLink.replaceWith(label, links);
  }
}

/* ---------------------------------------------------------------------
   7) RESOURCE NAVIGATION
   Keeps the richer desktop guide list and simpler mobile hub cards
   consistent across the static site without duplicating menu markup.
   --------------------------------------------------------------------- */
function initResourceNavigation(){
  var currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  var isInsights = currentPath === "/insights" || currentPath.indexOf("/insights/") === 0 || currentPath === "/archive";
  var isResources = currentPath === "/resources" || currentPath.indexOf("/resources/") === 0 || currentPath === "/commercial-ai-readiness" || currentPath === "/forge-pilot-example";

  var desktopMarkup = [
    '<a class="nav-resource-hub" href="/insights"><strong>Insights</strong><span>Bid More. Win More. Newsletter</span></a>',
    '<a class="nav-resource-hub" href="/commercial-ai-readiness"><strong>Commercial AI Readiness Check</strong><span>Find the safest workflow to test first.</span></a>',
    '<a class="nav-resource-hub" href="/forge-pilot-example"><strong>Worked FORGE pilot example</strong><span>See the workflow, controls and pilot measures.</span></a>',
    '<div class="nav-resource-section">',
      '<a class="nav-resource-hub" href="/resources"><strong>Human-Agent Systems</strong><span>Practical guides for commercial teams.</span></a>',
      '<div class="nav-resource-guide-list">',
        '<span class="nav-resource-list-label">Practical guides</span>',
        '<a class="nav-resource-guide" href="/resources/ai-augmented-bid-practice"><strong>How to build an AI-augmented bid practice</strong></a>',
        '<a class="nav-resource-guide" href="/resources/bid-agent-maturity"><strong>What can bid teams build with AI agents in 2026?</strong></a>',
        '<a class="nav-resource-guide" href="/resources/choose-first-ai-bid-use-case"><strong>Where should bid teams start with AI agents?</strong></a>',
      '</div>',
    '</div>'
  ].join("");

  document.querySelectorAll('.nav-dropdown-menu:not([data-nav-menu="services"])').forEach(function(menu){
    menu.innerHTML = desktopMarkup;
    var parentTrigger = menu.closest(".nav-dropdown") && menu.closest(".nav-dropdown").querySelector(".nav-dropdown-trigger");
    var insightsLink = menu.querySelector('a[href="/insights"]');
    var resourcesLink = menu.querySelector('a[href="/resources"]');
    var exactGuide = menu.querySelector('.nav-resource-guide[href="' + currentPath + '"]');
    var exactResource = menu.querySelector('.nav-resource-hub[href="' + currentPath + '"]');
    if ((isInsights || isResources) && parentTrigger) parentTrigger.setAttribute("aria-current", "page");
    if (isInsights && insightsLink) insightsLink.setAttribute("aria-current", "page");
    if (isResources && resourcesLink) resourcesLink.setAttribute("aria-current", "page");
    if (exactGuide) exactGuide.setAttribute("aria-current", "page");
    if (exactResource) exactResource.setAttribute("aria-current", "page");
  });

  var mobileMarkup = [
    '<a href="/insights"><strong>Insights</strong><span>Bid More. Win More. Newsletter</span></a>',
    '<a href="/commercial-ai-readiness"><strong>Commercial AI Readiness Check</strong><span>Find the safest workflow to test first.</span></a>',
    '<a href="/forge-pilot-example"><strong>Worked FORGE pilot example</strong><span>See the workflow and controls.</span></a>',
    '<a href="/resources"><strong>Human-Agent Systems</strong><span>Practical guides for commercial teams.</span></a>'
  ].join("");

  document.querySelectorAll(".mobile-resource-links:not(.mobile-service-links)").forEach(function(menu){
    menu.innerHTML = mobileMarkup;
    var insightsLink = menu.querySelector('a[href="/insights"]');
    var resourcesLink = menu.querySelector('a[href="/resources"]');
    if (isInsights && insightsLink) insightsLink.setAttribute("aria-current", "page");
    if (isResources && resourcesLink) resourcesLink.setAttribute("aria-current", "page");
  });
}

function initDeferredAnchorTarget(){
  if (!window.location.hash) return;
  var targetId = decodeURIComponent(window.location.hash.slice(1));

  function alignTarget(){
    var target = document.getElementById(targetId);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
  }

  window.setTimeout(alignTarget, 0);
  window.setTimeout(alignTarget, 500);
  window.addEventListener("load", function(){ window.setTimeout(alignTarget, 100); }, { once: true });
}

/* ---------------------------------------------------------------------
   7) MOBILE MENU: hamburger toggle + full-screen overlay
   Only active at the mobile breakpoint (see assets/style.css); on wider
   screens the toggle is hidden and the overlay never displays.
   --------------------------------------------------------------------- */
function initMobileMenu(){
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  var serviceLinks = menu.querySelector(".mobile-service-links");
  var serviceLabel = serviceLinks && serviceLinks.previousElementSibling;
  var serviceToggle;

  if (serviceLinks && serviceLabel && serviceLabel.classList.contains("mobile-nav-group-label")) {
    serviceToggle = document.createElement("button");
    serviceToggle.type = "button";
    serviceToggle.className = "mobile-navlink mobile-services-toggle";
    serviceToggle.setAttribute("aria-expanded", "false");
    serviceToggle.setAttribute("aria-controls", "mobile-service-links");
    serviceToggle.innerHTML = '<span>Services</span><span class="mobile-nav-arrow" aria-hidden="true">⌄</span>';
    serviceLinks.id = "mobile-service-links";
    serviceLinks.hidden = true;
    serviceLabel.replaceWith(serviceToggle);

    serviceToggle.addEventListener("click", function(){
      var isOpen = serviceToggle.getAttribute("aria-expanded") === "true";
      serviceToggle.setAttribute("aria-expanded", String(!isOpen));
      serviceLinks.hidden = isOpen;
    });
  }

  function collapseServices(){
    if (!serviceToggle || !serviceLinks) return;
    serviceToggle.setAttribute("aria-expanded", "false");
    serviceLinks.hidden = true;
  }

  function closeMenu(){
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    collapseServices();
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
    if (window.innerWidth > 1024) closeMenu();
  });
}

/* ---------------------------------------------------------------------
   8) SCROLL-AWARE HEADER
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
   9) ARCHITECTURE DIAGRAM: tap/click to enlarge in a lightbox
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

function initAiOpportunityTimeline(){
  var timeline = document.querySelector("[data-ai-lifecycle]");
  if (!timeline) return;

  function positionFirstDot(){
    var node = timeline.querySelector(".ai-path-capture");
    var dot = node && node.querySelector("i");
    var path = timeline.querySelector(".ai-path-guide");
    if (!dot || !path) return;
    if (window.matchMedia("(max-width: 820px)").matches) {
      dot.style.removeProperty("left");
      dot.style.removeProperty("top");
      return;
    }
    var point = path.getPointAtLength(path.getTotalLength() * 0.04);
    dot.style.left = (point.x * timeline.clientWidth / 1000 - node.offsetLeft - dot.offsetWidth / 2) + "px";
    dot.style.top = (point.y * timeline.clientHeight / 280 - node.offsetTop - dot.offsetHeight / 2) + "px";
  }
  positionFirstDot();
  window.addEventListener("resize", positionFirstDot);

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    timeline.classList.add("is-visible");
    return;
  }

  timeline.classList.add("ai-motion-ready");
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (!entry.isIntersecting) return;
      timeline.classList.add("is-visible");
      observer.disconnect();
    });
  }, {threshold:0.15, rootMargin:"0px 0px -10%"});
  observer.observe(timeline);
}

function initAiCardAccordion(){
  var cards = Array.prototype.slice.call(document.querySelectorAll(".ai-opportunity-card"));
  if (!cards.length || !window.matchMedia) return;

  var mobile = window.matchMedia("(max-width: 680px)");

  function setCard(card, expanded){
    var button = card.querySelector(".ai-card-toggle");
    var content = card.querySelector(".ai-card-content");
    if (!button || !content) return;
    button.setAttribute("aria-expanded", expanded ? "true" : "false");
    card.classList.toggle("is-collapsed", !expanded);
    if (expanded) {
      content.removeAttribute("aria-hidden");
      content.removeAttribute("inert");
    } else {
      content.setAttribute("aria-hidden", "true");
      content.setAttribute("inert", "");
    }
  }

  function applyMode(){
    cards.forEach(function(card, index){
      var button = card.querySelector(".ai-card-toggle");
      if (!button) return;
      if (mobile.matches) {
        button.removeAttribute("tabindex");
        setCard(card, index === 0);
      } else {
        button.setAttribute("tabindex", "-1");
        setCard(card, true);
      }
    });
  }

  cards.forEach(function(card){
    var button = card.querySelector(".ai-card-toggle");
    if (!button) return;
    button.addEventListener("click", function(){
      if (!mobile.matches || button.getAttribute("aria-expanded") === "true") return;
      cards.forEach(function(item){ setCard(item, item === card); });
    });
  });

  if (mobile.addEventListener) mobile.addEventListener("change", applyMode);
  else mobile.addListener(applyMode);
  applyMode();
}

function initFaqAccordion(){
  var items = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));
  if (!items.length || !window.matchMedia) return;

  var mobile = window.matchMedia("(max-width: 700px)");

  function applyMode(){
    items.forEach(function(item, index){
      item.open = mobile.matches ? index === 0 : true;
    });
  }

  items.forEach(function(item){
    item.addEventListener("toggle", function(){
      if (!mobile.matches || !item.open) return;
      items.forEach(function(other){
        if (other !== item) other.open = false;
      });
    });
  });

  if (mobile.addEventListener) mobile.addEventListener("change", applyMode);
  else mobile.addListener(applyMode);
  applyMode();
}

document.addEventListener("DOMContentLoaded", function(){
  initCookieBanner();
  initCalendly();
  initForm();
  initServiceRouteSelection();
  initPrimaryNavigation();
  initServicesNavigation();
  initResourceNavigation();
  initDeferredAnchorTarget();
  initMobileMenu();
  initScrollAwareHeader();
  initLightbox();
  initAiOpportunityTimeline();
  initAiCardAccordion();
  initFaqAccordion();
});
