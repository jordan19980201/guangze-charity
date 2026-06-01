const { getUser, readJson, ghGet, ghPut } = require("../lib/cms.js");

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "method" }); return; }
  if (!getUser(req)) { res.status(401).json({ error: "未登入" }); return; }
  const { filename, dataBase64 } = await readJson(req);
  if (!filename || !dataBase64) { res.status(400).json({ error: "缺少檔案" }); return; }
  // 清理檔名（保留副檔名），加時間戳避免覆蓋
  const clean = String(filename).toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const finalName = `${Date.now()}-${clean || "image"}`;
  const path = "public/assets/img/uploads/" + finalName;
  const b64 = String(dataBase64).replace(/^data:[^;]+;base64,/, "");
  // 粗略大小檢查（base64 約為原始的 1.37 倍；限制原始約 4MB）
  if (b64.length > 5.6 * 1024 * 1024) { res.status(413).json({ error: "圖片太大，請壓到 4MB 以下" }); return; }
  try {
    const existing = await ghGet(path); // 多半為 null
    await ghPut(path, b64, `chore(cms): 上傳圖片 ${finalName}`, existing && existing.sha);
    res.status(200).json({ ok: true, path: "assets/img/uploads/" + finalName });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
