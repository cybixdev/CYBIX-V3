const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.cardgen$/i,
  async handler(ctx) {
    const res = await axios.get('https://random-data-api.com/api/v2/credit_card');
    const card = res.data;
    await ctx.replyWithPhoto({ url: banner }, { caption: `💳 Card: ${card.credit_card_number}\nType: ${card.credit_card_type}\nExpires: ${card.credit_card_expiry_date}`, reply_markup: { inline_keyboard: buttons } });
  }
};