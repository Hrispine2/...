const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const FormData = require("form-data");
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// --- HELPERS ---
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

// Custom Temporary Uploader (Replaces ElitePro's local uploadToEliteTempUrl)
async function uploadToCatbox(buffer, ext = 'jpg') {
    try {
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, `temp.${ext}`);
        const res = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() });
        return res.data;
    } catch (e) {
        throw new Error("Failed to upload media to temporary server.");
    }
}

// Helper to extract media from replied messages
async function extractAndUploadMedia(msgRepondu, requiredType = 'image') {
    if (!msgRepondu) return null;
    
    let mediaType, mediaMessage, ext;
    if (msgRepondu.imageMessage && requiredType === 'image') {
        mediaType = 'image';
        mediaMessage = msgRepondu.imageMessage;
        ext = 'jpg';
    } else if (msgRepondu.audioMessage && requiredType === 'audio') {
        mediaType = 'audio';
        mediaMessage = msgRepondu.audioMessage;
        ext = 'mp3';
    } else {
        return null;
    }

    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
    const buffer = await streamToBuffer(stream);
    return await uploadToCatbox(buffer, ext);
}

// ==========================================
// 1. TEXT TO IMAGE (Flux & Tzai)
// ==========================================
adams({ nomCom: "flux", categorie: "AI", reaction: "🎨" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');
    if (!text) return repondre(`⚠️ Example: *.flux a futuristic car*`);
    
    try {
        const response = await axios.get(`https://eliteprotech-apis.zone.id/flux?prompt=${encodeURIComponent(text)}`, { responseType: 'arraybuffer' });
        await zk.sendMessage(dest, { image: Buffer.from(response.data), caption: `✅ *Flux Image for:* ${text}` }, { quoted: ms });
    } catch (e) {
        repondre('❌ Error generating flux image.');
    }
});

adams({ nomCom: "tzai", categorie: "AI", reaction: "🕒" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');
    if (!text) return repondre(`*🧑‍💻 Enter a text to generate your image*`);
    
    try {
        await repondre('*🧑‍💻 Please wait, we are generating your image*');
        const imageUrl = `https://eliasar-yt-api.vercel.app/api/ai/text2img?prompt=${encodeURIComponent(text)}`;
        await zk.sendMessage(dest, { image: { url: imageUrl }, caption: `*Results for:* ${text}` }, { quoted: ms });
    } catch (error) {
        repondre(`*🚨 Sorry, an error occurred 😔*`);
    }
});

// ==========================================
// 2. IMAGE MANIPULATION (RemoveBG, Upscale, Comic, Wasted)
// ==========================================
adams({ nomCom: "removebg", categorie: "AI", reaction: "⏳" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms, msgRepondu } = commandeOptions;
    let imgUrl = arg.join(' ') && arg[0].startsWith('http') ? arg[0] : await extractAndUploadMedia(msgRepondu, 'image');
    
    if (!imgUrl) return repondre(`❌ Please reply to an image or provide an image URL.`);
    
    try {
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/removebg?url=${encodeURIComponent(imgUrl)}`);
        if (!data?.success) throw new Error();
        await zk.sendMessage(dest, { image: { url: data.result }, caption: '✅ Background removed successfully!' }, { quoted: ms });
    } catch (error) {
        repondre('❌ Error occurred while removing background.');
    }
});

adams({ nomCom: "hd", aliases: ["remini", "enhance", "upscale"], categorie: "AI", reaction: "✨" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms, msgRepondu } = commandeOptions;
    let imgUrl = arg.join(' ') && arg[0].startsWith('http') ? arg[0] : await extractAndUploadMedia(msgRepondu, 'image');
    
    if (!imgUrl) return repondre(`❌ Please reply to an image or provide an image URL.`);
    
    try {
        const response = await axios.get(`https://eliteprotech-apis.zone.id/upscaler?url=${encodeURIComponent(imgUrl)}`, { responseType: 'arraybuffer' });
        await zk.sendMessage(dest, { image: Buffer.from(response.data), caption: '✅ Image upscaled successfully!' }, { quoted: ms });
    } catch (error) {
        repondre('❌ Error occurred while upscaling image.');
    }
});

adams({ nomCom: "img2comic", categorie: "AI", reaction: "🎨" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms, msgRepondu } = commandeOptions;
    let imgUrl = arg.join(' ') && arg[0].startsWith('http') ? arg[0] : await extractAndUploadMedia(msgRepondu, 'image');
    if (!imgUrl) return repondre(`❌ Please reply to an image or provide an image URL.`);
    try {
        const { data } = await axios.get(`https://zenz.biz.id/maker/img2comic?url=${encodeURIComponent(imgUrl)}`, { responseType: 'arraybuffer' });
        await zk.sendMessage(dest, { image: Buffer.from(data), caption: '🎨 *Comic-style image generated!*' }, { quoted: ms });
    } catch (err) {
        repondre('❌ Failed to generate comic-style image.');
    }
});

