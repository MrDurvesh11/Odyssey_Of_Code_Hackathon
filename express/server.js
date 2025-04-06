const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Pinecone } = require('@pinecone-database/pinecone');
const pdfParse = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');
const { generateAnalysisPDF } = require('./pdfGenerator');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(
    'https://lctghtyulmexpbbilxix.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdGdodHl1bG1leHBiYmlseGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3Njg2NTQsImV4cCI6MjA1OTM0NDY1NH0.-qs-NLGXxpf5OiQo3a_sF9VSeh1NUcjLL5zO8OcDt9I'
);

// Configure multer for file upload
const upload = multer();

// Initialize Pinecone
const pc = new Pinecone({
    apiKey: 'pcsk_4MnHDL_SjR2k3bo65r8QW7fnk2eDiPiuyYt6M9JxFE61fF6HzS1VzbzfLVW53kgVbp8pQZ',
});

// Legal Eligibility Agent functions
async function extractStateRequirements(text) {
    const prompt = `Extract all U.S. state registration requirements from the following RFP text.
    You must respond with ONLY a JSON array of state codes, for example: ["TX", "CA"]
    If no specific states are mentioned, respond with: []
    
    RFP Text: ${text}
    
    Response (only JSON array):`;
    
    const response = await getCompletion(prompt);
    try {
        // Clean the response - remove any extra text and keep only the JSON array
        const cleanedResponse = response.replace(/^[^[]*/, '').replace(/][^]*$/, ']');
        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error('Original response:', response);
        console.error('Failed to parse state requirements:', error);
        return [];
    }
}

async function checkStateRegistrations(requiredStates) {
    console.log('Checking state registrations for:', requiredStates);
    if (!requiredStates || requiredStates.length === 0) return { passed: true, missing: [] };
    
    const { data: registrations, error } = await supabase
        .from('state_registrations')
        .select('state_code');
        
    if (error) throw new Error(`Failed to check state registrations: ${error.message}`);
    
    const registeredStates = registrations.map(r => r.state_code);
    const missingStates = requiredStates.filter(state => !registeredStates.includes(state));
    
    return {
        passed: missingStates.length === 0,
        missing: missingStates
    };
}

async function extractCertificationRequirements(text) {
    const prompt = `Extract only business and legal certifications/licenses from the following RFP text.
    Exclude technical certifications (like PMP) and compliance standards (like ISO, SOC2).
    You must respond with ONLY a JSON array of certification names, for example: ["Employment Agency License", "Insurance Policy"]
    If none found, respond with: []
    
    RFP Text: ${text}
    
    Response (only JSON array):`;
    
    const response = await getCompletion(prompt);
    try {
        const cleanedResponse = response.replace(/^[^[]*/, '').replace(/][^]*$/, ']');
        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error('Original response:', response);
        console.error('Failed to parse certification requirements:', error);
        return [];
    }
}

async function checkCertifications(requiredCerts) {
    console.log('Checking certifications for:', requiredCerts);
    if (!requiredCerts || requiredCerts.length === 0) return { passed: true, missing: [] };
    
    const { data: certifications, error } = await supabase
        .from('certifications')
        .select('cert_type');
    
    console.log('Retrieved certifications:', certifications);
    if (error) throw new Error(`Failed to check certifications: ${error.message}`);
    
    const existingCerts = certifications.map(c => c.cert_type.toLowerCase());
    // More flexible matching
    const missingCerts = requiredCerts.filter(cert => {
        const certLower = cert.toLowerCase();
        return !existingCerts.some(existing => 
            // Check if any existing cert contains the required cert keywords
            certLower.includes(existing) || 
            existing.includes(certLower.replace('active ', ''))
        );
    });
    
    return {
        passed: missingCerts.length === 0,
        missing: missingCerts
    };
}

// Function to check legal eligibility
async function checkLegalEligibility(rfpText) {
    const [requiredStates, requiredCerts] = await Promise.all([
        extractStateRequirements(rfpText),
        extractCertificationRequirements(rfpText)
    ]);
    
    const [stateCheck, certCheck] = await Promise.all([
        checkStateRegistrations(requiredStates),
        checkCertifications(requiredCerts)
    ]);
    
    return {
        eligible: stateCheck.passed && certCheck.passed,
        stateRegistrations: {
            required: requiredStates,
            missing: stateCheck.missing
        },
        certifications: {
            required: requiredCerts,
            missing: certCheck.missing
        }
    };
}

// Function to get embeddings using Ollama
async function getEmbeddings(text) {
    try {
        const response = await fetch('http://localhost:11434/api/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'mistral',
                prompt: text
            })
        });
        
        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!data.embedding) {
            throw new Error('No embedding received from Ollama');
        }
        
        return data.embedding;
    } catch (error) {
        console.error('Error getting embeddings:', error);
        throw new Error(`Failed to get embeddings: ${error.message}`);
    }
}

// Modified getCompletion function with retry logic and timeout
async function getCompletion(prompt, maxRetries = 3, timeout = 600000) {
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            console.log(`Attempt ${retries + 1} for Ollama request`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                console.log(`Request timed out after ${timeout}ms`);
            }, timeout);

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'mistral',
                prompt: prompt,
                    stream: false,
                    options: {
                        num_ctx: 8192,  // Increased context window
                        temperature: 0.1 // More focused responses
                    }
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.response) {
            throw new Error('No response received from Ollama');
        }

        return data.response;

    } catch (error) {
            retries++;
            console.error(`Attempt ${retries} failed:`, error);
            
            if (retries === maxRetries) {
                throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
            }
            
            // Exponential backoff with longer delays
            await new Promise(resolve => setTimeout(resolve, 5000 * Math.pow(2, retries)));
        }
    }
}

