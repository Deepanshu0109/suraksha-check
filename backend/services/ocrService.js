const Tesseract = require('tesseract.js');

exports.extractTextFromImage = async (imageBuffer) => {
    try {
        console.log('[OCR] Analyzing image... this may take a few seconds.');
        
        // Tesseract accepts a buffer directly. We'll stick to English ('eng') for now, 
        // as most scam SMS/emails in India use English text or English/Hinglish script.
        const result = await Tesseract.recognize(imageBuffer, 'eng', {
            // logger: m => console.log(m) // Uncomment this if you want to see the progress bar in terminal
        });

        // Strip out excessive newlines and whitespace that OCR sometimes hallucinates
        const extractedText = result.data.text.replace(/\s+/g, ' ').trim();
        
        return extractedText;
    } catch (error) {
        console.error('Error during OCR extraction:', error);
        return null; // Return null so the pipeline knows it failed and can handle it gracefully
    }
};