const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({ dialect: 'sqlite', storage: 'backend/satyalabel.sqlite' });

const Batch = sequelize.define('Batch', {
  status: DataTypes.STRING,
  errorMessage: { type: DataTypes.TEXT, field: 'error_message' },
}, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

Batch.findAll({ order: [['created_at', 'DESC']], limit: 1 })
  .then(b => console.log(JSON.stringify(b[0], null, 2)))
  .catch(console.error);
