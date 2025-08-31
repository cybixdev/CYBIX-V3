module.exports = {
  pattern: /^\.stats$/i,
  async handler(ctx) {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return ctx.reply('❌ Only owner.');
    await ctx.reply(`Bot stats:\nUsers: ${global.users.size}\nGroups: ${global.groups.size}`);
  }
};