const { Batch } = require('./models');
async function test() {
  const batches = await Batch.findAll({ limit: 5, order: [['created_at', 'DESC']] });
  console.log(JSON.stringify(batches, null, 2));
}
test().catch(console.error).finally(() => process.exit());
