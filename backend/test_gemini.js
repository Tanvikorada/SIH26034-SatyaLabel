require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function check() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("Testing gemini-1.5-flash...");
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    await model.generateContent("hello");
    console.log('gemini-1.5-flash OK');
  } catch(e) { console.log('gemini-1.5-flash ERR', e.message); }

  console.log("Testing gemini-1.5-pro...");
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    await model.generateContent("hello");
    console.log('gemini-1.5-pro OK');
  } catch(e) { console.log('gemini-1.5-pro ERR', e.message); }

  console.log("Testing gemini-pro...");
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    await model.generateContent("hello");
    console.log('gemini-pro OK');
  } catch(e) { console.log('gemini-pro ERR', e.message); }
}
check();
