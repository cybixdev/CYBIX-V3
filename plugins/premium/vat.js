const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.vat (\w+)$/i,
  async handler(ctx) {
    const vat = ctx.match[1];
    const res = await axios.get(`https://vatapi.com/v1/validate?vat_number=${vat}`, { headers: { 'apikey': 'YOUR_VATAPI_KEY' } });
    await ctx.replyWithPhoto({ url: banner }, { caption: `VAT Valid: ${res.data.valid}\nCountry: ${res.data.countryCode}`, reply_markup: { inline_keyboard: buttons } });
  }
};