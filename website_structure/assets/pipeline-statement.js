(function () {
  "use strict";

  var section = document.querySelector(".pipeline-statement");
  var frame = section && section.querySelector(".pipeline-statement-word");
  var word = frame && frame.querySelector("[data-pipeline-word]");
  var heading = section && section.querySelector("h2");
  if (!section || !frame || !word || !heading || !window.IntersectionObserver || !word.animate) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var stages = ["Process", "Context", "Data", "Governance", "Workflows"];
  var HOLD_MS = 1100;
  var generation = 0;
  var animation = null;
  var playing = false;
  var ready = true;
  var finished = false;

  function showWord(value) {
    var isBrand = value === "Ignis";
    frame.classList.toggle("is-brand", isBrand);
    if (isBrand) {
      var initial = document.createElement("span");
      initial.className = "brand-accent";
      initial.textContent = "I";
      word.replaceChildren(initial, document.createTextNode("gnis"));
    } else {
      word.textContent = value;
    }
  }

  function clearMotion() {
    if (animation) animation.cancel();
    animation = null;
    word.style.opacity = "";
    word.style.transform = "";
  }

  function showFirst() {
    clearMotion();
    showWord(stages[0]);
  }

  function pause(milliseconds) {
    return new Promise(function (resolve) { window.setTimeout(resolve, milliseconds); });
  }

  function move(keyframes, duration, run) {
    if (animation) animation.cancel();
    animation = word.animate(keyframes, {
      duration: duration,
      easing: "cubic-bezier(.2,.7,.2,1)",
      fill: "forwards"
    });
    return animation.finished.then(function () { return run === generation; }, function () { return false; });
  }

  function stopIfStale(run) {
    if (run === generation) playing = false;
  }

  async function play() {
    if (playing || !ready || finished || reducedMotion.matches || document.hidden) return;
    playing = true;
    ready = false;
    finished = false;
    var run = ++generation;
    showFirst();

    for (var i = 0; i < stages.length; i += 1) {
      if (run !== generation) return;
      if (i > 0) {
        showWord(stages[i]);
        if (!await move([
          { opacity: 0, transform: "translateY(18px)" },
          { opacity: 1, transform: "translateY(0)" }
        ], 280, run)) {
          stopIfStale(run);
          return;
        }
      }
      await pause(HOLD_MS);
      if (run !== generation) return;
      if (!await move([
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-14px)" }
      ], 220, run)) {
        stopIfStale(run);
        return;
      }
    }

    if (run !== generation) return;
    showWord("Ignis");
    if (!await move([
      { opacity: 0, transform: "translateY(12px)" },
      { opacity: 1, transform: "translateY(0)" }
    ], 360, run)) {
      stopIfStale(run);
      return;
    }
    if (run !== generation) return;
    playing = false;
    finished = true;
  }

  function reset() {
    generation += 1;
    playing = false;
    ready = true;
    finished = false;
    showFirst();
  }

  function viewportHeight() {
    return window.innerHeight || document.documentElement.clientHeight || 1;
  }

  function metrics() {
    var rect = section.getBoundingClientRect();
    var vh = viewportHeight();
    var visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    var headingRect = heading.getBoundingClientRect();
    return {
      rect: rect,
      vh: vh,
      ratio: Math.max(0, visible) / Math.max(rect.height, 1),
      headingTop: headingRect.top,
      headingBottom: headingRect.bottom
    };
  }

  // The section box is taller than the line, so a ratio or a section-top
  // threshold starts the cycle while the heading is still in the lower half.
  // Wait until the heading itself has reached the middle and most of the
  // section is on screen.
  function canStart() {
    var view = metrics();
    return view.ratio >= 0.6 && view.headingTop <= view.vh * 0.5 && view.headingBottom > 0;
  }

  function isOutOfView() {
    var view = metrics();
    return view.ratio < 0.15 || view.headingBottom < 0 || view.headingTop > view.vh;
  }

  function sync() {
    if (reducedMotion.matches || document.hidden) {
      if (playing || finished || !ready) reset();
      else showFirst();
      return;
    }
    if (finished && !isOutOfView()) return;
    if (!playing && canStart()) play();
    else if (isOutOfView() && (playing || finished || !ready)) reset();
  }

  var observer = new IntersectionObserver(function () {
    sync();
  }, { threshold: [0, 0.6] });
  observer.observe(section);

  var scheduled = false;
  function onScroll() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      sync();
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) reset();
    else sync();
  });
  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener("change", sync);
  }
  showFirst();
  sync();
}());
