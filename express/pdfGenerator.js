const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// Simplified but comprehensive PDF generator
async function generateAnalysisPDF(analysisResults) {
    return new Promise((resolve, reject) => {
        try {
            // Create a unique filename
            const filename = `rfp_analysis_${Date.now()}.pdf`;
            const filePath = path.join(uploadsDir, filename);
            
            // Create a new PDF document with simpler settings
            const doc = new PDFDocument({
                margins: { top: 50, bottom: 50, left: 50, right: 50 },
                size: 'A4'
            });
            
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);
            
            // Title page
            doc.fontSize(24).font('Helvetica-Bold').text('RFP Analysis Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).font('Helvetica').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown(2);
            
            // Define a simple function to print each section
            function printSection(title, content) {
                doc.addPage();
                doc.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
                doc.moveDown();
                doc.fontSize(12).font('Helvetica');
                
                // Convert object to string representation
                if (typeof content === 'object') {
                    // For each key in the object
                    Object.keys(content).forEach(key => {
                        const value = content[key];
                        
                        // Skip if null or empty array
                        if (value === null || (Array.isArray(value) && value.length === 0)) {
                            return;
                        }
                        
                        // Format the key as a title
                        doc.fontSize(14).font('Helvetica-Bold').text(formatTitle(key));
                        doc.fontSize(12).font('Helvetica');
                        
                        // Handle different types of values
                        if (typeof value === 'boolean') {
                            doc.text(`${value ? 'Yes' : 'No'}`);
                        } else if (typeof value === 'string' || typeof value === 'number') {
                            doc.text(`${value}`);
                        } else if (Array.isArray(value)) {
                            value.forEach((item, i) => {
                                if (typeof item === 'object') {
                                    Object.keys(item).forEach(itemKey => {
                                        const itemValue = item[itemKey];
                                        if (itemValue !== null && itemValue !== undefined) {
                                            doc.text(`${formatTitle(itemKey)}: ${itemValue}`);
                                        }
                                    });
                                    doc.moveDown(0.5);
                                } else {
                                    doc.text(`• ${item}`);
                                }
                            });
                        } else if (typeof value === 'object') {
                            // Recursively print nested objects with indentation
                            Object.keys(value).forEach(nestedKey => {
                                const nestedValue = value[nestedKey];
                                if (nestedValue !== null && nestedValue !== undefined && 
                                    !(Array.isArray(nestedValue) && nestedValue.length === 0)) {
                                    if (typeof nestedValue === 'object' && !Array.isArray(nestedValue)) {
                                        doc.text(`${formatTitle(nestedKey)}:`);
                                        Object.keys(nestedValue).forEach(deepKey => {
                                            const deepValue = nestedValue[deepKey];
                                            if (deepValue !== null && deepValue !== undefined && 
                                                !(Array.isArray(deepValue) && deepValue.length === 0)) {
                                                doc.text(`  ${formatTitle(deepKey)}: ${formatValue(deepValue)}`, { indent: 20 });
                                            }
                                        });
                                    } else {
                                        doc.text(`${formatTitle(nestedKey)}: ${formatValue(nestedValue)}`);
                                    }
                                }
                            });
                        }
                        
                        doc.moveDown();
                    });
                } else {
                    doc.text(String(content));
                }
            }
            
            // Format keys as titles
            function formatTitle(key) {
                return key
                    .replace(/_/g, ' ')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }
            
            // Format values appropriately
            function formatValue(value) {
                if (value === null || value === undefined) {
                    return 'Not specified';
                } else if (Array.isArray(value)) {
                    return value.join(', ');
                } else if (typeof value === 'object') {
                    return 'Complex Object';
                } else {
                    return String(value);
                }
            }
            
            // Print each section of the analysis
            if (analysisResults.eligibility) {
                printSection('Eligibility Analysis', analysisResults.eligibility);
            }
            
            if (analysisResults.document_requirements) {
                printSection('Document Requirements', analysisResults.document_requirements);
            }
            
            if (analysisResults.risk_analysis) {
                printSection('Risk Analysis', analysisResults.risk_analysis);
            }
            
            if (analysisResults.past_performance) {
                printSection('Past Performance', analysisResults.past_performance);
            }
            
            if (analysisResults.budget_analysis) {
                printSection('Budget Analysis', analysisResults.budget_analysis);
            }
            
            if (analysisResults.technical_analysis) {
                printSection('Technical Analysis', analysisResults.technical_analysis);
            }
            
            // Add table of contents at the beginning
            doc.switchToPage(0);
            doc.moveDown(3);
            doc.fontSize(16).font('Helvetica-Bold').text('Table of Contents');
            doc.fontSize(12).font('Helvetica');
            
            let pageNum = 2; // Starting from page 2 (after title page)
            if (analysisResults.eligibility) {
                doc.text(`Eligibility Analysis - Page ${pageNum++}`);
            }
            if (analysisResults.document_requirements) {
                doc.text(`Document Requirements - Page ${pageNum++}`);
            }
            if (analysisResults.risk_analysis) {
                doc.text(`Risk Analysis - Page ${pageNum++}`);
            }
            if (analysisResults.past_performance) {
                doc.text(`Past Performance - Page ${pageNum++}`);
            }
            if (analysisResults.budget_analysis) {
                doc.text(`Budget Analysis - Page ${pageNum++}`);
            }
            if (analysisResults.technical_analysis) {
                doc.text(`Technical Analysis - Page ${pageNum++}`);
            }
            
            // Finalize the PDF
            doc.end();
            
            stream.on('finish', () => {
                resolve({
                    filename,
                    path: filePath,
                    url: `/download/${filename}`
                });
            });
            
            stream.on('error', (err) => {
                reject(err);
            });
            
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateAnalysisPDF };