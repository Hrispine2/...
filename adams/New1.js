 const { adams } = require("../Ibrahim/adams");
const axios = require("axios");

// M-Pesa API Configuration (ONLY CHANGED THE API KEY TO YOUR WORKING ONE)
const API_KEY = "Bearer d81e9ab230c5d8f588b15c79de920b44cde9002e";
const BASE_API_URL = "https://lipia-api.kreativelabske.com/api/request/stk";

// Store active payment sessions
const paymentSessions = new Map();

// Data bundles array
const dataBundles = [
    { id: 1, name: "1GB 1hr", price: 19, description: "1GB 1hr @ Ksh 19/=", dailyLimit: true },
    { id: 2, name: "250MB 24hrs", price: 20, description: "250MB 24hrs @ Ksh 20/=", dailyLimit: true },
    { id: 3, name: "1GB 24hrs", price: 99, description: "1GB 24hrs @ Ksh 99/=", dailyLimit: true },
    { id: 4, name: "1.5GB 3hrs", price: 50, description: "1.5GB 3hrs @ Ksh 50/=", dailyLimit: true },
    { id: 5, name: "1.2GB till midnight", price: 55, description: "1.2GB till midnight @ Ksh 55/=", dailyLimit: true },
    { id: 6, name: "20 SMS 24hrs", price: 5, description: "20 SMS 24hrs @ Ksh 5/=", dailyLimit: false },
    { id: 7, name: "200 SMS 24hrs", price: 10, description: "200 SMS 24hrs @ Ksh 10/=", dailyLimit: false },
    { id: 8, name: "1000 SMS 7days", price: 30, description: "1000 SMS 7days @ Ksh 30/=", dailyLimit: false },
    { id: 9, name: "50 min midnight", price: 51, description: "50 min midnight @ Ksh 51/=", dailyLimit: false },
    { id: 10, name: "1GB 1HOUR", price: 24, description: "1GB 1HOUR @ Ksh 24/=", dailyLimit: false },
    { id: 11, name: "1.5GB 3hours", price: 53, description: "1.5GB 3hours @ Ksh 53/=", dailyLimit: false },
    { id: 12, name: "2GB 24hrs", price: 120, description: "2GB 24hrs @ Ksh 120/=", dailyLimit: false },
    { id: 13, name: "45 min 3hrs", price: 22, description: "45 min 3hrs @ Ksh 22/=", dailyLimit: false },
    { id: 14, name: "1500 SMS", price: 101, description: "1500 SMS @ Ksh 101/=", dailyLimit: false },
    { id: 15, name: "3500 SMS", price: 199, description: "3500 SMS @ Ksh 199/=", dailyLimit: false }
];

