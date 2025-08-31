module.exports = {
  pattern: /^\.premiumlist$/i,
  async handler(ctx, bot, helpers) {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return ctx.reply('❌ Only owner.');
    await ctx.reply(`Premium users:\n${helpers.premiumList().join('\n') || 'None'}`);
  }
};