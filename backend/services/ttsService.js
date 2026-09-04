const googleTTS = require('google-tts-api');

exports.generateVoiceNoteUrl = (text, language = 'hi') => {
    try {
        // google-tts-api limits single requests to 200 characters.
        // Since your AI prompt strictly limits explanations to 2 simple sentences, 
        // this fits perfectly within the limit.
        const url = googleTTS.getAudioUrl(text, {
            lang: language,
            slow: false,
            host: 'https://translate.google.com',
        });
        
        return url;
    } catch (error) {
        console.error('Error generating TTS URL:', error);
        return null; // Graceful degradation: if TTS fails, we still send the text
    }
};