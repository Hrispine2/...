const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// Utility to convert stream to buffer
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

// Helper to extract view-once media from msgRepondu
async function extractViewOnceMedia(msgRepondu) {
    if (!msgRepondu) return null;

    // Check if the quoted message contains a view-once wrapper
    let viewOnceWrapper = msgRepondu.viewOnceMessageV2?.message || 
                          msgRepondu.viewOnceMessage?.message || 
                          msgRepondu.viewOnceMessageV2Extension?.message ||
                          null;

    if (!viewOnceWrapper) return null;

    const type = Object.keys(viewOnceWrapper)[0]; // imageMessage, videoMessage, audioMessage
    const mediaMessage = viewOnceWrapper[type];
    const mediaType = type.replace('Message', ''); // image, video, audio

    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
    const buffer = await streamToBuffer(stream);

    return {
        buffer,
        type: mediaType,
        caption: mediaMessage.caption || '',
        mimetype: mediaMessage.mimetype
    };
}

// ==========================================
// 1. VIEW-ONCE BYPASSERS
// ==========================================

adams({ nomCom: "vv", aliases: ["viewonce", "vv3"], categorie: "Tools", reaction: "🔓" }, async (dest, zk, commandeOptions) => {
    const { repondre, ms, msgRepondu } = commandeOptions;

    if (!msgRepondu) return repondre(`⚠️ Please reply to a *view-once* image, video, or audio.`);

    try {
        await zk.sendMessage(dest, { react: { text: "🔓", key: ms.key } });

        const media = await extractViewOnceMedia(msgRepondu);
        if (!media) return repondre("❌ That's not a valid view-once message.");

        const caption = `${media.caption}\n> *🔓 Opened by ʙᴡᴍ-xᴍᴅ©*`;

        if (media.type === 'image') {
            await zk.sendMessage(dest, { image: media.buffer, caption }, { quoted: ms });
        } else if (media.type === 'video') {
            await zk.sendMessage(dest, { video: media.buffer, caption }, { quoted: ms });
        } else if (media.type === 'audio') {
            await zk.sendMessage(dest, { audio: media.buffer, mimetype: 'audio/mp4', ptt: true }, { quoted: ms });
        }

    } catch (error) {
        console.error("VV Error:", error);
        repondre("❌ Failed to process view-once media.");
    }
});

adams({ nomCom: "vvdm", categorie: "Tools", reaction: "📩" }, async (dest, zk, commandeOptions) => {
    const { repondre, ms, msgRepondu } = commandeOptions;

    if (!msgRepondu) return repondre(`⚠️ Please reply to a *view-once* image, video, or audio.`);

    try {
        await zk.sendMessage(dest, { react: { text: "📩", key: ms.key } });

        const media = await extractViewOnceMedia(msgRepondu);
        if (!media) return repondre("❌ That's not a valid view-once message.");

        // Send to Bot's own number (or owner's number)
        const ownerNumber = zk.user.id.split(':')[0] + '@s.whatsapp.net';
        const caption = `*📩 VVDM: View-Once from ${ms.pushName}*\n${media.caption}\n> *🔓 Opened by ʙᴡᴍ-xᴍᴅ©*`;

        if (media.type === 'image') {
            await zk.sendMessage(ownerNumber, { image: media.buffer, caption });
        } else if (media.type === 'video') {
            await zk.sendMessage(ownerNumber, { video: media.buffer, caption });
        } else if (media.type === 'audio') {
            await zk.sendMessage(ownerNumber, { audio: media.buffer, mimetype: 'audio/mp4', ptt: false });
        }

        await zk.sendMessage(dest, { react: { text: "✅", key: ms.key } });

    } catch (error) {
        console.error("VVDM Error:", error);
        repondre("❌ Failed to forward view-once media to DM.");
    }
});

// ==========================================
// 2. TEMPORARY EMAIL GENERATOR
// ==========================================

