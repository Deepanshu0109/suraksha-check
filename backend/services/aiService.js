const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.runAICheck = async (messageText, language = 'hi') => {
    try {
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-3.1-flash-lite',
            generationConfig: { 
                responseMimeType: 'application/json' 
            }
        });

        const prompt = `
        You are a cybersecurity expert analyzing WhatsApp messages for elderly Indian users.
        Analyze the following text message and classify it based on these strict rules:

        CRITICAL CLASSIFICATION RULES:
        1. "scam": Use this ONLY for 100% verified fraud. This includes malicious URLs, explicit phishing (fake bank KYC, electricity disconnection threats), fake lotteries, or OTP stealing. 
        2. "suspicious": Use this for social engineering and impersonation. Examples: "Hi Mom", "I am your nephew", "My phone broke". Any urgent request for money (UPI, recharge) from an unknown number WITHOUT malicious links falls here. *You must mark these as suspicious because an AI cannot know the user's real family members. Human verification is required.*
        3. "safe": Normal informational messages, housing society updates, general chat, no requests for money or personal data.

        Return ONLY a valid JSON object with these exact keys:
        - "verdict": strictly one of ["safe", "suspicious", "scam"]
        - "confidence": integer between 0 and 100
        - "explanation": Exactly 2 simple, plain-language sentences explaining why, translated into the language code: ${language}. Do not use technical jargon like "phishing" or "malware".

        Text to analyze: "${messageText}"
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        return JSON.parse(responseText);

    } catch (error) {
        console.error('Error in AI fallback check:', error);
        // Fail safely if the API goes down
        return {
            verdict: 'suspicious', 
            confidence: 50,
            explanation: 'We are unable to fully verify this message right now. Please do not click any links until you check with your family.'
        };
    }
};