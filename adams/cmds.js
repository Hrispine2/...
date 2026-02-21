const { adams, cm } = require("../Ibrahim/adams");
const { sendInteractiveMessage } = require('gifted-btns');
const moment = require("moment-timezone");
const s = require(__dirname + "/../config");

const PREFIX = s.PREFIX;
const readMore = String.fromCharCode(8206).repeat(4001);

// Caching System for Blazing Fast Speeds
let categoryCache = null;

function buildCommandCache() {
    if (categoryCache) return categoryCache;

    const categories = {};
    
    // Group commands by category dynamically
    cm.forEach(cmd => {
        const cat = cmd.categorie ? cmd.categorie.toUpperCase() : "GENERAL";
        if (!categories[cat]) categories[cat] = [];
        
        // Add command to category if not already there
        if (!categories[cat].includes(cmd.nomCom)) {
            categories[cat].push(cmd.nomCom);
        }
    });

    // Sort commands alphabetically within their categories
    for (let cat in categories) {
        categories[cat].sort();
    }

    categoryCache = categories;
    return categoryCache;
}

// ==========================================
// 1. MAIN COMMANDS MENU (Category List)
// ==========================================
const commandTriggers = ["cmds", "cmd", "commands", "list"];

commandTriggers.forEach(trigger => {
    adams({ 
        nomCom: trigger, 
        categorie: "General",
        reaction: "📜"
    }, async (dest, zk, commandeOptions) => {
        const { ms } = commandeOptions;
        const userName = commandeOptions?.ms?.pushName || "User";
        
        // Ensure cache is built
        const categories = buildCommandCache();
        const totalCategories = Object.keys(categories).length;
        const totalCommands = cm.length;

        // Format time and date
        moment.tz.setDefault(s.TZ || "Africa/Nairobi");
        const time = moment().format("h:mm A");
        const date = moment().format("DD/MM/YYYY");

        // Build the beautiful header
        const messageHeader = `
┌─❖ 𓆩 ⚡ 𓆪 ❖─┐
       𝐁𝐖𝐌 𝐗𝐌𝐃    
└─❖ 𓆩 ⚡ 𓆪 ❖─┘  

👤 ᴜsᴇʀ ɴᴀᴍᴇ: ${userName}
📅 ᴅᴀᴛᴇ: ${date}
⏰ ᴛɪᴍᴇ: ${time}
📊 ᴄᴀᴛᴇɢᴏʀɪᴇs: ${totalCategories}
📜 ᴄᴏᴍᴍᴀɴᴅs: ${totalCommands}

┌─❖
│ 
└┬❖  
┌┤✑  𝗧𝗵𝗮𝗻𝗸𝘀 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 𝗕𝗪𝗠 𝗫𝗠𝗗
│└────────────┈ ⳹        
│ > © sɪʀ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs
└─────────────────┈ ⳹

${readMore}
*Tap the button below to view and select a category!*`;

        // Build the Interactive List Rows dynamically
        const listRows = Object.keys(categories).sort().map(cat => ({
            title: `📂 ${cat}`,
            description: `View ${categories[cat].length} commands in this category`,
            id: `${PREFIX}cmdcat ${cat}` // Hidden command triggered when tapped
        }));

        const listParams = {
            title: "📜 Command Categories",
            sections: [
                {
                    title: "📊 SELECT A CATEGORY",
                    rows: listRows
                }
            ]
        };

        const interactiveMessage = {
            text: messageHeader,
            footer: "© Ibrahim Adams | BWM-XMD",
            interactiveButtons: [
                {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify(listParams)
                },
                {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🌐 Visit Website",
                        url: "https://bwmxmd.online"
                    })
                }
            ],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                mentionedJid: [commandeOptions.auteurMessage],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363285388090068@newsletter",
                    newsletterName: "BWM-XMD COMMANDS",
                    serverMessageId: Math.floor(100000 + Math.random() * 900000)
                }
            }
        };

        await sendInteractiveMessage(zk, dest, interactiveMessage, { quoted: ms });
    });
});

// ==========================================
// 2. SUB-SELECTION HANDLER (Command List with Descriptions)
// ==========================================
adams({ nomCom: "cmdcat", categorie: "hidden" }, async (dest, zk, commandeOptions) => {
    const { arg, repondre, ms } = commandeOptions;
    const catKey = arg.join(' ').toUpperCase();
    
    const categories = buildCommandCache();

    if (!catKey || !categories[catKey]) {
        return repondre(`❌ Category not found.`);
    }

    const commandsInCategory = categories[catKey];

    // Build the sub-selection list with Descriptions!
    const listRows = commandsInCategory.slice(0, 100).map(cmdName => {
        // Find the command object in the main registry to get its description
        const cmdObj = cm.find(c => c.nomCom === cmdName);
        
        // Grab the desc/description if it exists, otherwise default text
        let desc = cmdObj?.description || cmdObj?.desc || `Execute the ${cmdName} command`;
        
        // WhatsApp list descriptions have a character limit. We truncate to 60 chars to be safe.
        if (desc.length > 60) {
            desc = desc.substring(0, 57) + '...';
        }

        return {
            title: `${PREFIX}${cmdName}`,
            description: desc,
            id: `${PREFIX}${cmdName}` 
        };
    });

    const listParams = {
        title: `🛠️ Select Command`,
        sections: [
            {
                title: `✨ ${catKey} COMMANDS`,
                rows: listRows
            }
        ]
    };

    const interactiveMessage = {
        text: `*📂 CATEGORY: ${catKey}*\n\nContains *${commandsInCategory.length}* commands.\n\nTap the button below to execute a command! If the command requires text, it will guide you.`,
        footer: "© Ibrahim Adams | BWM-XMD",
        interactiveButtons: [
            {
                name: "single_select",
                buttonParamsJson: JSON.stringify(listParams)
            }
        ],
        contextInfo: {
            externalAdReply: {
                title: `${catKey} COMMANDS`,
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
