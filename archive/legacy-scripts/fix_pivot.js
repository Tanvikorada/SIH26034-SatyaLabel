const fs = require('fs');

// 1. Add errorMessage to Batch model
let modelsJs = fs.readFileSync('backend/models/index.js', 'utf8');
const targetModel = `    status: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'processing',
      validate: { isIn: [['processing', 'completed', 'failed']] },
    },
  }, {`;
const replaceModel = `    status: {
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
  }, {`;
if (modelsJs.includes(targetModel)) {
  modelsJs = modelsJs.replace(targetModel, replaceModel);
  fs.writeFileSync('backend/models/index.js', modelsJs);
  console.log("Updated Batch model");
}

// 2. Revert scans.js to single pipeline with length check
let scansJs = fs.readFileSync('backend/routes/scans.js', 'utf8');
// I need to replace the entire pipeline block from `const { detectAndCropProducts }` up to the end of the `try {` block
// Since my previous string replacement used a lot of braces, I will use regex or careful indexing.

const startIdx = scansJs.indexOf("const { detectAndCropProducts } = require('../services/crop_service');");
// I'll just write a script to replace the whole body of runBatchPipeline!
