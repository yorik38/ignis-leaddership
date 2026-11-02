(function () {
  "use strict";

  function visible(cards) {
    return cards.filter(function (card) { return !card.hidden; });
  }

  function init(block) {
    var filters = block.querySelector("[data-res-filters]");
    var row = block.querySelector("[data-res-row]");
    var follow = block.querySelector("[data-res-follow]");
    var dots = block.querySelector("[data-res-dots]");
    var status = block.querySelector("[data-res-status]");
    var rowCards = row ? Array.prototype.slice.call(row.querySelectorAll(".res-card")) : [];
    var allCards = Array.prototype.slice.call(block.querySelectorAll(".res-card"));

    function syncDots() {
      if (row) row.setAttribute("data-count", String(visible(rowCards).length));
      if (!dots) return;
      var buttons = Array.prototype.slice.call(dots.querySelectorAll("[data-dot]"));
      buttons.forEach(function (button) {
        var card = rowCards[Number(button.getAttribute("data-dot"))];
        button.hidden = !card || card.hidden;
      });
      var shown = buttons.filter(function (button) { return !button.hidden; });
      dots.hidden = shown.length < 2;
      markCurrent();
    }

    function markCurrent() {
      if (!dots || !row || dots.hidden) return;
      var buttons = Array.prototype.slice.call(dots.querySelectorAll("[data-dot]")).filter(function (button) {
        return !button.hidden;
      });
      var items = visible(rowCards);
      if (!buttons.length || !items.length) return;
      var left = row.getBoundingClientRect().left;
      var current = 0;
      var best = Infinity;
      items.forEach(function (card, index) {
        var delta = Math.abs(card.getBoundingClientRect().left - left);
        if (delta < best) {
          best = delta;
          current = index;
        }
      });
      buttons.forEach(function (button, index) {
        if (index === current) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
      });
    }

    function applyFilter(value) {
      allCards.forEach(function (card) {
        card.hidden = value !== "all" && card.getAttribute("data-res-type") !== value;
      });
      if (row) {
        row.hidden = visible(rowCards).length === 0;
        row.scrollLeft = 0;
      }
      if (follow) {
        follow.hidden = visible(Array.prototype.slice.call(follow.querySelectorAll(".res-card"))).length === 0;
      }
      syncDots();
      if (status && filters) {
        var pressed = filters.querySelector('[aria-pressed="true"]');
        status.textContent = pressed ? pressed.textContent.trim() : "";
      }
    }

    if (filters) {
      var buttons = Array.prototype.slice.call(filters.querySelectorAll("button[data-filter]"));
      function select(button) {
        buttons.forEach(function (item) {
          item.setAttribute("aria-pressed", item === button ? "true" : "false");
        });
        applyFilter(button.getAttribute("data-filter"));
      }
      buttons.forEach(function (button, index) {
        button.addEventListener("click", function () { select(button); });
        button.addEventListener("keydown", function (event) {
          var next = null;
          if (event.key === "ArrowRight" || event.key === "ArrowDown") next = buttons[(index + 1) % buttons.length];
          else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = buttons[(index - 1 + buttons.length) % buttons.length];
          else if (event.key === "Home") next = buttons[0];
          else if (event.key === "End") next = buttons[buttons.length - 1];
          if (!next || next === button) return;
          event.preventDefault();
          next.focus();
          select(next);
        });
      });
    }

    if (dots && row) {
      dots.addEventListener("click", function (event) {
        var button = event.target.closest("[data-dot]");
        if (!button || button.hidden) return;
        var card = rowCards[Number(button.getAttribute("data-dot"))];
        if (!card || card.hidden) return;
        var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        card.scrollIntoView({behavior: reduce ? "auto" : "smooth", inline: "start", block: "nearest"});
      });
      var ticking = false;
      row.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          ticking = false;
          markCurrent();
        });
      }, {passive: true});
    }

    syncDots();
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-research]"), init);
})();
