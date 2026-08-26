const express = require('express');
const router = express.Router();
const config = require('../config');
const Groq = require('groq-sdk');

router.get('/', async (req, res) => {
  try {
    const groq = new Groq({ apiKey: config.groq.apiKey });
    const dummyBase64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACv/aAAgBAQABPxA=";
    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      messages: [{ role: "user", content: [{ type: "text", text: "What is this?" }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${dummyBase64}` } }] }],
      temperature: 0.1, max_tokens: 10,
    });
    res.json({ success: true, result: completion.choices[0]?.message?.content });
  } catch(e) {
    res.json({ success: false, error: e.message });
  }
});

module.exports = router;
