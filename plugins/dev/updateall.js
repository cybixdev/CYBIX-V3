module.exports = {
  pattern: /^\.updateall$/i,
  async handler(ctx) {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return ctx.reply('❌ Only owner.');
    await ctx.reply('🔄 Updates will be applied on next restart.');
  }
};