const { adams } = require("../Ibrahim/adams");
const axios = require("axios");

// ==========================================
// 1. GAMES & BETTING
// ==========================================

adams({ nomCom: "bet", aliases: ["betting", "odds"], categorie: "Fun", reaction: "⚽" }, async (dest, zk, commandeOptions) => {
    const { repondre, ms } = commandeOptions;

    try {
        await zk.sendMessage(dest, { react: { text: '⚽', key: ms.key } });

        const { data } = await axios.get('https://apiskeith.vercel.app/bet');

        if (!data.status || !data.result || data.result.length === 0) {
            return repondre('❌ No betting predictions available right now.');
        }

        let betText = `⚽ *FOOTBALL BET PREDICTIONS*\n\n`;

        // Loop through the top 5 matches
        const matches = data.result.slice(0, 5);
        for (let i = 0; i < matches.length; i++) {
            const mth = matches[i];
            betText += `━━━━━━━━━━━━━━━━━━\n`;
            betText += `🏟 *Match:* ${mth.match}\n`;
            betText += `🏆 *League:* ${mth.league}\n`;
            betText += `⏰ *Time:* ${mth.time}\n\n`;
            
            betText += `📊 *Full Time Odds*\n`;
            betText += `• Home: ${mth.predictions.fulltime.home}%\n`;
            betText += `• Draw: ${mth.predictions.fulltime.draw}%\n`;
            betText += `• Away: ${mth.predictions.fulltime.away}%\n\n`;

            betText += `⚽ *Over 2.5 Goals:* ${mth.predictions.over_2_5.yes}%\n`;
            betText += `🔥 *BTTS (Both Score):* ${mth.predictions.bothTeamToScore.yes}%\n`;
        }

        betText += `━━━━━━━━━━━━━━━━━━\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴡᴍ-xᴍᴅ©*`;

        await zk.sendMessage(dest, { text: betText }, { quoted: ms });

    } catch (error) {
        console.error('Bet Error:', error);
        repondre('❌ Failed to fetch betting predictions.');
    }
});

adams({ nomCom: "truth", categorie: "Fun", reaction: "🫣" }, async (dest, zk, commandeOptions) => {
    const { repondre, ms, auteurMessage } = commandeOptions;

    try {
        const { data } = await axios.get('https://apis.davidcyriltech.my.id/truth');

        if (data.status === 200 && data.success) {
            const truthQuestion = data.question;
            const imagePath = 'https://i.ibb.co/gLNc5SGK/ce5871f200bb421678c982f5af52d7fd.jpg';

            await zk.sendMessage(dest, {
                image: { url: imagePath },
                caption: `🫣 @${auteurMessage.split('@')[0]}, you chose *TRUTH*!\n\n❓ *Question:* ${truthQuestion}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴡᴍ-xᴍᴅ©*`,
                mentions: [auteurMessage]
            }, { quoted: ms });
        } else {
            repondre('❌ Failed to fetch a truth question. Please try again later.');
        }
    } catch (error) {
        repondre('❌ An error occurred while fetching truth question.');
    }
});

adams({ nomCom: "8ballpool", aliases: ["8ball"], categorie: "Fun", reaction: "🎱" }, async (dest, zk, commandeOptions) => {
    const { repondre, ms, arg } = commandeOptions;
    
    if (!arg.join(' ')) return repondre("🎱 Ask the magic 8-ball a question!\n*Example:* .8ball Will I get rich?");

    try {
        const { data } = await axios.get(`https://nekos.life/api/v2/img/8ball`);
        await zk.sendMessage(dest, { 
            image: { url: data.url }, 
            caption: `🎱 *The Magic 8-Ball has spoken!*\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴡᴍ-xᴍᴅ©*` 
        }, { quoted: ms });
    } catch (err) {
        repondre('❌ Error shaking the 8-ball!');
    }
});

// ==========================================
// 2. FUN TEXTS (Pickup lines, Flirt, Insult)
// ==========================================

