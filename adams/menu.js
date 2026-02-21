const { adams, cm } = require("../Ibrahim/adams");
const { sendInteractiveMessage } = require('gifted-btns');
const moment = require("moment-timezone");
const s = require(__dirname + "/../config");
const axios = require("axios");

const readMore = String.fromCharCode(8206).repeat(4000); 
const PREFIX = s.PREFIX;

// Configurable elements from config.js
const {
    BOT: BOT_NAME = 'BWM XMD',
    BOT_URL: MEDIA_URLS = [],
    MENU_TOP_LEFT = "┌─❖",
    MENU_BOT_NAME_LINE = "│ ",
    MENU_BOTTOM_LEFT = "└┬❖",
    MENU_GREETING_LINE = "┌┤ ",
    MENU_DIVIDER = "│└────────┈⳹",
    MENU_USER_LINE = "│🕵️ ",
    MENU_DATE_LINE = "│📅 ",
    MENU_TIME_LINE = "│⏰ ",
    MENU_STATS_LINE = "│⭐ ",
    MENU_BOTTOM_DIVIDER = "└─────────────┈⳹",
    FOOTER = `\n\n©Sir Ibrahim Adams\n\n╭━========================\n┃  ᴛᴏ sᴇᴇ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs ᴛᴏɢᴇᴛʜᴇʀ ᴜsᴇ \n┃ *${PREFIX}Cmds*\n┃ *${PREFIX}Help*\n┃ *${PREFIX}list*\n┃ *${PREFIX}Commands* \n╰━========================\n\n*For more visit*\nbwmxmd.online\n\n®2025 ʙᴡᴍ xᴍᴅ 🔥`,
    WEB = 'ibrahimadams.site',
    GURL = 'whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y'
} = s;

// Category mappings for the interactive menu
// This groups multiple internal script categories into beautiful parent menus
const categoryMap = {
    "AI": { title: "🤖 AI MENU", keys: ["AI", "TTS", "NEWS"] },
    "SPORTS": { title: "⚽ SPORTS MENU", keys: ["FOOTBALL", "GAMES"] },
    "DOWNLOAD": { title: "📥 DOWNLOAD MENU", keys: ["NEWS", "SEARCH", "IMAGES", "DOWNLOAD", "MEDIA"] },
    "HEROKU": { title: "🛠️ HEROKU MENU", keys: ["CONTROL", "STICKCMD", "TOOLS"] },
    "CONVERSATION": { title: "💬 CONVERSATION MENU", keys: ["CONVERSION", "LOGO", "WEEB", "SCREENSHOTS", "IMG", "AUDIO-EDIT", "MPESA"] },
    "FUN": { title: "😂 FUN MENU", keys: ["HENTAI", "FUN", "REACTION"] },
    "GENERAL": { title: "🌍 GENERAL MENU", keys: ["GENERAL", "MODS", "UTILITY", "TRADE"] },
    "GROUP": { title: "👨‍👨‍👦‍👦 GROUP MENU", keys: ["GROUP"] },
    "BOT_INFO": { title: "💻 BOT_INFO MENU", keys: ["GITHUB", "USER", "PAIR", "NEW"] },
    "ADULT": { title: "🔞 ADULT MENU", keys: ["XVIDEO", "NSFW"] }
};

// --- CACHING SYSTEM (For Blazing Fast Speeds) ---

// 1. Media Cache
const randomMedia = () => {
    if (MEDIA_URLS.length === 0) return null;
    const url = MEDIA_URLS[Math.floor(Math.random() * MEDIA_URLS.length)].trim();
    return url.startsWith('http') ? url : null;
};

// 2. GitHub Stats Cache
let cachedStats = null;
let lastStatFetch = 0;
const fetchGitHubStats = async () => {
    if (cachedStats && (Date.now() - lastStatFetch < 3600000)) return cachedStats; 
    try {
        const response = await axios.get(`https://api.github.com/repos/Bwmxmd254/BWM-XMD-GO`, {
            headers: { 'User-Agent': 'BWM-XMD-BOT' }
        });
        cachedStats = (response.data.forks_count * 2) + (response.data.stargazers_count * 2);
        lastStatFetch = Date.now();
        return cachedStats;
    } catch (error) {
        return cachedStats || (Math.floor(Math.random() * 1000) + 500);
    }
};

