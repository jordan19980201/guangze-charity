// 共用工具：JWT 簽章、Cookie、GitHub API（提交內容）
// 純 Node 內建模組，無第三方相依，無需建置。
const crypto = require("crypto");

const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || "main";
const TOKEN = process.env.GITHUB_TOKEN;
const SECRET = process.env.SESSION_SECRET || "";

// ---------- base64url ----------
function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlJson(o) {
  return b64url(Buffer.from(JSON.stringify(o), "utf8"));
}

// ---------- JWT (HS256) ----------
function sign(payload, maxAgeSec) {
  const header = { alg: "HS256", typ: "JWT" };
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + maxAgeSec };
  const data = b64urlJson(header) + "." + b64urlJson(body);
  const sig = b64url(crypto.createHmac("sha256", SECRET).update(data).digest());
  return data + "." + sig;
}
function verify(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const data = parts[0] + "." + parts[1];
  const expected = b64url(crypto.createHmac("sha256", SECRET).update(data).digest());
  if (expected.length !== parts[2].length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts[2]))) return null;
  let body;
  try {
    body = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
  } catch (e) {
    return null;
  }
  if (body.exp && body.exp < Math.floor(Date.now() / 1000)) return null;
  return body;
}

// ---------- Cookies ----------
function setCookie(res, name, value, { maxAge } = {}) {
  const parts = [`${name}=${value}`, "Path=/", "HttpOnly", "SameSite=Lax", "Secure"];
  parts.push(`Max-Age=${maxAge != null ? maxAge : 0}`);
  res.setHeader("Set-Cookie", parts.join("; "));
}
function getCookie(req, name) {
  const c = req.headers.cookie || "";
  const m = c.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? m[1] : null;
}
function getUser(req) {
  return verify(getCookie(req, "gz_session"));
}

// ---------- Request body ----------
async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return await new Promise((resolve) => {
    let d = "";
    req.on("data", (c) => (d += c));
    req.on("end", () => { try { resolve(JSON.parse(d || "{}")); } catch (e) { resolve({}); } });
    req.on("error", () => resolve({}));
  });
}

// ---------- GitHub contents API ----------
function ghHeaders() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    "User-Agent": "guangze-cms",
    Accept: "application/vnd.github+json",
  };
}
function ghUrl(path) {
  // keep slashes, encode the rest
  const enc = path.split("/").map(encodeURIComponent).join("/");
  return `https://api.github.com/repos/${REPO}/contents/${enc}`;
}
async function ghGet(path) {
  const r = await fetch(`${ghUrl(path)}?ref=${encodeURIComponent(BRANCH)}`, { headers: ghHeaders() });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error("GitHub 讀取失敗 " + r.status);
  return await r.json();
}
async function ghPut(path, contentBase64, message, sha) {
  const body = { message, content: contentBase64, branch: BRANCH };
  if (sha) body.sha = sha;
  const r = await fetch(ghUrl(path), {
    method: "PUT",
    headers: { ...ghHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error("GitHub 寫入失敗 " + r.status + " " + t);
  }
  return await r.json();
}

function envReady() {
  return Boolean(REPO && TOKEN && SECRET && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
}

module.exports = { sign, verify, setCookie, getCookie, getUser, readJson, ghGet, ghPut, envReady };
