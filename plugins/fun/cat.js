const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.cat$/i,
  async handler(ctx) {
    const res = await axios.get('https://api.thecatapi.com/v1/images/search');
    await ctx.replyWithPhoto(
      { url: res.data[0].url },
      {
        caption: `Cat Pic`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};