(function () {
  const root = document.querySelector("[data-working-examples]");
  if (!root) return;
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const host = root.querySelector("[data-wx-accordion]");

  if (host) {
    root.querySelectorAll(".wx-panel").forEach((panel, index) => {
      const details = document.createElement("details");
      if (index === 0) details.open = true;
      const summary = document.createElement("summary");
      const tab = document.getElementById(panel.getAttribute("aria-labelledby"));
      summary.textContent = tab ? tab.textContent : "Example";
      const clone = panel.cloneNode(true);
      clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
      clone.removeAttribute("id");
      clone.removeAttribute("role");
      clone.removeAttribute("aria-labelledby");
      clone.hidden = false;
      details.append(summary, clone);
      host.append(details);
    });
    host.hidden = false;
  }

  function select(tab, focus) {
    for (const item of tabs) {
      const on = item === tab;
      item.setAttribute("aria-selected", on ? "true" : "false");
      item.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(item.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    }
    if (host) {
      const index = tabs.indexOf(tab);
      host.querySelectorAll("details").forEach((item, itemIndex) => {
        item.open = itemIndex === index;
      });
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
