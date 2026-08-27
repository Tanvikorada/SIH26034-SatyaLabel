require('dotenv').config({ path: 'backend/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function check() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const models = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('gemini-1.5-flash OK');
  } catch(e) { console.log('1.5-flash ERR', e.message); }
}
check();
