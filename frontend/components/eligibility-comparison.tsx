import { CheckCircle, HelpCircle, MinusCircle, XCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const requirements = [
  {
    category: "Technical Requirements",
    items: [
      { name: "Cloud Migration Experience", status: "match", score: 95 },
      { name: "FedRAMP Certification", status: "match", score: 100 },
      { name: "Agile Development", status: "match", score: 90 },
      { name: "DevSecOps Implementation", status: "partial", score: 65 },
    ],
  },
  {
    category: "Past Performance",
    items: [
      { name: "Federal Agency Experience", status: "match", score: 85 },
      { name: "Similar Project Scale", status: "match", score: 80 },
      { name: "On-time Delivery Record", status: "match", score: 90 },
    ],
  },
  {
    category: "Compliance & Certifications",
    items: [
      { name: "ISO 27001", status: "match", score: 100 },
      { name: "CMMI Level 4", status: "no-match", score: 0 },
      { name: "Section 508 Compliance", status: "partial", score: 60 },
    ],
  },
]

export function EligibilityComparison() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Eligibility & Capability Analysis</CardTitle>
        <CardDescription>Comparison between RFP requirements and company capabilities</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-8">
            {requirements.map((category) => (
              <div key={category.category}>
                <h3 className="text-lg font-medium mb-4">{category.category}</h3>
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <div key={item.name} className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-6">
                        {item.status === "match" ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : item.status === "partial" ? (
                          <MinusCircle className="h-5 w-5 text-amber-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center">
                          <span className="font-medium">{item.name}</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-80 text-sm">
                                {item.status === "match"
                                  ? "Your company fully meets this requirement."
                                  : item.status === "partial"
                                    ? "Your company partially meets this requirement. Consider addressing gaps."
                                    : "Your company does not meet this requirement. Consider partnering."}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={item.score} className="h-2 w-full" />
                          <span className="text-sm text-muted-foreground w-8">{item.score}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TooltipProvider>

        <div className="mt-8 rounded-lg bg-muted p-4">
          <h3 className="text-sm font-medium mb-2">Gap Analysis Summary</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your company meets 7 out of 10 requirements fully, 2 partially, and 1 not at all. Consider addressing the
            following gaps:
          </p>
          <ul className="text-sm space-y-2">
            <li className="flex items-start">
              <MinusCircle className="mr-2 h-4 w-4 text-amber-500 mt-0.5" />
              <span>
                <span className="font-medium">DevSecOps Implementation:</span> Consider obtaining additional
                certifications or partnering with a specialized provider.
              </span>
            </li>
            <li className="flex items-start">
              <MinusCircle className="mr-2 h-4 w-4 text-amber-500 mt-0.5" />
              <span>
                <span className="font-medium">Section 508 Compliance:</span> Enhance accessibility expertise through
                training or hiring.
              </span>
            </li>
            <li className="flex items-start">
              <XCircle className="mr-2 h-4 w-4 text-red-500 mt-0.5" />
              <span>
                <span className="font-medium">CMMI Level 4:</span> Consider partnering with a CMMI Level 4 certified
                organization or begin certification process.
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

