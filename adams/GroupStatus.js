const { adams } = require("../Ibrahim/adams");
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

adams({
    nomCom: "groupstatus",
    aliases: ["gstatus"],
    categorie: "Group",
    reaction: "📢",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { repondre, ms, arg, msgRepondu, verifGroupe, verifAdmin, superUser } = commandeOptions;

    // 1. Basic Checks
    if (!verifGroupe) {
        return repondre('❌ This command is for groups only.');
    }
    if (!verifAdmin && !superUser) {
        return repondre('❌ You need admin privileges to send a group status.');
    }

    const text = arg.join(' ') || '';

    try {
        // 2. If the user DID NOT reply to media (Text Status)
        if (!msgRepondu || (!msgRepondu.imageMessage && !msgRepondu.videoMessage && !msgRepondu.audioMessage)) {
            if (!text) return repondre('❌ Provide text or reply to media to make a status.');

            await zk.sendMessage(dest, {
                groupStatusMessage: {
                    text: text,
                    backgroundColor: '#25D366', // Hex color (WhatsApp Green)
                    font: 1 // Font style 
                }
            });
            return repondre('✅ Text group status sent.');
        }

        // 3. If the user DID reply to media (Image/Video/Audio Status)
        
        // ElitePro trick: Format the msgRepondu object so Baileys downloadMediaMessage accepts it
        const fakeMessage = { message: msgRepondu };
        const type = Object.keys(msgRepondu)[0]; // Will be 'imageMessage', 'videoMessage', etc.

        // Download using native Baileys function (Exactly how ElitePro's m.quoted.download() works)
        const buffer = await downloadMediaMessage(
            fakeMessage,
            'buffer',
            {},
            { logger: console } // Suppress unnecessary logs
        );

        // Send Image Status
        if (type === 'imageMessage') {
            await zk.sendMessage(dest, {
                groupStatusMessage: { image: buffer, caption: text }
            });
        } 
        // Send Video Status
        else if (type === 'videoMessage') {
            await zk.sendMessage(dest, {
                groupStatusMessage: { video: buffer, caption: text }
            });
        } 
        // Send Audio/Voice Note Status
        else if (type === 'audioMessage') {
            await zk.sendMessage(dest, {
                groupStatusMessage: { audio: buffer, mimetype: 'audio/mp4', ptt: true }
            });
        } else {
            return repondre('❌ Unsupported media type for status.');
        }

        repondre('✅ Media group status sent.');

    } catch (err) {
        console.error('GroupStatus Error:', err);
        repondre(`❌ Failed to send group status.\n\n*Error details:* ${err.message}`);
    }
});
