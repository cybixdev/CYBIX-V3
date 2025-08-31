const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.buybot$/i,
  async handler(ctx) {
    await ctx.replyWithPhoto({ url: banner }, { caption: `💸 Buy: DM ${process.env.OWNER_ID} or ${require('../../config').developer}`, reply_markup: { inline_keyboard: buttons } });
  }
};