const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.info$/i,
  async handler(ctx) {
    await ctx.replyWithPhoto({ url: banner }, { caption: `CYBIX V3 by ${require('../../config').developer}, running on ${process.platform}`, reply_markup: { inline_keyboard: buttons } });
  }
};