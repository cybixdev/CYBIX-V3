const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.iplookup ([\d\.]+)$/i,
  async handler(ctx) {
    const ip = ctx.match[1];
    const res = await axios.get(`https://ipinfo.io/${ip}/json`);
    await ctx.replyWithPhoto({ url: banner }, { caption: `IP Lookup:\n${JSON.stringify(res.data, null, 2)}`, reply_markup: { inline_keyboard: buttons } });
  }
};