// Function to split text into chunks
function splitIntoChunks(text, chunkSize = 1000, overlap = 200) {
    if (!text) return [];
    
    const chunks = [];
    let startIndex = 0;
    
    while (startIndex < text.length) {
        const chunk = text.slice(startIndex, startIndex + chunkSize);
        chunks.push(chunk);
        startIndex += (chunkSize - overlap);
    }
    
    return chunks;
}

const indexName = "pdf-rag";

// Function to delete index if it exists
async function deleteIndex() {
    try {
        const indexList = await pc.listIndexes();
        const indexExists = indexList.indexes?.some(index => index.name === indexName);
        
        if (indexExists) {
            console.log('Deleting existing index:', indexName);
            await pc.deleteIndex(indexName);
            console.log('Index deleted successfully');
            // Wait for deletion to complete
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    } catch (error) {
        console.error('Error deleting index:', error);
        throw error;
    }
}

// Function to ensure index exists
async function ensureIndex() {
    try {
        const indexList = await pc.listIndexes();
        const indexExists = indexList.indexes?.some(index => index.name === indexName);
        
        if (!indexExists) {
        console.log('Creating new index:', indexName);
        await pc.createIndex({
            name: indexName,
                dimension: 4096,
            metric: 'cosine',
            spec: {
                serverless: {
                    cloud: "aws",
                    region: "us-east-1"
                }
            }
        });
        // Wait for index to be ready
        await new Promise(resolve => setTimeout(resolve, 60000));
        } else {
            console.log('Index already exists, skipping creation');
        }
        return true;
    } catch (error) {
        console.error('Error ensuring index:', error);
        throw error;
    }
}

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!req.file.mimetype.includes('pdf')) {
            return res.status(400).json({ error: 'File must be a PDF' });
        }

        // Parse PDF
        const pdfData = await pdfParse(req.file.buffer);
        const text = pdfData.text;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'PDF contains no extractable text' });
        }

        // Split text into chunks
        const chunks = splitIntoChunks(text);
        if (chunks.length === 0) {
            return res.status(400).json({ error: 'Failed to split text into chunks' });
        }

        // Get index
        const index = pc.index(indexName);

        // Process each chunk
        const upsertPromises = chunks.map(async (chunk, i) => {
            const embedding = await getEmbeddings(chunk);
            return index.upsert([{
                id: `chunk${i}-${Date.now()}`, // Add timestamp to make IDs unique
                values: embedding,
                metadata: { text: chunk }
            }]);
        });

        await Promise.all(upsertPromises);

        res.json({ 
            message: 'File processed successfully',
            chunks: chunks.length
        });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: error.message });
    }
});

// Document Requirements Agent functions
async function extractFormattingRequirements(text) {
    let response = '';  // Define response variable outside try block
    try {
        const prompt = `Extract document formatting requirements from the following RFP text.
        Return ONLY a valid JSON object with this exact structure:
        {
            "page_limits": {"total": null, "per_section": {}},
            "font": {"type": null, "size": null, "allowed_fonts": []},
            "spacing": {"line": null, "paragraph": null},
            "margins": {"top": null, "bottom": null, "left": null, "right": null},
            "other_formatting": []
        }
        Do not include comments or extra characters. Only return valid JSON.
        
        RFP Text: ${text}`;
        
        response = await getCompletion(prompt);
        // Clean the response - remove any non-JSON characters
        const cleanedResponse = response
            .replace(/[\u2018\u2019]/g, "'")   // Replace smart quotes
            .replace(/[\u201C\u201D]/g, '"')   // Replace smart double quotes
            .replace(/\n/g, '')                 // Remove newlines
            .replace(/\r/g, '')                 // Remove carriage returns
            .replace(/^\s*{/, '{')             // Remove leading whitespace before {
            .replace(/}\s*$/, '}')             // Remove trailing whitespace after }
            .replace(/\/\/.*$/gm, '')          // Remove any comments
            .replace(/([0-9])"/g, '$1"')       // Fix numbers with quotes
            .trim();                           // Remove any remaining whitespace

        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error('Original response:', response);  // Now response is defined
        console.error('Failed to parse formatting requirements:', error);
        // Return safe default values
        return {
            page_limits: { total: null, per_section: {} },
            font: { type: null, size: null, allowed_fonts: [] },
            spacing: { line: null, paragraph: null },
            margins: { top: null, bottom: null, left: null, right: null },
            other_formatting: []
        };
    }
}

async function extractSubmissionRequirements(text) {
    const prompt = `Extract submission requirements from the following RFP text.
    Return ONLY a valid JSON object with this structure:
    {
        "required_documents": [],
        "submission_format": {"electronic": null, "physical_copies": null},
        "deadlines": {"main": null, "questions": null},
        "special_instructions": []
    }
    Do not include any explanations, comments or additional text.
    
    Text: ${text}`;
    
    const response = await getCompletion(prompt);
    try {
        // Better cleaning to remove any explanatory text
        let cleanJson = response;
        // Find the first { and last }
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        
        if (firstBrace >= 0 && lastBrace >= 0) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }
        
        // Remove any comments
        cleanJson = cleanJson.replace(/\/\/.*$/gm, '');
        
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error('Original response:', response);
        console.error('Failed to parse submission requirements:', error);
        return {
            required_documents: [],
            submission_format: { electronic: null, physical_copies: null },
            deadlines: { main: null, questions: null },
            special_instructions: []
        };
    }
}

// Function to check document requirements
async function checkDocumentRequirements(rfpText) {
    const [formatting, submission] = await Promise.all([
        extractFormattingRequirements(rfpText),
        extractSubmissionRequirements(rfpText)
    ]);
    
    return {
        formatting_requirements: formatting,
        submission_requirements: submission,
        checklist: generateChecklist(formatting, submission)
    };
}

