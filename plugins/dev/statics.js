const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.statics$/i,
  async handler(ctx) {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return ctx.reply('❌ Only owner.');
    await ctx.replyWithPhoto({ url: banner }, { caption: `Users: ${global.users.size} | Groups: ${global.groups.size}`, reply_markup: { inline_keyboard: buttons } });
  }
};