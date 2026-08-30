import re

with open("backend/models/index.js", "r", encoding="utf-8") as f:
    js = f.read()

# 1. Insert Batch model before Scan
batch_model = """// ── TABLE: batches ────────────────────────────────────────────────────────────
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

// ─── TABLE: scans """

js = js.replace("// ─── TABLE: scans ", batch_model)

# 2. Add batchId to Scan
scan_def = """const Scan = sequelize.define('Scan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },"""
scan_def_new = """const Scan = sequelize.define('Scan', {
  id: {
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
js = js.replace(scan_def, scan_def_new)

# 3. Add associations
assoc_old = """User.hasMany(Scan, { foreignKey: 'uploadedBy', as: 'scans' });
Scan.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploadedByUser' });"""

assoc_new = """User.hasMany(Scan, { foreignKey: 'uploadedBy', as: 'scans' });
Scan.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploadedByUser' });

Batch.hasMany(Scan, { foreignKey: 'batchId', as: 'scans', onDelete: 'CASCADE' });
Scan.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });

User.hasMany(Batch, { foreignKey: 'uploadedBy', as: 'batches' });
Batch.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploadedByUser' });"""
js = js.replace(assoc_old, assoc_new)

# 4. Add to sync
sync_old = """    await User.sync(options);
    await Product.sync(options);
    await Scan.sync(options);"""
sync_new = """    await User.sync(options);
    await Product.sync(options);
    await Batch.sync(options);
    await Scan.sync(options);"""
js = js.replace(sync_old, sync_new)

# 5. Add to exports
exp_old = """  User,
  Product,
  Scan,"""
exp_new = """  User,
  Product,
  Batch,
  Scan,"""
js = js.replace(exp_old, exp_new)

with open("backend/models/index.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Batch schema injected successfully.")