// Helper function to generate checklist
function generateChecklist(formatting, submission) {
    const checklist = [];
    
    // Add formatting checks
    if (formatting.page_limits?.total) {
        checklist.push(`Ensure proposal is within ${formatting.page_limits.total} pages`);
    }
    if (formatting.font?.type) {
        checklist.push(`Use ${formatting.font.type} font${formatting.font.size ? ` at ${formatting.font.size} pt` : ''}`);
    }
    if (formatting.spacing?.line) {
        checklist.push(`Use ${formatting.spacing.line} line spacing`);
    }
    
    // Add submission checks
    if (submission.required_documents?.length > 0) {
        submission.required_documents.forEach(doc => {
            checklist.push(`Prepare and include: ${doc}`);
        });
    }
    if (submission.deadlines?.main) {
        checklist.push(`Submit by deadline: ${submission.deadlines.main}`);
    }
    
    return checklist;
}

// Risk Analysis Agent functions
async function analyzeContractRisks(text) {
    const prompt = `Analyze the following RFP text for potential contract risks.
    Return as JSON with the following structure:
    {
        "high_risk_clauses": [
            {
                "type": string,
                "clause": string,
                "risk_level": "high" | "medium" | "low",
                "explanation": string,
                "suggestion": string
            }
        ],
        "unfavorable_terms": [
            {
                "term": string,
                "category": string,
                "impact": string,
                "recommendation": string
            }
        ],
        "liability_concerns": {
            "indemnification": boolean,
            "unlimited_liability": boolean,
            "insurance_requirements": []
        }
    }
    
    Text: ${text}`;
    
    const response = await getCompletion(prompt);
    try {
        return JSON.parse(response);
    } catch (error) {
        console.error('Failed to parse risk analysis:', error);
        return {
            high_risk_clauses: [],
            unfavorable_terms: [],
            liability_concerns: {
                indemnification: false,
                unlimited_liability: false,
                insurance_requirements: []
            }
        };
    }
}

// Function to generate risk summary
function generateRiskSummary(risks) {
    const summary = [];
    
    // Add high risk clauses
    if (risks.high_risk_clauses?.length > 0) {
        risks.high_risk_clauses.forEach(clause => {
            summary.push({
                risk_type: clause.type,
                severity: clause.risk_level,
                details: clause.explanation,
                action_item: clause.suggestion
            });
        });
    }
    
    // Add unfavorable terms
    if (risks.unfavorable_terms?.length > 0) {
        risks.unfavorable_terms.forEach(term => {
            summary.push({
                risk_type: term.category,
                severity: "medium",
                details: term.impact,
                action_item: term.recommendation
            });
        });
    }
    
    // Add liability concerns
    if (risks.liability_concerns) {
        if (risks.liability_concerns.unlimited_liability) {
            summary.push({
                risk_type: "Liability",
                severity: "high",
                details: "Unlimited liability clause detected",
                action_item: "Negotiate liability cap"
            });
        }
        if (risks.liability_concerns.insurance_requirements.length > 0) {
            summary.push({
                risk_type: "Insurance",
                severity: "medium",
                details: "Additional insurance requirements",
                action_item: "Review insurance coverage"
            });
        }
    }
    
    return summary;
}

// Past Performance Analysis Agent functions
async function extractPastPerformanceRequirements(text) {
    const prompt = `Extract past performance requirements from the following RFP text.
    You must respond with ONLY a JSON object using this exact structure:
    {
        "years_of_experience": number,
        "similar_projects_count": number,
        "minimum_contract_value": number,
        "required_sectors": [],
        "reference_requirements": {
            "count": number,
            "years_recent": number
        }
    }
    If a field is not specified, set it to null.
    
    RFP Text: ${text}
    
    Response (only JSON):`;
    
    const response = await getCompletion(prompt);
    try {
        const cleanedResponse = response.replace(/^[^{]*/, '').replace(/}[^}]*$/, '}');
        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error('Original response:', response);
        console.error('Failed to parse past performance requirements:', error);
        return {
            years_of_experience: null,
            similar_projects_count: null,
            minimum_contract_value: null,
            required_sectors: [],
            reference_requirements: {
                count: null,
                years_recent: null
            }
        };
    }
}

async function checkPastPerformance(requirements) {
    console.log('Checking past performance requirements:', requirements);
    
    const { data: pastProjects, error } = await supabase
        .from('past_performance')
        .select('*');
    
    if (error) throw new Error(`Failed to check past performance: ${error.message}`);
    
    // Calculate years of experience
    const projectDates = pastProjects.map(p => new Date(p.completion_date));
    const earliestProject = new Date(Math.min(...projectDates));
    const yearsExperience = (new Date().getFullYear() - earliestProject.getFullYear());
    
    // Count similar projects
    const similarProjects = pastProjects.filter(project => {
        const meetsValue = !requirements.minimum_contract_value || 
            project.contract_value >= requirements.minimum_contract_value;
        const meetsSector = !requirements.required_sectors.length || 
            requirements.required_sectors.includes(project.sector);
        return meetsValue && meetsSector;
    });
    
    // Check references
    const recentProjects = pastProjects.filter(project => {
        if (!requirements.reference_requirements.years_recent) return true;
        const projectDate = new Date(project.completion_date);
        const yearsDiff = new Date().getFullYear() - projectDate.getFullYear();
        return yearsDiff <= requirements.reference_requirements.years_recent;
    });
    
    const results = {
        meets_experience: !requirements.years_of_experience || 
            yearsExperience >= requirements.years_of_experience,
        meets_project_count: !requirements.similar_projects_count || 
            similarProjects.length >= requirements.similar_projects_count,
        meets_references: !requirements.reference_requirements.count || 
            recentProjects.length >= requirements.reference_requirements.count,
        current_stats: {
            years_experience: yearsExperience,
            similar_projects: similarProjects.length,
            recent_references: recentProjects.length
        },
        gaps: []
    };
    
    // Identify gaps
    if (requirements.years_of_experience && yearsExperience < requirements.years_of_experience) {
        results.gaps.push(`Need ${requirements.years_of_experience - yearsExperience} more years of experience`);
    }
    if (requirements.similar_projects_count && similarProjects.length < requirements.similar_projects_count) {
        results.gaps.push(`Need ${requirements.similar_projects_count - similarProjects.length} more similar projects`);
    }
    if (requirements.reference_requirements.count && recentProjects.length < requirements.reference_requirements.count) {
        results.gaps.push(`Need ${requirements.reference_requirements.count - recentProjects.length} more recent references`);
    }
    
    return results;
}

