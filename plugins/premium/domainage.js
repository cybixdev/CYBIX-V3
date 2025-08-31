const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.domainage (.+)$/i,
  async handler(ctx) {
    const domain = ctx.match[1];
    const res = await axios.get(`https://api.api-ninjas.com/v1/domainlookup?domain=${domain}`, { headers: { 'X-Api-Key': 'YOUR_API_NINJAS_KEY' } });
    await ctx.replyWithPhoto({ url: banner }, { caption: `Domain Age: ${res.data.domain_age} years`, reply_markup: { inline_keyboard: buttons } });
  }
};