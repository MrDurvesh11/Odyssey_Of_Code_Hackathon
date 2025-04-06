'use client';

import { RfpAnalysisCharts } from '@/components/dashboard/rfp-analysis-charts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Search, Upload, Zap, ChartColumnIncreasing, CircleCheck, Clock, TriangleAlert } from 'lucide-react'

export default function AnalyzePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analyze RFP</h1>
          <p className="text-muted-foreground">
            Extract and analyze requirements from your RFP documents
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      <Tabs defaultValue="document">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Document Tab */}
        <TabsContent value="document">
          {/* Document upload area */}
          <Card>
            <CardHeader>
              <CardTitle>Upload RFP Document</CardTitle>
              <CardDescription>
                Upload your RFP document for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-10 text-center">
                <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="mb-2 font-medium">Drag and drop your file here or click to browse</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports PDF, DOCX, and TXT files up to 20MB
                </p>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              </div>
              
              <div>
                <p className="mb-2 font-medium">Or paste RFP text below</p>
                <Textarea placeholder="Paste your RFP text here..." className="min-h-[200px]" />
                <div className="mt-4">
                  <Button>
                    <Zap className="h-4 w-4 mr-2" />
                    Analyze Text
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Requirements Tab */}
        <TabsContent value="requirements">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Requirements</CardTitle>
              <CardDescription>
                AI-extracted requirements from your RFP document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div>
                  <p>Sample Healthcare RFP.pdf</p>
                  <div className="flex items-center mt-1">
                    <Progress value={100} className="w-[100px] mr-2" />
                    <span className="text-sm text-muted-foreground">68 requirements found</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requirements</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Sample requirements */}
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="mb-2">Technical</Badge>
                      <p className="font-medium">The system must support HL7 FHIR for healthcare data exchange</p>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="ml-auto">Mandatory</Badge>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="mb-2">Security</Badge>
                      <p className="font-medium">All data must be encrypted at rest using AES-256 encryption</p>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="ml-auto">Mandatory</Badge>
                      <Badge variant="outline" className="bg-red-100 text-red-800">High</Badge>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="mb-2">Compliance</Badge>
                      <p className="font-medium">Solution must be HIPAA compliant and provide audit logs</p>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="ml-auto">Mandatory</Badge>
                      <Badge variant="outline" className="bg-red-100 text-red-800">High</Badge>
                    </div>
                  </div>
                </div>

                {/* More requirements would be here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>RFP Insights</CardTitle>
              <CardDescription>
                AI-generated insights based on RFP Nexus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-4 border rounded-md p-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <ChartColumnIncreasing className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Complexity Score</p>
                    <p className="text-xl font-bold">7.8/10</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 border rounded-md p-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CircleCheck className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fit Score</p>
                    <p className="text-xl font-bold">85%</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 border rounded-md p-4">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-orange-700" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Completion</p>
                    <p className="text-xl font-bold">45 days</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Key Insights</h3>
                <div className="space-y-2">
                  <div className="flex gap-2 items-start">
                    <TriangleAlert className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p>High number of security requirements (18) with 85% marked as mandatory</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <TriangleAlert className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p>HIPAA compliance is a critical requirement with multiple mentions</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <CircleCheck className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Our solution has 85% alignment with technical requirements</p>
                  </div>
                </div>
              </div>

              <RfpAnalysisCharts />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