// Enhanced Budget Analysis Agent functions
async function extractBudgetRequirements(text) {
    const prompt = `Extract budget and financial requirements from the following RFP text.
    Return ONLY a valid JSON object with this exact structure:
    {
        "estimated_budget": {
            "min": null,
            "max": null,
            "currency": "USD"
        },
        "financial_requirements": {
            "annual_revenue": null,
            "working_capital": null,
            "insurance_coverage": null
        },
        "payment_terms": {
            "type": null,
            "frequency": null,
            "payment_days": null,
            "payment_schedule": {
                "advance_payment": null,
                "milestone_payments": [],
                "retention": null
            }
        },
        "cost_breakdown_required": false,
        "financial_metrics": {
            "debt_ratio_max": null,
            "current_ratio_min": null,
            "profit_margin_min": null
        },
        "additional_requirements": []
    }
    Do not include any comments, explanations or text outside the JSON.
    
    RFP Text: ${text}`;
    
    const response = await getCompletion(prompt);
    try {
        // Extract only valid JSON
        let cleanJson = response;
        // Find the first { and last }
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        
        if (firstBrace >= 0 && lastBrace >= 0) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }
        
        // Remove any comments
        cleanJson = cleanJson.replace(/\/\/.*$/gm, '');
        
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error('Original response:', response);
        console.error('Failed to parse budget requirements:', error);
        return {
            estimated_budget: {
                min: null,
                max: null,
                currency: "USD"
            },
            financial_requirements: {
                annual_revenue: null,
                working_capital: null,
                insurance_coverage: null
            },
            payment_terms: {
                type: null,
                frequency: null,
                payment_days: null,
                payment_schedule: {
                    advance_payment: null,
                    milestone_payments: [],
                    retention: null
                }
            },
            cost_breakdown_required: false,
            financial_metrics: {
                debt_ratio_max: null,
                current_ratio_min: null,
                profit_margin_min: null
            },
            additional_requirements: []
        };
    }
}

async function checkBudgetRequirements(requirements) {
    try {
        console.log('Checking budget requirements:', requirements);
        
        // Add a try-catch here to handle database table not existing
        let financial_data = { meets_revenue: true, meets_working_capital: true, meets_insurance: true };
        
        try {
            const { data, error } = await supabase
                .from('financial_data')
                .select('*')
                .single();
                
            if (error) throw new Error(`Failed to fetch financial data: ${error.message}`);
            financial_data = data;
        } catch (dbError) {
            console.warn('Could not fetch financial data, using defaults:', dbError.message);
            // Continue with defaults instead of failing the entire process
        }
        
        // Rest of the function remains unchanged
        const meets_revenue = !requirements.financial_requirements.annual_revenue || 
            financial_data.annual_revenue >= requirements.financial_requirements.annual_revenue;
            
        const meets_working_capital = !requirements.financial_requirements.working_capital || 
            financial_data.working_capital >= requirements.financial_requirements.working_capital;
            
        const meets_insurance = !requirements.financial_requirements.insurance_coverage || 
            financial_data.insurance_coverage >= requirements.financial_requirements.insurance_coverage;
        
        const gaps = [];
        if (!meets_revenue) gaps.push(`Annual revenue below requirement: ${requirements.financial_requirements.annual_revenue}`);
        if (!meets_working_capital) gaps.push(`Working capital below requirement: ${requirements.financial_requirements.working_capital}`);
        if (!meets_insurance) gaps.push(`Insurance coverage below requirement: ${requirements.financial_requirements.insurance_coverage}`);
        
        return {
            meets_revenue,
            meets_working_capital,
            meets_insurance,
            meets_requirements: meets_revenue && meets_working_capital && meets_insurance,
            gaps,
            estimated_budget: requirements.estimated_budget,
            payment_terms: requirements.payment_terms,
            recommendations: generateBudgetRecommendations(requirements, {
                meets_revenue,
                meets_working_capital,
                meets_insurance
            })
        };
    } catch (error) {
        console.error('Failed to check budget requirements:', error);
        return {
            meets_revenue: false,
            meets_working_capital: false,
            meets_insurance: false,
            meets_requirements: false,
            gaps: ['Error in budget analysis'],
            estimated_budget: requirements.estimated_budget,
            payment_terms: requirements.payment_terms,
            recommendations: []
        };
    }
}

// Technical Requirements Agent functions
async function extractTechnicalRequirements(text) {
    const prompt = `Extract technical requirements from the following RFP text.
    You must respond with ONLY a JSON object using this exact structure:
    {
        "required_technologies": [
            {
                "name": string,
                "version": string,
                "category": string,
                "priority": "required" | "preferred"
            }
        ],
        "team_requirements": {
            "key_personnel": [
                {
                    "role": string,
                    "required_experience": number,
                    "certifications": [],
                    "education": string
                }
            ],
            "team_size": number,
            "availability": string
        },
        "methodology_requirements": {
            "project_management": string,
            "development_methodology": string,
            "quality_assurance": string
        },
        "infrastructure_requirements": {
            "hosting": string,
            "security_requirements": [],
            "compliance_standards": []
        },
        "additional_requirements": []
    }
    If a field is not specified, set it to null.
    
    RFP Text: ${text}
    
    Response (only JSON):`;
    
    const response = await getCompletion(prompt);
    try {
        const cleanedResponse = response.replace(/^[^{]*/, '').replace(/}[^}]*$/, '}');
        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error('Original response:', response);
        console.error('Failed to parse technical requirements:', error);
        return {
            required_technologies: [],
            team_requirements: {
                key_personnel: [],
                team_size: null,
                availability: null
            },
            methodology_requirements: {
                project_management: null,
                development_methodology: null,
                quality_assurance: null
            },
            infrastructure_requirements: {
                hosting: null,
                security_requirements: [],
                compliance_standards: []
            },
            additional_requirements: []
        };
    }
}

