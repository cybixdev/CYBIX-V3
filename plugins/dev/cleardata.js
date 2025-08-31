module.exports = {
  pattern: /^\.cleardata$/i,
  async handler(ctx) {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return ctx.reply('❌ Only owner.');
    global.users.clear();
    global.groups.clear();
    await ctx.reply('✅ User/group data cleared.');
  }
};