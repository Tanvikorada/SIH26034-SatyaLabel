const fs = require('fs');
let js = fs.readFileSync('backend/models/index.js', 'utf8');

const target = `    status: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'processing',
      validate: { isIn: [['processing', 'completed', 'failed']] },
    },`;

const replace = `    status: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'processing',
      validate: { isIn: [['processing', 'completed', 'failed']] },
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message',
    },`;

js = js.replace(target, replace);
fs.writeFileSync('backend/models/index.js', js);
console.log("Fixed Batch model!");
