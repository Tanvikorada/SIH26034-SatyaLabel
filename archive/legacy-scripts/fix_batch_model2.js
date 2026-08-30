const fs = require('fs');
let js = fs.readFileSync('backend/models/index.js', 'utf8');

const regex = /const Batch = sequelize\.define\('Batch', \{[\s\S]*?status: \{[\s\S]*?\},/m;
const match = js.match(regex);

if (match) {
  const insert = `\n    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message',
    },`;
  js = js.replace(match[0], match[0] + insert);
  fs.writeFileSync('backend/models/index.js', js);
  console.log("Fixed batch model!");
} else {
  console.log("Target not found!");
}
