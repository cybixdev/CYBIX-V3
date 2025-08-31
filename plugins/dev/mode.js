const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.mode$/i,
  async handler(ctx) {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return ctx.reply('❌ Only owner.');
    await ctx.replyWithPhoto({ url: banner }, { caption: 'Mode: Production', reply_markup: { inline_keyboard: buttons } });
  }
};