with open('backend/server.js', 'r', encoding='utf-8') as f:
    text = f.read()

injection = """
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config');
if (config.gemini?.apiKey) {
  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Just checking
  // We can fetch models but getGenerativeModel doesn't fetch them.
  // There is no listModels in the simple SDK unless we use fetch directly.
  fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + config.gemini.apiKey)
    .then(res => res.json())
    .then(data => {
       console.log("============== AVAILABLE MODELS ==============");
       if (data.models) {
         data.models.forEach(m => console.log(m.name, m.supportedGenerationMethods));
       } else {
         console.log("No models returned or invalid key:", data);
       }
       console.log("==============================================");
    })
    .catch(err => console.log("Failed to list models:", err));
}
"""

text = text.replace('app.listen(', injection + '\napp.listen(')

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
