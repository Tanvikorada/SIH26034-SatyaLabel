import re

with open("backend/models/index.js", "r", encoding="utf-8") as f:
    js = f.read()

batch_model = """//  TABLE: batches 
// Represents a single image upload that may contain multiple distinct products.
const Batch = sequelize.define('Batch', {
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
}, {
  tableName: 'batches',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

//  TABLE: scans """

js = js.replace("//  TABLE: scans ", batch_model)

scan_update = """  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  batchId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'batches', key: 'id' },
    onDelete: 'CASCADE',
    field: 'batch_id',
  },"""

js = js.replace("""  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },""", scan_update)


associations_old = """User.hasMany(Scan, { foreignKey: 'uploadedBy', as: 'scans' });
Scan.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploadedByUser' });"""

associations_new = """User.hasMany(Scan, { foreignKey: 'uploadedBy', as: 'scans' });
Scan.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploadedByUser' });

Batch.hasMany(Scan, { foreignKey: 'batchId', as: 'scans', onDelete: 'CASCADE' });
Scan.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });

User.hasMany(Batch, { foreignKey: 'uploadedBy', as: 'batches' });
Batch.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploadedByUser' });"""

js = js.replace(associations_old, associations_new)


sync_old = """    await User.sync(options);
    await Product.sync(options);
    await Scan.sync(options);"""

sync_new = """    await User.sync(options);
    await Product.sync(options);
    await Batch.sync(options);
    await Scan.sync(options);"""

js = js.replace(sync_old, sync_new)

exports_old = """  User,
  Product,
  Scan,"""
exports_new = """  User,
  Product,
  Batch,
  Scan,"""
js = js.replace(exports_old, exports_new)

with open("backend/models/index.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Batch model added to index.js")
