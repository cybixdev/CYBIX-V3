const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.play (.+)/i,
  async handler(ctx) {
    const song = ctx.match[1];
    const res = await axios.get(`https://saavn.dev/api/songs/?query=${encodeURIComponent(song)}`);
    if (res.data.data && res.data.data[0]?.downloadUrl?.[4]?.url) {
      await ctx.replyWithAudio(
        { url: res.data.data[0].downloadUrl[4].url },
        {
          caption: `🎶 Song: ${song}`,
          reply_markup: { inline_keyboard: buttons }
        }
      );
    } else {
      await ctx.reply('❌ No audio found.');
    }
  }
};