import { useState, useEffect } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import { motion } from "framer-motion";
import {
  ChartPieIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  Cog6ToothIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline';
import "./App.css";

// Sample RFP text for testing
const sampleRFPText = `The contractor must be registered in Texas and California. Must have active employment agency license and liability insurance. 
Contractor shall have minimum 5 years experience in government contracting with at least 3 similar projects valued at $500,000 or more in the past 3 years. 
Must provide 2 references from projects completed within the last 2 years. The estimated project budget is $2.5M to $3M USD. 
Contractor must demonstrate annual revenue of at least $6M and working capital of $1M. Required insurance coverage minimum of $5M. 
Project team must include a certified Project Manager (PMP) with 10+ years experience and at least 3 senior developers with 5+ years experience in Node.js and React. 
Must follow Agile methodology with bi-weekly sprints. All infrastructure must be SOC2 compliant with ISO 27001 certification. 
Proposal must be submitted in Times New Roman, 12pt font with 1.5 line spacing. 
Contractor shall indemnify and hold harmless the Client against all claims. 
Contractor assumes unlimited liability for any damages. Payment terms are net-90 days. 
Client may terminate the contract at any time without cause with 24-hour notice.`;

// Dummy analytics data
const performanceData = [
  { name: 'Jan', value: 4 },
  { name: 'Feb', value: 3 },
  { name: 'Mar', value: 5 },
  { name: 'Apr', value: 2 },
  { name: 'May', value: 6 },
  { name: 'Jun', value: 4 },
];

const riskDistribution = [
  { name: 'High Risk', value: 30, color: '#ef4444' },
  { name: 'Medium Risk', value: 45, color: '#f97316' },
  { name: 'Low Risk', value: 25, color: '#22c55e' },
];

// Chart type options
const chartTypes = [
  { value: 'pie', label: 'Pie Chart', Icon: ChartPieIcon },
  { value: 'bar', label: 'Bar Chart', Icon: ChartBarIcon },
  { value: 'line', label: 'Line Chart', Icon: PresentationChartLineIcon },
  { value: 'area', label: 'Area Chart', Icon: ArrowTrendingUpIcon },
];

// Theme options
const themes = [
  { value: 'default', label: 'Default', colors: ['#3b82f6', '#ef4444', '#22c55e'] },
  { value: 'modern', label: 'Modern', colors: ['#6366f1', '#ec4899', '#14b8a6'] },
  { value: 'warm', label: 'Warm', colors: ['#f97316', '#f59e0b', '#84cc16'] },
  { value: 'cool', label: 'Cool', colors: ['#06b6d4', '#6366f1', '#8b5cf6'] },
];

function ChartContainer({ title, chartType, data, onChartTypeChange, className = "" }) {
  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" fill="#3b82f6" fillOpacity={0.3} />
          </AreaChart>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <select
            value={chartType}
            onChange={(e) => onChartTypeChange(e.target.value)}
            className="block w-40 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {chartTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function MetricCard({ title, value, change, type = "neutral", className = "" }) {
  const colors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg ${className}`}
    >
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {change && (
          <p className={`ml-2 text-sm font-medium ${colors[type]}`}>
            {change > 0 ? "+" : ""}{change}%
          </p>
        )}
      </div>
    </motion.div>
  );
}

function DashboardHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

// Modified getCompletion function with chunking for large prompts
async function getCompletion(prompt, maxRetries = 3, timeout = 120000) {
    // If prompt is too long, split it into context and question
    const MAX_PROMPT_LENGTH = 4000;
    let actualPrompt = prompt;
    
    if (prompt.length > MAX_PROMPT_LENGTH) {
        // Extract the instruction part (everything before "RFP Text:")
        const parts = prompt.split('RFP Text:');
        const instruction = parts[0];
        const rfpText = parts[1];
        
        // Take only the first and last parts of the RFP text
        const truncatedRfp = rfpText.length > MAX_PROMPT_LENGTH 
            ? rfpText.substring(0, MAX_PROMPT_LENGTH/2) + 
              "\n...[truncated]...\n" + 
              rfpText.substring(rfpText.length - MAX_PROMPT_LENGTH/2)
            : rfpText;
            
        actualPrompt = instruction + 'RFP Text:' + truncatedRfp;
        console.log(`Prompt truncated from ${prompt.length} to ${actualPrompt.length} characters`);
    }

    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            console.log(`Attempt ${retries + 1}/${maxRetries} for Ollama request`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                console.log(`Request timed out after ${timeout}ms`);
            }, timeout);

            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'mistral',
                    prompt: actualPrompt,
                    stream: false,
                    options: {
                        num_ctx: 8192,        // Increased context window
                        temperature: 0.1,     // More focused responses
                        top_p: 0.9,          // More focused token selection
                        repeat_penalty: 1.1   // Reduce repetition
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

            console.log('Ollama request completed successfully');
            return data.response;

        } catch (error) {
            retries++;
            console.error(`Attempt ${retries} failed:`, {
                error: error.message,
                type: error.name,
                isTimeout: error.name === 'AbortError'
            });
            
            if (retries === maxRetries) {
                // Return a safe default value based on the expected response type
                if (prompt.includes('JSON array')) {
                    return '[]';
                } else if (prompt.includes('JSON object')) {
                    return '{}';
                }
                return '{"error": "Request failed", "result": null}';
            }
            
            // Exponential backoff
            const waitTime = 5000 * Math.pow(2, retries);
            console.log(`Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
}

function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [chartPreferences, setChartPreferences] = useState({
    performance: 'line',
    risk: 'pie'
  });
  const [layout, setLayout] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [progress, setProgress] = useState({
    eligibility: false,
    documents: false,
    risks: false,
    performance: false,
    budget: false,
    technical: false
  });
  const [errors, setErrors] = useState({});
  const [analysisId, setAnalysisId] = useState(null);
  const [results, setResults] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [data, setData] = useState(null);

  // Function to transform API response into chart data
  const transformToChartData = (data) => {
    if (!data) return {};

    // Transform risk analysis data for pie chart
    const riskDistribution = data.risk_analysis?.details?.high_risk_clauses?.map(risk => ({
      name: risk.type,
      value: risk.risk_level === 'high' ? 30 : risk.risk_level === 'medium' ? 20 : 10,
      color: risk.risk_level === 'high' ? '#ef4444' : risk.risk_level === 'medium' ? '#f97316' : '#22c55e'
    })) || [];

    // Transform past performance data for line/bar chart
    const performanceData = [
      { name: 'Experience', value: data.past_performance?.current_stats?.years_experience || 0 },
      { name: 'Projects', value: data.past_performance?.current_stats?.similar_projects || 0 },
      { name: 'References', value: data.past_performance?.current_stats?.recent_references || 0 }
    ];

    return {
      riskDistribution,
      performanceData
    };
  };

  // Function to get eligibility status
  const getEligibilityStatus = (data) => {
    if (!data?.summary?.overall_status) return {};
    
    return {
      score: Math.round((Object.values(data.summary.overall_status).filter(Boolean).length / 
              Object.values(data.summary.overall_status).length) * 100),
      change: 0 // You could calculate this if you store previous values
    };
  };

  // Function to fetch analysis data
  const fetchAnalysisData = async () => {
    setLoading(true);
    setError(null);
    
    try {
        const eventSource = new EventSource('http://localhost:5000/query');
        
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received update:', data);
            
            switch (data.type) {
                case 'start':
                    setProgress(0);
                    break;
                    
                case 'progress':
                    // Update progress indicator
                    setProgress(prev => prev + 16.67); // Each step is ~16.67% of total
                    break;
                    
                case 'result':
                    // Update the specific section of the analysis
                    setAnalysisData(prev => ({
                        ...prev,
                        [data.step]: data.data
                    }));
                    break;
                    
                case 'error':
                    console.error(`Error in ${data.step}:`, data.error);
                    setErrors(prev => ({
                        ...prev,
                        [data.step]: data.error
                    }));
                    break;
                    
                case 'complete':
                    setLoading(false);
                    eventSource.close();
                    break;
            }
        };
        
        eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
            setError('Connection failed');
            setLoading(false);
            eventSource.close();
        };
        
    } catch (error) {
        setError(error.message);
        setLoading(false);
    }
};

  // Transform the API data for charts
  const chartData = transformToChartData(analysisData);
  const eligibilityStatus = getEligibilityStatus(analysisData);

  // Start Analysis
  const startAnalysis = async () => {
    setLoading(true);
    setData(null);
    setProgress({
      eligibility: false,
      documents: false,
      risks: false,
      performance: false,
      budget: false,
      technical: false
    });

    try {
      // First call to start analysis
      const response = await fetch('http://localhost:5000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: "analyze",
          rfpText: sampleRFPText
        }),
        // Increase timeout
        timeout: 300000 // 5 minutes
      });

      if (!response.ok) throw new Error('Analysis failed to start');

      // Start polling for results
      pollResults();

    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  // Poll for results
  const pollResults = async () => {
    try {
      const response = await fetch('http://localhost:5000/query/status');
      const result = await response.json();

      // Update progress based on completed analyses
      if (result.eligibility) {
        setProgress(prev => ({ ...prev, eligibility: true }));
      }
      if (result.document_requirements) {
        setProgress(prev => ({ ...prev, documents: true }));
      }
      if (result.risk_analysis) {
        setProgress(prev => ({ ...prev, risks: true }));
      }
      if (result.past_performance) {
        setProgress(prev => ({ ...prev, performance: true }));
      }
      if (result.budget) {
        setProgress(prev => ({ ...prev, budget: true }));
      }
      if (result.technical) {
        setProgress(prev => ({ ...prev, technical: true }));
      }

      // Update data as it comes in
      setData(prev => ({ ...prev, ...result }));

      // Check if all analyses are complete
      if (result.completed) {
        setLoading(false);
      } else {
        // Continue polling every 2 seconds
        setTimeout(pollResults, 2000);
      }

    } catch (error) {
      console.error('Polling error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing RFP...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button 
            onClick={startAnalysis}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={startAnalysis}
          disabled={loading}
          className="mb-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Start Analysis'}
        </button>

        {/* Progress Indicators */}
        {loading && (
          <div className="mt-4">
            <h3>Analysis Progress:</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(progress).map(([key, done]) => (
                <div key={key} className="flex items-center">
                  {done ? '✅' : '⏳'} {key}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Display */}
        {data && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.eligibility && (
              <div className="border p-4 rounded">
                <h3>Eligibility Analysis</h3>
                <pre>{JSON.stringify(data.eligibility, null, 2)}</pre>
              </div>
            )}
            {data.document_requirements && (
              <div className="border p-4 rounded">
                <h3>Document Requirements</h3>
                <pre>{JSON.stringify(data.document_requirements, null, 2)}</pre>
              </div>
            )}
            {data.risk_analysis && (
              <div className="border p-4 rounded">
                <h3>Risk Analysis</h3>
                <pre>{JSON.stringify(data.risk_analysis, null, 2)}</pre>
              </div>
            )}
            {data.past_performance && (
              <div className="border p-4 rounded">
                <h3>Past Performance</h3>
                <pre>{JSON.stringify(data.past_performance, null, 2)}</pre>
              </div>
            )}
            {data.budget && (
              <div className="border p-4 rounded">
                <h3>Budget Analysis</h3>
                <pre>{JSON.stringify(data.budget, null, 2)}</pre>
              </div>
            )}
            {data.technical && (
              <div className="border p-4 rounded">
                <h3>Technical Analysis</h3>
                <pre>{JSON.stringify(data.technical, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;