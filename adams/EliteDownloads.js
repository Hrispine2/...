const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const fetch = require("node-fetch"); // Used for some specific API streams

// ==========================================
// 1. SOCIAL MEDIA VIDEO DOWNLOADERS
// ==========================================

adams({ nomCom: "tiktok", aliases: ["tt", "ttdl"], categorie: "Download", reaction: "🎵" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');
    
    if (!text) return repondre(`⚠️ Please provide a TikTok URL or search query.\n*Example:* .tiktok https://vt.tiktok.com/...`);

    try {
        await zk.sendMessage(dest, { react: { text: '📥', key: ms.key } });

        if (text.startsWith('http')) {
            const { data } = await axios.get(`https://eliteprotech-apis.zone.id/tiktok?url=${encodeURIComponent(text)}`);
            if (!data?.success) throw new Error("Failed to fetch TikTok video.");

            const videoUrl = data.mp4 || data.mp4_hd;
            if (!videoUrl) return repondre('⚠️ No downloadable video found.');

            await zk.sendMessage(dest, {
                video: { url: videoUrl },
                mimetype: 'video/mp4',
                caption: `🎬 *TikTok Video*\n📝 Title: *${data.title || 'No title'}*\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴡᴍ-xᴍᴅ©*`
            }, { quoted: ms });
        } else {
            // Search Mode
            const { data } = await axios.get(`https://eliteprotech-apis.zone.id/tiktoksearch?q=${encodeURIComponent(text)}`);
            if (data?.error || !data?.results?.length) return repondre('❌ No TikTok videos found.');

            const first = data.results[0];
            await zk.sendMessage(dest, {
                video: { url: first.play },
                mimetype: 'video/mp4',
                caption: `🔎 *TikTok Search Result*\n🎬 Title: *${first.title || 'No title'}*\n🕒 Duration: ${first.duration || 'N/A'}s\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴡᴍ-xᴍᴅ©*`
            }, { quoted: ms });
        }
    } catch (err) {
        console.error('TikTok Error:', err);
        repondre('❌ An error occurred. Please try again later.');
    }
});

