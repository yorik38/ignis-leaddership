(function () {
  "use strict";

  var section = document.querySelector(".pipeline-statement");
  var frame = section && section.querySelector(".pipeline-statement-word");
  var word = frame && frame.querySelector("[data-pipeline-word]");
  if (!section || !frame || !word || !window.IntersectionObserver || !word.animate) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var stages = ["fewer surprises", "one source of truth", "faster gates", "stronger terms"];
  var generation = 0;
  var animation = null;
  var playing = false;
  var ready = true;

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

  async function play() {
    if (playing || !ready || reducedMotion.matches || document.hidden) return;
    playing = true;
    ready = false;
    var run = ++generation;

    for (var i = 0; i < stages.length; i += 1) {
      if (run !== generation) return;
      showWord(stages[i]);
      if (!await move([
        { opacity: 0, transform: "translateY(18px)" },
        { opacity: 1, transform: "translateY(0)" }
      ], 330, run)) return;
      await pause(600);
      if (run !== generation) return;
      if (!await move([
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-14px)" }
      ], 220, run)) return;
    }

    if (run !== generation) return;
    showWord("Ignis");
    if (!await move([
      { opacity: 0.25, transform: "translateY(12px)" },
      { opacity: 1, transform: "translateY(0)" }
    ], 1200, run)) return;
    playing = false;
  }

  function reset() {
    generation += 1;
    if (animation) animation.cancel();
    animation = null;
    playing = false;
    ready = true;
    showWord("Ignis");
  }

  function viewportHeight() {
    return window.innerHeight || document.documentElement.clientHeight || 1;
  }

  function metrics() {
    var rect = section.getBoundingClientRect();
    var vh = viewportHeight();
    var visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    return {
      rect: rect,
      vh: vh,
      ratio: Math.max(0, visible) / Math.max(rect.height, 1)
    };
  }

  // Start only once the section is substantially on screen and its top
  // has moved into the upper 40% of the viewport, so the block above
  // is no longer what the reader is on. The first word stays put until then.
  function canStart() {
    var view = metrics();
    return view.ratio >= 0.6 && view.rect.top <= view.vh * 0.4 && view.rect.bottom > view.vh * 0.45;
  }

  function isOutOfView() {
    return metrics().ratio < 0.15;
  }

  function sync() {
    if (reducedMotion.matches || document.hidden) {
      if (playing || !ready) reset();
      return;
    }
    if (canStart()) play();
    else if (isOutOfView() && (playing || !ready)) reset();
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
  sync();
}());