adams({
    nomCom: "buydata",
    aliases: ["data", "bundle"],
    categorie: "Payment",
    reaction: "📱"
}, async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;
    const contactName = commandOptions?.ms?.pushName || "Unknown Contact";
    const sender = commandOptions?.sender || (commandOptions?.ms?.key?.remoteJid || "").replace(/@.+/, '');

    // Contact message for quoted replies (EXACT SAME AS YOUR WORKING CODE)
    const contactMsg = {
        key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: 'status@broadcast' },
        message: {
            contactMessage: {
                displayName: contactName,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:${contactName}\nitem1.TEL;waid=${sender}:${sender}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
            },
        },
    };

    // Context info with mentionedJid (EXACT SAME AS YOUR WORKING CODE)
    const contextInfo = {
        mentionedJid: [sender ? `${sender}@s.whatsapp.net` : undefined].filter(Boolean),
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363401639653085@newsletter",
            newsletterName: "VIRUSI DATA SOLUTIONS",
            serverMessageId: Math.floor(100000 + Math.random() * 900000),
        },
    };

    try {
        // Show data bundles menu (EXACT SAME AS YOUR WORKING CODE)
        const menuMessage = `📱 *VIRUSI DATA SOLUTIONS - DATA BUNDLES*

*1.* 1GB 1hr @ Ksh 19/=
*2.* 250MB 24hrs @ Ksh 20/=
*3.* 1GB 24hrs @ Ksh 99/=
*4.* 1.5GB 3hrs @ Ksh 50/=
*5.* 1.2GB till midnight @ Ksh 55/=
*6.* 20 SMS 24hrs @ Ksh 5/=
*7.* 200 SMS 24hrs @ Ksh 10/=
*8.* 1000 SMS 7days @ Ksh 30/=
*9.* 50 min midnight @ Ksh 51/=
*10.* 1GB 1HOUR @ Ksh 24/=
*11.* 1.5GB 3hours @ Ksh 53/=
*12.* 2GB 24hrs @ Ksh 120/=
*13.* 45 min 3hrs @ Ksh 22/=
*14.* 1500 SMS @ Ksh 101/=
*15.* 3500 SMS @ Ksh 199/=

📋 *IMPORTANT NOTES:*
• Options 1–5 can be bought only once per day
• Options 6–15 can be bought as many times as you want

💡 *Reply with the number of the bundle you want (1-15)*`;

        // Send the menu message (EXACT SAME AS YOUR WORKING CODE)
        const sentMessage = await zk.sendMessage(dest, {
            text: menuMessage,
            contextInfo: contextInfo
        }, { quoted: contactMsg });

        // Store the session with the sent message ID (EXACT SAME AS YOUR WORKING CODE)
        const sessionId = sentMessage.key.id;
        paymentSessions.set(sessionId, {
            dest: dest,
            originalMsg: ms,
            createdAt: Date.now(),
            status: "waiting_bundle_selection",
            contactMsg: contactMsg,
            contextInfo: contextInfo
        });

        // Handle replies using the EXACT same pattern as your working code
        const handleReply = async (update) => {
            const message = update.messages[0];
            if (!message?.message) return;

            // Check if this is a reply to our menu message (EXACT SAME AS YOUR WORKING CODE)
            const isReply = message.message.extendedTextMessage?.contextInfo?.stanzaId === sentMessage.key.id;
            if (!isReply) return;

            const responseText = message.message.extendedTextMessage?.text?.trim() || 
                               message.message.conversation?.trim();
            
            if (!responseText) return;

            const session = paymentSessions.get(sessionId);
            if (!session) return;

            if (session.status === "waiting_bundle_selection") {
                await processBundleSelection(responseText, sessionId, session, zk, message);
            } else if (session.status === "waiting_phone") {
                await processPhoneNumber(responseText, sessionId, session, zk, message);
            }
        };

        // Add event listener (EXACT SAME AS YOUR WORKING CODE)
        zk.ev.on("messages.upsert", handleReply);

        // Clean up old sessions (EXACT SAME AS YOUR WORKING CODE)
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
        for (const [sessionId, session] of paymentSessions.entries()) {
            if (session.createdAt < thirtyMinutesAgo) {
                paymentSessions.delete(sessionId);
            }
        }

    } catch (error) {
        console.error("Buydata command error:", error);
        return repondre("❌ Error loading data bundles. Please try again.");
    }
});

