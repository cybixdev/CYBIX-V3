const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.fact$/i,
  async handler(ctx) {
    const res = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
    await ctx.replyWithPhoto(
      { url: banner },
      {
        caption: `🧠 Fact: ${res.data.text}`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};