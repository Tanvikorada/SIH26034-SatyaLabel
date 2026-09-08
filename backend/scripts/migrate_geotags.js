const { Sequelize } = require('sequelize');
const config = require('../config');

async function migrate() {
  const sequelize = config.db.url 
    ? new Sequelize(config.db.url, { 
        dialect: 'postgres', 
        logging: console.log, 
        dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } 
      })
    : new Sequelize(config.db.name, config.db.user, config.db.password, {
        host: config.db.host,
        port: config.db.port,
        dialect: 'postgres',
        logging: console.log
      });

  try {
    console.log('Adding latitude and longitude to batches...');
    await sequelize.query('ALTER TABLE batches ADD COLUMN latitude FLOAT;');
    await sequelize.query('ALTER TABLE batches ADD COLUMN longitude FLOAT;');
    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed (columns might already exist):', err.message);
  } finally {
    await sequelize.close();
  }
}
migrate();