adams({ nomCom: "tempmail", aliases: ["tempemail"], categorie: "Tools", reaction: "📧" }, async (dest, zk, commandeOptions) => {
    const { repondre } = commandeOptions;

    try {
        const { data } = await axios.get('https://eliteprotech-apis.zone.id/tempemail');

        if (!data?.success || !data.email) return repondre('❌ Failed to generate temporary email.');

        repondre(`📩 *TEMP EMAIL CREATED*\n\n📧 *Email:*\n${data.email}\n\n📥 *Check inbox using:*\n.tempinbox ${data.email}\n\n⚠️ _This email is temporary._`);

    } catch (err) {
        repondre('❌ Error generating temp email.');
    }
});

adams({ nomCom: "tempinbox", categorie: "Tools", reaction: "📨" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg } = commandeOptions;
    const text = arg.join(' ');

    if (!text) return repondre(`⚠️ Provide the email address\n\n*Example:*\n.tempinbox test@gmail.com`);

    try {
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/tempemail?email=${encodeURIComponent(text)}`);

        if (!data?.success) return repondre('❌ Failed to fetch inbox.');
        if (!data.inbox) return repondre('📭 Inbox is empty.');

        const inbox = data.inbox;
        const message = inbox.html ? inbox.html.replace(/<[^>]*>/g, '').trim() : 'No message content';

        repondre(`📥 *TEMP EMAIL INBOX*\n\n📧 *Email:*\n${data.email}\n\n👤 *From:* ${inbox.from}\n📝 *Subject:* ${inbox.subject}\n⏰ *Time:* ${inbox.time}\n\n📨 *Message:*\n${message}`);

    } catch (err) {
        repondre('❌ Error fetching inbox.');
    }
});

// ==========================================
// 3. UTILITY TOOLS (Web Screenshot, IDs, Fetch)
// ==========================================

adams({ nomCom: "ssweb", aliases: ["screenshot"], categorie: "Tools", reaction: "🖼️" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');

    if (!text) return repondre(`📸 Please provide a link!\n*Example:* .ssweb https://example.com`);

    try {
        await zk.sendMessage(dest, { react: { text: `🖼️`, key: ms.key } });
        const apiUrl = `https://apis.prexzyvilla.site/ssweb/webss?url=${encodeURIComponent(text)}`;

        await zk.sendMessage(dest, {
            image: { url: apiUrl },
            caption: `*Screenshot of:* ${text}\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴡᴍ-xᴍᴅ©*`
        }, { quoted: ms });

    } catch (error) {
        repondre(`❌ Failed to capture the screenshot.\nPlease try again later.`);
    }
});

adams({ nomCom: "channel-id", aliases: ["channelid"], categorie: "Tools", reaction: "📢" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');

    if (!text || !text.includes('whatsapp.com/channel/')) return repondre('❌ Please provide a valid WhatsApp channel link.');

    const channelCode = text.split('whatsapp.com/channel/')[1].trim();

    try {
        const res = await zk.newsletterMetadata('invite', channelCode);
        repondre(`📢 *Whatsapp Channel Info:*\n\n📌 *Name:* ${res.name}\n🆔 *Channel ID:* \n${res.id}`);
    } catch (err) {
        repondre('❌ Failed to resolve channel ID.');
    }
});

adams({ nomCom: "groupid", aliases: ["groupjid"], categorie: "Tools", reaction: "👥" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');

    if (!text || !text.includes('chat.whatsapp.com/')) return repondre('❌ Please provide a valid WhatsApp Group invite link.');

    const inviteCode = text.split('chat.whatsapp.com/')[1].trim();

    try {
        const res = await zk.groupGetInviteInfo(inviteCode);
        repondre(`👥 *Whatsapp Group Info:*\n\n📝 *Group Name:* ${res.subject}\n🆔 *Group ID:* \n${res.id}`);
    } catch (err) {
        repondre('❌ Failed to resolve group ID. Make sure the link is valid and not revoked.');
    }
});

