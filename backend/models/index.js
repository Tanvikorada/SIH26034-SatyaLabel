// backend/models/index.js
// ============================================================
// Sequelize ORM — Database Models
// Schema matches 03_DATABASE_SCHEMA.md exactly (SIH26034)
// ============================================================

const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'postgres',
  logging: config.server.nodeEnv === 'development' ? false : false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
});

// ─── TABLE: users ─────────────────────────────────────────────────────────────
// Enforcement officers and admins
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.TEXT, allowNull: false },
  email: { type: DataTypes.TEXT, allowNull: false, unique: true },
  passwordHash: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'password_hash',
  },
  role: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'officer',
    validate: { isIn: [['admin', 'officer']] },
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

// ─── TABLE: products ──────────────────────────────────────────────────────────
// One row per unique product — can have multiple scans over time.
// Created/found when a scan is first submitted for a product.
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  productName: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'product_name',
  },
  brandName: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'brand_name',
  },
  category: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'e.g. food, pharma, cosmetics, household — inferred from OCR/FSSAI presence',
  },
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

// ─── TABLE: scans ─────────────────────────────────────────────────────────────
// One row per image scan event.
const Scan = sequelize.define('Scan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // ── Foreign Keys ──────────────────────────────────────────────────────────
  productId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'products', key: 'id' },
    field: 'product_id',
    comment: 'Set after OCR extracts the product name and finds/creates a product record',
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' },
    field: 'uploaded_by',
    comment: 'Null in demo/anonymous mode',
  },

  // ── Image & OCR ────────────────────────────────────────────────────────────
  imagePath: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'image_path',
  },
  originalFilename: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'original_filename',
  },
  sourceType: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'physical_label',
    field: 'source_type',
    validate: { isIn: [['physical_label', 'ecommerce_listing']] },
    comment: 'physical_label (default) or ecommerce_listing (Rule 6(10) applies)',
  },

  // ── Processing Status ─────────────────────────────────────────────────────
  status: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'processing',
    validate: { isIn: [['processing', 'complete', 'failed']] },
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message',
    comment: 'Set if status=failed',
  },

  // ── OCR output ────────────────────────────────────────────────────────────
  ocrRawText: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'ocr_raw_text',
  },

  // ── JSONB extracted fields (spec 03 §extracted_fields) ─────────────────────
  // Stores all OCR-extracted declarations as flexible key-value JSON.
  // No rigid column-per-field — accommodates whatever OCR returns.
  // Schema: { manufacturer_name, manufacturer_address, product_name, brand_name,
  //           net_quantity, mrp, mfg_date, best_before, customer_care,
  //           batch_lot_number, fssai_license, ingredients, country_of_origin, ... }
  extractedFields: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'extracted_fields',
  },

  // ── Compliance result (spec 03 §overall_compliance) ───────────────────────
  // 'compliant'     = zero fail violations
  // 'needs_review'  = only estimated_fail violations (no hard fails)
  // 'non_compliant' = any hard fail violation found
  overallCompliance: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'overall_compliance',
    validate: { isIn: [['compliant', 'non_compliant', 'needs_review']] },
  },

  // ── Dashboard metrics (not in spec 03 but needed for aggregation) ─────────
  ocrEngineUsed: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'tesseract',
    field: 'ocr_engine_used',
  },
  ocrConfidenceAvg: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'ocr_confidence_avg',
    comment: 'Average Tesseract word confidence (0–100)',
  },
  complianceScore: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'compliance_score',
    comment: '% of rules passed (0–100)',
  },
  totalRulesChecked: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'total_rules_checked',
  },
  totalViolations: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'total_violations',
  },
  highViolations: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'high_violations',
    comment: 'Count of severity=high violations',
  },
}, {
  tableName: 'scans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['status'] },
    { fields: ['overall_compliance'] },
    { fields: ['created_at'] },
  ],
});

// ─── TABLE: violations ────────────────────────────────────────────────────────
// One row per rule check result (fail or estimated_fail) per scan.
// Schema exactly matches spec 03_DATABASE_SCHEMA.md.
const Violation = sequelize.define('Violation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  scanId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'scans', key: 'id' },
    onDelete: 'CASCADE',
    field: 'scan_id',
  },

  // ── Rule identification (spec 02 + 03) ─────────────────────────────────────
  ruleId: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'rule_id',
    comment: 'e.g. "Rule 6(1)(c)" — exact citation from LM(PC) Rules 2011',
  },
  ruleTitle: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'rule_title',
  },

  // ── Check outcome ─────────────────────────────────────────────────────────
  // 'fail'           = definite, hard violation
  // 'estimated_fail' = image-based approximation (font size, PDP)
  // 'pass'           = rule satisfied (stored for audit trail)
  status: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { isIn: [['fail', 'estimated_fail', 'pass']] },
  },

  // ── Finding detail ────────────────────────────────────────────────────────
  affectedField: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'field',
    comment: 'Which extracted field this check relates to',
  },
  severity: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: { isIn: [['high', 'medium', 'low', null]] },
    comment: 'null for pass results',
  },
  detail: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // ── Confidence (spec 02 key differentiator) ───────────────────────────────
  // 'high'      = presence/pattern check — reliable
  // 'estimated' = image analysis (font/PDP) — approximate
  confidence: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'high',
    validate: { isIn: [['high', 'estimated']] },
  },
}, {
  tableName: 'violations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['scan_id'] },
  ],
});

// ─── TABLE: reports ───────────────────────────────────────────────────────────
// Generated PDF reports — decoupled from scans table per spec 03.
const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  scanId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'scans', key: 'id' },
    onDelete: 'CASCADE',
    field: 'scan_id',
  },
  filePath: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'file_path',
  },
  generatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' },
    field: 'generated_by',
  },
}, {
  tableName: 'reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

// ─── ASSOCIATIONS ─────────────────────────────────────────────────────────────
User.hasMany(Scan, { foreignKey: 'uploadedBy', as: 'scans' });
Scan.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploadedByUser' });

Product.hasMany(Scan, { foreignKey: 'productId', as: 'scans' });
Scan.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Scan.hasMany(Violation, { foreignKey: 'scanId', as: 'violations', onDelete: 'CASCADE' });
Violation.belongsTo(Scan, { foreignKey: 'scanId', as: 'scan' });

Scan.hasMany(Report, { foreignKey: 'scanId', as: 'reports', onDelete: 'CASCADE' });
Report.belongsTo(Scan, { foreignKey: 'scanId', as: 'scan' });

User.hasMany(Report, { foreignKey: 'generatedBy', as: 'generatedReports' });
Report.belongsTo(User, { foreignKey: 'generatedBy', as: 'generatedByUser' });

// ─── INDEX RAW SQL (applied after sync) ───────────────────────────────────────
// These match the exact index definitions from spec 03.
const INDEXES_SQL = [
  'CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status)',
  'CREATE INDEX IF NOT EXISTS idx_scans_compliance ON scans(overall_compliance)',
  'CREATE INDEX IF NOT EXISTS idx_violations_scan_id ON violations(scan_id)',
  'CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC)',
];

// ─── SYNC HELPER ─────────────────────────────────────────────────────────────
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established');

    // Sync tables in dependency order
    await User.sync(options);
    await Product.sync(options);
    await Scan.sync(options);
    await Violation.sync(options);
    await Report.sync(options);

    // Apply raw indexes from spec 03
    for (const sql of INDEXES_SQL) {
      await sequelize.query(sql).catch(() => {}); // Ignore if already exists
    }

    console.log('✅ Database tables synced (schema v03)');
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Product,
  Scan,
  Violation,
  Report,
  syncDatabase,
};
