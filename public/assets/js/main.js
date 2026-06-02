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
    ["services.html", "我們的足跡"],
    ["news.html", "最新消息"],
    ["stories.html", "成果與故事"],
    ["worship.html", "線上參拜"],
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
           <p data-setting="orgName" style="opacity:.8;font-size:.95rem;padding:4px 0">新竹市廣澤慈善協會</p>
           <p data-setting="address" style="opacity:.8;font-size:.95rem;padding:4px 0">　</p>
           <a data-setting="phone" href="#">　</a>
           <a data-setting="email" href="#">　</a>
         </div>
       </div>
       <div class="footer__bottom">
         © <span data-year></span> 新竹市廣澤慈善協會　統一編號：50598756｜立案字號：府社行字第1050212004號
       </div>
     </div>`;
  const headerEl = $("#site-header");
  const footerEl = $("#site-footer");
  if (headerEl) { headerEl.className = "header"; headerEl.innerHTML = headerHTML; }
  if (footerEl) { footerEl.className = "footer"; footerEl.innerHTML = footerHTML; }

  /* ---------- 全站浮動圈圈：拜 + 籤（每一頁都有） ---------- */
  const floats = document.createElement("div");
  floats.className = "worship-floats";
  floats.setAttribute("aria-hidden", "true");
  floats.innerHTML =
    `<button class="worship-float worship-float--pray" id="float-pray" type="button" aria-label="合十參拜">
       <span class="worship-float__icon"><span class="worship-float__char">拜</span></span>
       <span class="worship-float__label">合十參拜</span>
     </button>
     <button class="worship-float worship-float--oracle" id="float-oracle" type="button" aria-label="抽今日籤">
       <span class="worship-float__icon"><span class="worship-float__char">籤</span></span>
       <span class="worship-float__label">抽今日籤</span>
     </button>`;
  document.body.appendChild(floats);
  const isWorshipPage = (location.pathname.split("/").pop() || "").toLowerCase() === "worship.html";
  const smoothScrollTo = (sel, focusSel) => {
    const t = document.querySelector(sel); if (!t) return;
    t.scrollIntoView({ behavior: "smooth", block: "start" });
    if (focusSel) setTimeout(() => { const i = document.querySelector(focusSel); if (i) i.focus(); }, 800);
  };
  $("#float-pray").addEventListener("click", () => {
    if (isWorshipPage) smoothScrollTo("#section-pray", "#pray-name");
    else location.href = "worship.html#section-pray";
  });
  $("#float-oracle").addEventListener("click", () => {
    if (isWorshipPage) smoothScrollTo("#section-oracle");
    else location.href = "worship.html#section-oracle";
  });

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

  /* ---------- Worship page ---------- */
  // 蓮花花瓣動畫
  function dropPetals() {
    const wrap = $("#petals"); if (!wrap) return;
    wrap.innerHTML = "";
    const emojis = ["🌸", "🌺", "🪷", "✨"];
    for (let i = 0; i < 14; i++) {
      const s = document.createElement("span");
      s.textContent = emojis[i % emojis.length];
      s.style.left = (Math.random() * 100) + "%";
      s.style.animationDuration = (3 + Math.random() * 2) + "s";
      s.style.animationDelay = (Math.random() * 1.2) + "s";
      s.style.fontSize = (1.2 + Math.random() * 1) + "rem";
      wrap.appendChild(s);
    }
    setTimeout(() => (wrap.innerHTML = ""), 6000);
  }

  const prayBtn = $("#pray-btn");
  if (prayBtn) {
    const countEl = $("#pray-count");
    // 載入累積參拜數
    fetch("https://api.counterapi.dev/v1/guangze-charity/worship-total/?")
      .then((r) => r.json()).then((d) => {
        const n = (d && (d.count || d.Count)) || 0;
        if (n > 0) countEl.textContent = `🪷 至今已有 ${n.toLocaleString()} 位信眾參拜`;
      }).catch(() => {});

    prayBtn.addEventListener("click", () => {
      const name = ($("#pray-name").value || "").trim();
      const type = $("#pray-type").value;
      const wish = ($("#pray-wish").value || "").trim();
      if (!name) { $("#pray-name").focus(); $("#pray-name").placeholder = "請填入您的姓名 🙏"; return; }
      // 儀式感：禁用按鈕、顯示動畫、增量計數
      prayBtn.disabled = true; prayBtn.textContent = "🙏 合十中…";
      const incense = $("#incense"); if (incense) incense.classList.add("lit");
      const deity = $("#deity"); if (deity) deity.classList.add("praying");
      dropPetals();
      countEl.textContent = "✨ 廣澤尊王垂佑　善願已記";
      fetch("https://api.counterapi.dev/v1/guangze-charity/worship-total/up")
        .then((r) => r.json()).then((d) => {
          const n = (d && (d.count || d.Count)) || 0;
          setTimeout(() => {
            prayBtn.classList.add("done"); prayBtn.textContent = "已合十參拜　謝謝您";
            if (n > 0) countEl.textContent = `🪷 您是第 ${n.toLocaleString()} 位向廣澤尊王合十參拜的信眾`;
            // 本地保存（不上傳），純粹紀念
            try {
              const log = JSON.parse(localStorage.getItem("gz_prayers") || "[]");
              log.push({ name, type, wish, at: new Date().toISOString() });
              localStorage.setItem("gz_prayers", JSON.stringify(log.slice(-10)));
            } catch (e) {}
          }, 1200);
        }).catch(() => {
          setTimeout(() => { prayBtn.classList.add("done"); prayBtn.textContent = "已合十參拜　謝謝您"; }, 1200);
        });
    });
  }

  /* ---------- Oracle (today's fortune) ---------- */
  const oraclePlaceholder = $("#oracle-placeholder");
  if (oraclePlaceholder) {
    let pool = [];
    getJSON("content/oracle.json").then((d) => {
      pool = d.items || [];
      const intro = $("#oracle-intro");
      if (intro && d.intro) intro.textContent = d.intro;
      // 已抽過就直接顯示
      try {
        const today = new Date().toISOString().slice(0, 10);
        const saved = JSON.parse(localStorage.getItem("gz_oracle") || "null");
        if (saved && saved.date === today) showOracle(saved.item, true);
      } catch (e) {}
    }).catch(() => {});

    function showOracle(item, alreadyDrawn) {
      $("#oracle-no").textContent = item.no;
      $("#oracle-title").textContent = item.title;
      $("#oracle-verse").textContent = item.verse;
      $("#oracle-modern").textContent = item.modern;
      $("#oracle-hint").textContent = alreadyDrawn ? "（今日已抽過，明日可再抽一籤）" : "本籤僅供靜心反思，誠心向善，自得平安。";
      oraclePlaceholder.hidden = true;
      $("#oracle-content").hidden = false;
    }
    $("#oracle-draw").addEventListener("click", () => {
      if (!pool.length) return;
      const item = pool[Math.floor(((Date.now() * 9301 + 49297) % 233280) / 233280 * pool.length)];
      try { localStorage.setItem("gz_oracle", JSON.stringify({ date: new Date().toISOString().slice(0, 10), item })); } catch (e) {}
      showOracle(item, false);
    });
    $("#oracle-again").addEventListener("click", () => {
      try { localStorage.removeItem("gz_oracle"); } catch (e) {}
      oraclePlaceholder.hidden = false;
      $("#oracle-content").hidden = true;
    });
  }

  /* ---------- Categories page (services) ---------- */
  const catList = $("#categories-list");
  if (catList) {
    Promise.all([
      getJSON("content/categories.json").catch(() => ({ items: [] })),
      getJSON("content/news.json").catch(() => ({ items: [] })),
    ]).then(([cats, news]) => {
      const byId = {};
      (news.items || []).forEach((n) => (byId[n.id] = n));
      const html = (cats.items || []).map((c) => {
        const items = (c.newsIds || []).map((id) => byId[id]).filter(Boolean)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        const itemsHTML = items.length
          ? items.map((n) =>
              `<a class="cat__item" href="news.html?id=${encodeURIComponent(n.id)}">
                 <span class="cat__date">${esc(fmtDate(n.date))}</span>
                 <span class="cat__title">${esc(n.title)}</span>
                 <span class="cat__arrow">→</span>
               </a>`).join("")
          : '<p class="empty-note" style="opacity:.65">尚無紀錄</p>';
        return `<section class="cat reveal">
            <header class="cat__head">
              <div class="cat__icon">${c.icon || "✦"}</div>
              <div class="cat__heading">
                <h3>${esc(c.title)}</h3>
                <p class="cat__sub">${esc(c.subtitle || "")}</p>
              </div>
              <div class="cat__count">${items.length} 則</div>
            </header>
            ${c.desc ? `<p class="cat__desc">${esc(c.desc)}</p>` : ""}
            <div class="cat__items">${itemsHTML}</div>
          </section>`;
      }).join("");
      catList.innerHTML = html;
      observeReveals();
    });
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

  /* ---------- Monthly visitor counter (heart) ---------- */
  (function () {
    const wrap = $("#hero-visitor"), txt = $("#hero-visitor-text");
    if (!wrap || !txt) return;
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const counterName = `guangze-${monthKey}`;
    const lastVisit = (() => { try { return localStorage.getItem(`gz_visit_${monthKey}`); } catch (e) { return null; } })();
    // 一個月內同一瀏覽器只計一次
    const shouldIncrement = !lastVisit;
    const url = `https://api.counterapi.dev/v1/guangze-charity/${counterName}/${shouldIncrement ? "up" : "?"}`;
    fetch(url).then((r) => r.json()).then((data) => {
      const n = (data && (data.count || data.Count)) || 0;
      if (n <= 0) return;
      txt.textContent = `${now.getMonth() + 1} 月已有 ${n.toLocaleString()} 位愛心人士關注`;
      wrap.hidden = false;
      if (shouldIncrement) { try { localStorage.setItem(`gz_visit_${monthKey}`, String(Date.now())); } catch (e) {} }
    }).catch(() => {});
  })();

  /* ---------- Upcoming events: section + floating badge ---------- */
  const monthDay = (d) => { const dt = new Date(d); return isNaN(dt) ? { m: "", d: "" } : { m: (dt.getMonth() + 1) + " 月", d: dt.getDate() }; };
  const eventCard = (e) => {
    const md = monthDay(e.date);
    const meta = [e.time ? "🕒 " + e.time : "", e.location ? "📍 " + e.location : ""]
      .filter(Boolean).map((s) => `<span>${esc(s)}</span>`).join("");
    return `<article class="event-card reveal">
        <div class="event-card__date"><div class="event-card__month">${esc(md.m)}</div><div class="event-card__day">${esc(md.d)}</div></div>
        <div class="event-card__body">
          <h3>${esc(e.title)}</h3>
          ${meta ? `<div class="event-card__meta">${meta}</div>` : ""}
          ${e.note ? `<p>${esc(e.note)}</p>` : ""}
          ${e.link ? `<a class="event-card__link" href="${esc(e.link)}" target="_blank" rel="noopener">${esc(e.linkText || "看更多")} →</a>` : ""}
        </div>
      </article>`;
  };
  function buildBadge(e) {
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
         <h4>${esc(e.title)}</h4>
         ${e.date ? `<div class="upcoming__date">🗓 ${esc(fmtDate(e.date))}${e.time ? "　" + esc(e.time) : ""}</div>` : ""}
         ${e.note ? `<p>${esc(e.note)}</p>` : ""}
         ${e.link ? `<a class="upcoming__link" href="${esc(e.link)}" target="_blank" rel="noopener">${esc(e.linkText || "看更多")} →</a>` : ""}
       </div>`;
    document.body.appendChild(wrap);
    const card = $("#up-card", wrap), dot = $("#up-dot", wrap), close = $("#up-close", wrap);
    let seen = false;
    try { seen = sessionStorage.getItem("gz_up_seen") === "1"; } catch (e2) {}
    if (!seen) { setTimeout(() => card.classList.remove("hide"), 1200); try { sessionStorage.setItem("gz_up_seen", "1"); } catch (e2) {} }
    dot.addEventListener("click", () => card.classList.toggle("hide"));
    close.addEventListener("click", () => card.classList.add("hide"));
  }
  getJSON("content/events.json").then((data) => {
    const items = (data.items || []).filter((e) => e && e.title);
    const future = items.filter((e) => {
      if (!e.date) return true;
      const end = new Date(e.date + "T23:59:59");
      return !isNaN(end) && end.getTime() >= Date.now();   // 過期自動隱藏
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
    const listEl = $("#events-list"), sec = $("#events-section");
    if (listEl && future.length) {
      listEl.innerHTML = future.map(eventCard).join("");
      if (sec) sec.style.display = "";
      observeReveals();
    }
    if (future.length) buildBadge(future[0]);            // 小圈圈顯示最近的一個
  }).catch(() => {});
})();
