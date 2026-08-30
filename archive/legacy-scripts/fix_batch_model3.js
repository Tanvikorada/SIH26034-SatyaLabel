const fs = require('fs');
let js = fs.readFileSync('backend/models/index.js', 'utf8');

const regex = /const Batch = sequelize\.define\('Batch', \{[\s\S]*?\}, \{\s*tableName: 'batches'/;
const newBatch = `const Batch = sequelize.define('Batch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' },
    field: 'uploaded_by',
  },
  originalImage: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'original_image',
  },
  status: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'processing',
    validate: { isIn: [['processing', 'completed', 'failed']] },
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message',
  },
}, {
  tableName: 'batches'`;

js = js.replace(regex, newBatch);
fs.writeFileSync('backend/models/index.js', js);
console.log("Fixed batch model correctly!");
