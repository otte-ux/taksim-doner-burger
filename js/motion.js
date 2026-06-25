/* ============================================================
   motion.js — the "alive" layer. Fully optional & guarded.
   Part A: lightweight scroll UI (no libs needed).
   Part B: premium motion via GSAP + ScrollTrigger + Lenis (if present).
   Everything respects prefers-reduced-motion; page works with none of it.
   ============================================================ */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var isMobile = window.matchMedia("(max-width: 680px)").matches;

  /* ============ PART A — always on, no dependencies ============ */

  // scroll progress bar
  var bar = document.getElementById("progress");
  // sticky header: shrink + hide-on-scroll-down
  var header = document.querySelector(".topbar");
  var lastY = window.pageYOffset, ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    if (header) {
      header.classList.toggle("scrolled", y > 40);
      if (y > 320 && y > lastY + 4) header.classList.add("hide");
      else if (y < lastY - 4) header.classList.remove("hide");
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // hero video: only load/play when allowed & visible; pause off-screen; poster-only on mobile/reduced/save-data
  var video = document.getElementById("heroVideo");
  if (video) {
    var saveData = navigator.connection && navigator.connection.saveData;
    var allowVideo = !reduced && !isMobile && !saveData;
    if (!allowVideo) {
      // keep poster as the only paint; never fetch the clip
      video.removeAttribute("autoplay");
      while (video.firstChild) video.removeChild(video.firstChild); // drop <source>s
      video.load();
    } else {
      video.addEventListener("loadeddata", function () { video.classList.add("ready"); });
      var vio = new IntersectionObserver(function (e) {
        e.forEach(function (en) {
          if (en.isIntersecting) { var p = video.play(); if (p) p.catch(function () {}); }
          else video.pause();
        });
      }, { threshold: 0.15 });
      vio.observe(video);
    }
  }

  /* ============ PART B — premium motion (needs GSAP) ============ */
  if (reduced || typeof window.gsap === "undefined") return;
  var gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  document.documentElement.classList.add("motion");

  // NOTE: native scrolling only — no Lenis smooth-scroll (it felt laggy on the wheel).
  // Smooth anchor jumps come from CSS `scroll-behavior:smooth`.

  // hero headline: split into words, rise in
  var h1 = document.getElementById("heroTitle");
  function splitWords(el) {
    var txt = el.textContent.trim();
    el.innerHTML = txt.split(/\s+/).map(function (w) {
      return '<span class="word" style="display:inline-block">' + w + "</span>";
    }).join(" ");
    return el.querySelectorAll(".word");
  }
  if (h1) {
    var words = splitWords(h1);
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(words, { yPercent: 115, opacity: 0, duration: 0.7, stagger: 0.05 })
      .from(".hero .hook", { y: 18, opacity: 0, duration: 0.5 }, "-=0.3")
      .from(".hero .chips .chip", { y: 14, opacity: 0, duration: 0.4, stagger: 0.08 }, "-=0.25")
      .from(".hero .cta-row .btn", { y: 16, opacity: 0, duration: 0.45, stagger: 0.1 }, "-=0.2");
  }
  // re-run i18n word split when language changes (so toggle doesn't strip spans oddly)
  ["btnTR", "btnEN"].forEach(function (id) {
    var b = document.getElementById(id);
    if (b) b.addEventListener("click", function () {
      if (h1) gsap.set(splitWords(h1), { yPercent: 0, opacity: 1 });
    });
  });

  // scroll reveals (scroll-driven, NOT IntersectionObserver — content visibility must
  // never depend on a single async API. Initial check + scroll + Lenis + resize cover it.)
  var toReveal = Array.prototype.slice.call(document.querySelectorAll(".reveal, .reveal-img"));
  toReveal.forEach(function (el, i) { el.style.transitionDelay = (i % 6) * 0.05 + "s"; });
  function revealCheck() {
    if (!toReveal.length) return;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var k = toReveal.length - 1; k >= 0; k--) {
      var el = toReveal[k];
      if (el.getBoundingClientRect().top < vh * 0.9) {
        el.classList.add("in");
        toReveal.splice(k, 1);
      }
    }
    if (!toReveal.length) {
      window.removeEventListener("scroll", revealCheck);
      window.removeEventListener("resize", revealCheck);
    }
  }
  revealCheck(); // reveal whatever is in view at load
  window.addEventListener("scroll", revealCheck, { passive: true });
  window.addEventListener("resize", revealCheck, { passive: true });
  window.addEventListener("load", revealCheck);
  // safety net: never let motion trap content — if nothing has scrolled after 4s, reveal all
  setTimeout(function () { revealCheck(); toReveal.forEach(function (el) { el.classList.add("in"); }); toReveal.length = 0; }, 4000);

  // parallax accents
  if (window.ScrollTrigger) {
    gsap.utils.toArray("[data-parallax]").forEach(function (el) {
      var amt = parseFloat(el.getAttribute("data-parallax")) || 12;
      gsap.to(el, {
        yPercent: amt, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  // count-ups
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = (el.getAttribute("data-count").split(".")[1] || "").length;
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.4, ease: "power2.out",
      onUpdate: function () {
        el.textContent = obj.v.toFixed(dec) + (el.getAttribute("data-suffix") || "");
      }
    });
  }
  if (window.ScrollTrigger) {
    gsap.utils.toArray("[data-count]").forEach(function (el) {
      window.ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: function () { countUp(el); } });
    });
  }

  // magnetic buttons (desktop)
  if (finePointer) {
    document.querySelectorAll(".btn, .wa-float").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.4 });
      });
      btn.addEventListener("mouseleave", function () { gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" }); });
    });
  }

  // (custom cursor removed by request)
})();
