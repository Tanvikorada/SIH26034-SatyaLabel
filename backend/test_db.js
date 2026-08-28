const { Scan, Product } = require('./models');
const { Op } = require('sequelize');

async function test() {
  const where = {};
  const productInclude = {
    model: Product,
    as: 'product',
    required: false,
  };

  const { count, rows } = await Scan.findAndCountAll({
    where,
    include: [productInclude],
    order: [['created_at', 'DESC']],
    limit: 20,
    offset: 0,
  });

  console.log("Count:", count);
  console.log("Rows:", rows.length);
}
test().catch(console.error).finally(() => process.exit(0));
