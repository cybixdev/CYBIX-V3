const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.weather (.+)/i,
  async handler(ctx) {
    const city = ctx.match[1];
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=3`;
    const res = await axios.get(url);
    await ctx.replyWithPhoto(
      { url: banner },
      {
        caption: `${res.data}`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};