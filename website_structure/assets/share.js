(function () {
  var body = document.body;
  var buttons = document.querySelectorAll("[data-share]");
  if (!buttons.length) return;
  var canonical = document.querySelector('link[rel="canonical"]');
  var shareUrl = body.getAttribute("data-share-url") || (canonical && canonical.href) || window.location.href.split("#")[0];
  var shareTitle = body.getAttribute("data-share-title") || document.title;
  var status = document.getElementById("share-status");
  function say(text) {
    if (!status) return;
    status.textContent = text;
    window.clearTimeout(say.t);
    say.t = window.setTimeout(function () { status.textContent = ""; }, 3000);
  }
  function track(method) {
    if (typeof window.gtag === "function") window.gtag("event", "share", { method: method, content_type: "article", item_id: window.location.pathname });
  }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try { document.execCommand("copy") ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(area);
    });
  }
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      var type = button.getAttribute("data-share");
      if (type === "linkedin") {
        var url = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(shareUrl);
        var win = window.open(url, "_blank");
        if (win) { try { win.opener = null; } catch (e) {} } else { window.location.href = url; }
        track("linkedin");
      } else if (type === "email") {
        window.location.href = "mailto:?subject=" + encodeURIComponent(shareTitle) + "&body=" + encodeURIComponent(shareTitle + "\n\n" + shareUrl);
        track("email");
      } else if (type === "copy") {
        copy(shareUrl).then(function () { say("Link copied."); }, function () { say("Copy this link: " + shareUrl); });
        track("copy_link");
      }
    });
  });
})();
