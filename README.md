# 新竹市廣澤慈善協會 官方網站

charity: water 風格的形象網站，採用協會 Logo 的紅／金／墨品牌色。
**純靜態網站 + Sveltia CMS 後台**，可免費部署於 Cloudflare Pages。

---

## 📁 專案結構

```
廣澤慈善協會/
├─ public/                  ← 網站本體（部署時的發布目錄）
│  ├─ index.html            首頁（全幅輪播）
│  ├─ about.html            關於我們
│  ├─ services.html         我們的善行
│  ├─ news.html             最新消息（含內頁 ?id=）
│  ├─ stories.html          成果與故事
│  ├─ get-involved.html     響應愛心
│  ├─ contact.html          聯絡我們
│  ├─ admin/                後台 CMS
│  │  ├─ index.html
│  │  └─ config.yml         ← 部署前需修改 repo 設定
│  ├─ assets/
│  │  ├─ css/styles.css
│  │  ├─ js/main.js
│  │  └─ img/               Logo、佔位圖、uploads/（後台上傳處）
│  └─ content/              ← 後台管理的內容（JSON）
│     ├─ settings.json      聯絡資訊
│     ├─ impact.json        影響力數據
│     ├─ carousel.json      首頁輪播
│     ├─ news.json          最新消息
│     └─ stories.json       成果故事
├─ docs/                    設計文件
└─ README.md
```

---

## 🖥️ 本機預覽

需要一個本機伺服器（直接打開 HTML 會因瀏覽器限制無法載入內容）。

**用 Python（本機已安裝）：**
```bash
cd public
python -m http.server 8000
```
然後瀏覽器開啟 http://localhost:8000

---

## 🚀 部署上線（Cloudflare Pages，免費）

### 步驟 1：建立 GitHub 儲存庫
1. 註冊 / 登入 [GitHub](https://github.com)（免費）
2. 建立新的 repository，例如 `guangze-charity`
3. 把整個專案資料夾推上去：
   ```bash
   git remote add origin https://github.com/你的帳號/guangze-charity.git
   git branch -M main
   git push -u origin main
   ```

### 步驟 2：連接 Cloudflare Pages
1. 註冊 / 登入 [Cloudflare](https://dash.cloudflare.com)（免費）
2. 進入 **Workers & Pages → Create → Pages → Connect to Git**
3. 選擇剛才的 GitHub repo
4. 建置設定：
   - **Framework preset**：None
   - **Build command**：留空
   - **Build output directory**：`public`
5. 按 **Save and Deploy**，幾十秒後網站就上線了 🎉

之後只要 `git push`，或透過後台存檔，網站都會自動更新。

---

## 🔐 開通後台 `/admin`

後台使用 **Sveltia CMS**，以 GitHub 帳號登入管理內容。

### 1. 修改設定檔
編輯 `public/admin/config.yml`，把：
```yaml
repo: YOUR_GITHUB_USERNAME/YOUR_REPO_NAME
```
改成你的實際帳號與儲存庫名稱，例如 `repo: jordan1998/guangze-charity`。

### 2. 設定 GitHub 登入授權（OAuth）
Sveltia CMS 需要一個 OAuth 中介服務來登入 GitHub。最簡單的方式：

**方法 A — 使用 Sveltia 官方文件的 Cloudflare Workers 授權器**
1. 在 GitHub 建立 OAuth App：
   - Settings → Developer settings → OAuth Apps → New OAuth App
   - Homepage URL：你的網站網址
   - Authorization callback URL：依授權器說明填寫
2. 依 [Sveltia CMS 文件](https://github.com/sveltia/sveltia-cms#getting-started) 部署 `sveltia-cms-auth` 到 Cloudflare Workers，填入 OAuth App 的 Client ID / Secret
3. 完成後即可在 `你的網址/admin/` 用 GitHub 登入

> 這一步較技術性，若需要我可以在你回來後一步步帶你設定，或直接幫你完成。

### 3. 開始管理內容
登入後台後，左側會看到：
- **首頁輪播大圖**：上傳 / 新增輪播照片
- **影響力數據**：修改首頁的數字
- **最新消息／活動公告**：新增活動消息（標題、日期、封面、內文）
- **成果與故事**：新增受助故事
- **基本聯絡資訊**：電話、地址、LINE、臉書、地圖

存檔後會自動更新到網站。

---

## ✏️ 需要替換的佔位內容

目前網站可正常運作，但以下為**示意內容**，建議盡快更新（可透過後台）：

| 項目 | 說明 |
|---|---|
| 所有照片 | 目前為紅金漸層佔位圖，請換成真實活動照片 |
| 影響力數據 | `16 年`、`100,000 斤` 等為估計值，請填實際數字 |
| 聯絡資訊 | 電話 `03-000-0000`、地址、信箱、LINE ID 請更新為正確資訊 |
| 成立年份 | 設計文件中待協會確認 |

---

## 🎨 品牌色

| 顏色 | 色碼 |
|---|---|
| 朱紅 | `#9E1B1B` |
| 古金 | `#C8A04C` |
| 墨黑 | `#2B2320` |
| 暖米白 | `#FBF8F3` |

字體：標題 Noto Serif TC、內文 Noto Sans TC（透過 Google Fonts 載入）。

---

## 🛠️ 技術說明

- 純 HTML / CSS / 原生 JavaScript，**無建置步驟**
- 頁首、頁尾由 `main.js` 統一注入，維持全站一致
- 動態內容（消息、故事、輪播、數據、設定）由前端讀取 `content/*.json` 渲染
- 後台 Sveltia CMS 編輯這些 JSON 並 commit 回 GitHub，觸發自動部署

未來若想升級為 Astro（更好的 SEO 與圖片優化），架構已預留，可再行遷移。
