const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.iban (\w+)$/i,
  async handler(ctx) {
    const iban = ctx.match[1];
    const res = await axios.get(`https://openiban.com/validate/${iban}?getBIC=true&validateBankCode=true`);
    await ctx.replyWithPhoto({ url: banner }, { caption: `IBAN Valid: ${res.data.valid}\nBank: ${res.data.bankData?.name}`, reply_markup: { inline_keyboard: buttons } });
  }
};