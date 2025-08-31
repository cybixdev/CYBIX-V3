const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.currency (\w{3})$/i,
  async handler(ctx) {
    const code = ctx.match[1].toUpperCase();
    const res = await axios.get(`https://open.er-api.com/v6/latest/${code}`);
    await ctx.replyWithPhoto({ url: banner }, { caption: `Currency: 1 ${code} = ${res.data.rates.USD} USD`, reply_markup: { inline_keyboard: buttons } });
  }
};