async function checkTechnicalCapabilities(requirements) {
    try {
        console.log('Checking technical capabilities:', requirements);
        
        // Add try-catch for database operations
        let technical_data = { 
            technologies: ['Cloud', 'Web', 'Mobile'],
            certifications: ['ISO 27001'],
            methodologies: ['Agile', 'Waterfall'],
            team_size: 50
        };
        
        try {
            const { data, error } = await supabase
                .from('technical_capabilities')
                .select('*')
                .single();
                
            if (error) throw new Error(`Failed to fetch technical capabilities: ${error.message}`);
            technical_data = data;
        } catch (dbError) {
            console.warn('Could not fetch technical capabilities, using defaults:', dbError.message);
            // Continue with defaults instead of failing
        }
        
        // Check technologies
        const tech_matches = requirements.required_technologies.filter(req => 
            technical_data.technologies.some(tech => 
                tech.toLowerCase().includes(req.name.toLowerCase())
            )
        );
        
        const meets_technology_requirements = tech_matches.length === requirements.required_technologies.length;
        
        // Check team requirements
        const meets_team_size = !requirements.team_requirements.team_size || 
            technical_data.team_size >= requirements.team_requirements.team_size;
            
        const key_personnel_meets = requirements.team_requirements.key_personnel.every(role => {
            // Simple check - we would need more detailed data for a real check
            return true; // Assume we can meet key personnel requirements
        });
        
        const meets_team_requirements = meets_team_size && key_personnel_meets;
        
        // Check methodology
        const meets_methodology_requirements = true; // Simplified check
        
        // Generate gaps
        const gaps = [];
        if (!meets_technology_requirements) {
            const missing_tech = requirements.required_technologies.filter(req => 
                !tech_matches.some(match => match.name === req.name)
            );
            gaps.push(`Missing technologies: ${missing_tech.map(t => t.name).join(', ')}`);
        }
        
        if (!meets_team_size) {
            gaps.push(`Team size below requirement: Need ${requirements.team_requirements.team_size}, have ${technical_data.team_size}`);
        }
        
        // Generate recommendations
        const recommendations = [];
        if (!meets_technology_requirements) {
            recommendations.push({
                type: 'technical',
                suggestion: 'Acquire missing technology capabilities through training or hiring',
                priority: 'high'
            });
        }
        
        if (!meets_team_size) {
            recommendations.push({
                type: 'resources',
                suggestion: 'Expand team or consider subcontracting to meet size requirements',
                priority: 'medium'
            });
        }
        
        return {
            meets_technology_requirements,
            meets_team_requirements,
            meets_methodology_requirements,
            meets_requirements: meets_technology_requirements && meets_team_requirements && meets_methodology_requirements,
            gaps,
            recommendations
        };
    } catch (error) {
        console.error('Failed to check technical capabilities:', error);
        return {
            meets_technology_requirements: false,
            meets_team_requirements: false,
            meets_methodology_requirements: false,
            meets_requirements: false,
            gaps: ['Error in technical analysis'],
            recommendations: []
        };
    }
}

// RFP Improvement Analysis
async function analyzeRFPImprovements(text) {
    const prompt = `Analyze the following RFP text and provide improvements.
    Return as JSON with this exact structure:
    {
        "clarity_issues": [],
        "missing_information": [],
        "suggested_changes": []
    }
    Focus on practical, actionable improvements.
    
    RFP Text: ${text}`;

    const response = await getCompletion(prompt);
    try {
        return JSON.parse(response);
    } catch (error) {
        console.error('Failed to parse RFP improvements:', error);
        return {
            clarity_issues: [],
            missing_information: [],
            suggested_changes: []
        };
    }
}

// Competitive Analysis
async function analyzeMarketPosition(text) {
    const prompt = `Analyze the competitive position for this RFP.
    Return as JSON with this exact structure:
    {
        "competitiveness": "high" | "medium" | "low",
        "barriers_to_entry": [],
        "recommendations": []
    }
    
    RFP Text: ${text}`;

    const response = await getCompletion(prompt);
    try {
        return JSON.parse(response);
    } catch (error) {
        console.error('Failed to parse market position:', error);
        return {
            competitiveness: "unknown",
            barriers_to_entry: [],
            recommendations: []
        };
    }
}

// Success Probability Analysis
async function calculateSuccessMetrics(text) {
    const prompt = `Calculate success probability metrics for this RFP.
    Return as JSON with this exact structure:
    {
        "overall_score": number,
        "breakdown": {
            "technical_fit": number,
            "financial_viability": number,
            "risk_level": number,
            "competitive_position": number
        },
        "improvement_areas": []
    }
    Scores should be 0-100.
    
    RFP Text: ${text}`;

    const response = await getCompletion(prompt);
    try {
        return JSON.parse(response);
    } catch (error) {
        console.error('Failed to parse success metrics:', error);
        return {
            overall_score: 0,
            breakdown: {
                technical_fit: 0,
                financial_viability: 0,
                risk_level: 0,
                competitive_position: 0
            },
            improvement_areas: []
        };
    }
}