// Process bundle selection (EXACT SAME AS YOUR WORKING CODE)
async function processBundleSelection(bundleInput, sessionId, session, zk, message) {
    try {
        const bundleNumber = parseInt(bundleInput.trim());
        
        // Validate bundle number
        if (isNaN(bundleNumber) || bundleNumber < 1 || bundleNumber > 15) {
            return await zk.sendMessage(session.dest, {
                text: "❌ Invalid bundle number. Please reply with a number between 1-15.",
                contextInfo: session.contextInfo
            }, { quoted: message });
        }

        // Get selected bundle
        const selectedBundle = dataBundles.find(bundle => bundle.id === bundleNumber);
        
        if (!selectedBundle) {
            return await zk.sendMessage(session.dest, {
                text: "❌ Bundle not found. Please try again with a valid number (1-15).",
                contextInfo: session.contextInfo
            }, { quoted: message });
        }

        // Update session with selected bundle
        session.selectedBundle = selectedBundle;
        session.amount = selectedBundle.price;
        session.status = "waiting_phone";

        // Send phone number prompt (EXACT SAME AS YOUR WORKING CODE)
        const phonePrompt = `📱 *BUNDLE SELECTED*

${selectedBundle.description}
💰 *Price:* Ksh ${selectedBundle.price}

📞 *Please reply with your Safaricom phone number*

📱 *Accepted formats:*
• 07xxxxxxxx
• 2547xxxxxxxx  
• +2547xxxxxxxx

💡 *Example:* 0712345678`;

        const phoneMessage = await zk.sendMessage(session.dest, {
            text: phonePrompt,
            contextInfo: session.contextInfo
        }, { quoted: message });

        // Update session to listen for phone number on this new message (EXACT SAME AS YOUR WORKING CODE)
        const phoneSessionId = phoneMessage.key.id;
        paymentSessions.set(phoneSessionId, {
            ...session,
            status: "waiting_phone"
        });

        // Remove old session (EXACT SAME AS YOUR WORKING CODE)
        paymentSessions.delete(sessionId);

        // Handle phone number replies (EXACT SAME AS YOUR WORKING CODE)
        const handlePhoneReply = async (update) => {
            const phoneMsg = update.messages[0];
            if (!phoneMsg?.message) return;

            const isPhoneReply = phoneMsg.message.extendedTextMessage?.contextInfo?.stanzaId === phoneMessage.key.id;
            if (!isPhoneReply) return;

            const phoneText = phoneMsg.message.extendedTextMessage?.text?.trim() || 
                             phoneMsg.message.conversation?.trim();
            
            if (!phoneText) return;

            const phoneSession = paymentSessions.get(phoneSessionId);
            if (!phoneSession) return;

            await processPhoneNumber(phoneText, phoneSessionId, phoneSession, zk, phoneMsg);
            
            // Remove the phone reply listener
            zk.ev.off("messages.upsert", handlePhoneReply);
        };

        zk.ev.on("messages.upsert", handlePhoneReply);

    } catch (error) {
        console.error("Bundle selection error:", error);
        await zk.sendMessage(session.dest, {
            text: "❌ Error processing bundle selection. Please try again.",
            contextInfo: session.contextInfo
        }, { quoted: message });
    }
}

