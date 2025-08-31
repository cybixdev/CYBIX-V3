const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.emailverify (.+)$/i,
  async handler(ctx) {
    const email = ctx.match[1];
    const res = await axios.get(`https://api.eva.pingutil.com/email?email=${email}`);
    await ctx.replyWithPhoto({ url: banner }, { caption: `Email Valid: ${res.data.data.deliverable}`, reply_markup: { inline_keyboard: buttons } });
  }
};