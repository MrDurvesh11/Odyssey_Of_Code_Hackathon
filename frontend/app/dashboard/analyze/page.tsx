"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Zap,
  Clock,
  AlertCircle,
  BarChart4
} from "lucide-react";

export default function AnalyzePage() {
  const [activeTab, setActiveTab] = useState("upload");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("file");
  const [progress, setProgress] = useState(0);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setAnalyzing(false);
          setAnalyzed(true);
          setActiveTab("results");
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">RFP Analysis</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload RFP</TabsTrigger>
          <TabsTrigger value="results" disabled={!analyzed}>Analysis Results</TabsTrigger>
          <TabsTrigger value="history">Analysis History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyze a New RFP</CardTitle>
              <CardDescription>
                Upload your RFP document or paste the content for AI-powered analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Button 
                  variant={uploadMethod === "file" ? "default" : "outline"} 
                  className="flex items-center justify-center gap-2 h-20"
                  onClick={() => setUploadMethod("file")}
                >
                  <Upload className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Upload File</div>
                    <div className="text-xs text-muted-foreground">PDF, DOCX, or TXT</div>
                  </div>
                </Button>
                <Button 
                  variant={uploadMethod === "text" ? "default" : "outline"} 
                  className="flex items-center justify-center gap-2 h-20"
                  onClick={() => setUploadMethod("text")}
                >
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Paste Text</div>
                    <div className="text-xs text-muted-foreground">Copy and paste RFP content</div>
                  </div>
                </Button>
              </div>

              {uploadMethod === "file" ? (
                <div className="border-2 border-dashed rounded-lg p-10 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Upload your RFP document</h3>
                    <p className="text-sm text-muted-foreground mt-2 mb-4">
                      Drag and drop your file here, or click to browse
                    </p>
                    <Input 
                      type="file" 
                      className="hidden" 
                      id="rfp-upload" 
                    />
                    <Button
                      asChild
                      variant="outline"
                    >
                      <label htmlFor="rfp-upload">
                        Select File
                      </label>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                      Supports PDF, DOCX, and TXT files up to 10MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">RFP Title</label>
                    <Input placeholder="Enter the title of the RFP" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">RFP Content</label>
                    <Textarea 
                      placeholder="Paste the content of your RFP here..." 
                      className="min-h-[300px]"
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center gap-2">
                <Select defaultValue="detailed">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Analysis Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick Analysis</SelectItem>
                    <SelectItem value="detailed">Detailed Analysis</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAnalyze}>
                {analyzing ? (
                  <>Analyzing... <Progress value={progress} className="ml-2 w-20" /></>
                ) : (
                  <>Analyze RFP <Zap className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </CardFooter>
          </Card>

          {analyzing && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis in Progress</CardTitle>
                <CardDescription>
                  Our AI is analyzing your RFP document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Extracting document content...</span>
                    <CheckCircle2 className="text-green-500 h-5 w-5" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Identifying key requirements...</span>
                    {progress > 30 ? (
                      <CheckCircle2 className="text-green-500 h-5 w-5" />
                    ) : (
                      <Clock className="text-muted-foreground h-5 w-5" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Analyzing complexity and scope...</span>
                    {progress > 60 ? (
                      <CheckCircle2 className="text-green-500 h-5 w-5" />
                    ) : (
                      <Clock className="text-muted-foreground h-5 w-5" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Generating insights and recommendations...</span>
                    {progress > 80 ? (
                      <CheckCircle2 className="text-green-500 h-5 w-5" />
                    ) : (
                      <Clock className="text-muted-foreground h-5 w-5" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Preparing final report...</span>
                    {progress === 100 ? (
                      <CheckCircle2 className="text-green-500 h-5 w-5" />
                    ) : (
                      <Clock className="text-muted-foreground h-5 w-5" />
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <Progress value={progress} className="w-full h-2" />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>Starting analysis</span>
                    <span>Finalizing results</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    Enterprise Cloud Migration Solution RFP
                  </CardDescription>
                </div>
                <Badge className="ml-2">Detailed Analysis</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">Complexity</h3>
                      <Badge variant="outline">High</Badge>
                    </div>
                    <Progress value={78} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      This RFP has high complexity due to technical requirements and scale.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">Competitiveness</h3>
                      <Badge variant="outline">Medium</Badge>
                    </div>
                    <Progress value={54} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Expected medium competition with specialized requirements.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">Potential Fit</h3>
                      <Badge variant="outline">High</Badge>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      This opportunity aligns well with your company's capabilities.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Key Requirements</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-green-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>Enterprise-scale migration of 200+ servers and 50+ applications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-green-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>Minimal business disruption during the migration process</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-green-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>Implementation of security controls and compliance monitoring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-green-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>Staff training on cloud operations and management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-green-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>Certified partnership with major cloud providers required</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Potential Challenges</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="text-amber-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>Tight timeline of 6 months for full migration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="text-amber-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>Complex data volume (5 petabytes) may require specialized migration approach</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="text-amber-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>Requirements for minimal disruption while migrating critical systems</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Strategic Recommendations</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Zap className="text-blue-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>Highlight your experience with similar scale enterprise migrations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="text-blue-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>Emphasize your proven methodology for minimal-disruption migrations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="text-blue-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>Showcase your security and compliance expertise with concrete examples</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="text-blue-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>Present a phased approach with clear milestones to address the timeline concerns</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button>Generate Response Draft</Button>
              <Button variant="outline">Save Analysis</Button>
              <Button variant="outline">Export PDF</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis History</CardTitle>
              <CardDescription>
                View and access your previous RFP analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search analyses..."
                  className="pl-10 pr-4"
                />
              </div>

              <div className="space-y-4">
                <div className="border rounded-lg p-4 hover:bg-accent transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Enterprise Cloud Migration Solution</h3>
                      <p className="text-sm text-muted-foreground">Analyzed today</p>
                    </div>
                    <Badge>High Match</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm flex items-center gap-1">
                      <BarChart4 className="h-4 w-4" /> Detailed Analysis
                    </span>
                    <span className="text-sm flex items-center gap-1">
                      <FileText className="h-4 w-4" /> IT Infrastructure
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg p-4 hover:bg-accent transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Healthcare Data Analytics Platform</h3>
                      <p className="text-sm text-muted-foreground">Analyzed 2 days ago</p>
                    </div>
                    <Badge variant="secondary">Medium Match</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm flex items-center gap-1">
                      <BarChart4 className="h-4 w-4" /> Comprehensive Analysis
                    </span>
                    <span className="text-sm flex items-center gap-1">
                      <FileText className="h-4 w-4" /> Healthcare
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg p-4 hover:bg-accent transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Smart City IoT Implementation</h3>
                      <p className="text-sm text-muted-foreground">Analyzed 1 week ago</p>
                    </div>
                    <Badge variant="secondary">Low Match</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm flex items-center gap-1">
                      <BarChart4 className="h-4 w-4" /> Quick Analysis
                    </span>
                    <span className="text-sm flex items-center gap-1">
                      <FileText className="h-4 w-4" /> Smart City
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg p-4 hover:bg-accent transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Financial Services Security Audit</h3>
                      <p className="text-sm text-muted-foreground">Analyzed 2 weeks ago</p>
                    </div>
                    <Badge>High Match</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm flex items-center gap-1">
                      <BarChart4 className="h-4 w-4" /> Detailed Analysis
                    </span>
                    <span className="text-sm flex items-center gap-1">
                      <FileText className="h-4 w-4" /> Financial
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
