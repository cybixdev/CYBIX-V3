const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.premiuminfo$/i,
  async handler(ctx, bot, helpers) {
    await ctx.replyWithPhoto({ url: banner }, { caption: `Your premium expires: ${helpers.premiumLeft(ctx.from.id)}`, reply_markup: { inline_keyboard: buttons } });
  }
};