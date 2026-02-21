const { adams } = require("../Ibrahim/adams");
const { exec } = require("child_process");
const fs = require("fs-extra"); 
const path = require("path");
const axios = require("axios");
const AdmZip = require("adm-zip");

// ==========================================
// 1. ADVANCED FULL-REPO UPDATER
// ==========================================

adams({ 
    nomCom: "update", 
    aliases: ["sync", "updatebot"], 
    categorie: "Control", 
    reaction: "🔄" 
}, async (dest, zk, commandeOptions) => {
    const { repondre, superUser, ms } = commandeOptions;

    // Security Check: Only Owner
    if (!superUser) {
        return repondre('❌ *Access Denied!* Only the bot owner can use this command.');
    }

    try {
        await zk.sendMessage(dest, { react: { text: "🔄", key: ms.key } });
        await repondre("🔄 *Downloading full repository update...*\n_This will fetch all new and modified files!_");

        const repoOwner = "Bwmxmd254";
        const repoName = "BWM-XMD-GO";
        
        // Try 'main' branch first
        let zipUrl = `https://github.com/${repoOwner}/${repoName}/archive/refs/heads/main.zip`;
        let response;
        
        try {
            response = await axios.get(zipUrl, { responseType: 'arraybuffer' });
        } catch (e) {
            // Fallback to 'master' branch if 'main' doesn't exist
            zipUrl = `https://github.com/${repoOwner}/${repoName}/archive/refs/heads/master.zip`;
            response = await axios.get(zipUrl, { responseType: 'arraybuffer' });
        }

        if (response.status === 200) {
            const zipPath = path.join(process.cwd(), 'update_temp.zip');
            fs.writeFileSync(zipPath, response.data);

            const zip = new AdmZip(zipPath);
            const zipEntries = zip.getEntries();

            // ⚠️ CRITICAL: Files/Folders to IGNORE so we don't overwrite user data/sessions
            const ignoreList = [
                'Ibrahim/',            // Session folder
                'config.env',          // Environment variables
                'database.db',         // Database
                'config/settings.json' // Custom Hybrid Config settings
            ];

            let updatedFilesCount = 0;

            for (const entry of zipEntries) {
                if (entry.isDirectory) continue;

                // entry.entryName looks like "BWM-XMD-GO-main/adams/EliteDev.js"
                // We need to remove the root folder ("BWM-XMD-GO-main/")
                const parts = entry.entryName.split('/');
                parts.shift(); 
                const targetPath = parts.join('/');

                if (!targetPath) continue;

                // Check if this file is in our ignore list
                const shouldIgnore = ignoreList.some(ignore => targetPath.startsWith(ignore) || targetPath === ignore);
                if (shouldIgnore) continue;

                const fullPath = path.join(process.cwd(), targetPath);
                const dirName = path.dirname(fullPath);

                // Create folder if it doesn't exist (e.g. for new command folders)
                if (!fs.existsSync(dirName)) {
                    fs.mkdirSync(dirName, { recursive: true });
                }

                // Overwrite/Create the file
                fs.writeFileSync(fullPath, entry.getData());
                updatedFilesCount++;
            }

            // Cleanup the temporary ZIP file
            fs.unlinkSync(zipPath);
            
            await repondre(`✅ *Update successful!*\n\n📥 Successfully updated/added *${updatedFilesCount}* files.\n🔄 Restarting the bot to apply changes...`);
            
            // Restart bot safely
            setTimeout(() => {
                process.exit(0);
            }, 2000);
        } else {
            await repondre(`❌ Failed to fetch update. Status: ${response.status}`);
        }

    } catch (err) {
        console.error("Update Error:", err);
        await repondre(`❌ *Error while updating the bot:*\n\`\`\`${err.message}\`\`\``);
    }
});

// ==========================================
// 2. TERMINAL EXECUTOR (Runs bash commands)
// ==========================================

adams({ 
    nomCom: "exec", 
    aliases: ["$", "bash"], 
    categorie: "Control", 
    reaction: "💻" 
}, async (dest, zk, commandeOptions) => {
    const { repondre, arg, superUser } = commandeOptions;
    const command = arg.join(' ');

    if (!superUser) return repondre('❌ *Owner Only Command!*');
    if (!command) return repondre('⚙️ *Please provide a terminal command to execute.*\n*Example:* .$ ls -la');
    
    exec(command, (err, stdout, stderr) => {
        if (err) return repondre(`❌ *Error:*\n\`\`\`${err.message}\`\`\``);
        if (stderr) return repondre(`⚠️ *Stderr:*\n\`\`\`${stderr}\`\`\``);
        if (!stdout) return repondre('✅ *Executed successfully but no output.*');
        
        repondre(`💻 *Shell Output:*\n\`\`\`${stdout}\`\`\``);
    });
});

// ==========================================
// 3. JAVASCRIPT EVALUATOR (Runs JS code)
// ==========================================

adams({ 
    nomCom: "eval", 
    aliases: [">", "=>"], 
    categorie: "Control", 
    reaction: "⚙️" 
}, async (dest, zk, commandeOptions) => {
    const { repondre, arg, superUser, ms, msgRepondu } = commandeOptions;
    const code = arg.join(' ');

    if (!superUser) return repondre('❌ *Owner Only Command!*');
    if (!code) return repondre('⚙️ *Please provide code to evaluate.*\n*Example:* .> return 5 + 5');

    try {
        // Evaluate the code asynchronously
        let evaled = await eval(`(async () => { ${code.includes('return') ? code : `return ${code}`} })()`);
        
        if (typeof evaled !== 'string') {
            evaled = require('util').inspect(evaled, { depth: 5 });
        }

        // Prevent sending massive logs that crash WhatsApp
        if (evaled.length > 50000) {
            console.log(evaled);
            return repondre("✅ *Result too long! I have logged it to the console.*");
        } else {
            await repondre(`✅ *Eval Output:*\n\`\`\`${evaled}\`\`\``);
        }
    } catch (err) {
        await repondre(`❌ *Eval Error:*\n\`\`\`${String(err)}\`\`\``);
    }
});
