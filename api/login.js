const { readJson, sign, setCookie } = require("../lib/cms.js");

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "method" }); return; }
  const U = process.env.ADMIN_USERNAME;
  const P = process.env.ADMIN_PASSWORD;
  if (!U || !P || !process.env.SESSION_SECRET) {
    res.status(500).json({ error: "後台尚未完成設定（請確認 Vercel 環境變數）" });
    return;
  }
  const { username, password } = await readJson(req);
  const ok = typeof username === "string" && typeof password === "string" && username === U && password === P;
  if (!ok) { res.status(401).json({ error: "帳號或密碼錯誤" }); return; }
  const token = sign({ u: username }, 60 * 60 * 24 * 30); // 30 天
  setCookie(res, "gz_session", token, { maxAge: 60 * 60 * 24 * 30 });
  res.status(200).json({ ok: true, username });
};
