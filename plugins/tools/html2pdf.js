const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.html2pdf (https?:\/\/\S+)$/i,
  async handler(ctx) {
    const url = ctx.match[1];
    const res = await axios.get(`https://api.html2pdf.app/v1/generate?url=${encodeURIComponent(url)}&apiKey=demo`);
    await ctx.replyWithDocument({ url: res.data.pdfUrl }, { caption: `PDF for ${url}`, reply_markup: { inline_keyboard: buttons } });
  }
};