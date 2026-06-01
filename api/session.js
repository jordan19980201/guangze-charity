const { getUser, envReady } = require("../lib/cms.js");

module.exports = async (req, res) => {
  const u = getUser(req);
  res.status(200).json({ user: u ? u.u : null, configured: envReady() });
};
