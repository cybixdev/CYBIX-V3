const { banner, buttons, developer } = require('../../config');
module.exports = {
  pattern: /^\.developer$/i,
  async handler(ctx) {
    await ctx.replyWithPhoto({ url: banner }, { caption: `👨‍💻 ${developer}`, reply_markup: { inline_keyboard: buttons } });
  }
};