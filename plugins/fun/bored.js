const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.bored$/i,
  async handler(ctx) {
    const res = await axios.get('https://www.boredapi.com/api/activity');
    await ctx.replyWithPhoto(
      { url: banner },
      {
        caption: `Bored? Try: ${res.data.activity}`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};