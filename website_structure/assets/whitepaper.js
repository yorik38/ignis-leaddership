(function () {
  "use strict";

  function revealWhitepaperDownload(pdfUrl, options) {
    var url = pdfUrl;
    var slot = document.getElementById("hubspot-whitepaper-form");
    var ready = document.getElementById("whitepaper-download");
    var link = document.getElementById("whitepaper-download-link");
    var direct = document.getElementById("whitepaper-direct-link");
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
    if (direct) direct.hidden = true;
    ready.hidden = false;
    if (slot) slot.hidden = true;
    if (ready.focus) ready.focus({preventScroll: true});
    ready.scrollIntoView({behavior: "smooth", block: "start"});
  }

  // Called from the HubSpot embed onFormSubmitted callback once portalId and formId are set.
  window.ignisRevealWhitepaperDownload = revealWhitepaperDownload;

  function ensureStarted(form) {
    var field = form.querySelector("[name=form_started_at]");
    if (field && !field.value) field.value = String(Date.now());
  }

  function resourceOf(form) {
    var field = form.querySelector('[name="resource"]');
    return field && field.value ? String(field.value).trim() : "";
  }

  function showDirectDownload(pdfUrl) {
    if (!pdfUrl) return;
    var slot = document.getElementById("hubspot-whitepaper-form");
    if (!slot || !slot.parentNode) return;
    var block = document.getElementById("whitepaper-free-download");
    if (!block) {
      block = document.createElement("div");
      block.id = "whitepaper-free-download";
      block.className = "wp-free-download";
      var label = document.createElement("p");
      label.className = "wp-free-label";
      label.textContent = "Free to read";
      var link = document.createElement("a");
      link.id = "whitepaper-direct-link";
      link.className = "wp-download-link";
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Download the PDF";
      block.appendChild(label);
      block.appendChild(link);
      slot.parentNode.insertBefore(block, slot);
    }
    document.getElementById("whitepaper-direct-link").href = pdfUrl;
    slot.hidden = true;
  }

  function startDownload(url) {
    var link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function showPopupSuccess(form, data) {
    var dialog = form.closest("dialog");
    var success = dialog && dialog.querySelector("[data-download-success]");
    var fallback = dialog && dialog.querySelector("[data-download-fallback]");
    if (fallback) {
      fallback.href = data.pdf;
      fallback.target = "_blank";
      fallback.rel = "noopener";
    }
    form.hidden = true;
    if (success) success.hidden = false;
    if (dialog) dialog.setAttribute("aria-labelledby", "wp-download-success-title");
    startDownload(data.pdf);
    if (success && success.focus) success.focus();
  }

  function formErrorText(value, fallback) {
    var message = value;
    if (value && typeof value === "object") message = value.message;
    if (typeof message === "string") {
      var trimmed = message.trim();
      if (trimmed && trimmed !== "[object Object]") return trimmed;
    }
    return fallback;
  }

  function paperDialog(button) {
    var id = button.getAttribute("aria-controls");
    return (id && document.getElementById(id)) || document.querySelector("dialog[data-paper]");
  }

  function openDownloadDialog(button) {
    var dialog = paperDialog(button);
    if (!dialog || typeof dialog.showModal !== "function" || dialog.open) return;
    var form = dialog.querySelector("[data-whitepaper-form]");
    var success = dialog.querySelector("[data-download-success]");
    if (form) form.hidden = false;
    if (success) success.hidden = true;
    dialog._opener = button;
    dialog.setAttribute("aria-labelledby", "wp-download-dialog-title");
    dialog.showModal();
    var email = dialog.querySelector('input[type="email"]');
    if (email) email.focus();
  }

  document.querySelectorAll("dialog[data-paper]").forEach(function (dialog) {
    var key = dialog.getAttribute("data-paper");
    var field = dialog.querySelector('[name="resource"]');
    if (field && key) field.value = key;
    dialog.querySelectorAll("[data-dialog-close]").forEach(function (close) {
      close.addEventListener("click", function () { dialog.close(); });
    });
    dialog.addEventListener("close", function () {
      if (dialog._opener && dialog._opener.focus) dialog._opener.focus();
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
  });

  document.querySelectorAll("[data-download-open]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      openDownloadDialog(button);
    });
  });

  document.querySelectorAll("[data-whitepaper-form]").forEach(function (form) {
    ensureStarted(form);
    var resource = resourceOf(form);
    var popup = form.hasAttribute("data-whitepaper-popup");
    if (resource && !popup) {
      fetch("/api/whitepaper?resource=" + encodeURIComponent(resource), {
        headers: {Accept: "application/json"}
      }).then(function (response) {
        return response.json().catch(function () { return {}; });
      }).then(function (data) {
        if (data && data.gated === false && data.pdf) showDirectDownload(data.pdf);
      }).catch(function () {});
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var button = form.querySelector("button[type=submit]");
      var status = form.querySelector("[data-form-status]");
      var payload = Object.fromEntries(new FormData(form).entries());
      payload.page_url = window.location.href;
      if (document.referrer) payload.referrer = document.referrer;
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
          if (!response.ok || !data.ok) throw new Error(formErrorText(data.error, "We could not send your paper just now."));
          return data;
        });
      }).then(function (data) {
        if (!data.pdf) throw new Error("We could not send your paper just now.");
        if (form.hasAttribute("data-whitepaper-popup")) {
          showPopupSuccess(form, data);
          return;
        }
        revealWhitepaperDownload(data.pdf, {
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
    var highAt = Number(card.getAttribute("data-high-at") || 7);
    var midAt = Number(card.getAttribute("data-mid-at") || 4);
    label.textContent = ticked >= highAt ? high : ticked >= midAt ? mid : low;
    card.dataset.band = ticked >= highAt ? "g" : ticked >= midAt ? "a" : "r";
  }

  boxes.forEach(function (box) {
    box.addEventListener("change", updateScore);
  });
})();
