const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgresql://satyalabel:O8P80j7E9XqE5O8wL61N0oFzR0fS9d8v@dpg-cv62u1tds78s73dmv9fg-a.oregon-postgres.render.com/satyalabel_dev_db?sslmode=require', { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } });
sequelize.query('SELECT id, status, "errorMessage", created_at FROM batches ORDER BY created_at DESC LIMIT 5').then(([results]) => {
  console.log(results);
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
