module.exports = {
  pattern: /^\.addpremium (\d+)$/i,
  async handler(ctx, bot, helpers) {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return ctx.reply('❌ Only owner.');
    helpers.setPremium(ctx.match[1], 1);
    await ctx.reply(`✅ Premium enabled for user ${ctx.match[1]} for 1 month.`);
  }
};