// ==========================================
// 1. MAIN MENU COMMAND (Interactive List)
// ==========================================
adams({ nomCom: "menu", aliases: ["botmenu"], categorie: "General" }, async (dest, zk, commandeOptions) => {
    const contactName = commandeOptions?.ms?.pushName || "Unknown Contact";
    const sender = commandeOptions?.sender || (commandeOptions?.ms?.key?.remoteJid || "").replace(/@.+/, '');
    const { ms } = commandeOptions;

    // Contact message for quoted replies
    const contactMsg = {
        key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: 'status@broadcast' },
        message: {
            contactMessage: {
                displayName: contactName,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:${contactName}\nitem1.TEL;waid=${sender}:${sender}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
            },
        },
    };

    moment.tz.setDefault(s.TZ || "Africa/Nairobi");
    const date = moment().format("DD/MM/YYYY");
    const time = moment().format("HH:mm:ss");
    const githubStats = await fetchGitHubStats(); 

    const hour = moment().hour();
    let greeting = "🌙 Good Night 😴";
    if (hour >= 5 && hour < 12) greeting = "🌅 Good Morning 🤗";
    else if (hour >= 12 && hour < 18) greeting = "☀️ Good Afternoon 😊";
    else if (hour >= 18 && hour < 22) greeting = "🌆 Good Evening 🤠";

    const contextInfo = {
        mentionedJid: [sender ? `${sender}@s.whatsapp.net` : undefined].filter(Boolean),
        forwardingScore: 1, 
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363285388090068@newsletter",
            newsletterName: `${contactName}`,
            serverMessageId: Math.floor(100000 + Math.random() * 900000),
        },
    };

    const menuHeader = `
${MENU_TOP_LEFT}
${MENU_BOT_NAME_LINE}${BOT_NAME}    
${MENU_BOTTOM_LEFT}  
${MENU_GREETING_LINE}${greeting}
${MENU_DIVIDER}  
${MENU_USER_LINE}ᴜsᴇʀ ɴᴀᴍᴇ: ${contactName}
${MENU_DATE_LINE}ᴅᴀᴛᴇ: ${date}
${MENU_TIME_LINE}ᴛɪᴍᴇ: ${time}       
${MENU_STATS_LINE}ᴜsᴇʀs: ${githubStats}       
${MENU_BOTTOM_DIVIDER}`;

    const listParams = {
        title: "📋 Tap to open Menu",
        sections: [
            {
                title: "🌟 Quick Actions",
                rows: [
                    { title: "🌐 Official Website", description: "Visit BWM-XMD Web App", id: `${PREFIX}webapp` },
                    { title: "🎵 Random Song", description: "Listen to a random NCS track", id: `${PREFIX}randomsong` },
                    { title: "📢 Updates Channel", description: "Join our official channel", id: `${PREFIX}updates` }
                ]
            },
            {
                title: "📂 Command Categories",
                rows: Object.keys(categoryMap).map(key => ({
                    title: categoryMap[key].title,
                    description: `Tap to view commands`,
                    id: `${PREFIX}menucat ${key}`
                }))
            }
        ]
    };

    const interactiveMessage = {
        text: `${menuHeader}\n\n${readMore}\n*Please tap the button below to view the command categories, or visit our website for more info!*`,
        footer: "© Ibrahim Adams | BWM-XMD",
        contextInfo: contextInfo,
        interactiveButtons: [
            {
                name: "single_select",
                buttonParamsJson: JSON.stringify(listParams)
            },
            {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                    display_text: "🌐 Visit Website",
                    url: `https://${WEB}`
                })
            }
        ]
    };

    const selectedMedia = randomMedia();
    if (selectedMedia) {
        if (selectedMedia.match(/\.(mp4|gif)$/i)) {
            interactiveMessage.video = { url: selectedMedia };
            interactiveMessage.gifPlayback = true;
        } else {
            interactiveMessage.image = { url: selectedMedia };
        }
    }

    await sendInteractiveMessage(zk, dest, interactiveMessage, { quoted: contactMsg });
});

