import { ArrowLeft, Calendar, CheckCircle, Download, FileText, HelpCircle, Share2, XCircle } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { EligibilityComparison } from "@/components/eligibility-comparison"
import { RiskHeatmap } from "@/components/risk-heatmap"
import { SubmissionChecklist } from "@/components/submission-checklist"

export default function AnalysisPage({ params }: { params: { id: string } }) {
  // This would normally fetch the document data based on the ID
  const document = {
    id: params.id,
    title: "Federal IT Modernization RFP",
    date: "2023-11-15",
    status: "High Match",
    statusColor: "success",
    bidRecommendation: "Recommended",
    confidenceScore: 87,
    summary:
      "This RFP seeks proposals for modernizing federal IT infrastructure with a focus on cloud migration, security enhancement, and improved user experience. The project has a 24-month timeline with an estimated budget of $5-7M.",
    criticalDates: [
      { name: "Questions Due", date: "2023-12-01", daysRemaining: 15 },
      { name: "Proposal Due", date: "2023-12-15", daysRemaining: 30 },
      { name: "Award Date", date: "2024-01-30", daysRemaining: 75 },
      { name: "Project Start", date: "2024-02-15", daysRemaining: 90 },
    ],
  }

  return (
    <DashboardShell>
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to dashboard</span>
          </Link>
        </Button>
        <DashboardHeader heading={document.title} subheading="Analysis and insights">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm">
              <HelpCircle className="mr-2 h-4 w-4" />
              Ask AI
            </Button>
          </div>
        </DashboardHeader>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bid Recommendation</CardTitle>
            <div className={document.bidRecommendation === "Recommended" ? "text-emerald-500" : "text-amber-500"}>
              {document.bidRecommendation === "Recommended" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{document.bidRecommendation}</div>
            <div className="mt-2 flex items-center space-x-2">
              <div className="text-sm">Confidence:</div>
              <Progress value={document.confidenceScore} className="h-2 w-24" />
              <div className="text-sm font-medium">{document.confidenceScore}%</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligibility Match</CardTitle>
            <FileText className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{document.status}</div>
              <Badge variant={document.statusColor as "default" | "success" | "warning" | "destructive"}>
                {document.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on company capabilities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Critical Date</CardTitle>
            <Calendar className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{document.criticalDates[0].name}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>{document.criticalDates[0].date}</span>
              <span>•</span>
              <span>{document.criticalDates[0].daysRemaining} days remaining</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>RFP Summary</CardTitle>
          <CardDescription>AI-generated summary of key information</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{document.summary}</p>

          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Critical Dates Timeline</h4>
            <div className="relative mt-2">
              <div className="absolute left-0 top-4 h-0.5 w-full bg-gray-200"></div>
              <div className="relative flex justify-between">
                {document.criticalDates.map((date, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                      {index + 1}
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-xs font-medium">{date.name}</div>
                      <div className="text-xs text-muted-foreground">{date.date}</div>
                      <div className="text-xs text-muted-foreground">{date.daysRemaining} days</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="eligibility">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="eligibility">Eligibility Analysis</TabsTrigger>
          <TabsTrigger value="checklist">Submission Checklist</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>
        <TabsContent value="eligibility">
          <EligibilityComparison />
        </TabsContent>
        <TabsContent value="checklist">
          <SubmissionChecklist />
        </TabsContent>
        <TabsContent value="risk">
          <RiskHeatmap />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

