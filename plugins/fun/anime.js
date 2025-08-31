const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.anime$/i,
  async handler(ctx) {
    const res = await axios.get('https://api.catboys.com/img');
    await ctx.replyWithPhoto(
      { url: res.data.url },
      {
        caption: `Anime Pic`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};