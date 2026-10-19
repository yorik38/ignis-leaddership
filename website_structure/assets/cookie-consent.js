/* Shared cookie choice for every page.
   Analytics (GA4 and HubSpot) load only after Accept.
   Reject records the choice, revokes HubSpot consent, denies GA storage
   and deletes the analytics cookies. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.ignisCookieConsent = api;
  if (typeof document !== "undefined") api.install(document, root);
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var CONSENT_NAME = "ignis_cookie_consent";
  var CONSENT_DAYS = 180;
  var GA4_ID = "G-F5LV9CKKTS";
  var HUBSPOT_SRC = "https://js-eu1.hs-scripts.com/149324702.js";
  var TRACKING_COOKIES = ["__hstc", "hubspotutk", "__hssc", "__hssrc", "_ga", "_ga_F5LV9CKKTS"];
  var EXPIRED = "Thu, 01 Jan 1970 00:00:00 GMT";
  var BANNER_HTML = '<div class="cookie-inner"><p class="cookie-text">We use a small number of cookies to understand how this site is used. Essential cookies are always on; analytics cookies only run if you accept. See our <a href="/privacy">Privacy Policy</a> for details.</p><div class="cookie-actions"><button class="cookie-btn decline" id="cookie-decline" type="button">Reject non-essential</button><button class="cookie-btn accept" id="cookie-accept" type="button">Accept</button></div></div>';

  function consentCookie(value, now) {
    var expires = new Date((now || Date.now()) + CONSENT_DAYS * 86400000);
    return CONSENT_NAME + "=" + encodeURIComponent(value) + "; expires=" + expires.toUTCString() + "; path=/; SameSite=Lax; Secure";
  }

  function clearDirectives(hostname) {
    var host = String(hostname || "");
    var domains = [];
    if (host) domains.push(host);
    if (domains.indexOf(".ignisleadership.com") === -1) domains.push(".ignisleadership.com");
    var directives = [];
    TRACKING_COOKIES.forEach(function (name) {
      directives.push(name + "=; expires=" + EXPIRED + "; Max-Age=0; path=/; SameSite=Lax");
      domains.forEach(function (domain) {
        directives.push(name + "=; expires=" + EXPIRED + "; Max-Age=0; path=/; domain=" + domain + "; SameSite=Lax");
      });
    });
    return directives;
  }

  function denyAnalytics(gtag) {
    if (typeof gtag !== "function") return;
    gtag("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
  }

  function withdraw(env) {
    var jar = env || {};
    var clears = clearDirectives(jar.hostname);
    if (typeof jar.setCookie === "function") {
      jar.setCookie(consentCookie("declined", jar.now));
      clears.forEach(jar.setCookie);
    }
    if (jar.hsq && typeof jar.hsq.push === "function") jar.hsq.push(["revokeCookieConsent"]);
    denyAnalytics(jar.gtag);
    return {consent: "declined", clears: clears};
  }

  function install(doc, windowRef) {
    if (!doc || !doc.body || !windowRef || windowRef.__ignisConsentInstalled) return;
    windowRef.__ignisConsentInstalled = true;

    function readCookie(name) {
      var match = doc.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
      return match ? decodeURIComponent(match[1]) : null;
    }

    function writeCookie(value) {
      doc.cookie = value;
    }

    function ensureGtag() {
      windowRef.dataLayer = windowRef.dataLayer || [];
      if (typeof windowRef.gtag !== "function") {
        windowRef.gtag = function () { windowRef.dataLayer.push(arguments); };
      }
      return windowRef.gtag;
    }

    ensureGtag()("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });

    function loadGA4() {
      if (readCookie(CONSENT_NAME) !== "accepted") return;
      if (windowRef.__ga4Loaded) return;
      windowRef.__ga4Loaded = true;
      ensureGtag()("consent", "update", {analytics_storage: "granted"});
      var script = doc.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_ID;
      doc.head.appendChild(script);
      windowRef.gtag("js", new Date());
      windowRef.gtag("config", GA4_ID);
    }

    function loadHubSpot() {
      if (readCookie(CONSENT_NAME) !== "accepted") return;
      if (windowRef.__hubSpotTrackingLoaded || doc.getElementById("hs-script-loader")) {
        windowRef.__hubSpotTrackingLoaded = true;
        return;
      }
      windowRef.__hubSpotTrackingLoaded = true;
      windowRef._hsq = windowRef._hsq || [];
      var script = doc.createElement("script");
      script.id = "hs-script-loader";
      script.async = true;
      script.defer = true;
      script.src = HUBSPOT_SRC;
      doc.body.appendChild(script);
    }

    function rejectTracking() {
      var hsq = windowRef._hsq;
      withdraw({
        hostname: windowRef.location && windowRef.location.hostname,
        now: Date.now(),
        setCookie: writeCookie,
        hsq: hsq,
        gtag: ensureGtag()
      });
    }

    function ensureBanner() {
      var banner = doc.getElementById("cookie-banner");
      if (!banner) {
        banner = doc.createElement("div");
        banner.id = "cookie-banner";
        banner.innerHTML = BANNER_HTML;
        doc.body.appendChild(banner);
      }
      if (banner.getAttribute("data-bound") === "true") return banner;
      banner.setAttribute("data-bound", "true");
      var accept = banner.querySelector("#cookie-accept");
      var decline = banner.querySelector("#cookie-decline");
      if (accept) {
        accept.addEventListener("click", function () {
          writeCookie(consentCookie("accepted"));
          banner.classList.remove("visible");
          loadGA4();
          loadHubSpot();
        });
      }
      if (decline) {
        decline.addEventListener("click", function () {
          rejectTracking();
          banner.classList.remove("visible");
        });
      }
      return banner;
    }

    function openSettings(event) {
      if (event && event.preventDefault) event.preventDefault();
      var banner = ensureBanner();
      banner.classList.add("visible");
    }

    windowRef.ignisOpenCookieSettings = openSettings;
    doc.addEventListener("click", function (event) {
      var target = event.target;
      var link = target && target.closest ? target.closest("[data-cookie-settings]") : null;
      if (!link) return;
      openSettings(event);
    });

    var consent = readCookie(CONSENT_NAME);
    if (consent === "accepted") {
      loadGA4();
      loadHubSpot();
      return;
    }
    if (consent === "declined") return;
    var banner = ensureBanner();
    windowRef.setTimeout(function () { banner.classList.add("visible"); }, 400);
  }

  return {
    CONSENT_NAME: CONSENT_NAME,
    CONSENT_DAYS: CONSENT_DAYS,
    TRACKING_COOKIES: TRACKING_COOKIES,
    consentCookie: consentCookie,
    clearDirectives: clearDirectives,
    withdraw: withdraw,
    install: install
  };
});
