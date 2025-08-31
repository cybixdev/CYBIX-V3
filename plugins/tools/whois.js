const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.whois (.+)$/i,
  async handler(ctx) {
    const domain = ctx.match[1];
    const res = await axios.get(`https://api.api-ninjas.com/v1/whois?domain=${domain}`, {
      headers: { 'X-Api-Key': 'YOUR_API_NINJAS_KEY' }
    });
    await ctx.replyWithPhoto({ url: banner }, { caption: `Whois Info:\n${JSON.stringify(res.data, null, 2)}`, reply_markup: { inline_keyboard: buttons } });
  }
};