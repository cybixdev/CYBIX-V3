const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.listusers$/i,
  async handler(ctx) {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return ctx.reply('❌ Only owner.');
    let userList = Array.from(global.users).join(', ');
    await ctx.replyWithPhoto({ url: banner }, { caption: `User IDs: ${userList}`, reply_markup: { inline_keyboard: buttons } });
  }
};