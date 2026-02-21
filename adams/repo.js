const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const { generateWAMessageFromContent, generateWAMessageContent } = require('@whiskeysockets/baileys');
const s = require(__dirname + "/../config");

const { BOT: BOT_NAME = 'BWM XMD', BOT_URL: MEDIA_URLS = [] } = s;

const randomMedia = () => {
    if (MEDIA_URLS.length === 0) return 'https://files.catbox.moe/sd49da.jpg';
    const url = MEDIA_URLS[Math.floor(Math.random() * MEDIA_URLS.length)].trim();
    return url.startsWith('http') ? url : 'https://files.catbox.moe/sd49da.jpg';
};

adams({ 
    nomCom: "repo", 
    aliases: ["sc", "script", "github", "git"], 
    categorie: "General", 
    reaction: "☑️" 
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;
    await zk.sendMessage(dest, { react: { text: "☑️", key: ms.key } });

    let repo;
    try {
        const response = await axios.get(`https://api.github.com/repos/Bwmxmd254/BWM-XMD-GO`);
        repo = response.data;
    } catch (apiError) {
        repo = {
            description: "Next-Gen WhatsApp Automation Bot",
            name: "BWM-XMD-GO",
            owner: { login: "Bwmxmd254" },
            stargazers_count: 500,
            forks_count: 250,
            html_url: "https://github.com/Bwmxmd254/BWM-XMD-GO"
        };
    }

    try {
        const channelLink = "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y";
        const selectedMedia = randomMedia();
        
        // 1. Download the image buffer to embed into the Carousel Headers
        let imageBuffer;
        try {
            imageBuffer = (await axios.get(selectedMedia, { responseType: 'arraybuffer' })).data;
        } catch (e) {
            imageBuffer = (await axios.get('https://files.catbox.moe/sd49da.jpg', { responseType: 'arraybuffer' })).data;
        }

        // 2. Format the image to be attached to the cards
        const imageMsg = await generateWAMessageContent({ image: imageBuffer }, { upload: zk.waUploadToServer });

        // 3. Build the Carousel Cards (All info moved inside the cards!)
        const cards = [
            {
                header: { 
                    title: ``, // Left blank so the image stands out
                    hasMediaAttachment: true, 
                    imageMessage: imageMsg.imageMessage 
                },
                body: { 
                    text: `*📂 ${repo.name}*\n\n*Description:*\n${repo.description || "Premium WhatsApp Bot Solution"}\n\n👤 *Owner:* ${repo.owner.login}\n🌟 *Stars:* ${repo.stargazers_count * 2}\n🍴 *Forks:* ${repo.forks_count * 2}` 
                },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({ display_text: "🌐 Open GitHub", url: repo.html_url })
                        },
                        {
                            name: "cta_copy",
                            buttonParamsJson: JSON.stringify({ display_text: "📋 Copy Link", copy_code: repo.html_url })
                        }
                    ]
                }
            },
            {
                header: { 
                    title: ``, 
                    hasMediaAttachment: true, 
                    imageMessage: imageMsg.imageMessage 
                },
                body: { 
                    text: `*📢 Official WhatsApp Channel*\n\nStay updated with the latest features, bug fixes, and announcements by joining our official channel!` 
                },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({ display_text: "📢 Open Channel", url: channelLink })
                        },
                        {
                            name: "cta_copy",
                            buttonParamsJson: JSON.stringify({ display_text: "📋 Copy Link", copy_code: channelLink })
                        }
                    ]
                }
            }
        ];

        // 4. Wrap everything into a seamless ViewOnce Interactive Message
        const message = generateWAMessageFromContent(dest, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: {
                        body: { text: `*${BOT_NAME.toUpperCase()} REPOSITORY* 🎠\n> _Swipe horizontally to view links_` },
                        carouselMessage: { cards: cards }
                    }
                }
            }
        }, { quoted: ms });

        // 5. Send the payload!
        await zk.relayMessage(dest, message.message, { messageId: message.key.id });

    } catch (error) {
        console.error("Carousel Error:", error);
        await repondre(`⚠️ *Failed to send Interactive Carousel.*\n\n*Error:* ${error.message}`);
    }
});
