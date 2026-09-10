(function(){
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var allowedSources = ["website", "linkedin", "email", "shared"];
  var requestedSource = (params.get("source") || params.get("utm_source") || "website").toLowerCase();
  var resolvedSource = allowedSources.indexOf(requestedSource) > -1 ? requestedSource : "website";

  document.querySelectorAll("#newsletter-form, [data-newsletter-form]").forEach(function(form){
    var status = form.querySelector(".subscribe-status");
    var sourceField = form.querySelector("[name=source]");
    if (sourceField) sourceField.value = resolvedSource;
    form.addEventListener("submit", function(event){
      event.preventDefault();
      if (!form.reportValidity()) return;
      var button = form.querySelector("button[type=submit]");
      button.disabled = true;
      button.textContent = "Joining...";
      status.className = "subscribe-status";
      status.textContent = "";

      fetch(form.action, {
        method: "POST",
        headers: {"Content-Type": "application/json", "Accept": "application/json"},
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
      }).then(function(response){
        return response.json().catch(function(){ return {}; }).then(function(data){
          if (!response.ok) throw new Error(data.error || "We could not add you just now.");
          return data;
        });
      }).then(function(){
        form.reset();
        if (sourceField) sourceField.value = resolvedSource;
        status.textContent = "You’re nearly there. Check your inbox to confirm your subscription.";
        button.textContent = "Subscribed";
      }).catch(function(error){
        status.className = "subscribe-status error";
        status.textContent = error.message + " Please try again.";
        button.disabled = false;
        button.innerHTML = "Subscribe <span aria-hidden=\"true\">→</span>";
      });
    });
  });

  var shareUrl = document.body.getAttribute("data-share-url") || "https://www.ignisleadership.com/newsletter?source=shared&utm_source=reader&utm_medium=referral";
  var shareText = document.body.getAttribute("data-share-title") || "Bid more. Win more.: practical field notes on AI-augmented bid management.";
  var shareStatus = document.getElementById("share-status");

  function updateShareStatus(message, isError){
    if (!shareStatus) return;
    shareStatus.textContent = message;
    shareStatus.classList.toggle("error", Boolean(isError));
  }

  function legacyCopy(text){
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    var copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    document.body.removeChild(textarea);
    return copied;
  }

  function copyShareUrl(){
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareUrl).then(function(){
        updateShareStatus("Link copied.");
      }).catch(function(){
        updateShareStatus(legacyCopy(shareUrl) ? "Link copied." : "Copy failed. Please copy the address from your browser.", true);
      });
      return;
    }
    updateShareStatus(legacyCopy(shareUrl) ? "Link copied." : "Copy failed. Please copy the address from your browser.", true);
  }

  document.querySelectorAll("[data-share]").forEach(function(button){
    button.addEventListener("click", function(event){
      event.preventDefault();
      var type = button.getAttribute("data-share");
      if (type === "linkedin") {
        var linkedInUrl = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(shareUrl);
        var shareWindow = window.open(linkedInUrl, "_blank");
        if (shareWindow) {
          shareWindow.opener = null;
          updateShareStatus("LinkedIn opened in a new tab.");
        } else {
          updateShareStatus("Your browser blocked the new tab. Opening LinkedIn here.");
          window.location.assign(linkedInUrl);
        }
      }
      if (type === "email") {
        updateShareStatus("Opening your email app.");
        window.location.href = "mailto:?subject=" + encodeURIComponent("A resource you might value") + "&body=" + encodeURIComponent(shareText + "\n\n" + shareUrl);
      }
      if (type === "copy") copyShareUrl();
    });
  });
}());
