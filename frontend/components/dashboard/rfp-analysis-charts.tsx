'use client'

import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Dummy data for requirement types
const requirementTypesData = {
  title: 'Requirement Categories',
  labels: ['Technical', 'Security', 'Compliance', 'Integration', 'Support'],
  datasets: [
    {
      label: 'Count',
      data: [24, 18, 12, 8, 6],
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
      ],
    },
  ],
}

// Dummy data for compliance requirements
const complianceRequirementsData = {
  title: 'Compliance Requirements',
  labels: ['GDPR', 'HIPAA', 'ISO 27001', 'SOC 2', 'PCI DSS'],
  datasets: [
    {
      label: 'Count',
      data: [5, 7, 3, 4, 2],
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 1,
    },
  ],
}

// Dummy data for complexity score
const complexityScoreData = {
  title: 'Complexity Analysis',
  labels: ['Technical Complexity', 'Timeline Constraints', 'Resource Requirements', 'Integration Complexity', 'Customization'],
  datasets: [
    {
      label: 'Score (1-10)',
      data: [8, 6, 7, 9, 5],
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1,
    },
  ],
}

// Dummy data for risk assessment
const riskAssessmentData = {
  title: 'Risk Assessment',
  labels: ['Low', 'Medium', 'High', 'Critical'],
  datasets: [
    {
      label: 'Requirements Count',
      data: [15, 25, 10, 5],
      backgroundColor: [
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(255, 99, 132, 0.7)',
      ],
    },
  ],
}

export function RfpAnalysisCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Requirement Types</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart 
            title={requirementTypesData.title}
            labels={requirementTypesData.labels}
            datasets={requirementTypesData.datasets}
            height={300}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Compliance Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart 
            title={complianceRequirementsData.title}
            labels={complianceRequirementsData.labels}
            datasets={complianceRequirementsData.datasets}
            height={300}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Complexity Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart 
            title={complexityScoreData.title}
            labels={complexityScoreData.labels}
            datasets={complexityScoreData.datasets}
            height={300}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart 
            title={riskAssessmentData.title}
            labels={riskAssessmentData.labels}
            datasets={riskAssessmentData.datasets}
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  )
}
