// express/queue.js
const Queue = require('bull');
const analysisQueue = new Queue('rfp-analysis', 'redis://127.0.0.1:6379');

// Process queue jobs
analysisQueue.process(async (job) => {
    const { rfpText } = job.data;
    
    try {
        // Update progress as each step completes
        job.progress(10);
        const eligibility = await checkLegalEligibility(rfpText);
        
        job.progress(30);
        const documents = await checkDocumentRequirements(rfpText);
        
        job.progress(50);
        const risks = await analyzeContractRisks(rfpText);
        
        job.progress(70);
        const performance = await extractPastPerformanceRequirements(rfpText)
            .then(reqs => checkPastPerformance(reqs));
        
        job.progress(85);
        const budget = await extractBudgetRequirements(rfpText)
            .then(reqs => checkBudgetRequirements(reqs));
        
        job.progress(95);
        const technical = await extractTechnicalRequirements(rfpText)
            .then(reqs => checkTechnicalCapabilities(reqs));
        
        job.progress(100);
        
        return {
            status: 'completed',
            timestamp: new Date().toISOString(),
            results: {
                eligibility,
                document_requirements: documents,
                risk_analysis: {
                    details: risks,
                    summary: generateRiskSummary(risks)
                },
                past_performance: performance,
                budget_analysis: budget,
                technical_analysis: technical
            }
        };
    } catch (error) {
        throw new Error(`Analysis failed: ${error.message}`);
    }
});

module.exports = analysisQueue;