const axios = require('axios');
const { banner, buttons } = require('../../config');
module.exports = {
  pattern: /^\.trivia$/i,
  async handler(ctx) {
    const res = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
    const q = res.data.results[0];
    await ctx.replyWithPhoto(
      { url: banner },
      {
        caption: `❓ Trivia: ${q.question}\nA: ${q.correct_answer}\nOptions: ${q.incorrect_answers.join(', ')}`,
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
};