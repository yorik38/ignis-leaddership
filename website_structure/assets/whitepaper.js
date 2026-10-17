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

  document.querySelectorAll(".wp-signup-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      if (form.classList.contains("wp-download-form") && !form.checkValidity()) return;
      event.preventDefault();
      if (!form.classList.contains("wp-download-form")) return;
      revealWhitepaperDownload();
      if (!PDF_URL) return;
      var link = document.getElementById("whitepaper-download-link");
      if (link && link.getAttribute("href")) link.click();
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
