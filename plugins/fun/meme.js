const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.meme$/i,
  async handler(ctx) {
    const res = await axios.get('https://meme-api.com/gimme');
    await ctx.replyWithPhoto(
      { url: res.data.url },
      {
        caption: `${res.data.title}`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};