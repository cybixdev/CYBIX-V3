const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.broadcast (.+)/i,
  async handler(ctx, bot) {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return ctx.reply('❌ Only owner.');
    const msg = ctx.match[1];
    for (const id of global.users) {
      try {
        await bot.telegram.sendPhoto(
          id,
          { url: banner },
          { caption: `📢 Broadcast:\n${msg}`, reply_markup: { inline_keyboard: buttons } }
        );
      } catch {}
    }
    for (const gid of global.groups) {
      try {
        await bot.telegram.sendPhoto(
          gid,
          { url: banner },
          { caption: `📢 Broadcast:\n${msg}`, reply_markup: { inline_keyboard: buttons } }
        );
      } catch {}
    }
    await ctx.reply('✅ Broadcast sent!');
  }
};