adams({ nomCom: "pickupline", aliases: ["pickup"], categorie: "Fun", reaction: "❤️" }, async (dest, zk, commandeOptions) => {
    const { repondre } = commandeOptions;
    try {
        const res = await fetch('https://api.popcat.xyz/pickuplines');
        const json = await res.json();
        repondre(`❤️ *Pickup Line:*\n\n"${json.pickupline}"\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴡᴍ-xᴍᴅ©*`);
    } catch (error) {
        repondre('❌ Failed to fetch a pickup line.');
    }
});

adams({ nomCom: "flirt", categorie: "Fun", reaction: "💘" }, async (dest, zk, commandeOptions) => {
    const { repondre, ms } = commandeOptions;
    try {
        const { data } = await axios.get(`https://api.giftedtech.web.id/api/fun/flirt?apikey=gifted`);
        if (!data || !data.success || !data.result) throw new Error();
        
        await zk.sendMessage(dest, {
            text: `💘 *Flirty Line:*\n\n${data.result}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴡᴍ-xᴍᴅ©*`
        }, { quoted: ms });
    } catch (err) {
        repondre("❌ Error occurred while getting a flirt line.");
    }
});

adams({ nomCom: "insulte", aliases: ["roast"], categorie: "Fun", reaction: "🔥" }, async (dest, zk, commandeOptions) => {
    const { repondre, ms } = commandeOptions;
    try {
        const { data } = await axios.get('https://eliteprotech-apis.zone.id/insult');
        if (!data?.success) throw new Error();
        
        await zk.sendMessage(dest, {
            text: `🔥 *ROASTED:*\n\n${data.insult}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴡᴍ-xᴍᴅ©*`
        }, { quoted: ms });
    } catch (error) {
        repondre('❌ Failed to fetch an insult. Try again later.');
    }
});

// ==========================================
// 3. UTILITY FUN (Readmore, Story, Define)
// ==========================================

adams({ nomCom: "readmore", aliases: ["spoiler"], categorie: "Fun", reaction: "👀" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');

    if (!text.includes('|')) return repondre(`👀 *Usage:* .readmore Visible Text | Hidden Text`);

    let [visible, hidden] = text.split('|');
    if (!visible) visible = 'Read more...';
    if (!hidden) hidden = 'You found the secret!';

    // The magical hidden character that triggers WhatsApp's "Read More" button
    const readmoreChar = String.fromCharCode(8206).repeat(4001);

    await zk.sendMessage(dest, { text: `${visible.trim()} ${readmoreChar} \n\n${hidden.trim()}` }, { quoted: ms });
});

adams({ nomCom: "story", aliases: ["aistory"], categorie: "Fun", reaction: "📖" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');

    if (!text) return repondre(`*Example:* .story A cyberpunk ninja who lost his sword.`);
    
    try {
        await zk.sendMessage(dest, { react: { text: `📖`, key: ms.key } });
        
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/story?text=${encodeURIComponent(text)}`);
        if (!data || !data.success) throw new Error();
        
        const title = text.length > 50 ? text.substring(0, 50) + "..." : text;
        
        await zk.sendMessage(dest, {
            text: `📚 *AI Story Generated!*\n\n🖋 *Prompt:* ${title}\n\n✨ *Story:*\n${data.story}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴡᴍ-xᴍᴅ©*`
        }, { quoted: ms });
        
    } catch (error) {
        repondre(`❌ Error generating story.`);
    }
});

adams({ nomCom: "define", aliases: ["urban", "meaning"], categorie: "Fun", reaction: "📚" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');

    if (!text) return repondre(`📚 What do you want to define?\n*Example:* .define Sigma`);

    try {
        const { data } = await axios.get(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(text)}`);
        
        if (!data.list || data.list.length === 0) return repondre(`❌ No definition found for *${text}*.`);

        const def = data.list[0];
        const replyText = `📚 *Urban Dictionary: ${text}*\n\n` +
                          `*Definition:*\n${def.definition.replace(/\[|\]/g, "")}\n\n` +
                          `*Example:*\n_${def.example.replace(/\[|\]/g, "")}_\n\n` +
                          `👍 ${def.thumbs_up} | 👎 ${def.thumbs_down}\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴡᴍ-xᴍᴅ©*`;

        await zk.sendMessage(dest, { text: replyText }, { quoted: ms });
    } catch (err) {
        repondre(`❌ Failed to fetch definition.`);
    }
});
