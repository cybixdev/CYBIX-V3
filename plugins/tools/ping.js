const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.ping$/i,
  async handler(ctx) {
    await ctx.replyWithPhoto({ url: banner }, { caption: '🏓 Pong!', reply_markup: { inline_keyboard: buttons } });
  }
};