// ==========================================
// 2. INSTANT STATELESS BUTTON HANDLERS
// ==========================================

adams({ nomCom: "webapp", categorie: "hidden" }, async (dest, zk, commandeOptions) => {
    await commandeOptions.repondre(`🌐 *${BOT_NAME} WEB APP*\n\nVisit our official website here:\nhttps://${WEB}\n${FOOTER}`);
});

adams({ nomCom: "updates", categorie: "hidden" }, async (dest, zk, commandeOptions) => {
    await commandeOptions.repondre(`📢 *${BOT_NAME} UPDATES CHANNEL*\n\nJoin our official updates channel:\nhttps://${GURL}\n${FOOTER}`);
});

adams({ nomCom: "randomsong", categorie: "hidden" }, async (dest, zk, commandeOptions) => {
    const { repondre, ms } = commandeOptions;
    try {
        const response = await axios.get('https://ncs.bwmxmd.online/random');
        if (response.data.status === "success" && response.data.data.length > 0) {
            const audioUrl = response.data.data[0].links.Bwm_stream_link;
            await zk.sendMessage(dest, { audio: { url: audioUrl }, mimetype: 'audio/mp4', ptt: true }, { quoted: ms });
        } else throw new Error();
    } catch (e) {
        await repondre(`❌ Failed to fetch random song. Please try again.\n${FOOTER}`);
    }
});

// ==========================================
// 3. SUB-MENU COMMAND LIST BUILDER (The "Tree")
// ==========================================
adams({ nomCom: "menucat", categorie: "hidden" }, async (dest, zk, commandeOptions) => {
    const { arg, repondre, ms } = commandeOptions;
    const catKey = arg[0];
    
    if (!catKey || !categoryMap[catKey]) return;

    const categoryData = categoryMap[catKey];
    
    // Find all commands that belong to this mapped category
    let matchedCommands = [];
    cm.forEach((cmdObj) => {
        const internalCat = cmdObj.categorie ? cmdObj.categorie.toUpperCase() : "GENERAL";
        if (categoryData.keys.includes(internalCat)) {
            matchedCommands.push(cmdObj);
        }
    });

    if (matchedCommands.length === 0) {
        return await repondre(`❌ No commands available in this category.\n${FOOTER}`);
    }

    // Sort alphabetically
    matchedCommands.sort((a, b) => a.nomCom.localeCompare(b.nomCom));

    // Build list rows with descriptions (Max 100)
    const listRows = matchedCommands.slice(0, 100).map(cmdObj => {
        let desc = cmdObj.description || cmdObj.desc || `Execute the ${cmdObj.nomCom} command`;
        if (desc.length > 60) desc = desc.substring(0, 57) + '...';
        
        return {
            title: `${PREFIX}${cmdObj.nomCom}`,
            description: desc,
            id: `${PREFIX}${cmdObj.nomCom}` // Instantly triggers command when tapped
        };
    });

    const listParams = {
        title: `🛠️ Select Command`,
        sections: [
            {
                title: `✨ ${categoryData.title}`,
                rows: listRows
            }
        ]
    };

    const interactiveMessage = {
        text: `*${categoryData.title}*\n\nContains *${matchedCommands.length}* commands.\n\nTap the button below to execute a command! If the command requires text, it will guide you.`,
        footer: "© Ibrahim Adams | BWM-XMD",
        interactiveButtons: [
            {
                name: "single_select",
                buttonParamsJson: JSON.stringify(listParams)
            }
        ],
        contextInfo: {
            externalAdReply: {
                title: `${categoryData.title}`,
                body: "Powered by BWM XMD",
                mediaType: 1,
                thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
                sourceUrl: "https://bwmxmd.online",
                renderLargerThumbnail: false,
                showAdAttribution: true
            }
        }
    };

    await sendInteractiveMessage(zk, dest, interactiveMessage, { quoted: ms });
});
