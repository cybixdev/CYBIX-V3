const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.waifu$/i,
  async handler(ctx) {
    const res = await axios.get('https://api.waifu.pics/sfw/waifu');
    await ctx.replyWithPhoto(
      { url: res.data.url },
      {
        caption: `Waifu Pic`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};