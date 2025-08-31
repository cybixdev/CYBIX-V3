const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.bininfo (\d{6,8})$/i,
  async handler(ctx) {
    const bin = ctx.match[1];
    const res = await axios.get(`https://lookup.binlist.net/${bin}`);
    await ctx.replyWithPhoto({ url: banner }, { caption: `BIN: ${bin}\nBank: ${res.data.bank?.name}\nCountry: ${res.data.country?.name}\nType: ${res.data.type}`, reply_markup: { inline_keyboard: buttons } });
  }
};