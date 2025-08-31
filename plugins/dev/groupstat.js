const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.groupstat$/i,
  async handler(ctx) {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return ctx.reply('❌ Only owner.');
    let groupList = Array.from(global.groups).join(', ');
    await ctx.replyWithPhoto({ url: banner }, { caption: `Group IDs: ${groupList}`, reply_markup: { inline_keyboard: buttons } });
  }
};