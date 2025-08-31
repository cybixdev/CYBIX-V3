const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.shorturl (https?:\/\/\S+)$/i,
  async handler(ctx) {
    const url = ctx.match[1];
    const res = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
    await ctx.replyWithPhoto({ url: banner }, { caption: `Short URL: ${res.data}`, reply_markup: { inline_keyboard: buttons } });
  }
};