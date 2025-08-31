const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.urlscan (https?:\/\/\S+)$/i,
  async handler(ctx) {
    const url = ctx.match[1];
    const res = await axios.get(`https://urlscan.io/api/v1/search/?q=domain:${url}`);
    await ctx.replyWithPhoto({ url: banner }, { caption: `URLScan Results: ${JSON.stringify(res.data.results[0], null, 2)}`, reply_markup: { inline_keyboard: buttons } });
  }
};