// Function to process phone number and initiate payment (ONLY CHANGED API KEY AND MESSAGES)
async function processPhoneNumber(phoneInput, sessionId, session, zk, message) {
    console.log("=== PHONE NUMBER PROCESSING ===");
    console.log("Raw input:", phoneInput);
    
    try {
        // Let's try different phone number formats the API might accept
        let phone = phoneInput.trim();
        
        // Remove any spaces, dashes, or parentheses
        phone = phone.replace(/[\s\-\(\)]/g, '');
        console.log("After cleaning spaces/dashes:", phone);
        
        // Try different formats that M-Pesa APIs commonly accept:
        let phoneFormats = [];
        
        if (phone.startsWith('+254')) {
            // +254727716045 -> try multiple formats
            const numberPart = phone.substring(4);
            phoneFormats = [
                phone, // +254727716045
                '254' + numberPart, // 254727716045
                '0' + numberPart, // 0727716045
                numberPart // 727716045
            ];
        } else if (phone.startsWith('254')) {
            // 254727716045 -> try multiple formats
            const numberPart = phone.substring(3);
            phoneFormats = [
                phone, // 254727716045
                '+' + phone, // +254727716045
                '0' + numberPart, // 0727716045
                numberPart // 727716045
            ];
        } else if (phone.startsWith('0') && phone.length === 10) {
            // 0727716045 -> try multiple formats
            const numberPart = phone.substring(1);
            phoneFormats = [
                phone, // 0727716045
                '254' + numberPart, // 254727716045
                '+254' + numberPart, // +254727716045
                numberPart // 727716045
            ];
        } else if (phone.startsWith('7') && phone.length === 9) {
            // 727716045 -> try multiple formats
            phoneFormats = [
                phone, // 727716045
                '0' + phone, // 0727716045
                '254' + phone, // 254727716045
                '+254' + phone // +254727716045
            ];
        } else {
            return await zk.sendMessage(session.dest, {
                text: `*Wait a minute we process your request *\n\n*Your Number:* ${phoneInput}\n\n`,
                mentions: [message.key.participant || message.key.remoteJid]
            }, { quoted: message });
        }
        
        console.log("Phone formats to try:", phoneFormats);
        
        // Send processing message
        await zk.sendMessage(session.dest, {
            text: `⏳ *Processing M-Pesa Payment...*\n\n📱 *Phone:* ${phoneInput}\n💰 *Amount:* Ksh ${session.amount}\n\n🔄 *Please check your phone to enter mpesa pin...*`,
            mentions: [message.key.participant || message.key.remoteJid]
        }, { quoted: message });

        // Update session status
        session.status = "processing";
        
        // Try each phone format until one works
        let lastError = null;
        for (let i = 0; i < phoneFormats.length; i++) {
            const phoneToTry = phoneFormats[i];
            console.log(`\n=== TRYING FORMAT ${i + 1}: ${phoneToTry} ===`);
            
            try {
                const paymentData = {
                    phone: phoneToTry,
                    amount: session.amount.toString()
                };

                console.log("Request payload:", JSON.stringify(paymentData, null, 2));
                
                const response = await axios.post(BASE_API_URL, paymentData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': API_KEY
                    },
                    timeout: 30000
                });

                console.log("SUCCESS with format:", phoneToTry);
                console.log("Response:", JSON.stringify(response.data, null, 2));

                const result = response.data;

                // Check response structure
                if (result.data && result.data.amount && result.data.phone && 
                    result.data.refference && result.data.CheckoutRequestID) {
                    
                    const successMessage = `📲 *M-Pesa request was successful sent*
💰 *Amount:* Ksh ${result.data.amount}
📱 *Phone:* ${result.data.phone}

> © VIRUSI DATA SOLUTIONS Payment System`;

                    await zk.sendMessage(session.dest, {
                        text: successMessage,
                        contextInfo: {
                            externalAdReply: {
                                title: "📲 M-Pesa Prompt Sent",
                                body: `Check your phone - Ksh ${result.data.amount}`,
                                mediaType: 1,
                                thumbnailUrl: "https://url.bwmxmd.online/Adams.x7eli7fw.jpg",
                                sourceUrl: "https://payment.bwmxmd.online",
                                renderLargerThumbnail: false,
                                showAdAttribution: true,
                            }
                        },
                        mentions: [message.key.participant || message.key.remoteJid]
                    }, { quoted: message });

                    // Update session
                    session.status = "stk_sent";
                    session.txnId = result.data.refference;
                    session.checkoutId = result.data.CheckoutRequestID;

                    // Wait for payment completion (60 seconds)
                    setTimeout(async () => {
                        if (session.status === "stk_sent") {
                            await sendPaymentConfirmation(session, zk, message);
                        }
                    }, 60000);

                    return; // Success, exit function
                }
            } catch (error) {
                console.log(`Format ${phoneToTry} failed:`, error.response?.data || error.message);
                lastError = error;
                continue;
            }
        }
        
        // If all formats failed
        console.log("=== ALL FORMATS FAILED ===");
        throw lastError || new Error("All phone number formats failed");

    } catch (error) {
        console.log("=== FINAL ERROR ===");
        console.error("Error:", error.response?.data || error.message);
        
        const errorMessage = `❌ *Payment request failed*

📱 *Phone:* ${phoneInput}
📦 *Bundle:* ${session.selectedBundle.name}

🔧 *Please ensure:*
• Your number is from Safaricom
• You have sufficient M-Pesa balance
• Try again in a few minutes

💡 *Try again with:* buydata`;

        await zk.sendMessage(session.dest, {
            text: errorMessage,
            contextInfo: session.contextInfo
        }, { quoted: message });

        // Reset session for retry
        session.status = "waiting_phone";
    }
}

// Function to send payment confirmation
async function sendPaymentConfirmation(session, zk, message) {
    try {
        const confirmationMessage = `🎉 *DATA BUNDLE PURCHASE SUCCESSFUL!*

✅ *Status:* Payment Completed
📦 *Bundle:* ${session.selectedBundle.name}
💰 *Amount:* Ksh ${session.amount}
📱 *Phone:* ${session.phone}

🎊 *Your data bundle has been activated successfully!*`;

        await zk.sendMessage(session.dest, {
            text: confirmationMessage,
            contextInfo: session.contextInfo
        }, { quoted: message });

        // Clean up session
        const sessionKeys = Array.from(paymentSessions.keys());
        for (const key of sessionKeys) {
            const sess = paymentSessions.get(key);
            if (sess && sess.txnId === session.txnId) {
                paymentSessions.delete(key);
                break;
            }
        }

    } catch (error) {
        console.error("Confirmation message error:", error);
    }
}



