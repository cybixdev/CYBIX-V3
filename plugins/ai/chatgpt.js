const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.chatgpt (.+)/i,
  async handler(ctx) {
    const query = ctx.match[1];
    const res = await axios.post('https://chatgpt-api.shn.hk/v1/', { prompt: query });
    await ctx.replyWithPhoto(
      { url: banner },
      {
        caption: `🤖 ${res.data.choices?.[0]?.message?.content || 'No response.'}`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};