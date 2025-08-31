const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.advice$/i,
  async handler(ctx) {
    const res = await axios.get('https://api.adviceslip.com/advice');
    await ctx.replyWithPhoto(
      { url: banner },
      {
        caption: `💡 Advice: ${res.data.slip.advice}`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};