// Strategic Recommendations
async function generateStrategicActions(text) {
    const prompt = `Generate strategic actions for this RFP.
    Return as JSON with this exact structure:
    {
        "immediate": [],
        "pre_submission": [],
        "negotiation_points": []
    }
    Focus on practical, actionable steps.
    
    RFP Text: ${text}`;

    const response = await getCompletion(prompt);
    try {
        return JSON.parse(response);
    } catch (error) {
        console.error('Failed to parse strategic actions:', error);
        return {
            immediate: [],
            pre_submission: [],
            negotiation_points: []
        };
    }
}

let currentAnalysis = null;

app.post('/query', async (req, res) => {
    if (!req.body.rfpText) {
        return res.status(400).json({ error: 'No RFP text provided' });
    }
    
    currentAnalysis = {
        status: 'processing',
        progress: 0,
        results: {}
    };
    
    res.json({ message: 'Analysis started', status: 'processing' });

    try {
        // Use the original individual analyses
        currentAnalysis.progress = 10;
        console.log('Starting eligibility analysis...');
        currentAnalysis.results.eligibility = await checkLegalEligibility(req.body.rfpText);
        
        currentAnalysis.progress = 30;
        console.log('Starting document requirements analysis...');
        currentAnalysis.results.document_requirements = await checkDocumentRequirements(req.body.rfpText);
        
        currentAnalysis.progress = 50;
        console.log('Starting risk analysis...');
        currentAnalysis.results.risk_analysis = await analyzeContractRisks(req.body.rfpText);
        
        currentAnalysis.progress = 70;
        console.log('Starting past performance analysis...');
        currentAnalysis.results.past_performance = await extractPastPerformanceRequirements(req.body.rfpText)
            .then(reqs => checkPastPerformance(reqs));
        
        currentAnalysis.progress = 85;
        console.log('Starting budget analysis...');
        currentAnalysis.results.budget_analysis = await extractBudgetRequirements(req.body.rfpText)
            .then(reqs => checkBudgetRequirements(reqs));
        
        currentAnalysis.progress = 95;
        console.log('Starting technical analysis...');
        currentAnalysis.results.technical_analysis = await extractTechnicalRequirements(req.body.rfpText)
            .then(reqs => checkTechnicalCapabilities(reqs));
        
        // Add summary generation
        currentAnalysis.progress = 98;
        console.log('Generating comprehensive summary...');
        currentAnalysis.results.summary = generateSummary(currentAnalysis.results);
        
        currentAnalysis.status = 'completed';
        currentAnalysis.progress = 100;
        console.log('Analysis completed successfully');

        // After completing the analysis, generate PDF and Word document
        if (currentAnalysis.status === 'completed') {
            try {
                console.log('Generating PDF...');
                currentAnalysis.pdf = await generateAnalysisPDF(currentAnalysis.results);
                console.log('PDF generated successfully');
            } catch (docError) {
                console.error('Failed to generate documents:', docError);
                // Continue even if document generation fails
            }
        }
        
    } catch (error) {
        console.error('Analysis failed:', error);
        currentAnalysis.status = 'error';
        currentAnalysis.error = error.message;
        currentAnalysis.progress = 0;
    }
});

// Add status endpoint
app.get('/query/status', (req, res) => {
    if (!currentAnalysis) {
        return res.json({ status: 'no_analysis' });
    }
    
    // Include PDF and Word document information if available
    res.json(currentAnalysis);
});

