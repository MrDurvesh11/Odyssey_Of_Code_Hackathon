'use client'

import { BarChart } from '@/components/charts/bar-chart'
import { LineChart } from '@/components/charts/line-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Dummy data for RFP analysis
const rfpStatusData = {
  title: 'RFP Status',
  labels: ['Pending', 'In Progress', 'Submitted', 'Won', 'Lost'],
  datasets: [
    {
      label: '# of RFPs',
      data: [12, 19, 3, 5, 2],
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

// Dummy data for monthly trends
const monthlyTrendsData = {
  title: 'Monthly Submission Trends',
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Submissions',
      data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 85, 90],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      tension: 0.2,
    },
    {
      label: 'Win Rate',
      data: [30, 25, 40, 50, 35, 45, 55, 40, 50, 60, 70, 65],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      tension: 0.2,
    },
  ],
}

// Dummy data for requirement categories
const requirementCategoriesData = {
  title: 'Requirement Categories',
  labels: ['Technical', 'Security', 'Compliance', 'Integration', 'Support'],
  datasets: [
    {
      label: 'Requirement Distribution',
      data: [35, 25, 20, 15, 5],
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

// Dummy data for response performance
const responsePerformanceData = {
  title: 'Response Performance by Quarter',
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    {
      label: 'Completion Time (days)',
      data: [12, 10, 8, 6],
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1,
    },
    {
      label: 'Quality Score',
      data: [75, 80, 85, 90],
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 1,
    },
  ],
}

export function AnalyticsDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>RFP Status</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart 
            title={rfpStatusData.title}
            labels={rfpStatusData.labels}
            datasets={rfpStatusData.datasets}
            height={300}
          />
        </CardContent>
      </Card>
      
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Submission Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart 
            title={monthlyTrendsData.title}
            labels={monthlyTrendsData.labels}
            datasets={monthlyTrendsData.datasets}
            height={300}
          />
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Requirement Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart 
            title={requirementCategoriesData.title}
            labels={requirementCategoriesData.labels}
            datasets={requirementCategoriesData.datasets}
            height={300}
          />
        </CardContent>
      </Card>
      
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Response Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart 
            title={responsePerformanceData.title}
            labels={responsePerformanceData.labels}
            datasets={responsePerformanceData.datasets}
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  )
}
