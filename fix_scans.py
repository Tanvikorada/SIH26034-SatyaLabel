with open('backend/routes/scans.js', 'r', encoding='utf-8') as f:
    routes = f.read()

debug_route = '''
// Temporary debug route to list models
router.get('/debug-models', async (req, res) => {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_API_KEY);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
'''

routes = routes.replace('const router = express.Router();', 'const router = express.Router();\n' + debug_route)

with open('backend/routes/scans.js', 'w', encoding='utf-8') as f:
    f.write(routes)
