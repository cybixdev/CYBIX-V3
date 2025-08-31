const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.dog$/i,
  async handler(ctx) {
    const res = await axios.get('https://dog.ceo/api/breeds/image/random');
    await ctx.replyWithPhoto(
      { url: res.data.message },
      {
        caption: `Dog Pic`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};