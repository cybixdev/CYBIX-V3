const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.privnote (.+)$/i,
  async handler(ctx) {
    const note = ctx.match[1];
    const res = await axios.post('https://privnote-api.vercel.app/api/notes', { note });
    await ctx.replyWithPhoto({ url: banner }, { caption: `🔒 Privnote Link: ${res.data.url}`, reply_markup: { inline_keyboard: buttons } });
  }
};