adams({ nomCom: "wasted", categorie: "AI", reaction: "💀" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms, msgRepondu } = commandeOptions;
    let imgUrl = arg.join(' ') && arg[0].startsWith('http') ? arg[0] : await extractAndUploadMedia(msgRepondu, 'image');
    if (!imgUrl) return repondre(`❌ Please reply to an image or provide an image URL.`);
    try {
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/wasted?url=${encodeURIComponent(imgUrl)}`);
        await zk.sendMessage(dest, { image: { url: data.url }, caption: '💀 WASTED' }, { quoted: ms });
    } catch (error) {
        repondre('❌ Error occurred while generating wasted image.');
    }
});

// ==========================================
// 3. ADVANCED AI (Vocal Remover, Colorize, Deepfake, OCR)
// ==========================================
adams({ nomCom: "vocalremover", categorie: "AI", reaction: "🎤" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms, msgRepondu } = commandeOptions;
    let audioUrl = arg.join(' ') && arg[0].startsWith('http') ? arg[0] : await extractAndUploadMedia(msgRepondu, 'audio');
    
    if (!audioUrl) return repondre(`❌ Please reply to an audio file or provide an audio URL.`);
    
    try {
        await repondre("⏳ Processing audio (This may take a moment)...");
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/vocalremove?url=${encodeURIComponent(audioUrl)}`);
        if (!data?.success) throw new Error();
        
        await zk.sendMessage(dest, { audio: { url: data.instrumental }, mimetype: 'audio/mpeg', caption: '🎵 Instrumental (No Vocals)' }, { quoted: ms });
        await zk.sendMessage(dest, { audio: { url: data.vocal }, mimetype: 'audio/mpeg', caption: '🎤 Vocals Only' }, { quoted: ms });
    } catch (error) {
        repondre('❌ Error occurred while removing vocals.');
    }
});

adams({ nomCom: "colorize", categorie: "AI", reaction: "🌈" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms, msgRepondu } = commandeOptions;
    let text = arg.join(' ');
    let imgUrl = text.startsWith('http') ? text : await extractAndUploadMedia(msgRepondu, 'image');
    let prompt = text && !text.startsWith('http') ? text : 'highly detailed, sharp focus, enhanced colors, realistic lighting';
    
    if (!imgUrl) return repondre(`❌ Please reply to an image.`);
    
    try {
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/colorize?url=${encodeURIComponent(imgUrl)}&prompt=${encodeURIComponent(prompt)}`);
        await zk.sendMessage(dest, { image: { url: data.result }, caption: `✅ Image colorized successfully!\n🎨 Prompt: *${prompt}*` }, { quoted: ms });
    } catch (error) {
        repondre('❌ Error occurred while colorizing image.');
    }
});

adams({ nomCom: "deepfake", categorie: "AI", reaction: "🎭" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms, msgRepondu } = commandeOptions;
    let text = arg.join(' ');
    let imgUrl = text.startsWith('http') ? text : await extractAndUploadMedia(msgRepondu, 'image');
    let prompt = text && !text.startsWith('http') ? text : 'Change my image';
    
    if (!imgUrl) return repondre(`❌ Please reply to an image.`);
    
    try {
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/deepfake?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(imgUrl)}`);
        await zk.sendMessage(dest, { image: { url: data.result.generate_url }, caption: `✅ Deepfake generated successfully!\n🎭 Prompt: *${prompt}*` }, { quoted: ms });
    } catch (error) {
        repondre('❌ Error occurred while generating deepfake image.');
    }
});

adams({ nomCom: "ocr", aliases: ["img2txt"], categorie: "AI", reaction: "📝" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms, msgRepondu } = commandeOptions;
    let imgUrl = arg.join(' ') && arg[0].startsWith('http') ? arg[0] : await extractAndUploadMedia(msgRepondu, 'image');
    if (!imgUrl) return repondre(`❌ Please reply to an image.`);
    try {
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/ocr?url=${encodeURIComponent(imgUrl)}`);
        repondre(`✅ *OCR Result:*\n\n${data.text}`);
    } catch (err) {
        repondre('❌ Error occurred while performing OCR.');
    }
});

// ==========================================
// 4. AI VIDEO & MUSIC GENERATION
// ==========================================
adams({ nomCom: "musicgen", aliases: ["aisong", "aimusic"], categorie: "AI", reaction: "🎶" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');
    if (!text) return repondre(`🎵 Please provide a prompt!\nExample: *.musicgen A cinematic superhero theme*`);
    
    try {
        await repondre('*🎧 Generating Ai Music . . . . .*');
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/musicgen?prompt=${encodeURIComponent(text)}`);
        
        for (const track of data.results) {
            await zk.sendMessage(dest, {
                audio: { url: track.audio }, mimetype: 'audio/mp4', ptt: false,
                contextInfo: { externalAdReply: { title: '🎵 AI Music Generator', body: text, thumbnailUrl: track.cover, mediaType: 1 } }
            }, { quoted: ms });
        }
    } catch (error) {
        repondre(`❌ An error occurred while generating music.`);
    }
});

adams({ nomCom: "aivideo", aliases: ["aivideo2"], categorie: "AI", reaction: "🎥" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');
    if (!text) return repondre(`🎬 *Example:* .aivideo A man walking in neon city`);
    
    try {
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/aivideo2?q=${encodeURIComponent(text)}`);
        await zk.sendMessage(dest, { video: { url: data.url }, caption: `🎥 *AI Generated Video*\n> *Prompt:* ${text}` }, { quoted: ms });
    } catch (error) {
        repondre(`❌ *Error generating AI video.*`);
    }
});

adams({ nomCom: "firelogo", categorie: "AI", reaction: "🔥" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');
    if (!text) return repondre(`*Example:* .firelogo BWM XMD`);
    try {
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/firelogo?text=${encodeURIComponent(text)}`);
        await zk.sendMessage(dest, { image: { url: data.image }, caption: `🔥 *Fire Logo Generated*\n*Text:* ${data.text}` }, { quoted: ms });
    } catch (err) {
        repondre("Failed to generate fire logo.");
    }
});