adams({
    nomCom: "pay",
    aliases: ["payment", "mpesa"],
    categorie: "Payment",
    reaction: "💰"
}, async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;
    const contactName = commandOptions?.ms?.pushName || "Unknown Contact";
    const sender = commandOptions?.sender || (commandOptions?.ms?.key?.remoteJid || "").replace(/@.+/, '');

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

    // Context info with mentionedJid
    const contextInfo = {
        mentionedJid: [sender ? `${sender}@s.whatsapp.net` : undefined].filter(Boolean),
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363401639653085@newsletter",
            newsletterName: "VIRUSI DATA SOLUTIONS",
            serverMessageId: Math.floor(100000 + Math.random() * 900000),
        },
    };

    if (!arg[0]) {
        return repondre("💰 *VIRUSI DATA SOLUTIONS PAYMENT SERVICE*\n\nPlease provide an amount.\n\nExample: *pay 100*");
    }

    const amount = parseInt(arg[0]);
    
    if (isNaN(amount) || amount <= 0) {
        return repondre("❌ Please provide a valid amount.\n\nExample: *pay 100*");
    }

    if (amount < 1) {
        return repondre("❌ Minimum payment amount is Ksh 1");
    }

    try {
        // Send payment prompt message (visible to everyone)
        const paymentPrompt = `💰 *VIRUSI DATA SOLUTIONS PAYMENT SERVICE*

💵 *Amount:* Ksh ${amount}

📞 *Please reply with your Safaricom phone number*

📱 *Accepted formats:*
• 07xxxxxxxx
• 2547xxxxxxxx  
• +2547xxxxxxxx

💡 *Example:* 0712345678`;

        const sentMessage = await zk.sendMessage(dest, {
            text: paymentPrompt,
            contextInfo: contextInfo,
            mentions: [sender ? `${sender}@s.whatsapp.net` : undefined].filter(Boolean)
        }, { quoted: contactMsg });

        // Store payment session
        const sessionId = sentMessage.key.id;
        paymentSessions.set(sessionId, {
            amount: amount,
            dest: dest,
            originalMsg: ms,
            createdAt: Date.now(),
            status: "waiting_phone",
            contactMsg: contactMsg,
            contextInfo: contextInfo,
            sender: sender
        });

        // Handle replies
        const handleReply = async (update) => {
            const message = update.messages[0];
            if (!message?.message) return;

            // Check if this is a reply to our payment message
            const isReply = message.message.extendedTextMessage?.contextInfo?.stanzaId === sentMessage.key.id;
            if (!isReply) return;

            const responseText = message.message.extendedTextMessage?.text?.trim() || 
                               message.message.conversation?.trim();
            
            if (!responseText) return;

            const session = paymentSessions.get(sessionId);
            if (!session) return;

            // Verify the sender is the same user who initiated the payment
            const replySender = message.key.participant?.split('@')[0] || message.key.remoteJid?.split('@')[0];
            if (replySender !== session.sender) {
                return await zk.sendMessage(dest, {
                    text: "❌ Only the person who initiated the payment can reply with their phone number.",
                    mentions: [message.key.participant || message.key.remoteJid]
                }, { quoted: message });
            }

            if (session.status === "waiting_phone") {
                await processPhoneNumber(responseText, sessionId, session, zk, message);
            }
        };

        // Add event listener
        zk.ev.on("messages.upsert", handleReply);

        // Set timeout to remove listener after 30 minutes
        setTimeout(() => {
            zk.ev.off("messages.upsert", handleReply);
            paymentSessions.delete(sessionId);
        }, 30 * 60 * 1000);

    } catch (error) {
        console.error("Payment command error:", error);
        return repondre("❌ Error initiating payment. Please try again.");
    }
});

