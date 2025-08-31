const moment = require('moment');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.runtime$/i,
  async handler(ctx) {
    const uptime = moment.duration(process.uptime(), "seconds").humanize();
    await ctx.replyWithPhoto({ url: banner }, { caption: `⏱️ Uptime: ${uptime}`, reply_markup: { inline_keyboard: buttons } });
  }
};