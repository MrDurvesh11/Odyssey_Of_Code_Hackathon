"use client"

import { useState } from "react"
import { Check, Download, FileText, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"

const checklistItems = [
  {
    section: "Administrative Requirements",
    items: [
      { id: "sf-33", name: "SF-33 Form", completed: true, required: true },
      { id: "cover-letter", name: "Cover Letter", completed: true, required: true },
      { id: "table-contents", name: "Table of Contents", completed: false, required: true },
      { id: "executive-summary", name: "Executive Summary", completed: false, required: true },
    ],
  },
  {
    section: "Technical Proposal",
    items: [
      { id: "tech-approach", name: "Technical Approach", completed: false, required: true },
      { id: "management-plan", name: "Management Plan", completed: false, required: true },
      { id: "staffing-plan", name: "Staffing Plan", completed: false, required: true },
      { id: "quality-control", name: "Quality Control Plan", completed: false, required: true },
      { id: "risk-mitigation", name: "Risk Mitigation Strategy", completed: false, required: false },
    ],
  },
  {
    section: "Past Performance",
    items: [
      { id: "past-perf-1", name: "Past Performance Reference #1", completed: false, required: true },
      { id: "past-perf-2", name: "Past Performance Reference #2", completed: false, required: true },
      { id: "past-perf-3", name: "Past Performance Reference #3", completed: false, required: false },
    ],
  },
  {
    section: "Cost Proposal",
    items: [
      { id: "cost-summary", name: "Cost Summary", completed: false, required: true },
      { id: "detailed-costs", name: "Detailed Cost Breakdown", completed: false, required: true },
      { id: "labor-categories", name: "Labor Categories and Rates", completed: false, required: true },
      { id: "other-direct-costs", name: "Other Direct Costs", completed: false, required: true },
    ],
  },
]

export function SubmissionChecklist() {
  const [checklist, setChecklist] = useState(checklistItems)

  const toggleItem = (sectionIndex: number, itemIndex: number) => {
    const newChecklist = [...checklist]
    newChecklist[sectionIndex].items[itemIndex].completed = !newChecklist[sectionIndex].items[itemIndex].completed
    setChecklist(newChecklist)
  }

  const totalItems = checklist.reduce((acc, section) => acc + section.items.length, 0)
  const completedItems = checklist.reduce(
    (acc, section) => acc + section.items.filter((item) => item.completed).length,
    0,
  )
  const completionPercentage = Math.round((completedItems / totalItems) * 100)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Submission Checklist</CardTitle>
            <CardDescription>Track your proposal submission requirements</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Checklist
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Overall Completion</div>
            <div className="text-sm font-medium">{completionPercentage}%</div>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {checklist.map((section, sectionIndex) => (
          <Collapsible key={section.section} defaultOpen={sectionIndex === 0}>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger className="flex items-center text-base font-medium hover:underline">
                {section.section}
              </CollapsibleTrigger>
              <div className="text-sm text-muted-foreground">
                {section.items.filter((item) => item.completed).length}/{section.items.length} completed
              </div>
            </div>
            <CollapsibleContent className="mt-4 space-y-3">
              {section.items.map((item, itemIndex) => (
                <div key={item.id} className="flex items-start space-x-3 rounded-md border p-3">
                  <Checkbox
                    id={item.id}
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(sectionIndex, itemIndex)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={item.id}
                      className="flex cursor-pointer items-center justify-between text-sm font-medium"
                    >
                      <span>{item.name}</span>
                      {!item.required && (
                        <Badge variant="outline" className="ml-2">
                          Optional
                        </Badge>
                      )}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.completed
                        ? "Completed and ready for submission"
                        : "Not yet completed - add to your task list"}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <FileText className="h-4 w-4" />
                    <span className="sr-only">View template</span>
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Item
              </Button>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-emerald-500" />
            AI-identified all required and optional submission items based on the RFP
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

