const express = require('express');
const router = express.Router();
const config = require('../config');
const Groq = require('groq-sdk');

router.get('/', async (req, res) => {
  try {
    const groq = new Groq({ apiKey: config.groq.apiKey });
    const models = await groq.models.list();
    res.json({ models: models.data.map(m => m.id) });
  } catch(e) {
    res.json({ success: false, error: e.message });
  }
});

module.exports = router;
