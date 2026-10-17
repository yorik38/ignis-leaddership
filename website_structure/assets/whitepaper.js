(function () {
  "use strict";

  var PDF_URL = "/assets/downloads/guide-01-bids-whitepaper.pdf";
  var STORAGE_KEY = "ignis-whitepaper-bids-won-on-evidence";

  function revealWhitepaperDownload() {
    var slot = document.getElementById("hubspot-whitepaper-form");
    var ready = document.getElementById("whitepaper-download");
    var link = document.getElementById("whitepaper-download-link");
    if (!ready || !link) return;
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
      event.preventDefault();
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
    label.textContent = ticked >= 7 ? "Ready to scale" : ticked >= 4 ? "Fix the gaps first" : "Start with the bid or no-bid gate";
    card.dataset.band = ticked >= 7 ? "g" : ticked >= 4 ? "a" : "r";
  }

  boxes.forEach(function (box) {
    box.addEventListener("change", updateScore);
  });
})();