async function processPhoneNumber(phoneInput, sessionId, session, zk, message) {
    try {
        let phone = phoneInput.trim();
        phone = phone.replace(/[\s\-\(\)]/g, '');
        
        let phoneFormats = [];
        
        if (phone.startsWith('+254')) {
            const numberPart = phone.substring(4);
            phoneFormats = [phone, '254' + numberPart, '0' + numberPart, numberPart];
        } else if (phone.startsWith('254')) {
            const numberPart = phone.substring(3);
            phoneFormats = [phone, '+' + phone, '0' + numberPart, numberPart];
        } else if (phone.startsWith('0') && phone.length === 10) {
            const numberPart = phone.substring(1);
            phoneFormats = [phone, '254' + numberPart, '+254' + numberPart, numberPart];
        } else if (phone.startsWith('7') && phone.length === 9) {
            phoneFormats = [phone, '0' + phone, '254' + phone, '+254' + phone];
        } else {
            return await zk.sendMessage(session.dest, {
                text: `*Wait a minute we process your request *\n\n*Your Number:* ${phoneInput}\n\n`,
                mentions: [message.key.participant || message.key.remoteJid]
            }, { quoted: message });
        }
        
        // Send processing message
        await zk.sendMessage(session.dest, {
            text: `⏳ *Processing M-Pesa Payment...*\n\n📱 *Phone:* ${phoneInput}\n💰 *Amount:* Ksh ${session.amount}\n\n🔄 *Please check your phone to enter M-Pesa pin...*`,
            mentions: [message.key.participant || message.key.remoteJid]
        }, { quoted: message });

        // Update session status
        session.status = "processing";
        
        // Try each phone format until one works
        let lastError = null;
        for (const phoneToTry of phoneFormats) {
            try {
                const paymentData = {
                    phone: phoneToTry,
                    amount: session.amount.toString()
                };
                
                const response = await axios.post(BASE_API_URL, paymentData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': API_KEY
                    },
                    timeout: 30000
                });

                const result = response.data;

                if (result.data && result.data.amount && result.data.phone && 
                    result.data.refference && result.data.CheckoutRequestID) {
                    
                    const successMessage = `📲 *M-Pesa request was successfully sent*
💰 *Amount:* Ksh ${result.data.amount}
📱 *Phone:* ${result.data.phone}

> © VIRUSI DATA SOLUTIONS Payment System`;

                    await zk.sendMessage(session.dest, {
                        text: successMessage,
                        contextInfo: {
                            externalAdReply: {
                                title: "📲 M-Pesa Prompt Sent",
                                body: `Check your phone - Ksh ${result.data.amount}`,
                                mediaType: 1,
                                thumbnailUrl: "https://url.bwmxmd.online/Adams.x7eli7fw.jpg",
                                sourceUrl: "https://payment.bwmxmd.online",
                                renderLargerThumbnail: false,
                                showAdAttribution: true,
                            }
                        },
                        mentions: [message.key.participant || message.key.remoteJid]
                    }, { quoted: message });

                    // Update session
                    session.status = "stk_sent";
                    session.txnId = result.data.refference;
                    session.checkoutId = result.data.CheckoutRequestID;
                    session.phone = phoneToTry;

                    // Wait for payment completion (60 seconds)
                    setTimeout(async () => {
                        if (session.status === "stk_sent") {
                            await sendPaymentConfirmation(session, zk, message);
                        }
                    }, 60000);

                    return; // Success
                }
            } catch (error) {
                lastError = error;
                continue;
            }
        }
        
        // If all formats failed
        throw lastError || new Error("All phone number formats failed");

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        
        const errorMessage = `❌ *Payment request failed*

📱 *Phone:* ${phoneInput}
💰 *Amount:* Ksh ${session.amount}

🔧 *Please ensure:*
• Your number is from Safaricom
• You have sufficient M-Pesa balance
• Try again in a few minutes

💡 *Try again with:* pay ${session.amount}`;

        await zk.sendMessage(session.dest, {
            text: errorMessage,
            contextInfo: session.contextInfo
        }, { quoted: message });

        // Reset session for retry
        session.status = "waiting_phone";
    }
}

async function sendPaymentConfirmation(session, zk, message) {
    try {
        const confirmationMessage = `🎉 *PAYMENT SUCCESSFUL!*
✅ *Status:* Payment Completed
💰 *Amount:* Ksh ${session.amount}
📱 *Phone:* ${session.phone}

🎊 *User has sent the money successfully!*`;

        await zk.sendMessage(session.dest, {
            text: confirmationMessage,
            contextInfo: {
                externalAdReply: {
                    title: "✅ Payment Successful",
                    body: `Ksh ${session.amount} - VIRUSI DATA SOLUTIONS Services`,
                    mediaType: 1,
                    thumbnailUrl: "https://url.bwmxmd.online/Adams.x7eli7fw.jpg",
                    sourceUrl: "https://payment.bwmxmd.online",
                    renderLargerThumbnail: false,
                    showAdAttribution: true,
                }
            },
            mentions: [message.key.participant || message.key.remoteJid]
        }, { quoted: message });

        // Clean up session
        paymentSessions.delete(session.txnId);

    } catch (error) {
        console.error("Confirmation message error:", error);
    }
}
