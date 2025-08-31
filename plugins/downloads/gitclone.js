const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.gitclone (.+)/i,
  async handler(ctx) {
    const repoUrl = ctx.match[1].replace('https://github.com/', '');
    const res = await axios.get(`https://api.github.com/repos/${repoUrl}`);
    if (res.data.clone_url) {
      await ctx.replyWithPhoto(
        { url: banner },
        {
          caption: `🗃️ Repo: ${res.data.clone_url}`,
          reply_markup: { inline_keyboard: buttons }
        }
      );
    } else {
      await ctx.reply('❌ Unable to clone repo.');
    }
  }
};