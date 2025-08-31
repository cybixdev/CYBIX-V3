const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.insult$/i,
  async handler(ctx) {
    const res = await axios.get('https://evilinsult.com/generate_insult.php?lang=en&type=json');
    await ctx.replyWithPhoto(
      { url: banner },
      {
        caption: `😈 ${res.data.insult}`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};