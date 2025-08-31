const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.disposablecheck (.+)$/i,
  async handler(ctx) {
    const email = ctx.match[1];
    const res = await axios.get(`https://open.kickbox.com/v1/disposable/${email}`);
    await ctx.replyWithPhoto({ url: banner }, { caption: `Disposable: ${res.data.disposable ? 'Yes' : 'No'}`, reply_markup: { inline_keyboard: buttons } });
  }
};