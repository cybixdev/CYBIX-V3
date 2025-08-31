const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.animalfact (\w+)$/i,
  async handler(ctx) {
    const animal = ctx.match[1];
    const res = await axios.get(`https://some-random-api.ml/facts/${animal}`);
    await ctx.replyWithPhoto({ url: banner }, { caption: `${animal} Fact: ${res.data.fact}`, reply_markup: { inline_keyboard: buttons } });
  }
};