const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_KEY"); // wait we need the key

// I can't easily list models if I don't have the key locally.
