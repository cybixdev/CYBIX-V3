module.exports = {
  pattern: /^\.reload$/i,
  async handler(ctx) {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return ctx.reply('❌ Only owner.');
    process.exit(0);
  }
};