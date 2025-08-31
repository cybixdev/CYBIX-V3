const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.repo$/i,
  async handler(ctx) {
    await ctx.replyWithPhoto({ url: banner }, { caption: `📦 Repo: repo not free,use .buybot`, reply_markup: { inline_keyboard: buttons } });
  }
};