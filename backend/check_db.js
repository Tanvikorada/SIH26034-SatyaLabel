const { Batch } = require('./models');
const { Op } = require('sequelize');

async function test() {
  const batch = await Batch.findOne({ order: [['createdAt', 'DESC']] });
  console.log("Last batch status:", batch.status);
  console.log("Last batch error:", batch.errorMessage);
}
test().catch(console.error).finally(() => process.exit(0));
