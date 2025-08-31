const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.blackbox (.+)/i,
  async handler(ctx) {
    const query = ctx.match[1];
    const res = await axios.get(`https://aigptx.vercel.app/api/blackbox?q=${encodeURIComponent(query)}`);
    await ctx.replyWithPhoto(
      { url: banner },
      {
        caption: `🤖 ${res.data.result || 'No response.'}`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};