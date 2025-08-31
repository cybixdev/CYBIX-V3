const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.agify (\w+)$/i,
  async handler(ctx) {
    const name = ctx.match[1];
    const res = await axios.get(`https://api.agify.io/?name=${name}`);
    await ctx.replyWithPhoto({ url: banner }, { caption: `Predicted age for ${name}: ${res.data.age}`, reply_markup: { inline_keyboard: buttons } });
  }
};