require('dotenv').config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  OWNER_ID: process.env.OWNER_ID,
  PORT: process.env.PORT || 8080,
  BANNER_IMAGE_URL: "https://files.catbox.moe/btskaz.jpg",
};