const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.ipinfo ([\d\.]+)$/i,
  async handler(ctx) {
    const ip = ctx.match[1];
    const res = await axios.get(`http://ip-api.com/json/${ip}`);
    await ctx.replyWithPhoto({ url: banner }, { caption: `🌍 IP Info for ${ip}\nCountry: ${res.data.country}\nCity: ${res.data.city}\nISP: ${res.data.isp}\nOrg: ${res.data.org}`, reply_markup: { inline_keyboard: buttons } });
  }
};