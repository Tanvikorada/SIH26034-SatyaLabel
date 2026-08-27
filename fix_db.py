import re

with open('backend/models/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace SQLite connection with Postgres connection
old_conn = "const sequelize = new Sequelize({ dialect: 'sqlite', storage: './test.sqlite', logging: false });"
new_conn = '''
const sequelize = config.db.url 
  ? new Sequelize(config.db.url, { 
      dialect: 'postgres', 
      logging: false, 
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } 
    })
  : new Sequelize(config.db.name, config.db.user, config.db.password, {
      host: config.db.host,
      port: config.db.port,
      dialect: 'postgres',
      logging: false
    });
'''

content = content.replace(old_conn, new_conn.strip())

with open('backend/models/index.js', 'w', encoding='utf-8') as f:
    f.write(content)
