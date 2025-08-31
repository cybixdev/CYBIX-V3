const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.quote$/i,
  async handler(ctx) {
    const res = await axios.get('https://api.quotable.io/random');
    await ctx.replyWithPhoto(
      { url: banner },
      {
        caption: `"${res.data.content}"\n— ${res.data.author}`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};