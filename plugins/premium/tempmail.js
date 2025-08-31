const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.tempmail$/i,
  async handler(ctx) {
    const res = await axios.get('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1');
    await ctx.replyWithPhoto({ url: banner }, { caption: `📧 Temporary Mail: ${res.data[0]}`, reply_markup: { inline_keyboard: buttons } });
  }
};