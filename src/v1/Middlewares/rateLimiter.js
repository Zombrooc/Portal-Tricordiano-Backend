const rateLimit = require("express-rate-limit");

const rateLimiterUsingThirdParty = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min in milliseconds
  max: 100,
  message: "You have exceeded the 100 requests in 15 min limit!",
  headers: true,
});

module.exports = rateLimiterUsingThirdParty;
