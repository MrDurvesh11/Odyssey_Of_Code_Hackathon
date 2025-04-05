"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  ChevronDown,
  HelpCircle,
} from "lucide-react";

// These are placeholder components - in a real app, use a proper charting library like recharts or Chart.js
const BarChartPlaceholder = () => (
  <div className="w-full h-[300px] rounded-lg border border-dashed flex items-center justify-center">
    <div className="flex flex-col items-center text-muted-foreground">
      <BarChart2 className="h-10 w-10 mb-2" />
      <p>Bar Chart Visualization</p>
    </div>
  </div>
);

const PieChartPlaceholder = () => (
  <div className="w-full h-[300px] rounded-lg border border-dashed flex items-center justify-center">
    <div className="flex flex-col items-center text-muted-foreground">
      <PieChartIcon className="h-10 w-10 mb-2" />
      <p>Pie Chart Visualization</p>
    </div>
  </div>
);

const LineChartPlaceholder = () => (
  <div className="w-full h-[300px] rounded-lg border border-dashed flex items-center justify-center">
    <div className="flex flex-col items-center text-muted-foreground">
      <TrendingUp className="h-10 w-10 mb-2" />
      <p>Line Chart Visualization</p>
    </div>
  </div>
);

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("last30days");
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>
      
      <div className="flex gap-4 items-center">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last7days">Last 7 days</SelectItem>
            <SelectItem value="last30days">Last 30 days</SelectItem>
            <SelectItem value="last90days">Last 90 days</SelectItem>
            <SelectItem value="lastYear">Last 12 months</SelectItem>
            <SelectItem value="allTime">All time</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Custom Range
        </Button>
        
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rfps">RFPs</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="success">Success Metrics</TabsTrigger>
          <TabsTrigger value="team">Team Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Total RFPs</span>
                  <span className="text-3xl font-bold">62</span>
                  <span className="text-xs flex items-center text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +12% from previous period
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Analyses Completed</span>
                  <span className="text-3xl font-bold">43</span>
                  <span className="text-xs flex items-center text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +8% from previous period
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Win Rate</span>
                  <span className="text-3xl font-bold">68%</span>
                  <span className="text-xs flex items-center text-amber-500">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    -2% from previous period
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                  <span className="text-3xl font-bold">3.2 days</span>
                  <span className="text-xs flex items-center text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    -0.5 days from previous period
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>RFP Submission Trends</CardTitle>
                <CardDescription>
                  Monthly RFP submissions and analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartPlaceholder />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Success Rate by Category</CardTitle>
                <CardDescription>
                  Win rate across different RFP categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartPlaceholder />
              </CardContent>
            </Card>
          </div>
          
          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>RFPs by Category</CardTitle>
                <CardDescription>
                  Distribution of RFPs across categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartPlaceholder />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>
                  RFP analysis and response metrics by team member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartPlaceholder />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="rfps" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>RFP Submissions Over Time</CardTitle>
              <CardDescription>
                Monthly submission trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartPlaceholder />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>RFPs by Category</CardTitle>
                <CardDescription>
                  Distribution across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartPlaceholder />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>RFPs by Status</CardTitle>
                <CardDescription>
                  Current status of all RFPs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartPlaceholder />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Average RFP Complexity</CardTitle>
              <CardDescription>
                Complexity score trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartPlaceholder />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Completion Time</CardTitle>
                <CardDescription>
                  Average time to complete RFP analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartPlaceholder />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Analysis Depth Distribution</CardTitle>
                <CardDescription>
                  Usage of different analysis levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartPlaceholder />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>AI-Identified Requirements by Category</CardTitle>
              <CardDescription>
                Types of requirements found in RFPs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartPlaceholder />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top AI-Suggested Strategies</CardTitle>
              <CardDescription>
                Most common strategic recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartPlaceholder />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="success" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Overall Success Rate</CardTitle>
              <CardDescription>
                RFP win rate over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartPlaceholder />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate by Category</CardTitle>
                <CardDescription>
                  Win rates across different RFP categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartPlaceholder />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Success Rate by Complexity</CardTitle>
                <CardDescription>
                  Win rates across different complexity levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartPlaceholder />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Factors Influencing Success</CardTitle>
              <CardDescription>
                Key factors correlated with successful RFPs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartPlaceholder />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Activity Overview</CardTitle>
              <CardDescription>
                RFP activities by team member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartPlaceholder />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyses by Team Member</CardTitle>
                <CardDescription>
                  Number of analyses completed by each team member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartPlaceholder />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Response Time by Team Member</CardTitle>
                <CardDescription>
                  Average response time for each team member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartPlaceholder />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Team Success Rates</CardTitle>
              <CardDescription>
                Win rates for RFPs handled by each team member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartPlaceholder />
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Detailed Team Reports</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
