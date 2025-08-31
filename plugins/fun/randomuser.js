const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.randomuser$/i,
  async handler(ctx) {
    const res = await axios.get('https://randomuser.me/api/');
    const user = res.data.results[0];
    await ctx.replyWithPhoto(
      { url: user.picture.large },
      {
        caption: `Random User:\nName: ${user.name.first} ${user.name.last}\nCountry: ${user.location.country}\nEmail: ${user.email}`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};