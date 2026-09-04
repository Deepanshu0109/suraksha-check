const axios = require('axios');

// Upgraded to match your current Meta App version
const META_API_VERSION = 'v20.0'; 

exports.sendWhatsAppText = async (toPhone, verdict, explanation) => {
    let emoji = '🟢';
    if (verdict === 'suspicious') emoji = '🟡';
    if (verdict === 'scam') emoji = '🔴';

    const messageBody = `${emoji} *Status: ${verdict.toUpperCase()}*\n\n${explanation}`;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;

    // DEBUG: This will prove if your .env file is actually loading
    console.log(`\n[Debug] Sending to Meta using Token: ${token ? token.substring(0, 15) + '... (Length: ' + token.length + ')' : 'UNDEFINED!'}`);
    console.log(`[Debug] Phone ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID}`);

    try {
        await axios({
            method: 'POST',
            url: `https://graph.facebook.com/${META_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: {
                messaging_product: 'whatsapp',
                to: toPhone,
                type: 'text',
                text: { body: messageBody }
            }
        });
        console.log(`[WhatsApp] Outbound text sent successfully to ${toPhone}`);
    } catch (error) {
        console.error('[WhatsApp] Failed to send text:', error.response?.data || error.message);
    }
};

exports.sendWhatsAppAudio = async (toPhone, audioUrl) => {
    if (!audioUrl) return; 
    
    // NOTE: Meta cannot download audio from "http://localhost:5000". 
    // This audioUrl MUST be your full Cloudflare Tunnel URL.
    const token = process.env.WHATSAPP_ACCESS_TOKEN;

    try {
        await axios({
            method: 'POST',
            url: `https://graph.facebook.com/${META_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: {
                messaging_product: 'whatsapp',
                to: toPhone,
                type: 'audio',
                audio: { link: audioUrl }
            }
        });
        console.log(`[WhatsApp] Native voice note sent to ${toPhone}`);
    } catch (error) {
        console.error('[WhatsApp] Failed to send audio:', error.response?.data || error.message);
    }
};

exports.downloadWhatsAppMedia = async (mediaId) => {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    try {
        const urlResponse = await axios.get(`https://graph.facebook.com/${META_API_VERSION}/${mediaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const mediaResponse = await axios.get(urlResponse.data.url, {
            headers: { 'Authorization': `Bearer ${token}` },
            responseType: 'arraybuffer' 
        });
        
        return Buffer.from(mediaResponse.data);
    } catch (error) {
        console.error('[WhatsApp] Failed to download media:', error.response?.data || error.message);
        return null;
    }
};