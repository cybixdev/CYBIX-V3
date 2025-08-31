const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.phoneinfo (\+?\d+)$/i,
  async handler(ctx) {
    const phone = ctx.match[1];
    const res = await axios.get(`https://numverify.com/api/validate?number=${phone}&access_key=YOUR_NUMVERIFY_KEY`);
    await ctx.replyWithPhoto({ url: banner }, { caption: `📱 Phone: ${phone}\nCountry: ${res.data.country_name}\nLocation: ${res.data.location}\nCarrier: ${res.data.carrier}`, reply_markup: { inline_keyboard: buttons } });
  }
};