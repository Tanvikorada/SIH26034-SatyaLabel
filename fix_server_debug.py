with open('backend/server.js', 'r', encoding='utf-8') as f:
    server = f.read()

if "require('./routes/debug')" not in server:
    server = server.replace("const modelsRouter   = require('./routes/models');", "const modelsRouter   = require('./routes/models');\nconst debugRouter    = require('./routes/debug');")
    server = server.replace("app.use(`${API}/models`,    modelsRouter);", "app.use(`${API}/models`,    modelsRouter);\napp.use(`${API}/debug`,     debugRouter);")

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(server)
