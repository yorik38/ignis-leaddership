(function () {
  "use strict";

  function pageValue(name, fallback) {
    var value = document.body.getAttribute(name);
    return value === null ? fallback : value;
  }
  var PDF_URL = pageValue("data-whitepaper-pdf", "/assets/downloads/guide-01-bids-whitepaper.pdf");
  var STORAGE_KEY = pageValue("data-whitepaper-key", "ignis-whitepaper-bids-won-on-evidence");

  function revealWhitepaperDownload() {
    var slot = document.getElementById("hubspot-whitepaper-form");
    var ready = document.getElementById("whitepaper-download");
    var link = document.getElementById("whitepaper-download-link");
    if (!PDF_URL || !ready || !link) return;
    link.href = PDF_URL;
    ready.hidden = false;
    if (slot) slot.hidden = true;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (error) {}
  }

  // Called from the HubSpot embed onFormSubmitted callback once portalId and formId are set.
  window.ignisRevealWhitepaperDownload = revealWhitepaperDownload;

  try {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") revealWhitepaperDownload();
  } catch (error) {}

  document.querySelectorAll("[data-whitepaper-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var button = form.querySelector("button[type=submit]");
      var status = form.querySelector("[data-form-status]");
      var payload = Object.fromEntries(new FormData(form).entries());
      payload.page_url = window.location.href;
      if (button) button.disabled = true;
      if (status) status.textContent = "Sending your request…";
      fetch(form.action, {
        method: "POST",
        headers: {"Content-Type": "application/json", "Accept": "application/json"},
        body: JSON.stringify(payload)
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          if (!response.ok || !data.ok) throw new Error(data.error || "We could not send your paper just now.");
          return data;
        });
      }).then(function (data) {
        if (data.pdf !== PDF_URL) throw new Error("The paper link did not match this page.");
        revealWhitepaperDownload();
        var link = document.getElementById("whitepaper-download-link");
        if (link) link.click();
      }).catch(function (error) {
        if (status) status.textContent = error.message + " Please try again.";
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
