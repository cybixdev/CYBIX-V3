module.exports = {
  pattern: /^\.removepremium (\d+)$/i,
  async handler(ctx, bot, helpers) {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return ctx.reply('❌ Only owner.');
    helpers.removePremium(ctx.match[1]);
    await ctx.reply(`✅ Premium removed for user ${ctx.match[1]}.`);
  }
};