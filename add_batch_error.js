const fs = require('fs');
let js = fs.readFileSync('backend/models/index.js', 'utf8');

js = js.replace(
`    status: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'processing',
      validate: { isIn: [['processing', 'completed', 'failed']] },
    },
  }, {`,
`    status: {
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
  }, {`
);

fs.writeFileSync('backend/models/index.js', js);
console.log("Added errorMessage to Batch!");
