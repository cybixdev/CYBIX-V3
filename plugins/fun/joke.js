const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.joke$/i,
  async handler(ctx) {
    const res = await axios.get('https://official-joke-api.appspot.com/random_joke');
    await ctx.replyWithPhoto(
      { url: banner },
      {
        caption: `${res.data.setup}\n${res.data.punchline}`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};