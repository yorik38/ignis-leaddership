(function () {
  "use strict";

  var section = document.querySelector(".pipeline-statement");
  var frame = section && section.querySelector(".pipeline-statement-word");
  var word = frame && frame.querySelector("[data-pipeline-word]");
  if (!section || !frame || !word || !window.IntersectionObserver || !word.animate) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) return;

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

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.intersectionRatio >= 0.3) play();
      else if (!entry.isIntersecting && !ready) reset();
    });
  }, { threshold: [0, 0.3] });
  observer.observe(section);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && playing) reset();
  });
  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener("change", function () {
      if (reducedMotion.matches) reset();
    });
  }
}());