adams({ nomCom: "get", categorie: "Tools", reaction: "🌐" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');

    if (!text) return repondre(`*Example:* .get https://api.github.com/users/Bwmxmd254`);

    try {
        const res = await axios.get(text, { responseType: 'arraybuffer' });
        const contentType = (res.headers['content-type'] || '').toLowerCase();
        const rawData = Buffer.from(res.data);

        // Detect JSON
        let parsedJson = null;
        try {
            const preview = rawData.slice(0, 200).toString();
            if (preview.trim().startsWith('{') || preview.trim().startsWith('[')) {
                parsedJson = JSON.parse(rawData.toString());
            }
        } catch { }

        if (contentType.includes('application/json') || parsedJson) {
            await zk.sendMessage(dest, { text: JSON.stringify(parsedJson, null, 2) }, { quoted: ms });
        } else if (contentType.startsWith('image/')) {
            await zk.sendMessage(dest, { image: rawData, caption: `📷 *Image from URL*` }, { quoted: ms });
        } else if (contentType.startsWith('video/')) {
            await zk.sendMessage(dest, { video: rawData, caption: `🎥 *Video from URL*` }, { quoted: ms });
        } else if (contentType.startsWith('audio/')) {
            await zk.sendMessage(dest, { audio: rawData, mimetype: contentType }, { quoted: ms });
        } else {
            await zk.sendMessage(dest, { document: rawData, mimetype: contentType || 'application/octet-stream', fileName: 'response.bin' }, { quoted: ms });
        }
    } catch (err) {
        repondre(`❌ *API Request Failed:* ${err.message}`);
    }
});

// ==========================================
// 4. CLOUD NOTEPAD SYSTEM
// ==========================================

adams({ nomCom: "note", categorie: "Tools", reaction: "📝" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, msgRepondu, auteurMessage } = commandeOptions;
    const text = arg.join(' ');

    if (!msgRepondu) return repondre("❌ Reply to a message to save it as a note!");
    
    // Safely extract text from quoted message
    const repliedText = msgRepondu.conversation || msgRepondu.extendedTextMessage?.text || msgRepondu.imageMessage?.caption || "";
    if (!repliedText) return repondre("❌ No text found in the replied message!");

    const title = text.trim() ? text.trim() : `Note_${Math.floor(Math.random() * 1000)}`;
    
    try {
        const { data } = await axios.post("https://notepad-cyan.vercel.app/", {
            userId: auteurMessage, // Uses user's unique JID
            action: "save",
            title,
            text: repliedText
        });
        repondre(data.message || "✅ Note saved successfully!");
    } catch (err) {
        repondre("❌ Failed to save note.");
    }
});

adams({ nomCom: "listnote", aliases: ["notes"], categorie: "Tools", reaction: "📚" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, auteurMessage } = commandeOptions;
    const text = arg.join(' ');

    try {
        if (!text) {
            const { data } = await axios.post("https://notepad-cyan.vercel.app/", {
                userId: auteurMessage,
                action: "get"
            });
            if (!data.all_notes || Object.keys(data.all_notes).length === 0) return repondre("📭 You have no saved notes.");
            
            const msg = `🗒️ *Your Saved Notes:*\n\n${Object.entries(data.all_notes)
                .map(([t, v]) => `• *${t}*: ${v.text.substring(0, 30)}...`)
                .join("\n\n")}\n\n_Use .listnote [title] to read a specific note._`;
            repondre(msg);
        } else {
            const { data } = await axios.post("https://notepad-cyan.vercel.app/", {
                userId: auteurMessage,
                action: "get",
                title: text
            });
            if (data.error) return repondre(`❌ ${data.error}`);
            repondre(`📘 *${data.title}:*\n\n${data.text}`);
        }
    } catch (err) {
        repondre("❌ Failed to fetch notes.");
    }
});

adams({ nomCom: "deletenote", aliases: ["delnote"], categorie: "Tools", reaction: "🗑️" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, auteurMessage } = commandeOptions;
    const text = arg.join(' ');

    if (!text) return repondre("❌ Provide the note title to delete. (Use .listnote to see titles)");
    
    try {
        const apiUrl = "https://notepad-cyan.vercel.app/";
        const { data } = await axios.post(apiUrl, { userId: auteurMessage, action: "get" });
        
        const notes = data.all_notes || {};
        if (!notes[text]) return repondre(`❌ No note found with title '${text}'`);
        
        delete notes[text];
        await axios.post(apiUrl, { userId: auteurMessage, action: "update", data: notes });
        
        repondre(`✅ Note '${text}' deleted successfully.`);
    } catch (err) {
        repondre("❌ Failed to delete note.");
    }
});
