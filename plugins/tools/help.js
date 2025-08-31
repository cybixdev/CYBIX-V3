const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.help$/i,
  async handler(ctx) {
    await ctx.replyWithPhoto({ url: banner }, { caption: `Menu: use .menu for all commands`, reply_markup: { inline_keyboard: buttons } });
  }
};