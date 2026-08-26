const express = require('express');
const router = express.Router();
const config = require('../config');
const Groq = require('groq-sdk');
const fs = require('fs');

router.get('/', async (req, res) => {
  try {
    const groq = new Groq({ apiKey: config.groq.apiKey });
    
    // Create a 1x1 black jpeg in base64
    const dummyBase64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACv/aAAgBAQABPxA=";
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.2-90b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What is this?" },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${dummyBase64}` } }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 1024,
    });

    res.json({ success: true, message: completion.choices[0]?.message?.content });
  } catch(e) {
    res.json({ success: false, error: e.message, name: e.name, stack: e.stack });
  }
});

module.exports = router;
