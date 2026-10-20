(function () {
  const root = document.querySelector("[data-working-examples]");
  if (!root) return;
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function select(tab, focus) {
    for (const item of tabs) {
      const on = item === tab;
      item.setAttribute("aria-selected", on ? "true" : "false");
      item.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(item.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    }
    if (focus) {
      tab.focus();
      tab.scrollIntoView({inline: "nearest", block: "nearest"});
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab, false));
    tab.addEventListener("keydown", (event) => {
      let next = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = tabs[(index + 1) % tabs.length];
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (event.key === "Home") next = tabs[0];
      else if (event.key === "End") next = tabs[tabs.length - 1];
      if (!next) return;
      event.preventDefault();
      select(next, true);
    });
  });

  document.querySelectorAll("[data-journey-tab]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const tab = document.getElementById(link.getAttribute("data-journey-tab"));
      if (!tab) return;
      event.preventDefault();
      select(tab, false);
      const heading = document.getElementById("working-examples-title");
      if (heading) heading.scrollIntoView({behavior: reduce ? "auto" : "smooth", block: "start"});
    });
  });
})();
