require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
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

// --- GLOBAL ERROR HANDLER ---
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  if (ctx && ctx.reply) {
    ctx.reply('❌ An unexpected error occurred. Please try again or contact the owner.');
  }
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// --- Channel Membership Check ---
async function isInChannel(userId) {
  try {
    const res = await bot.telegram.getChatMember(`@${config.channelUsername}`, userId);
    return res.status === 'member' || res.status === 'administrator' || res.status === 'creator';
  } catch {
    return false;
  }
}
bot.use(async (ctx, next) => {
  try {
    if (ctx.from && ctx.from.id) global.users.add(ctx.from.id);
    if (ctx.chat && (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup')) global.groups.add(ctx.chat.id);
    if (ctx.chat.type === 'private') {
      const ok = await isInChannel(ctx.from.id);
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
  } catch (e) {
    console.error('Middleware error:', e);
    if (ctx && ctx.reply) ctx.reply('❌ Unexpected error. Try again.');
  }
});

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
  return ctx.replyWithPhoto(
    { url: config.banner },
    {
      caption: menu,
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(config.buttons)
    }
  );
}

// --- Premium Helpers ---
function savePremium() {
  try {
    fs.writeFileSync(PREMIUM_FILE, JSON.stringify(global.premium, null, 2));
  } catch {}
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

// --- Plugin Loader
function loadPlugins(bot, folder) {
  fs.readdirSync(folder).forEach(file => {
    const fullPath = path.join(folder, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      loadPlugins(bot, fullPath);
    } else if (file.endsWith('.js')) {
      const plugin = require(fullPath);
      bot.hears(plugin.pattern, async ctx => {
        try {
          if (fullPath.includes('plugins/premium')) {
            if (!isPremium(ctx.from.id) && String(ctx.from.id) !== process.env.OWNER_ID) {
              return ctx.reply('🚫 This command is for premium users only. Contact owner for access.');
            }
          }
          await plugin.handler(ctx, bot, { isPremium, setPremium, removePremium, premiumLeft, premiumList });
        } catch (e) {
          console.error(`Plugin error (${fullPath}):`, e);
          if (ctx && ctx.reply) ctx.reply('❌ Error in plugin command. Try again or contact the owner.');
        }
      });
    }
  });
}
loadPlugins(bot, path.join(__dirname, 'plugins'));

bot.start(sendMenu);
bot.command('menu', sendMenu);

// --- Developer Premium Control ---
bot.hears(/^\.addpremium (\d+)$/, async ctx => {
  try {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return;
    setPremium(ctx.match[1], 1);
    await ctx.reply(`✅ Premium enabled for user ${ctx.match[1]} for 1 month.`);
  } catch (e) {
    console.error('addpremium error:', e);
    ctx.reply('❌ Could not add premium.');
  }
});
bot.hears(/^\.removepremium (\d+)$/, async ctx => {
  try {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return;
    removePremium(ctx.match[1]);
    await ctx.reply(`✅ Premium removed for user ${ctx.match[1]}.`);
  } catch (e) {
    console.error('removepremium error:', e);
    ctx.reply('❌ Could not remove premium.');
  }
});
bot.hears(/^\.premiumlist$/, async ctx => {
  try {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return;
    await ctx.reply(`Premium users:\n${premiumList().join('\n') || 'None'}`);
  } catch (e) {
    console.error('premiumlist error:', e);
    ctx.reply('❌ Could not list premium users.');
  }
});
bot.hears(/^\.renewpremium (\d+)$/, async ctx => {
  try {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return;
    setPremium(ctx.match[1], 1);
    await ctx.reply(`✅ Premium renewed for user ${ctx.match[1]} for 1 month.`);
  } catch (e) {
    console.error('renewpremium error:', e);
    ctx.reply('❌ Could not renew premium.');
  }
});
bot.hears(/^\.setvip (\d+) (\d+)$/, async ctx => {
  try {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return;
    setPremium(ctx.match[1], Number(ctx.match[2]));
    await ctx.reply(`✅ VIP enabled for user ${ctx.match[1]} for ${ctx.match[2]} months.`);
  } catch (e) {
    console.error('setvip error:', e);
    ctx.reply('❌ Could not set VIP.');
  }
});

// --- Broadcast for owner only ---
bot.hears(/^\.broadcast (.+)/, async ctx => {
  try {
    if (String(ctx.from.id) !== process.env.OWNER_ID) return;
    const msg = ctx.match[1];
    for (const id of global.users) {
      try {
        await bot.telegram.sendPhoto(
          id,
          { url: config.banner },
          {
            caption: `📢 Broadcast:\n${msg}`,
            ...Markup.inlineKeyboard(config.buttons)
          }
        );
      } catch (e) {
        console.error(`Broadcast to user ${id} failed:`, e);
      }
    }
    for (const gid of global.groups) {
      try {
        await bot.telegram.sendPhoto(
          gid,
          { url: config.banner },
          {
            caption: `📢 Broadcast:\n${msg}`,
            ...Markup.inlineKeyboard(config.buttons)
          }
        );
      } catch (e) {
        console.error(`Broadcast to group ${gid} failed:`, e);
      }
    }
    await ctx.reply('✅ Broadcast sent!');
  } catch (e) {
    console.error('broadcast error:', e);
    ctx.reply('❌ Could not send broadcast.');
  }
});

// --- Group/channel support ---
bot.on('new_chat_members', ctx => { try { sendMenu(ctx); } catch (e) {} });
bot.on('group_chat_created', ctx => { try { sendMenu(ctx); } catch (e) {} });
bot.on('channel_post', ctx => { try { sendMenu(ctx); } catch (e) {} });

// --- Render/Vercel/Panel Keepalive (HTTP) ---
const http = require('http');
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('CYBIX V3 Telegram Bot is running!\n');
}).listen(PORT, () => {
  console.log(`HTTP health-check server listening on port ${PORT}`);
  bot.launch().then(() => console.log("CYBIX V3 Telegram Bot started!"));
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));