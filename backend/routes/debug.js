const express = require('express');
const router = express.Router();
const config = require('../config');

router.get('/', (req, res) => {
  res.json({
    hasGroqKey: !!config.groq.apiKey,
    hasGeminiKey: !!config.gemini.apiKey,
  });
});

module.exports = router;
