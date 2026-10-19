(function () {
  "use strict";

  function pageValue(name, fallback) {
    var value = document.body.getAttribute(name);
    return value === null ? fallback : value;
  }
  var PDF_URL = pageValue("data-whitepaper-pdf", "/assets/downloads/guide-01-bids-whitepaper.pdf");
  var STORAGE_KEY = pageValue("data-whitepaper-key", "ignis-whitepaper-bids-won-on-evidence");

  function revealWhitepaperDownload(pdfUrl, options) {
    var url = pdfUrl || PDF_URL;
    var slot = document.getElementById("hubspot-whitepaper-form");
    var ready = document.getElementById("whitepaper-download");
    var link = document.getElementById("whitepaper-download-link");
    if (!url || !ready || !link) return;
    var signal = ready.querySelector("[data-thanks-signal]");
    var card = ready.closest(".wp-gate-card");
    var intro = card && card.querySelector(".wp-gate-intro");
    link.href = url;
    if (signal) {
      signal.hidden = true;
      signal.textContent = "";
      if (options && options.newsletterSubscribed) {
        signal.hidden = false;
        signal.textContent = "You're on Signal too: the weekly newsletter and an occasional update. We won't fill your inbox.";
      } else if (options && options.warning === "newsletter_submission_failed") {
        signal.hidden = false;
        signal.textContent = "We could not add you to Signal just now. The PDF is still on its way.";
      }
    }
    if (intro) intro.hidden = true;
    if (card) card.classList.add("is-thanks");
    ready.hidden = false;
    if (slot) slot.hidden = true;
    try {
      sessionStorage.setItem(STORAGE_KEY, options && options.newsletterSubscribed ? "signal" : "1");
    } catch (error) {}
    if (ready.focus) ready.focus();
  }

  // Called from the HubSpot embed onFormSubmitted callback once portalId and formId are set.
  window.ignisRevealWhitepaperDownload = revealWhitepaperDownload;

  try {
    var stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "1" || stored === "signal") {
      revealWhitepaperDownload(PDF_URL, {newsletterSubscribed: stored === "signal"});
    }
  } catch (error) {}

  function pdfFor(form) {
    return form.getAttribute("data-pdf") || PDF_URL;
  }

  function ensureStarted(form) {
    var field = form.querySelector("[name=form_started_at]");
    if (field && !field.value) field.value = String(Date.now());
  }

  document.querySelectorAll("[data-whitepaper-form]").forEach(function (form) {
    ensureStarted(form);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var button = form.querySelector("button[type=submit]");
      var status = form.querySelector("[data-form-status]");
      var expectedPdf = pdfFor(form);
      var payload = Object.fromEntries(new FormData(form).entries());
      payload.page_url = window.location.href;
      var hutk = document.cookie.match(/(?:^|; )hubspotutk=([^;]*)/);
      if (hutk && hutk[1]) payload.hutk = decodeURIComponent(hutk[1]);
      if (button) button.disabled = true;
      if (status) status.textContent = "Sending your request…";
      var delay = window.ignisFormDelay ? window.ignisFormDelay(form) : Promise.resolve();
      delay.then(function () {
        return fetch(form.action, {
          method: "POST",
          headers: {"Content-Type": "application/json", "Accept": "application/json"},
          body: JSON.stringify(payload)
        });
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          if (!response.ok || !data.ok) throw new Error(data.error || "We could not send your paper just now.");
          return data;
        });
      }).then(function (data) {
        if (data.pdf !== expectedPdf) throw new Error("The paper link did not match this page.");
        revealWhitepaperDownload(expectedPdf, {
          newsletterSubscribed: !!data.newsletterSubscribed,
          warning: data.warning
        });
      }).catch(function (error) {
        var message = error && error.message ? error.message : "We could not send your paper just now.";
        if (status) status.textContent = /try again|wait a few minutes|security check/i.test(message) ? message : message + " Please try again.";
        if (window.ignisResetTurnstile) window.ignisResetTurnstile(form);
        if (button) button.disabled = false;
      });
    });
  });

  var boxes = document.querySelectorAll(".sc input");
  var count = document.getElementById("sc-n");
  var label = document.getElementById("sc-l");
  var card = document.querySelector(".sc");
  if (!boxes.length || !count || !label || !card) return;

  function updateScore() {
    var ticked = 0;
    boxes.forEach(function (box) {
      if (box.checked) ticked += 1;
    });
    count.textContent = String(ticked);
    var low = card.getAttribute("data-band-low") || "Start with the bid or no-bid gate";
    var mid = card.getAttribute("data-band-mid") || "Fix the gaps first";
    var high = card.getAttribute("data-band-high") || "Ready to scale";
    label.textContent = ticked >= 7 ? high : ticked >= 4 ? mid : low;
    card.dataset.band = ticked >= 7 ? "g" : ticked >= 4 ? "a" : "r";
  }

  boxes.forEach(function (box) {
    box.addEventListener("change", updateScore);
  });
})();
