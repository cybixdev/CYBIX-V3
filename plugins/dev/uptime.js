const moment = require('moment');
module.exports = {
  pattern: /^\.uptime$/i,
  async handler(ctx) {
    const uptime = moment.duration(process.uptime(), "seconds").humanize();
    await ctx.reply(`Uptime: ${uptime}`);
  }
};