require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const config = require('./config');
const bot = new Telegraf(process.env.BOT_TOKEN);

const PREMIUM_FILE = './premium.json';
global.users = new Set();
global.groups = new Set();
global.premium = {};
if (fs.existsSync(PREMIUM_FILE)) {
  try { global.premium = JSON.parse(fs.readFileSync(PREMIUM_FILE)); } catch { global.premium = {}; }
}

// ----------- Middleware for channel check and user/group tracking -----------
bot.use(async (ctx, next) => {
  try {
    if (ctx.from && ctx.from.id) global.users.add(ctx.from.id);
    if (ctx.chat && (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup')) global.groups.add(ctx.chat.id);
    if (ctx.chat.type === 'private') {
      let ok = false;
      try {
        const res = await bot.telegram.getChatMember(`@${config.channelUsername}`, ctx.from.id);
        ok = res.status === 'member' || res.status === 'administrator' || res.status === 'creator';
      } catch {}
      if (!ok) {
        return ctx.reply(
          `🚫 You must join our Telegram channel to use CYBIX V3!\n\nChannel: @${config.channelUsername}`,
          Markup.inlineKeyboard([
            [{ text: 'Join Channel', url: `https://t.me/${config.channelUsername}` }]
          ])
        );
      }
    }
    return next();
  } catch {}
});

// ----------- Menu function -----------
function sendMenu(ctx) {
  const menu =
`╭━━━━━━━【 CYBIX V3 】━━━━━━━
┃ @${ctx.from.username || ctx.from.first_name}
┣━ users: ${global.users.size}
┣━ groups: ${global.groups.size}
┣━ prefix: "."
┣━ owner: ${config.developer}
╰━━━━━━━━━━━━━━━━━━━━━━

╭━━【 MAIN MENU 】━━
┃ • .ping
┃ • .runtime
┃ • .currency
┃ • .shorturl
┃ • .help
┃ • .info
┃ • .buybot
┃ • .repo
┃ • .developer
┃ • .uptime
╰━━━━━━━━━━━━━━━
╭━━【 AI MENU 】━━
┃ • .chatgpt
┃ • .bard
┃ • .deepseek
┃ • .blackbox
╰━━━━━━━━━━━━━━━
╭━━【 DOWNLOAD MENU 】━━
┃ • .video
┃ • .play
┃ • .gitclone
╰━━━━━━━━━━━━━━━
╭━━【 FUN MENU 】━━
┃ • .joke
┃ • .meme
┃ • .weather
┃ • .quote
┃ • .anime
┃ • .waifu
┃ • .cat
┃ • .dog
┃ • .fact
┃ • .advice
┃ • .randomuser
┃ • .activity
┃ • .insult
┃ • .trivia
┃ • .bored
╰━━━━━━━━━━━━━━━
╭━━【 TOOLS MENU 】━━
┃ • .dns
┃ • .whois
┃ • .html2pdf
╰━━━━━━━━━━━━━━━
╭━━【 PREMIUM MENU 】━━
┃ • .cardgen
┃ • .bininfo
┃ • .privnote
┃ • .tempmail
┃ • .ipinfo
┃ • .phoneinfo
┃ • .covidstats
┃ • .news
┃ • .genderize
┃ • .agify
┃ • .nationalize
┃ • .premiuminfo
┃ • .iban
┃ • .vat
┃ • .domainage
┃ • .urlscan
┃ • .emailverify
┃ • .randomaddress
┃ • .disposablecheck
┃ • .file2txt
╰━━━━━━━━━━━━━━━
╭━━【 EXTRA MENU 】━━
┃ • .iplookup
┃ • .randomfact
┃ • .animalfact
┃ • .math
┃ • .horoscope
┃ • .changelog
╰━━━━━━━━━━━━━━━
╭━━【 DEV MENU 】━━
┃ • .broadcast
┃ • .statics
┃ • .mode
┃ • .listusers
┃ • .groupstat
┃ • .addpremium
┃ • .removepremium
┃ • .premiumlist
┃ • .setvip
┃ • .renewpremium
┃ • .reload
┃ • .updateall
┃ • .cleardata
┃ • .stats
┃ • .logs
╰━━━━━━━━━━━━━━━

▣ powered by *CYBIX TECH* 👹💀
`;
  // Always reply, even if error
  try {
    return ctx.replyWithPhoto(
      { url: config.banner },
      {
        caption: menu,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(config.buttons)
      }
    );
  } catch {
    try { ctx.reply(menu); } catch {}
  }
}

// ----------- Premium helpers -----------
function savePremium() {
  try { fs.writeFileSync(PREMIUM_FILE, JSON.stringify(global.premium, null, 2)); } catch {}
}
function isPremium(id) {
  return global.premium[id] && moment().isBefore(moment(global.premium[id]));
}
function setPremium(id, months = 1) {
  global.premium[id] = moment().add(months, 'months').valueOf();
  savePremium();
}
function removePremium(id) {
  delete global.premium[id];
  savePremium();
}
function premiumLeft(id) {
  if (!isPremium(id)) return "None";
  return moment(global.premium[id]).fromNow();
}
function premiumList() {
  return Object.keys(global.premium).filter(isPremium);
}

// ----------- Plugin loader: listens for BOTH .command and /command -----------
function loadPlugins(bot, folder) {
  fs.readdirSync(folder).forEach(file => {
    const fullPath = path.join(folder, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      loadPlugins(bot, fullPath);
    } else if (file.endsWith('.js')) {
      const plugin = require(fullPath);
      // Listen for dot prefix
      bot.hears(plugin.pattern, async ctx => {
        try {
          if (fullPath.includes('plugins/premium')) {
            if (!isPremium(ctx.from.id) && String(ctx.from.id) !== process.env.OWNER_ID) {
              return ctx.reply('🚫 This command is for premium users only. Contact owner for access.');
            }
          }
          await plugin.handler(ctx, bot, { isPremium, setPremium, removePremium, premiumLeft, premiumList });
        } catch {}
      });
      // Listen for slash prefix
      // If pattern is /^\.command/ then register /command as .command
      const match = plugin.pattern.toString().match(/^\^\\?\.([a-zA-Z0-9_]+)/);
      if (match) {
        bot.command(match[1], async ctx => {
          try {
            if (fullPath.includes('plugins/premium')) {
              if (!isPremium(ctx.from.id) && String(ctx.from.id) !== process.env.OWNER_ID) {
                return ctx.reply('🚫 This command is for premium users only. Contact owner for access.');
              }
            }
            await plugin.handler(ctx, bot, { isPremium, setPremium, removePremium, premiumLeft, premiumList });
          } catch {}
        });
      }
    }
  });
}
loadPlugins(bot, path.join(__dirname, 'plugins'));

// ----------- Always respond to /start, /menu, and .menu -----------
bot.start((ctx) => sendMenu(ctx));
bot.command('menu', (ctx) => sendMenu(ctx));
bot.hears(/^\.menu$/i, (ctx) => sendMenu(ctx));

// ----------- Owner/premium commands -----------
bot.hears(/^\.addpremium (\d+)$/, async ctx => {
  if (String(ctx.from.id) !== process.env.OWNER_ID) return;
  setPremium(ctx.match[1], 1);
  await ctx.reply(`✅ Premium enabled for user ${ctx.match[1]} for 1 month.`);
});
bot.hears(/^\.removepremium (\d+)$/, async ctx => {
  if (String(ctx.from.id) !== process.env.OWNER_ID) return;
  removePremium(ctx.match[1]);
  await ctx.reply(`✅ Premium removed for user ${ctx.match[1]}.`);
});
bot.hears(/^\.premiumlist$/, async ctx => {
  if (String(ctx.from.id) !== process.env.OWNER_ID) return;
  await ctx.reply(`Premium users:\n${premiumList().join('\n') || 'None'}`);
});
bot.hears(/^\.renewpremium (\d+)$/, async ctx => {
  if (String(ctx.from.id) !== process.env.OWNER_ID) return;
  setPremium(ctx.match[1], 1);
  await ctx.reply(`✅ Premium renewed for user ${ctx.match[1]} for 1 month.`);
});
bot.hears(/^\.setvip (\d+) (\d+)$/, async ctx => {
  if (String(ctx.from.id) !== process.env.OWNER_ID) return;
  setPremium(ctx.match[1], Number(ctx.match[2]));
  await ctx.reply(`✅ VIP enabled for user ${ctx.match[1]} for ${ctx.match[2]} months.`);
});

bot.hears(/^\.broadcast (.+)/, async ctx => {
  if (String(ctx.from.id) !== process.env.OWNER_ID) return;
  const msg = ctx.match[1];
  for (const id of global.users) {
    try {
      await bot.telegram.sendPhoto(
        id,
        { url: config.banner },
        { caption: `📢 Broadcast:\n${msg}`, ...Markup.inlineKeyboard(config.buttons) }
      );
    } catch {}
  }
  for (const gid of global.groups) {
    try {
      await bot.telegram.sendPhoto(
        gid,
        { url: config.banner },
        { caption: `📢 Broadcast:\n${msg}`, ...Markup.inlineKeyboard(config.buttons) }
      );
    } catch {}
  }
  await ctx.reply('✅ Broadcast sent!');
});

// ----------- Menu on new group/channel/join -----------
bot.on('new_chat_members', ctx => { try { sendMenu(ctx); } catch {} });
bot.on('group_chat_created', ctx => { try { sendMenu(ctx); } catch {} });
bot.on('channel_post', ctx => { try { sendMenu(ctx); } catch {} });

// ----------- Health check for deployment -----------
const http = require('http');
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('CYBIX V3 Telegram Bot is running!\n');
}).listen(PORT, () => {
  console.log(`HTTP health-check server listening on port ${PORT}`);
  bot.launch().then(() => console.log("CYBIX V3 Telegram Bot started!"));
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));