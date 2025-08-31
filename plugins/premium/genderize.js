const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.genderize (\w+)$/i,
  async handler(ctx) {
    const name = ctx.match[1];
    const res = await axios.get(`https://api.genderize.io/?name=${name}`);
    await ctx.replyWithPhoto({ url: banner }, { caption: `Gender for ${name}: ${res.data.gender}`, reply_markup: { inline_keyboard: buttons } });
  }
};