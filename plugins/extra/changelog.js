const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.changelog$/i,
  async handler(ctx) {
    await ctx.replyWithPhoto({ url: banner }, { caption: `CYBIX V3 Changelog:\n- All menus\n- All features\n- All plugins\n- No errors\n- 2025 Update!`, reply_markup: { inline_keyboard: buttons } });
  }
};