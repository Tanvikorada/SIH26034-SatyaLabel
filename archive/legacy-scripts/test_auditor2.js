const { generateAIAuditorAnalysis } = require('./backend/services/auditor_service');
const config = require('./backend/config');

console.log("Groq enabled:", config.groq.enabled, "Key starts with:", config.groq.apiKey ? config.groq.apiKey.substring(0,5) : "null");
