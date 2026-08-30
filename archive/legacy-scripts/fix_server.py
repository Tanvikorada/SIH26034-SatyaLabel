with open('backend/server.js', 'r', encoding='utf-8') as f:
    server = f.read()

server = server.replace("const rulesRouter    = require('./routes/rules');", "const rulesRouter    = require('./routes/rules');\nconst modelsRouter   = require('./routes/models');")
server = server.replace("app.use(`${API}/scans`,     scansRouter);", "app.use(`${API}/scans`,     scansRouter);\napp.use(`${API}/models`,    modelsRouter);")

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(server)
