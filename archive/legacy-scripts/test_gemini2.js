require('dotenv').config({ path: 'backend/.env' });
const fs = require('fs');

async function run() {
  const modelName = 'gemini-2.5-flash';
  const apiKey = (await (await fetch('https://satyalabel-backend.onrender.com/api/v1/models')).json()).models[0]?.name ? 'WAIT_NO_I_HAVE_TO_FETCH_IT' : null;
}
