require('dotenv').config({ path: './backend/.env' });
const { Product } = require('./backend/models');

async function fix() {
  try {
    const products = await Product.findAll({ where: { productName: 'Unknown Product' } });
    for (let p of products) {
      console.log(`Fixing product ${p.id} (was ${p.brandName})`);
      p.brandName = null;
      await p.save();
    }
    console.log("Done fixing DB.");
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
fix();
