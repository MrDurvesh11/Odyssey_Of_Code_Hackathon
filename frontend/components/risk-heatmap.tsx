import { AlertCircle, ArrowRight, FileText, HelpCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const riskItems = [
  {
    id: "1",
    clause: "Section 5.2.3 - Security Requirements",
    risk: "high",
    description: "Requires FedRAMP High certification within 60 days of award.",
    impact: "Potential disqualification if certification timeline cannot be met.",
    mitigation: "Begin FedRAMP High certification process immediately or partner with certified provider.",
  },
  {
    id: "2",
    clause: "Section 3.4.1 - Staffing Requirements",
    risk: "medium",
    description: "Requires 3 full-time security-cleared personnel dedicated to the project.",
    impact: "Staffing challenges and potential delays if clearances are not in place.",
    mitigation: "Identify qualified personnel with active clearances or begin clearance process for existing staff.",
  },
  {
    id: "3",
    clause: "Section 7.1.2 - Delivery Timeline",
    risk: "medium",
    description: "Requires initial prototype delivery within 45 days of award.",
    impact: "Tight timeline may impact quality or require additional resources.",
    mitigation: "Prepare prototype development plan with accelerated timeline and dedicated resources.",
  },
  {
    id: "4",
    clause: "Section 9.3.5 - Penalty Clauses",
    risk: "high",
    description: "Financial penalties for missed milestones (2% of contract value per week).",
    impact: "Significant financial risk if deliverables are delayed.",
    mitigation: "Include buffer time in project plan and establish rigorous quality control process.",
  },
  {
    id: "5",
    clause: "Section 4.2.7 - Technical Requirements",
    risk: "low",
    description: "Integration with legacy systems using standard APIs.",
    impact: "Minimal risk as company has experience with similar integrations.",
    mitigation: "Request detailed documentation on legacy systems during Q&A period.",
  },
]

export function RiskHeatmap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment</CardTitle>
        <CardDescription>Analysis of contract clauses and associated risks</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">
                High Risk (2)
              </Badge>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100">
                Medium Risk (2)
              </Badge>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                Low Risk (1)
              </Badge>
            </div>

            <div className="space-y-4">
              {riskItems.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-lg border p-4 ${
                    item.risk === "high"
                      ? "border-red-200 bg-red-50"
                      : item.risk === "medium"
                        ? "border-amber-200 bg-amber-50"
                        : "border-emerald-200 bg-emerald-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium">{item.clause}</h3>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-80 text-sm">
                              This assessment is based on AI analysis of the contract language and your company profile.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={`${
                            item.risk === "high"
                              ? "bg-red-100 text-red-700"
                              : item.risk === "medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {item.risk === "high" ? "High Risk" : item.risk === "medium" ? "Medium Risk" : "Low Risk"}
                        </Badge>
                        {item.risk === "high" && <AlertCircle className="h-4 w-4 text-red-500" />}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">View clause</span>
                    </Button>
                  </div>

                  <div className="mt-3 text-sm">
                    <p>{item.description}</p>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <p className="font-medium">Potential Impact:</p>
                        <p className="text-muted-foreground">{item.impact}</p>
                      </div>
                      <div>
                        <p className="font-medium">Suggested Mitigation:</p>
                        <p className="text-muted-foreground">{item.mitigation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button>
                Generate Mitigation Plan <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}

