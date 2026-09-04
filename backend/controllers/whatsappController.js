const User = require('../models/User');
const Check = require('../models/Check');
const { runRuleBasedCheck } = require('../services/detectionService');
const { runAICheck } = require('../services/aiService');
const { extractTextFromImage } = require('../services/ocrService');
const {
    sendWhatsAppText,
    sendWhatsAppAudio,
    downloadWhatsAppMedia
} = require('../utils/whatsappUtils');
const { generateVoiceNoteUrl } = require('../services/ttsService');

// Webhook Verification
exports.verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (
            mode === 'subscribe' &&
            token === process.env.WHATSAPP_VERIFY_TOKEN
        ) {
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
};

// Handle incoming WhatsApp messages
exports.receiveMessage = async (req, res) => {
    const body = req.body;

    console.log('\n[WEBHOOK] Ping received from Meta!');

    if (body.object === 'whatsapp_business_account') {
        res.sendStatus(200); // Immediately acknowledge receipt

        try {
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {
                const message = body.entry[0].changes[0].value.messages[0];
                const senderPhone = message.from;
                const messageType = message.type;

                let rawText = '';
                let ocrFlag = false;

                // 1. Zero-friction user lookup/creation
                let user = await User.findOne({ phone: senderPhone });

                if (!user) {
                    user = await User.create({
                        phone: senderPhone,
                        role: 'primary'
                    });
                    console.log(`[System] Auto-created new user for ${senderPhone}`);
                }

                // 2. Extract text directly or through OCR
                if (messageType === 'text') {
                    rawText = message.text.body;
                } else if (messageType === 'image') {
                    console.log('[System] Image received, downloading for OCR...');

                    const imageBuffer = await downloadWhatsAppMedia(message.image.id);

                    if (!imageBuffer) {
                        await sendWhatsAppText(
                            senderPhone,
                            'suspicious',
                            'We encountered an error downloading the image. Please try sending it again.'
                        );
                        return;
                    }

                    rawText = await extractTextFromImage(imageBuffer);
                    ocrFlag = true;

                    if (!rawText || rawText.length < 5) {
                        await sendWhatsAppText(
                            senderPhone,
                            'suspicious',
                            'We could not read any clear text in that image. Please ensure the text is legible or type it out.'
                        );
                        return;
                    }

                    console.log(`[OCR] Extracted text: ${rawText.substring(0, 50)}...`);
                } else {
                    console.log(`[WhatsApp] Skipped unsupported message type: ${messageType}`);
                    return;
                }

                // 3. Pipeline Stage 1: Rule-based Check
                let pipelineResult = await runRuleBasedCheck(rawText);

                // 4. Pipeline Stage 2: AI Fallback
                if (pipelineResult.verdict === 'pending') {
                    console.log('[System] Rules missed. Routing to AI...');
                    
                    pipelineResult = await runAICheck(
                        rawText,
                        user.preferredLanguage
                    );
                    pipelineResult.detectionStage = 'ai';
                }

                // 5. Generate Audio FIRST
                const audioUrl = await generateVoiceNoteUrl(
                    pipelineResult.explanation,
                    user.preferredLanguage
                );

                // 6. Save result to database 
                const savedCheck = await Check.create({
                    userId: user._id,
                    source: 'whatsapp',
                    rawText: rawText,
                    ocrUsed: ocrFlag,
                    verdict: pipelineResult.verdict,
                    confidence: pipelineResult.confidence,
                    explanation: pipelineResult.explanation,
                    audioUrl: audioUrl || '', 
                    detectionStage: pipelineResult.detectionStage,
                    language: user.preferredLanguage
                });

                console.log(`\n[Pipeline] Success! Verdict: ${savedCheck.verdict.toUpperCase()}`);

                // 7. Send WhatsApp Text Response
                await sendWhatsAppText(
                    senderPhone,
                    savedCheck.verdict,
                    savedCheck.explanation
                );

                // 8. Send WhatsApp Audio Response
                if (audioUrl) {
                    await sendWhatsAppAudio(senderPhone, audioUrl);
                }
            }
        } catch (error) {
            console.error('Error in webhook pipeline:', error);
        }
    } else {
        res.sendStatus(404);
    }
};