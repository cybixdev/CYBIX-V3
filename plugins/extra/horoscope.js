const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.horoscope (\w+)$/i,
  async handler(ctx) {
    const sign = ctx.match[1];
    const res = await axios.get(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`, { method: 'POST' });
    await ctx.replyWithPhoto({ url: banner }, { caption: `Horoscope for ${sign}: ${res.data.description}`, reply_markup: { inline_keyboard: buttons } });
  }
};