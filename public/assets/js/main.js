/* =========================================================
   新竹市廣澤慈善協會 — 前端互動
   無建置：純原生 JS，於前端讀取 content/*.json 並渲染
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const esc = (str = "") =>
    String(str).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const paras = (body = "") =>
    body.split(/\n\n+/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  const fmtDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt)) return esc(d);
    return `${dt.getFullYear()} 年 ${dt.getMonth() + 1} 月 ${dt.getDate()} 日`;
  };
  const getJSON = (path) => fetch(path, { cache: "no-cache" }).then((r) => { if (!r.ok) throw new Error(path); return r.json(); });

  /* ---------- Inject shared header & footer ---------- */
  const NAV = [
    ["index.html", "首頁"],
    ["about.html", "關於我們"],
    ["services.html", "我們的善行"],
    ["news.html", "最新消息"],
    ["stories.html", "成果與故事"],
    ["contact.html", "聯絡我們"],
  ];
  const headerHTML =
    `<div class="header__inner">
       <a class="brand" href="index.html" aria-label="新竹市廣澤慈善協會 首頁">
         <img src="assets/img/logo.png" alt="新竹市廣澤慈善協會">
       </a>
       <button class="nav-toggle" aria-label="開啟選單"><span></span><span></span><span></span></button>
       <nav class="nav">
         ${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}
         <a class="nav__cta" href="get-involved.html">響應愛心</a>
       </nav>
     </div>`;
  const footerHTML =
    `<div class="container">
       <div class="footer__grid">
         <div class="footer__brand">
           <img src="assets/img/logo.png" alt="新竹市廣澤慈善協會">
           <p>秉持「取之社會、用之社會」的精神，扶弱濟貧，傳遞一世情。邀您一起成為善的循環。</p>
           <div class="social">
             <a data-link="facebook" href="#" aria-label="Facebook" target="_blank" rel="noopener">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9c0-.6.4-1 1-1z"/></svg>
             </a>
             <a data-link="lineId" href="#" aria-label="LINE" target="_blank" rel="noopener">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.5 3 2 6.6 2 11c0 4 3.6 7.3 8.5 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.6 1.1-.5 6-3.5 8.2-6C21.9 14.3 22 12.7 22 11c0-4.4-4.5-8-10-8z"/></svg>
             </a>
           </div>
         </div>
         <div>
           <h4>網站導覽</h4>
           ${NAV.slice(1).map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}
           <a href="get-involved.html">響應愛心</a>
         </div>
         <div>
           <h4>聯絡資訊</h4>
           <p data-setting="address" style="opacity:.8;font-size:.95rem;padding:6px 0">　</p>
           <a data-setting="phone" href="#">　</a>
           <a data-setting="email" href="#">　</a>
         </div>
       </div>
       <div class="footer__bottom">
         © <span data-year></span> 新竹市廣澤慈善協會　統一編號：50598756｜本網站照片為示意，將陸續更新為實際活動照片
       </div>
     </div>`;
  const headerEl = $("#site-header");
  const footerEl = $("#site-footer");
  if (headerEl) { headerEl.className = "header"; headerEl.innerHTML = headerHTML; }
  if (footerEl) { footerEl.className = "footer"; footerEl.innerHTML = footerHTML; }

  /* ---------- Header behaviour ---------- */
  const header = $(".header");
  const hasHero = document.body.classList.contains("has-hero");
  function onScroll() {
    if (!header) return;
    const solid = !hasHero || window.scrollY > window.innerHeight - 120;
    header.classList.toggle("is-solid", solid);
  }
  if (header) { if (!hasHero) header.classList.add("is-solid"); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); }

  /* ---------- Mobile nav ---------- */
  const toggle = $(".nav-toggle");
  const nav = $(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      document.body.classList.toggle("nav-open", open);
    });
    $$(".nav a", nav).forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open"); toggle.classList.remove("open"); document.body.classList.remove("nav-open");
      })
    );
  }

  /* ---------- Active nav link ---------- */
  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  $$(".nav a").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === page || (page === "" && href === "index.html")) a.classList.add("active");
  });

  /* ---------- Reveal on scroll ---------- */
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
      }, { threshold: 0.12 })
    : null;
  const observeReveals = () => $$(".reveal:not(.is-visible)").forEach((el) => (io ? io.observe(el) : el.classList.add("is-visible")));
  observeReveals();

  /* ---------- Back to top ---------- */
  const toTop = $(".to-top");
  if (toTop) {
    window.addEventListener("scroll", () => toTop.classList.toggle("show", window.scrollY > 600), { passive: true });
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Inject site settings ---------- */
  const hrefFor = (key, val) => {
    if (key === "phone") return "tel:" + String(val).replace(/[^0-9+]/g, "");
    if (key === "email") return "mailto:" + val;
    if (key === "lineId") return "https://line.me/R/ti/p/" + encodeURIComponent(val);
    return val; // facebook, mapEmbed, etc.
  };
  getJSON("content/settings.json").then((s) => {
    const hideEl = (el) => { const li = el.closest("li"); (li || el).style.display = "none"; };
    // [data-link]: set href only, preserve inner content (icons, custom labels)
    $$("[data-link]").forEach((el) => {
      const val = s[el.getAttribute("data-link")];
      if (val == null || val === "") { hideEl(el); return; }
      el.href = hrefFor(el.getAttribute("data-link"), val);
    });
    // [data-setting]: set text content (and href if it's a link); hide if empty
    $$("[data-setting]").forEach((el) => {
      const key = el.getAttribute("data-setting");
      const val = s[key];
      if (val == null || val === "") { hideEl(el); return; }
      if (el.tagName === "A") el.href = hrefFor(key, val);
      el.textContent = val;
    });
    const map = $("#map-frame");
    if (map && s.mapEmbed) map.src = s.mapEmbed;
  }).catch(() => {});

  // current year
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Hero carousel ---------- */
  const slidesWrap = $("#hero-slides");
  if (slidesWrap) {
    getJSON("content/carousel.json").then((data) => {
      const slides = (data.slides || []).sort((a, b) => (a.order || 0) - (b.order || 0));
      if (!slides.length) return;
      const dotsWrap = $("#hero-dots");
      const content = $("#hero-content");
      slidesWrap.innerHTML = slides
        .map((s, i) => `<div class="hero__slide${i === 0 ? " is-active" : ""}" style="background-image:url('${esc(s.image)}')"></div>`)
        .join("");
      if (dotsWrap)
        dotsWrap.innerHTML = slides
          .map((_, i) => `<button class="${i === 0 ? "is-active" : ""}" aria-label="第 ${i + 1} 張"></button>`)
          .join("");
      const slideEls = $$(".hero__slide", slidesWrap);
      const dotEls = dotsWrap ? $$("button", dotsWrap) : [];
      let idx = 0, timer;
      const setText = (i) => {
        if (!content) return;
        const s = slides[i];
        content.style.opacity = 0;
        setTimeout(() => {
          content.querySelector("h1").textContent = s.title || "";
          content.querySelector("p").textContent = s.subtitle || "";
          content.style.opacity = 1;
        }, 350);
      };
      const go = (i) => {
        idx = (i + slides.length) % slides.length;
        slideEls.forEach((el, k) => el.classList.toggle("is-active", k === idx));
        dotEls.forEach((el, k) => el.classList.toggle("is-active", k === idx));
        setText(idx);
      };
      const start = () => (timer = setInterval(() => go(idx + 1), 5500));
      const reset = () => { clearInterval(timer); start(); };
      dotEls.forEach((d, i) => d.addEventListener("click", () => { go(i); reset(); }));
      setText(0);
      if (content) content.style.transition = "opacity .35s ease";
      if (slides.length > 1) start();
    }).catch(() => { slidesWrap.innerHTML = '<div class="hero__slide is-active" style="background:linear-gradient(135deg,#9e1b1b,#5c0f0f)"></div>'; });
  }

  /* ---------- Impact stats ---------- */
  const statsWrap = $("#impact-stats");
  if (statsWrap) {
    getJSON("content/impact.json").then((d) => {
      const intro = $("#impact-intro");
      if (intro && d.intro) intro.textContent = d.intro;
      statsWrap.innerHTML = (d.stats || [])
        .map((s) => `<div class="stat reveal"><div><span class="stat__num">${esc(s.number)}</span><span class="stat__unit">${esc(s.unit || "")}</span></div><div class="stat__label">${esc(s.label)}</div></div>`)
        .join("");
      observeReveals();
    }).catch(() => {});
  }

  /* ---------- Render a news card ---------- */
  const newsCard = (n) =>
    `<a class="news-card reveal" href="news.html?id=${encodeURIComponent(n.id)}">
       <div class="news-card__img"><img src="${esc(n.cover || "assets/img/news-1.svg")}" alt="${esc(n.title)}" loading="lazy"></div>
       <div class="news-card__body">
         <span class="news-card__date">${fmtDate(n.date)}</span>
         <h3>${esc(n.title)}</h3>
         <p>${esc(n.excerpt || "")}</p>
         <span class="news-card__more">閱讀更多 →</span>
       </div>
     </a>`;

  /* ---------- Home: latest news ---------- */
  const homeNews = $("#home-news");
  if (homeNews) {
    getJSON("content/news.json").then((d) => {
      const items = (d.items || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
      homeNews.innerHTML = items.length ? items.map(newsCard).join("") : '<p class="empty">最新消息將陸續發布，敬請期待。</p>';
      observeReveals();
    }).catch(() => {});
  }

  /* ---------- News page: list or detail ---------- */
  const newsList = $("#news-list");
  const newsDetail = $("#news-detail");
  if (newsList || newsDetail) {
    const id = new URLSearchParams(location.search).get("id");
    getJSON("content/news.json").then((d) => {
      const items = (d.items || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
      if (id && newsDetail) {
        const n = items.find((x) => x.id === id);
        if (newsList) newsList.style.display = "none";
        const head = $("#news-detail-head");
        if (!n) { newsDetail.innerHTML = '<p class="empty">找不到這篇消息。<a href="news.html">返回最新消息</a></p>'; return; }
        document.title = n.title + "｜新竹市廣澤慈善協會";
        if (head) head.innerHTML = `<p class="eyebrow">最新消息</p><h1>${esc(n.title)}</h1><p>${fmtDate(n.date)}</p>`;
        newsDetail.innerHTML =
          `<article class="prose">
             <img src="${esc(n.cover || "assets/img/news-1.svg")}" alt="${esc(n.title)}" style="border-radius:14px;margin-bottom:32px">
             ${paras(n.body || n.excerpt || "")}
             <p style="margin-top:40px"><a class="btn btn--outline" href="news.html">← 返回最新消息</a></p>
           </article>`;
      } else if (newsList) {
        newsList.innerHTML = items.length ? items.map(newsCard).join("") : '<p class="empty">最新消息將陸續發布，敬請期待。</p>';
        observeReveals();
      }
    }).catch(() => { if (newsList) newsList.innerHTML = '<p class="empty">內容載入失敗，請稍後再試。</p>'; });
  }

  /* ---------- Stories page ---------- */
  const storyList = $("#stories-list");
  if (storyList) {
    getJSON("content/stories.json").then((d) => {
      const items = d.items || [];
      storyList.innerHTML = items.length
        ? items.map((s) =>
            `<article class="story reveal">
               <img src="${esc(s.image || "assets/img/story-1.svg")}" alt="${esc(s.title)}" loading="lazy">
               <div class="story__body">
                 <p class="story__quote">${esc(s.quote || "")}</p>
                 <h3>${esc(s.title)}</h3>
                 <p>${esc(s.body || "")}</p>
               </div>
             </article>`).join("")
        : '<p class="empty">感人的故事即將分享，敬請期待。</p>';
      observeReveals();
    }).catch(() => {});
  }

  /* ---------- Upcoming event floating badge ---------- */
  getJSON("content/upcoming.json").then((u) => {
    if (!u || !u.title) return;                       // 沒有設定 -> 不顯示
    if (u.date) {
      const end = new Date(u.date + "T23:59:59");
      if (isNaN(end) || end.getTime() < Date.now()) return; // 日期已過 -> 自動隱藏
    }
    const wrap = document.createElement("div");
    wrap.className = "upcoming";
    wrap.innerHTML =
      `<button class="upcoming__dot" id="up-dot" aria-label="近期活動">
         <span class="upcoming__badge"></span>
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l16-5v12L4 14z"/><path d="M11 16.5a2.5 2.5 0 01-4.8-1"/></svg>
       </button>
       <div class="upcoming__card hide" id="up-card">
         <button class="upcoming__close" id="up-close" aria-label="關閉">×</button>
         <span class="upcoming__eyebrow"><span class="live"></span>近期活動</span>
         <h4>${esc(u.title)}</h4>
         ${u.date ? `<div class="upcoming__date">🗓 ${esc(fmtDate(u.date))}</div>` : ""}
         ${u.subtitle ? `<p>${esc(u.subtitle)}</p>` : ""}
         ${u.link ? `<a class="upcoming__link" href="${esc(u.link)}" target="_blank" rel="noopener">${esc(u.linkText || "看更多")} →</a>` : ""}
       </div>`;
    document.body.appendChild(wrap);
    const card = $("#up-card", wrap), dot = $("#up-dot", wrap), close = $("#up-close", wrap);
    let seen = false;
    try { seen = sessionStorage.getItem("gz_up_seen") === "1"; } catch (e) {}
    if (!seen) {
      setTimeout(() => card.classList.remove("hide"), 1200);
      try { sessionStorage.setItem("gz_up_seen", "1"); } catch (e) {}
    }
    dot.addEventListener("click", () => card.classList.toggle("hide"));
    close.addEventListener("click", () => card.classList.add("hide"));
  }).catch(() => {});
})();
