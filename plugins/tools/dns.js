const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.dns (.+)$/i,
  async handler(ctx) {
    const domain = ctx.match[1];
    const res = await axios.get(`https://dns.google/resolve?name=${domain}`);
    await ctx.replyWithPhoto({ url: banner }, { caption: `DNS Lookup:\n${JSON.stringify(res.data.Answer || res.data, null, 2)}`, reply_markup: { inline_keyboard: buttons } });
  }
};