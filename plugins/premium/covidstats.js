const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.covidstats (\w+)$/i,
  async handler(ctx) {
    const country = ctx.match[1];
    const res = await axios.get(`https://disease.sh/v3/covid-19/countries/${country}`);
    await ctx.replyWithPhoto({ url: banner }, { caption: `🦠 Covid Stats for ${country}\nCases: ${res.data.cases}\nDeaths: ${res.data.deaths}\nRecovered: ${res.data.recovered}`, reply_markup: { inline_keyboard: buttons } });
  }
};