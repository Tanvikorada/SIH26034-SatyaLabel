const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const target = `  async function runBatchPipeline(batch, imagePath, metadata = {}) {
    try {
      const { Scan, Product, Violation, Report, Batch } = require('../models');
      const { runOcrPipeline } = require('../services/ocr_service');
      const { extractFields } = require('../services/extraction_service');
      const { validateCompliance } = require('../services/rules_engine');
      const { generateReport } = require('../services/report_service');
      const { generateAIAuditorAnalysis } = require('../services/auditor_service');
  
      console.log('[Pipeline] Starting pipeline for Batch', batch.id);
      const ocrResult = await runOcrPipeline(imagePath, metadata.forceEngine);
  
      if (!ocrResult) {
        await batch.update({ status: 'failed' });
        return;
      }
      
      let productsArray = ocrResult.structuredData?.products || ocrResult.structuredData;
      if (!Array.isArray(productsArray)) {
        productsArray = [productsArray];
      }
      
      let successfulScans = 0;
      for (const rawProductData of productsArray) {
        if (!rawProductData || Object.keys(rawProductData).length === 0) continue;
        
        try {`;

const replace = `  async function runBatchPipeline(batch, imagePath, metadata = {}) {
    try {
      const { Scan, Product, Violation, Report, Batch } = require('../models');
      const { runOcrPipeline } = require('../services/ocr_service');
      const { extractFields } = require('../services/extraction_service');
      const { validateCompliance } = require('../services/rules_engine');
      const { generateReport } = require('../services/report_service');
      const { generateAIAuditorAnalysis } = require('../services/auditor_service');
      const { detectAndCropProducts } = require('../services/crop_service');
  
      console.log('[Pipeline] Starting pipeline for Batch', batch.id);
      
      const imagePaths = await detectAndCropProducts(imagePath);
      let successfulScans = 0;
      
      for (const cropPath of imagePaths) {
        const ocrResult = await runOcrPipeline(cropPath, metadata.forceEngine);
        if (!ocrResult) continue;
        
        let productsArray = ocrResult.structuredData?.products || ocrResult.structuredData;
        if (!Array.isArray(productsArray)) productsArray = [productsArray];
        
        const rawProductData = productsArray[0];
        if (!rawProductData || Object.keys(rawProductData).length === 0) continue;
        
        try {
          const imagePath = cropPath; // Rebind imagePath for any inner scope usage just in case`;

const normalizedTarget = target.replace(/\r\n/g, '\n');
if (js.includes(normalizedTarget)) {
  js = js.replace(normalizedTarget, replace);
} else {
  console.log("Could not find target block to replace.");
}

fs.writeFileSync('backend/routes/scans.js', js);
console.log("Pipeline updated successfully.");
