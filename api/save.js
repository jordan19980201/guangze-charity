const { getUser, readJson, ghGet, ghPut } = require("../lib/cms.js");

const ALLOWED = { "news.json": 1, "stories.json": 1, "carousel.json": 1, "impact.json": 1, "settings.json": 1, "events.json": 1 };

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "method" }); return; }
  if (!getUser(req)) { res.status(401).json({ error: "未登入" }); return; }
  const { file, data } = await readJson(req);
  if (!ALLOWED[file]) { res.status(400).json({ error: "不允許的檔案" }); return; }
  if (data == null || typeof data !== "object") { res.status(400).json({ error: "資料格式錯誤" }); return; }
  const path = "public/content/" + file;
  try {
    const existing = await ghGet(path);
    const content = Buffer.from(JSON.stringify(data, null, 2) + "\n", "utf8").toString("base64");
    await ghPut(path, content, `chore(cms): 更新 ${file}`, existing && existing.sha);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
