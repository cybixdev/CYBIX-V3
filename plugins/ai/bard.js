const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.bard (.+)/i,
  async handler(ctx) {
    const query = ctx.match[1];
    const res = await axios.get(`https://bardapi.site/api/search?q=${encodeURIComponent(query)}`);
    await ctx.replyWithPhoto(
      { url: banner },
      {
        caption: `🤖 ${res.data.answer || 'No response.'}`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};