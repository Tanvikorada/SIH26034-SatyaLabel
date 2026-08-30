import re

with open("backend/routes/scans.js", "r", encoding="utf-8") as f:
    js = f.read()

old_logic = """    const productName = fieldsMap.product_name || scan.productNameHint || 'Unknown Product';
    const brandName   = fieldsMap.brand_name   || scan.brandNameHint   || null;
    let product = null;

    if (productName) {
      [product] = await Product.findOrCreate({
        where: { productName },
        defaults: { productName, brandName, category: inferCategory(fieldsMap) },
      });
    }"""

new_logic = """    const productName = fieldsMap.product_name || scan.productNameHint || 'Unknown Product';
    const brandName   = fieldsMap.brand_name   || scan.brandNameHint   || null;
    let product = null;

    if (productName === 'Unknown Product') {
      // Create a unique entry so we don't clump all unknown scans together and inherit old brands (like Diet Coke)
      product = await Product.create({
        productName,
        brandName,
        category: inferCategory(fieldsMap)
      });
    } else if (productName) {
      [product] = await Product.findOrCreate({
        where: { productName },
        defaults: { productName, brandName, category: inferCategory(fieldsMap) },
      });
      
      // Update existing product with new metadata if it was missing
      if (product) {
        let needsUpdate = false;
        if (!product.brandName && brandName) { product.brandName = brandName; needsUpdate = true; }
        if (!product.category && inferCategory(fieldsMap)) { product.category = inferCategory(fieldsMap); needsUpdate = true; }
        if (needsUpdate) await product.save();
      }
    }"""

js = js.replace(old_logic, new_logic)

with open("backend/routes/scans.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Product clumping logic fixed")
