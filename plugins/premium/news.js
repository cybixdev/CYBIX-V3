const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.news (\w+)$/i,
  async handler(ctx) {
    const country = ctx.match[1];
    const res = await axios.get(`https://newsapi.org/v2/top-headlines?country=${country}&apiKey=YOUR_NEWSAPI_KEY`);
    const headlines = res.data.articles.slice(0, 3).map(a => a.title).join('\n');
    await ctx.replyWithPhoto({ url: banner }, { caption: `🗞️ News:\n${headlines}`, reply_markup: { inline_keyboard: buttons } });
  }
};