const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.file2txt (https?:\/\/\S+)$/i,
  async handler(ctx) {
    const fileUrl = ctx.match[1];
    const res = await axios.get(`https://api.api-ninjas.com/v1/pdfextract?url=${fileUrl}`, { headers: { 'X-Api-Key': 'YOUR_API_NINJAS_KEY' } });
    await ctx.replyWithPhoto({ url: banner }, { caption: `Extracted Text:\n${res.data.text.substring(0, 500)}...`, reply_markup: { inline_keyboard: buttons } });
  }
};