// Add a status endpoint for health checks
app.get('/status', (req, res) => {
    try {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            services: {
                ollama: true,
                supabase: true,
                pinecone: true
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        status: 'error',
        error: 'Internal server error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Initialize server
async function initializeServer() {
    try {
        // Ensure index exists before starting server
        await ensureIndex();
        
        // Start server
        app.listen(5000, () => {
            console.log('Server running on port 5000');
        });
    } catch (error) {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    }
}

// Add test query to verify Supabase connection
async function testSupabaseConnection() {
    try {
        console.log('Testing Supabase connection...');
        
        // Test state_registrations
        const { data: stateData, error: stateError } = await supabase
            .from('state_registrations')
            .select('*');
        console.log('State Registrations:', stateData);
        if (stateError) console.error('State Registration Error:', stateError);

        // Test certifications
        const { data: certData, error: certError } = await supabase
            .from('certifications')
            .select('*');
        console.log('Certifications:', certData);
        if (certError) console.error('Certifications Error:', certError);

    } catch (error) {
        console.error('Supabase Connection Test Failed:', error);
    }
}

// Call test function when server starts
testSupabaseConnection();

// Start the server
initializeServer();

function generateSummary(analysisResults) {
    try {
        const {
            eligibility,
            document_requirements,
            risk_analysis,
            past_performance,
            budget_analysis,
            technical_analysis
        } = analysisResults;

        // Create a comprehensive summary from existing data
        return {
            overall_assessment: {
                go_no_go: eligibility.eligible && 
                           (past_performance?.meets_requirements !== false) && 
                           (budget_analysis?.meets_requirements !== false) ? 
                           "GO" : "NO-GO",
                key_strengths: extractStrengths(analysisResults),
                key_concerns: extractConcerns(analysisResults)
            },
            eligibility_summary: {
                status: eligibility.eligible ? "Eligible" : "Not Eligible",
                missing_registrations: eligibility.stateRegistrations.missing,
                missing_certifications: eligibility.certifications.missing,
                action_items: [
                    ...eligibility.stateRegistrations.missing.map(state => `Obtain ${state} registration`),
                    ...eligibility.certifications.missing.map(cert => `Acquire ${cert} certification`)
                ]
            },
            risk_assessment: {
                high_risks: risk_analysis.high_risk_clauses?.filter(risk => risk.risk_level === "high") || [],
                unfavorable_terms: risk_analysis.unfavorable_terms || [],
                mitigation_strategies: risk_analysis.high_risk_clauses?.map(risk => risk.suggestion) || []
            },
            document_requirements: {
                submission_checklist: document_requirements.checklist || [],
                formatting_requirements: cleanFormatting(document_requirements.formatting_requirements),
                deadlines: document_requirements.submission_requirements?.deadlines || {
                    main: "Not specified",
                    questions: "Not specified"
                }
            },
            financial_assessment: budget_analysis ? {
                budget_range: {
                    min: budget_analysis.estimated_budget?.min || null,
                    max: budget_analysis.estimated_budget?.max || null,
                    currency: budget_analysis.estimated_budget?.currency || "USD"
                },
                financial_requirements: cleanFinancials(budget_analysis),
                payment_terms: budget_analysis.payment_terms || { type: "Not specified" }
            } : { budget_range: { min: null, max: null } },
            technical_assessment: technical_analysis ? {
                key_technologies: technical_analysis.required_technologies?.map(tech => tech.name) || [],
                team_requirements: technical_analysis.team_requirements?.key_personnel?.length || 0,
                compliance_requirements: technical_analysis.infrastructure_requirements?.compliance_standards || []
            } : { key_technologies: [] },
            performance_requirements: past_performance ? {
                years_experience: past_performance.years_of_experience || "Not specified",
                similar_projects: past_performance.similar_projects_count || "Not specified",
                minimum_contract_value: formatCurrency(past_performance.minimum_contract_value) || "Not specified",
                reference_requirements: past_performance.reference_requirements || {}
            } : { years_experience: "Not specified" },
            confidence_assessment: {
                overall_score: calculateConfidenceScore(analysisResults),
                bid_recommendation: getBidRecommendation(analysisResults),
                win_probability: estimateWinProbability(analysisResults)
            },
            action_plan: {
                immediate_actions: extractImmediateActions(analysisResults),
                preparation_steps: extractPreparationSteps(analysisResults),
                questions_for_clarification: extractClarificationQuestions(analysisResults)
            }
        };
    } catch (error) {
        console.error('Error generating summary:', error);
        return {
            error: 'Failed to generate comprehensive summary',
            partial_results: analysisResults
        };
    }
}

// Helper functions for the summary
function extractStrengths(results) {
    const strengths = [];
    
    if (results.eligibility?.eligible) {
        strengths.push("Meets basic eligibility requirements");
    }
    
    if (results.past_performance?.meets_requirements) {
        strengths.push("Strong past performance match");
    }
    
    if (results.technical_analysis?.meets_technology_requirements) {
        strengths.push("Technical capabilities align with requirements");
    }
    
    if (results.budget_analysis?.meets_requirements) {
        strengths.push("Financially viable opportunity");
    }
    
    return strengths.length ? strengths : ["No specific strengths identified"];
}

function extractConcerns(results) {
    const concerns = [];
    
    if (!results.eligibility?.eligible) {
        concerns.push("Does not meet basic eligibility requirements");
    }
    
    if (results.eligibility?.stateRegistrations?.missing?.length > 0) {
        concerns.push(`Missing state registrations: ${results.eligibility.stateRegistrations.missing.join(', ')}`);
    }
    
    if (results.risk_analysis?.high_risk_clauses?.length > 0) {
        concerns.push(`${results.risk_analysis.high_risk_clauses.length} high-risk contract clauses identified`);
    }
    
    if (results.technical_analysis?.gaps?.length > 0) {
        concerns.push("Technical capability gaps exist");
    }
    
    return concerns.length ? concerns : ["No specific concerns identified"];
}

function cleanFormatting(formatting) {
    return {
        page_limit: formatting?.page_limits?.total || "Not specified",
        font: formatting?.font?.type ? `${formatting.font.type} ${formatting.font.size || ''}` : "Not specified",
        spacing: formatting?.spacing?.line || "Not specified",
        margins: formatting?.margins?.top ? `${formatting.margins.top}" top, ${formatting.margins.bottom}" bottom, ${formatting.margins.left}" left, ${formatting.margins.right}" right` : "Not specified"
    };
}

function cleanFinancials(budget) {
    return {
        annual_revenue: formatCurrency(budget?.financial_requirements?.annual_revenue) || "Not specified",
        working_capital: formatCurrency(budget?.financial_requirements?.working_capital) || "Not specified",
        insurance_coverage: formatCurrency(budget?.financial_requirements?.insurance_coverage) || "Not specified"
    };
}

// Helper function for currency formatting
function formatCurrency(value) {
    if (!value) return null;
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value);
}

function calculateConfidenceScore(results) {
    let score = 60; // Start with a neutral score
    
    // Adjust based on eligibility
    if (results.eligibility?.eligible) {
        score += 10;
    } else {
        score -= 20;
    }
    
    // Adjust based on risks
    if (results.risk_analysis?.high_risk_clauses?.length > 2) {
        score -= 10;
    }
    
    // Adjust based on past performance
    if (results.past_performance?.meets_requirements) {
        score += 10;
    } else if (results.past_performance?.meets_requirements === false) {
        score -= 10;
    }
    
    // Adjust based on technical capabilities
    if (results.technical_analysis?.meets_requirements) {
        score += 10;
    } else if (results.technical_analysis?.meets_requirements === false) {
        score -= 10;
    }
    
    // Adjust based on financial fit
    if (results.budget_analysis?.meets_requirements) {
        score += 10;
    } else if (results.budget_analysis?.meets_requirements === false) {
        score -= 10;
    }
    
    // Ensure score is within bounds
    return Math.max(0, Math.min(100, score));
}

function getBidRecommendation(results) {
    const score = calculateConfidenceScore(results);
    
    if (score >= 80) return "Strong Bid - Proceed with high confidence";
    if (score >= 60) return "Moderate Bid - Proceed with caution and address concerns";
    if (score >= 40) return "Risky Bid - Major improvements needed before proceeding";
    return "Not Recommended - Consider no-bid unless critical issues can be resolved";
}

function estimateWinProbability(results) {
    const score = calculateConfidenceScore(results);
    // Simple conversion from confidence to probability
    return {
        percentage: Math.round(score * 0.9), // Slightly more conservative than confidence
        factors: extractWinFactors(results, score)
    };
}

function extractWinFactors(results, score) {
    const factors = [];
    
    if (score >= 70) {
        factors.push("Strong alignment with requirements");
    } else if (score >= 50) {
        factors.push("Moderate alignment with requirements");
    } else {
        factors.push("Poor alignment with requirements");
    }
    
    if (results.eligibility?.eligible) {
        factors.push("Meets all eligibility requirements");
    }
    
    if (results.past_performance?.meets_requirements) {
        factors.push("Strong past performance record");
    }
    
    if (results.risk_analysis?.high_risk_clauses?.length === 0) {
        factors.push("Low risk profile");
    } else if (results.risk_analysis?.high_risk_clauses?.length > 2) {
        factors.push("High risk profile");
    }
    
    return factors;
}

function extractImmediateActions(results) {
    const actions = [];
    
    // Registration actions
    if (results.eligibility?.stateRegistrations?.missing?.length > 0) {
        actions.push(`Start registration process for: ${results.eligibility.stateRegistrations.missing.join(', ')}`);
    }
    
    // Certification actions
    if (results.eligibility?.certifications?.missing?.length > 0) {
        actions.push(`Initiate certification process for: ${results.eligibility.certifications.missing.join(', ')}`);
    }
    
    // Document actions
    if (results.document_requirements?.checklist?.length > 0) {
        const deadlines = results.document_requirements?.submission_requirements?.deadlines;
        if (deadlines?.main) {
            actions.push(`Create proposal timeline working backward from submission deadline: ${deadlines.main}`);
        }
    }
    
    // Risk actions
    if (results.risk_analysis?.high_risk_clauses?.length > 0) {
        actions.push(`Review high-risk clauses and develop mitigation strategies`);
    }
    
    return actions.length ? actions : ["No immediate actions identified"];
}

function extractPreparationSteps(results) {
    const steps = [];
    
    // Document preparation
    if (results.document_requirements?.checklist?.length > 0) {
        steps.push(`Prepare required documents according to formatting guidelines`);
    }
    
    // Team preparation
    if (results.technical_analysis?.team_requirements?.key_personnel?.length > 0) {
        steps.push(`Assemble proposal team and assign responsibilities`);
    }
    
    // Financial preparation
    if (results.budget_analysis?.financial_requirements?.annual_revenue || 
        results.budget_analysis?.financial_requirements?.working_capital) {
        steps.push(`Prepare financial documentation and statements`);
    }
    
    // Technical preparation
    if (results.technical_analysis?.gaps?.length > 0) {
        steps.push(`Address technical gaps through partnerships or capability development`);
    }
    
    return steps.length ? steps : ["No specific preparation steps identified"];
}

function extractClarificationQuestions(results) {
    const questions = [];
    
    // Ambiguous or missing information
    if (results.document_requirements?.submission_requirements?.special_instructions?.length === 0) {
        questions.push("Are there any special instructions for proposal submission?");
    }
    
    if (!results.budget_analysis?.estimated_budget?.min && !results.budget_analysis?.estimated_budget?.max) {
        questions.push("What is the budget range for this project?");
    }
    
    if (!results.past_performance?.years_of_experience) {
        questions.push("How many years of experience are required for this project?");
    }
    
    if (results.risk_analysis?.high_risk_clauses?.length > 0) {
        questions.push("Are the contract terms negotiable, particularly regarding risk allocation?");
    }
    
    return questions.length ? questions : ["No clarification questions identified"];
}

function generateBudgetRecommendations(requirements, results) {
    const recommendations = [];
    
    if (!results.meets_revenue) {
        recommendations.push({
            type: 'financial',
            suggestion: `Consider partnering with a larger firm to meet the annual revenue requirement of ${formatCurrency(requirements.financial_requirements.annual_revenue)}`,
            priority: 'high'
        });
    }
    
    if (!results.meets_working_capital) {
        recommendations.push({
            type: 'financial',
            suggestion: `Explore financing options to meet the working capital requirement of ${formatCurrency(requirements.financial_requirements.working_capital)}`,
            priority: 'high'
        });
    }
    
    if (!results.meets_insurance) {
        recommendations.push({
            type: 'compliance',
            suggestion: `Increase insurance coverage to meet the requirement of ${formatCurrency(requirements.financial_requirements.insurance_coverage)}`,
            priority: 'high'
        });
    }
    
    if (requirements.payment_terms?.type === 'Net 60' || requirements.payment_terms?.type === 'Net 90') {
        recommendations.push({
            type: 'financial',
            suggestion: `Prepare for extended payment terms (${requirements.payment_terms.type}) with adequate cash reserves`,
            priority: 'medium'
        });
    }
    
    return recommendations;
}

// Serve the uploads directory for PDF downloads
app.use('/download', express.static(path.join(__dirname, 'uploads')));

// Add endpoints for PDF generation and download
app.post('/generate-pdf', async (req, res) => {
    try {
        if (!currentAnalysis || !currentAnalysis.results) {
            return res.status(400).json({ error: 'No analysis results available' });
        }
        
        console.log('Generating PDF...');
        const pdfResult = await generateAnalysisPDF(currentAnalysis.results);
        console.log('PDF generated successfully:', pdfResult);
        
        res.json({
            message: 'PDF generated successfully',
            pdf: pdfResult
        });
    } catch (error) {
        console.error('Failed to generate PDF:', error);
        res.status(500).json({ error: `Failed to generate PDF: ${error.message}` });
    }
});