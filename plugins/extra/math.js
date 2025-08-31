const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.math (.+)$/i,
  async handler(ctx) {
    const expr = ctx.match[1];
    const res = await axios.get(`https://api.mathjs.org/v4/?expr=${encodeURIComponent(expr)}`);
    await ctx.replyWithPhoto({ url: banner }, { caption: `Result: ${res.data}`, reply_markup: { inline_keyboard: buttons } });
  }
};