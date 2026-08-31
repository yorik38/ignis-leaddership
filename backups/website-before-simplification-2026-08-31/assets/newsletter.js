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
  document.querySelectorAll("[data-share]").forEach(function(button){
    button.addEventListener("click", function(){
      var type = button.getAttribute("data-share");
      if (type === "linkedin") window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(shareUrl), "_blank", "noopener,noreferrer");
      if (type === "email") window.location.href = "mailto:?subject=" + encodeURIComponent("A newsletter you might value") + "&body=" + encodeURIComponent(shareText + "\n\n" + shareUrl);
      if (type === "copy") navigator.clipboard.writeText(shareUrl).then(function(){ shareStatus.textContent = "Link copied."; });
    });
  });
}());
