const fs = require('fs');
module.exports = {
  pattern: /^\.logs$/i,
  async handler(ctx) {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return ctx.reply('❌ Only owner.');
    await ctx.reply('Logs are only available in server console.');
  }
};