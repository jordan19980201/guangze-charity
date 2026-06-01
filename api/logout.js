const { setCookie } = require("../lib/cms.js");

module.exports = async (req, res) => {
  setCookie(res, "gz_session", "", { maxAge: 0 });
  res.status(200).json({ ok: true });
};
