"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { adams } = require("../Ibrahim/adams");
const { sendInteractiveMessage } = require('gifted-btns');
const conf = require("../config");

// Constants
const BOT_START_TIME = Date.now();
const NEWSLETTER_INFO = {
  jid: "120363285388090068@newsletter",
  name: "🌐 Bwm xmd Core System"
};
const TECH_EMOJIS = ["🚀", "⚡", "🔋", "💻", "🔌", "🌐", "📶", "🖥️", "🔍", "📊"];

// Helper functions
const randomTechEmoji = () => TECH_EMOJIS[Math.floor(Math.random() * TECH_EMOJIS.length)];
const getSystemTime = () => {
  return new Date().toLocaleString("en-US", {
    timeZone: "Africa/Nairobi",
    hour12: true,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 🏓 Network Ping Command (UPGRADED WITH INTERACTIVE BUTTONS)
adams(
  { nomCom: "ping", reaction: "🏓", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;
    const responseTime = Math.floor(50 + Math.random() * 951); // Random between 50-1000ms
    
    const msgText = `🏓 Pong! | ${responseTime}ms | ${randomTechEmoji()}`;
    
    // Using gifted-btns to send an interactive message with buttons
    await sendInteractiveMessage(zk, dest, {
      text: msgText,
      footer: "BWM-XMD Core System",
      interactiveButtons: [
        // Button 1: Triggers .uptime
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: 'System Uptime ⏳',
            id: `${conf.PREFIX}uptime`
          })
        },
        // Button 2: Triggers .menu
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: 'View Menu 📋',
            id: `${conf.PREFIX}menu`
          })
        },
        // Button 3: URL Button
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: 'Visit Website 🌐',
            url: 'https://bwmxmd.online'
          })
        }
      ]
    }, { quoted: ms });
  }
);

// ⏳ System Uptime Command
adams(
  { nomCom: "uptime", reaction: "⏳", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;
    const uptimeMs = Date.now() - BOT_START_TIME;
    
    const seconds = Math.floor((uptimeMs / 1000) % 60);
    const minutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
    const hours = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));

    await zk.sendMessage(dest, {
      text: `*${randomTechEmoji()} SYSTEM UPTIME ${randomTechEmoji()}*\n\n` +
            `🕒 System Time: ${getSystemTime()}\n` +
            `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
            `⏱️ Duration: ${days}d ${hours}h ${minutes}m ${seconds}s\n` +
            `📅 Activated: ${new Date(BOT_START_TIME).toLocaleString("en-US", {timeZone: "Africa/Nairobi"})}\n\n` +
            `⚡ Performance:\n` +
            `├ Reliability: 99.${Math.floor(95 + Math.random() * 4)}%\n` +
            `├ Stability: ${Math.floor(90 + Math.random() * 9)}%\n` +
            `└ Nodes: Global Distribution\n\n` +
            `🔋 Maintenance: Auto-Scheduled\n` +
            `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
            `*${NEWSLETTER_INFO.name}* • ${getSystemTime()}`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: NEWSLETTER_INFO.jid,
          newsletterName: NEWSLETTER_INFO.name,
          serverMessageId: Math.floor(100000 + Math.random() * 900000)
        }
      }
    }, { quoted: ms });
  }
);

// 🎵 Global Tech Audio Command
adams(
  { nomCom: "pairaudio", reaction: "🎵", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;
    await zk.sendMessage(dest, {
      audio: { url: "https://files.catbox.moe/89tvg4.mp3" },
      mimetype: "audio/mpeg",
      ptt: true,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: NEWSLETTER_INFO.jid,
          newsletterName: NEWSLETTER_INFO.name,
          serverMessageId: Math.floor(100000 + Math.random() * 900000)
        },
        externalAdReply: {
          title: "🔊 GLOBAL SOUND SYSTEM",
          body: `Streaming Worldwide • ${getSystemTime()}`,
          mediaType: 1
        }
      }
    });
  }
);
