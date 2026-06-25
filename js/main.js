/* ============================================================
   main.js — core behavior (works with NO external libs, NO motion)
   i18n toggle · menu tabs · lightbox · open-now · price hints · toast
   ============================================================ */
(function () {
  "use strict";

  /* ---------- i18n ---------- */
  var STR = {
    tr: { title: "Taksim Döner & Burger — 7/24 Sıcak Döner & Burger | Taksim, İstanbul" },
    en: { title: "Taksim Döner & Burger — Hot Döner & Burgers 24/7 | Taksim, Istanbul" }
  };
  var toggle = document.querySelector(".lang-toggle");
  var btnTR = document.getElementById("btnTR");
  var btnEN = document.getElementById("btnEN");

  function applyLang(lang) {
    lang = lang === "en" ? "en" : "tr";
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-tr]").forEach(function (el) {
      var v = el.getAttribute("data-" + lang);
      if (v !== null) el.innerHTML = v;
    });
    btnTR.setAttribute("aria-pressed", String(lang === "tr"));
    btnEN.setAttribute("aria-pressed", String(lang === "en"));
    if (toggle) toggle.classList.toggle("en", lang === "en");
    document.title = STR[lang].title;
    try { localStorage.setItem("tdb_lang", lang); } catch (e) {}
  }
  function initLang() {
    var saved = null;
    try { saved = localStorage.getItem("tdb_lang"); } catch (e) {}
    if (saved === "tr" || saved === "en") return applyLang(saved);
    var nav = (navigator.language || "tr").toLowerCase();
    applyLang(nav.indexOf("tr") === 0 ? "tr" : "en");
  }
  btnTR.addEventListener("click", function () { applyLang("tr"); });
  btnEN.addEventListener("click", function () { applyLang("en"); });
  initLang();

  /* ---------- approx € / $ price hints ---------- */
  var TRY_PER_EUR = 45; // placeholder rate — owner updates
  var TRY_PER_USD = 42; // placeholder rate — owner updates
  document.querySelectorAll(".card[data-price]").forEach(function (card) {
    var t = parseInt(card.getAttribute("data-price"), 10);
    var hint = card.querySelector(".price-approx");
    if (!t || !hint) return;
    hint.textContent = "≈ €" + Math.round(t / TRY_PER_EUR) + " / $" + Math.round(t / TRY_PER_USD);
  });

  /* ---------- image fallback: external stock → local themed SVG ---------- */
  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    img.addEventListener("error", function handle() {
      img.removeEventListener("error", handle);
      img.src = img.getAttribute("data-fallback");
      img.classList.add("is-fallback");
    });
  });

  /* ---------- menu tabs: scroll-spy (scroll-driven, reliable) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll("#menuTabs a"));
  var cats = tabs.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function tabsOffset() {
    var th = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tabs-h"), 10) || 56;
    return 56 + th + 48; // header + sticky tabs + breathing room
  }
  var lastTabIdx = -1;
  function spyTabs() {
    if (!cats.length) return;
    var off = tabsOffset(), idx = 0;
    for (var i = 0; i < cats.length; i++) {
      if (cats[i] && cats[i].getBoundingClientRect().top <= off) idx = i;
    }
    if (idx === lastTabIdx) return;        // only act when the category actually changes
    lastTabIdx = idx;
    tabs.forEach(function (t, i) { t.classList.toggle("active", i === idx); });
    // center the active tab by scrolling ONLY the horizontal tab strip — never the window
    var bar = document.getElementById("menuTabs"), at = tabs[idx];
    if (bar && at && bar.scrollWidth > bar.clientWidth) {
      var d = (at.getBoundingClientRect().left - bar.getBoundingClientRect().left)
              - (bar.clientWidth - at.offsetWidth) / 2;
      bar.scrollLeft += d;
    }
  }
  spyTabs();
  window.addEventListener("scroll", spyTabs, { passive: true });
  window.addEventListener("resize", spyTabs, { passive: true });

  /* ---------- lightbox (menu + gallery), keyboard + focus-trap + arrows ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbName = document.getElementById("lbName");
  var lbPrice = document.getElementById("lbPrice");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var lastFocus = null;
  var group = [];
  var idx = 0;

  function curSrc(el) {
    var img = el.querySelector("img");
    // prefer the already-loaded src (real photo if it resolved, else fallback)
    return (img && img.currentSrc) || (img && img.src) || el.getAttribute("data-img");
  }
  function lang() { return document.documentElement.lang === "en" ? "en" : "tr"; }

  function show(i) {
    if (!group.length) return;
    idx = (i + group.length) % group.length;
    var el = group[idx];
    var name = el.getAttribute("data-name-" + lang()) || el.getAttribute("data-name-tr") || "";
    lbImg.src = curSrc(el);
    lbImg.alt = name;
    lbName.textContent = name;
    var p = el.getAttribute("data-price");
    lbPrice.textContent = p ? "₺" + p : "";
    lbPrice.style.display = p ? "" : "none";
    var multi = group.length > 1;
    lbPrev.style.display = lbNext.style.display = multi ? "" : "none";
  }
  function openLB(groupSel, el) {
    group = Array.prototype.slice.call(document.querySelectorAll(groupSel));
    show(group.indexOf(el));
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    lastFocus = document.activeElement;
    lbClose.focus();
  }
  function closeLB() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll(".card .photo").forEach(function (btn) {
    btn.addEventListener("click", function () { openLB(".menu-grid .card", btn.closest(".card")); });
  });
  document.querySelectorAll(".gallery figure").forEach(function (fig) {
    fig.addEventListener("click", function () { openLB(".gallery figure", fig); });
  });
  document.querySelectorAll(".ig-item").forEach(function (it) {
    it.addEventListener("click", function () { openLB(".ig-track .ig-item", it); });
  });
  lbClose.addEventListener("click", closeLB);
  lbPrev.addEventListener("click", function () { show(idx - 1); });
  lbNext.addEventListener("click", function () { show(idx + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLB(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLB();
    else if (e.key === "ArrowRight") show(idx + 1);
    else if (e.key === "ArrowLeft") show(idx - 1);
    else if (e.key === "Tab") { e.preventDefault(); lbClose.focus(); }
  });

  /* ---------- live "open now" (reusable hours object) ---------- */
  var HOURS = { open24: true }; // swap for {0:[["00:00","23:59"]],...} (0=Sun) if hours become finite
  function isOpenNow() {
    if (HOURS.open24) return true;
    var now = new Date(), day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
    var spans = HOURS[day] || [];
    return spans.some(function (s) {
      function m(t) { var p = t.split(":"); return (+p[0]) * 60 + (+p[1]); }
      return mins >= m(s[0]) && mins <= m(s[1]);
    });
  }
  (function paintOpen() {
    var open = isOpenNow();
    document.querySelectorAll("[data-openstate]").forEach(function (el) {
      el.setAttribute("data-open", String(open));
    });
    if (!open) {
      var b = document.getElementById("openBadge");
      if (b) b.style.color = "var(--ink-soft)";
    }
  })();

  /* ---------- copy-phone toast ---------- */
  var toast = document.getElementById("toast");
  var toastTimer;
  function ping(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1900);
  }
  document.querySelectorAll("[data-copy]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      var val = el.getAttribute("data-copy");
      if (navigator.clipboard && val) {
        e.preventDefault();
        navigator.clipboard.writeText(val).then(function () {
          ping(document.documentElement.lang === "en" ? "Phone copied ✓" : "Telefon kopyalandı ✓");
        }).catch(function () {});
      }
    });
  });

  /* ---------- back-to-top ---------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("show", window.pageYOffset > 600);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
