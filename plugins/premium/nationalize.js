const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.nationalize (\w+)$/i,
  async handler(ctx) {
    const name = ctx.match[1];
    const res = await axios.get(`https://api.nationalize.io/?name=${name}`);
    const country = res.data.country[0]?.country_id;
    await ctx.replyWithPhoto({ url: banner }, { caption: `Top nationality for ${name}: ${country}`, reply_markup: { inline_keyboard: buttons } });
  }
};