const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.randomaddress$/i,
  async handler(ctx) {
    const res = await axios.get('https://random-data-api.com/api/address/random_address');
    await ctx.replyWithPhoto({ url: banner }, { caption: `Random Address: ${res.data.street_address}, ${res.data.city}, ${res.data.country}`, reply_markup: { inline_keyboard: buttons } });
  }
};