/* 新竹市廣澤慈善協會 — 自訂後台
   登入後可編輯內容並上傳照片，存檔即透過後端提交、自動更新網站。 */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const show = (el) => el && el.classList.remove("hidden");
  const hide = (el) => el && el.classList.add("hidden");

  // 內容區塊定義
  const SECTIONS = [
    {
      key: "carousel", file: "carousel.json", label: "首頁輪播", title: "首頁輪播大圖",
      desc: "首頁最上方自動輪播的大圖。建議橫式、解析度 1920×1080。",
      def: { slides: [] },
      list: {
        prop: "slides", itemLabel: "照片", titleOf: (s) => s.title || "(未命名)",
        newItem: (arr) => ({ image: "", title: "", subtitle: "", order: arr.length + 1 }),
        fields: [
          { k: "image", t: "image", l: "大圖（建議 1920×1080 橫式）" },
          { k: "title", t: "text", l: "主標題" },
          { k: "subtitle", t: "text", l: "副標題" },
          { k: "order", t: "number", l: "排序（數字小的排前面）" },
        ],
      },
    },
    {
      key: "events", file: "events.json", label: "活動預告", title: "活動預告（即將舉辦）",
      desc: "未來的活動。每筆到了「日期」之後會自動從網站消失；最近的一筆也會顯示在首頁左下角的小圈圈。沒有未來活動時，首頁「活動預告」整區會自動隱藏。",
      def: { items: [] },
      list: {
        prop: "items", itemLabel: "活動", titleOf: (s) => `${s.date || ""}　${s.title || "(未命名)"}`,
        newItem: () => ({ id: "event-" + Date.now(), title: "", date: today(), time: "", location: "", note: "", link: "", linkText: "前往臉書看更多" }),
        fields: [
          { k: "title", t: "text", l: "活動名稱" },
          { k: "date", t: "text", l: "日期（格式 2026-07-11；過了自動隱藏）" },
          { k: "time", t: "text", l: "時間（例：晚上 7:00　自由進場）" },
          { k: "location", t: "text", l: "地點" },
          { k: "note", t: "textarea", l: "活動說明" },
          { k: "link", t: "text", l: "連結網址（例如臉書貼文）" },
          { k: "linkText", t: "text", l: "連結文字" },
        ],
      },
    },
    {
      key: "impact", file: "impact.json", label: "影響力數據", title: "首頁影響力數據",
      desc: "首頁紅色區塊的數字。",
      def: { intro: "", stats: [], note: "" },
      objectFields: [
        { k: "intro", t: "text", l: "引言" },
        { k: "note", t: "text", l: "備註（不會顯示在網站上）" },
      ],
      list: {
        prop: "stats", itemLabel: "數據", titleOf: (s) => `${s.number || ""}${s.unit || ""}　${s.label || ""}`,
        newItem: () => ({ number: "", unit: "", label: "" }),
        fields: [
          { k: "number", t: "text", l: "數字（例：1,000）" },
          { k: "unit", t: "text", l: "單位（例：戶、年、斤+）" },
          { k: "label", t: "text", l: "說明文字" },
        ],
      },
    },
    {
      key: "news", file: "news.json", label: "最新消息", title: "最新消息／活動公告",
      desc: "新增或編輯活動消息。發布後會出現在「最新消息」頁與首頁。",
      def: { items: [] },
      list: {
        prop: "items", itemLabel: "消息", titleOf: (s) => `${s.date || ""}　${s.title || "(未命名)"}`,
        newItem: () => ({ id: "post-" + Date.now(), title: "", date: today(), cover: "", excerpt: "", body: "" }),
        fields: [
          { k: "title", t: "text", l: "標題" },
          { k: "date", t: "text", l: "日期（格式 2026-06-02）" },
          { k: "cover", t: "image", l: "封面照片" },
          { k: "excerpt", t: "textarea", l: "摘要（列表上顯示的短介紹）" },
          { k: "body", t: "textarea", l: "內文（段落之間請空一行）" },
          { k: "id", t: "text", l: "網址代碼（英數，需唯一；存檔後勿改）" },
        ],
      },
    },
    {
      key: "stories", file: "stories.json", label: "成果與故事", title: "成果與故事",
      desc: "分享受助者或服務的真實故事。",
      def: { items: [] },
      list: {
        prop: "items", itemLabel: "故事", titleOf: (s) => s.title || "(未命名)",
        newItem: () => ({ id: "story-" + Date.now(), title: "", image: "", quote: "", body: "" }),
        fields: [
          { k: "title", t: "text", l: "標題" },
          { k: "image", t: "image", l: "照片" },
          { k: "quote", t: "text", l: "金句（會以較大字體呈現）" },
          { k: "body", t: "textarea", l: "故事內容" },
          { k: "id", t: "text", l: "代碼（英數，需唯一）" },
        ],
      },
    },
    {
      key: "settings", file: "settings.json", label: "基本資訊", title: "基本聯絡資訊",
      desc: "全站共用的聯絡資訊，會顯示在頁尾與聯絡頁。",
      def: {},
      objectFields: [
        { k: "orgName", t: "text", l: "協會名稱" },
        { k: "slogan", t: "text", l: "標語" },
        { k: "subSlogan", t: "text", l: "副標語" },
        { k: "phone", t: "text", l: "電話" },
        { k: "email", t: "text", l: "電子信箱" },
        { k: "lineId", t: "text", l: "LINE ID" },
        { k: "facebook", t: "text", l: "臉書連結（完整網址）" },
        { k: "address", t: "text", l: "地址" },
        { k: "addressNote", t: "text", l: "地址備註" },
        { k: "mapEmbed", t: "textarea", l: "Google 地圖嵌入網址", hint: "Google 地圖 → 分享 → 嵌入地圖 → 複製 src=\"...\" 內的網址" },
        { k: "taxId", t: "text", l: "統一編號" },
      ],
    },
  ];

  function today() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
  function el(tag, props, kids) {
    const e = document.createElement(tag);
    if (props) for (const k in props) {
      if (k === "class") e.className = props[k];
      else if (k === "html") e.innerHTML = props[k];
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), props[k]);
      else if (props[k] != null) e.setAttribute(k, props[k]);
    }
    (kids || []).forEach((c) => c != null && e.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return e;
  }
  const api = (url, body) =>
    fetch(url, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {})
      .then(async (r) => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || ("錯誤 " + r.status)); return j; });

  const state = {};       // file -> data object
  let active = null;       // current section

  // ---------- 啟動 ----------
  api("/api/session").then((s) => {
    hide($("#loading"));
    if (!s.configured) { show($("#setup")); return; }
    if (!s.user) { show($("#login")); $("#username").focus(); return; }
    startApp(s.user);
  }).catch(() => { hide($("#loading")); show($("#login")); });

  // ---------- 登入 ----------
  $("#login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = $("#login-msg"); msg.className = "msg"; msg.textContent = "";
    const btn = $("#login-btn"); btn.disabled = true; btn.textContent = "登入中…";
    api("/api/login", { username: $("#username").value, password: $("#password").value })
      .then((r) => { hide($("#login")); startApp(r.username); })
      .catch((err) => { msg.className = "msg err"; msg.textContent = err.message; })
      .finally(() => { btn.disabled = false; btn.textContent = "登入"; });
  });

  function startApp(user) {
    show($("#app"));
    $("#who").textContent = "👤 " + user;
    $("#logout-btn").addEventListener("click", () => api("/api/logout", {}).finally(() => location.reload()));
    $("#save-btn").addEventListener("click", saveActive);
    // 建立分頁
    const tabs = $("#tabs");
    SECTIONS.forEach((sec, i) => {
      tabs.appendChild(el("button", { class: "tab" + (i === 0 ? " active" : ""), onclick: () => openSection(sec) }, [sec.label]));
    });
    // 載入所有內容
    Promise.all(SECTIONS.map((sec) =>
      fetch("../content/" + sec.file + "?t=" + Date.now())
        .then((r) => (r.ok ? r.json() : null)).catch(() => null)
        .then((data) => { state[sec.file] = normalize(sec, data); })
    )).then(() => openSection(SECTIONS[0]));
  }

  function normalize(sec, data) {
    const base = JSON.parse(JSON.stringify(sec.def));
    if (!data || typeof data !== "object") return base;
    const out = Object.assign(base, data);
    if (sec.list && !Array.isArray(out[sec.list.prop])) out[sec.list.prop] = [];
    return out;
  }

  function openSection(sec) {
    active = sec;
    Array.from($("#tabs").children).forEach((t, i) => t.classList.toggle("active", SECTIONS[i] === sec));
    setHint("");
    render();
  }

  function render() {
    const sec = active, data = state[sec.file];
    const root = $("#editor"); root.innerHTML = "";
    root.appendChild(el("div", { class: "section-head" }, [el("h2", null, [sec.title]), el("p", null, [sec.desc])]));

    (sec.objectFields || []).forEach((f) => root.appendChild(fieldRow(f, data)));

    if (sec.list) {
      const L = sec.list;
      const arr = data[L.prop];
      if (!arr.length) root.appendChild(el("p", { class: "empty-note" }, ["目前沒有項目，點下方按鈕新增。"]));
      arr.forEach((item, idx) => root.appendChild(listCard(sec, item, idx)));
      root.appendChild(el("button", { class: "btn btn--ghost add-btn", onclick: () => {
        arr.push(L.newItem(arr)); render();
      } }, ["＋ 新增" + L.itemLabel]));
    }
  }

  function listCard(sec, item, idx) {
    const L = sec.list, arr = state[sec.file][L.prop];
    const tools = el("div", { class: "card-item__tools" }, [
      idx > 0 ? el("button", { class: "btn btn--ghost btn--sm", title: "上移", onclick: () => { arr.splice(idx - 1, 0, arr.splice(idx, 1)[0]); render(); } }, ["↑"]) : null,
      idx < arr.length - 1 ? el("button", { class: "btn btn--ghost btn--sm", title: "下移", onclick: () => { arr.splice(idx + 1, 0, arr.splice(idx, 1)[0]); render(); } }, ["↓"]) : null,
      el("button", { class: "btn btn--danger btn--sm", onclick: () => { if (confirm("確定刪除這筆「" + L.titleOf(item) + "」？")) { arr.splice(idx, 1); render(); } } }, ["刪除"]),
    ]);
    const head = el("div", { class: "card-item__head" }, [el("span", { class: "card-item__title" }, [L.itemLabel + " " + (idx + 1) + "：" + L.titleOf(item)]), tools]);
    const card = el("div", { class: "card-item" }, [head]);
    L.fields.forEach((f) => card.appendChild(fieldRow(f, item)));
    return card;
  }

  function fieldRow(f, obj) {
    if (f.t === "image") return imageField(f, obj);
    const wrap = el("div", { class: "field" }, [el("label", null, [f.l])]);
    let input;
    if (f.t === "textarea") {
      input = el("textarea", null, []);
      input.value = obj[f.k] != null ? obj[f.k] : "";
      input.addEventListener("input", () => (obj[f.k] = input.value));
    } else {
      input = el("input", { type: "text" }, []);
      input.value = obj[f.k] != null ? obj[f.k] : "";
      input.addEventListener("input", () => (obj[f.k] = f.t === "number" ? (input.value === "" ? "" : Number(input.value)) : input.value));
    }
    wrap.appendChild(input);
    if (f.hint) wrap.appendChild(el("div", { class: "hint" }, [f.hint]));
    return wrap;
  }

  function imageField(f, obj) {
    const preview = el("div", { class: "imgfield__preview" }, []);
    const setPreview = (src, label) => {
      preview.innerHTML = "";
      if (src) preview.appendChild(el("img", { src: src, alt: "" }, []));
      else preview.appendChild(el("span", null, [label || "尚無圖片"]));
    };
    setPreview(obj[f.k] ? "../" + obj[f.k] : "", "尚無圖片");
    const fileInput = el("input", { type: "file", accept: "image/*" }, []);
    const stateLine = el("div", { class: "upload-state" }, [obj[f.k] ? "目前：" + obj[f.k] : ""]);
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        setPreview(dataUrl);
        stateLine.textContent = "上傳中…";
        api("/api/upload", { filename: file.name, dataBase64: dataUrl })
          .then((r) => { obj[f.k] = r.path; stateLine.textContent = "✓ 已上傳：" + r.path; })
          .catch((err) => { stateLine.textContent = "✗ 上傳失敗：" + err.message; });
      };
      reader.readAsDataURL(file);
    });
    const right = el("div", { class: "imgfield__right" }, [fileInput, stateLine]);
    return el("div", { class: "field" }, [el("label", null, [f.l]), el("div", { class: "imgfield" }, [preview, right])]);
  }

  function setHint(text, kind) {
    const h = $("#save-hint"); h.textContent = text; h.className = "savebar__hint" + (kind ? " " + kind : "");
  }

  function saveActive() {
    const sec = active; if (!sec) return;
    // 自動補上消息／故事缺漏的代碼
    if (sec.list) {
      const arr = state[sec.file][sec.list.prop];
      arr.forEach((it) => { if ("id" in (sec.list.newItem([]) || {}) && !it.id) it.id = sec.key + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000); });
    }
    const btn = $("#save-btn"); btn.disabled = true; btn.textContent = "儲存中…"; setHint("正在更新網站…");
    api("/api/save", { file: sec.file, data: state[sec.file] })
      .then(() => setHint("✓ 已儲存！網站約 1 分鐘後自動更新。", "ok"))
      .catch((err) => setHint("✗ 儲存失敗：" + err.message, "err"))
      .finally(() => { btn.disabled = false; btn.textContent = "儲存變更"; });
  }
})();