adams({ nomCom: "facebook", aliases: ["fb", "fbdl"], categorie: "Download", reaction: "📘" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');

    if (!text) return repondre(`Give Me A Facebook Video Link \n*Example:* .fb https://www.facebook.com/...`);

    try {
        await zk.sendMessage(dest, { react: { text: `📥`, key: ms.key } });
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/facebook?url=${encodeURIComponent(text)}`);
        
        if (data.success && data.video) {
            await zk.sendMessage(dest, {
                video: { url: data.video },
                mimetype: 'video/mp4',
                caption: `🎥 *Facebook Video*\n👤 *Author:* ${data.author || 'Unknown'}\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴡᴍ-xᴍᴅ©*`
            }, { quoted: ms });
        } else {
            repondre("❌ Unable to fetch the Facebook video. Please check the URL.");
        }
    } catch (error) {
        repondre("❌ An error occurred while downloading the Facebook video.");
    }
});

adams({ nomCom: "instagram", aliases: ["ig", "igdl", "reel"], categorie: "Download", reaction: "📸" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');

    if (!text) return repondre(`Give Me An Instagram Reel/Post Link\n*Example:* .ig https://www.instagram.com/reel/...`);

    try {
        await zk.sendMessage(dest, { react: { text: `📥`, key: ms.key } });
        const response = await axios.get(`https://api.princetechn.com/api/download/instadl?apikey=prince&url=${encodeURIComponent(text)}`);
        
        if (response.data.success && response.data.result?.download_url) {
            await zk.sendMessage(dest, {
                video: { url: response.data.result.download_url },
                mimetype: 'video/mp4',
                caption: `🎬 *Instagram Download*\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴡᴍ-xᴍᴅ©*`
            }, { quoted: ms });
        } else {
            repondre("❌ Unable to fetch the Instagram video.");
        }
    } catch (error) {
        repondre("❌ An error occurred while processing the Instagram video.");
    }
});

adams({ nomCom: "twitter", aliases: ["x", "twit", "xdl"], categorie: "Download", reaction: "🐦" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const url = arg.join(' ').trim();

    if (!/https?:\/\/(x|twitter)\.com\//i.test(url)) {
        return repondre(`❌ Please send a valid X/Twitter link.`);
    }

    try {
        await zk.sendMessage(dest, { react: { text: `📥`, key: ms.key } });
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/x?url=${url}`);
        
        if (data.status !== "success") return repondre(`❌ Failed to fetch media.`);

        const video = data.videos?.[0]; // Pick highest quality
        if (video) {
            await zk.sendMessage(dest, {
                video: { url: video.url },
                caption: `🐦 *X / Twitter Video*\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴡᴍ-xᴍᴅ©*`
            }, { quoted: ms });
        } else if (data.thumbnail) {
            await zk.sendMessage(dest, { image: { url: data.thumbnail }, caption: "🖼️ Only Image found." }, { quoted: ms });
        }
    } catch (e) {
        repondre(`❌ Error fetching Twitter media.`);
    }
});

adams({ nomCom: "aio", aliases: ["alldownloader"], categorie: "Download", reaction: "🌐" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');

    if (!text) return repondre(`Give Me A Video URL (Facebook, TikTok, etc.)\n*Example:* .aio https://...`);

    try {
        await zk.sendMessage(dest, { react: { text: `📥`, key: ms.key } });
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/aio?url=${encodeURIComponent(text)}`);
        
        if (data.success && data.download_links?.length) {
            await zk.sendMessage(dest, {
                video: { url: data.download_links[0] }, // Grab the first valid link
                caption: `🎥 *AIO Downloader*\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴡᴍ-xᴍᴅ©*`
            }, { quoted: ms });
        } else {
            repondre("❌ Unable to fetch video. Unsupported URL or Private Video.");
        }
    } catch (error) {
        repondre("❌ An error occurred. Try a specific downloader instead.");
    }
});

// ==========================================
// 2. SPOTIFY DOWNLOADER
// ==========================================

adams({ nomCom: "spotify", aliases: ["splay", "spdl"], categorie: "Download", reaction: "🎧" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');

    if (!text) return repondre('🎵 Provide a Spotify URL or song name.');

    try {
        await zk.sendMessage(dest, { react: { text: '🔍', key: ms.key } });
        
        // Search for track
        const searchApiUrl = `https://spotifyapi.caliphdev.com/api/search/tracks?q=${encodeURIComponent(text)}`;
        const searchData = (await axios.get(searchApiUrl)).data;
        const track = searchData[0];
        
        if (!track) return repondre("❌ Could not find that track on Spotify.");

        const info = `╭━━━━━━━━━\n┃ *SPOTIFY DOWNLOADER*\n\n> *ᴛɪᴛʟᴇ:* ${track.title}\n┃ *ᴀʀᴛɪꜱᴛ:* ${track.artist || 'Unknown'}\n> *ᴜʀʟ:* ${track.url}\n╰━━━━━━━━━━━━━━━━━━┈⊷`;
        
        await zk.sendMessage(dest, { image: { url: track.thumbnail }, caption: info }, { quoted: ms });

        // Download audio
        const downloadApiUrl = `https://spotifyapi.caliphdev.com/api/download/track?url=${encodeURIComponent(track.url)}`;
        const response = await fetch(downloadApiUrl);

        if (response.headers.get("content-type") === "audio/mpeg") {
            await zk.sendMessage(dest, { 
                audio: { url: downloadApiUrl }, 
                mimetype: 'audio/mpeg',
                fileName: `${track.title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: track.title,
                        body: track.artist,
                        thumbnailUrl: track.thumbnail,
                        mediaType: 1
                    }
                }
            }, { quoted: ms });
        } else {
            repondre("❌ Could not download this track. Try another.");
        }
    } catch (error) {
        console.error(error);
        repondre("⚠️ Failed to process Spotify request.");
    }
});

// ==========================================
// 3. FILE & APP DOWNLOADERS
// ==========================================

adams({ nomCom: "mediafire", aliases: ["mfdl"], categorie: "Download", reaction: "🔥" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');

    if (!text) return repondre(`*Example:* .mediafire https://www.mediafire.com/file/...`);
    
    try {
        await zk.sendMessage(dest, { react: { text: `📥`, key: ms.key } });
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/mediafire?url=${encodeURIComponent(text)}`);

        if (data?.status && data?.download) {
            await zk.sendMessage(dest, {
                document: { url: data.download },
                mimetype: data.mimetype || 'application/octet-stream',
                fileName: data.filename || data.name || 'file',
                caption: `📦 *File Name:* ${data.name}\n📁 *Size:* ${data.size}\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴡᴍ-xᴍᴅ©*`
            }, { quoted: ms });
        } else {
            repondre(`❌ *Failed to fetch file details!*`);
        }
    } catch (error) {
        repondre(`⚠️ *An error occurred while processing your request.*`);
    }
});

adams({ nomCom: "apk", aliases: ["getapk", "playstore"], categorie: "Download", reaction: "📱" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');

    if (!text) return repondre(`*Example:* .apk WhatsApp`);
    
    try {
        await zk.sendMessage(dest, { react: { text: `📥`, key: ms.key } });
        const apiUrl = `https://api.princetechn.com/api/download/apkdl?apikey=prince&appName=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 15000 });
        
        if (!response.data?.success || !response.data?.result) return repondre('❌ *Failed to fetch APK. Not found.*');
        
        const { appname, appicon, mimetype, download_url, developer } = response.data.result;
        
        // Send Info
        await zk.sendMessage(dest, {
            image: { url: appicon },
            caption: `📥 *APK Downloader*\n📌 *Name:* ${appname}\n👨‍💻 *Developer:* ${developer}\n\n_Uploading APK, please wait..._`
        }, { quoted: ms });
        
        // Send APK Document
        await zk.sendMessage(dest, {
            document: { url: download_url },
            mimetype: mimetype || 'application/vnd.android.package-archive',
            fileName: `${appname}.apk`
        }, { quoted: ms });
        
    } catch (error) {
        repondre('❌ *Failed to send APK file. It might be too large or timed out.*');
    }
});

adams({ nomCom: "fdroid", categorie: "Download", reaction: "🤖" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');

    if (!text) return repondre(`❌ Please provide a search query.\nExample: .fdroid Termux`);

    try {
        await zk.sendMessage(dest, { react: { text: '🔍', key: ms.key } });
        
        // Note: Preserved the exact API URL typo from ElitePro ('fdriod')
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/fdriod?q=${encodeURIComponent(text)}`);

        if (!data?.success || !data.result) return repondre(`❌ No results found for: ${text}`);

        const app = data.result;
        await zk.sendMessage(dest, {
            image: { url: app.icon },
            caption: `📱 *F-Droid App*\n\n*Name:* ${app.name}\n*Version:* ${app.version}\n*Size:* ${app.size || 'Unknown'}\n\n📦 *Sending APK...*`
        }, { quoted: ms });

        await zk.sendMessage(dest, {
            document: { url: app.apkUrl },
            mimetype: 'application/vnd.android.package-archive',
            fileName: `${app.name.replace(/[^a-zA-Z0-9]/g, '_')}.apk`
        }, { quoted: ms });

    } catch (err) {
        repondre('❌ Error fetching F-Droid app info.');
    }
});

// ==========================================
// 4. IMAGE SEARCH / PINTEREST
// ==========================================

adams({ nomCom: "pinterest", aliases: ["pin", "pindl"], categorie: "Search", reaction: "📌" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
    const text = arg.join(' ');

    if (!text) return repondre(`📌 Example:\n• Download: .pin https://pin.it/...\n• Search: .pin A guy in hoodie`);

    try {
        await zk.sendMessage(dest, { react: { text: "📌", key: ms.key } });

        // Download Mode
        if (text.includes("pinterest.com") || text.includes("pin.it")) {
            let { data } = await axios.get(`https://apis.prexzyvilla.site/download/pinterestV2?url=${encodeURIComponent(text)}`);
            if (!data?.status || !data?.data) return repondre("⚠️ Failed to fetch Pinterest media.");

            let { video, image } = data.data;
            if (video) {
                await zk.sendMessage(dest, { video: { url: video }, caption: `🎬 *Pinterest Video*` }, { quoted: ms });
            } else if (image) {
                await zk.sendMessage(dest, { image: { url: image }, caption: `🖼️ *Pinterest Image*` }, { quoted: ms });
            }
        } 
        // Search Mode
        else {
            let { data } = await axios.get(`https://ab-pinetrest.abrahamdw882.workers.dev/?query=${encodeURIComponent(text)}`);
            if (!data?.status || !data?.data || data.data.length === 0) return repondre(`⚠️ No results found for: *${text}*`);

            let pins = data.data.slice(0, 5); // Send top 5 images
            for (let pin of pins) {
                await zk.sendMessage(dest, {
                    image: { url: pin.image },
                    caption: `📌 *${pin.title || "No title"}*\n🔗 ${pin.pin_url}`
                }, { quoted: ms });
            }
        }
    } catch (err) {
        repondre("❌ An error occurred while processing Pinterest request.");
    }
});
