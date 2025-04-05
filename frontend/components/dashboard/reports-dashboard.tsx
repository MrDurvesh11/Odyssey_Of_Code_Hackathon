'use client'

import { BarChart } from '@/components/charts/bar-chart'
import { LineChart } from '@/components/charts/line-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Dummy data for win rate by month
const winRateData = {
  title: 'Win Rate by Month',
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Win Rate %',
      data: [45, 52, 49, 60, 55, 65],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      tension: 0.2,
    },
  ],
}

// Dummy data for RFP by industry
const rfpByIndustryData = {
  title: 'RFPs by Industry',
  labels: ['Healthcare', 'Finance', 'Government', 'Education', 'Technology', 'Retail'],
  datasets: [
    {
      label: 'Count',
      data: [25, 18, 15, 12, 30, 10],
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
      ],
    },
  ],
}

// Dummy data for average completion time
const completionTimeData = {
  title: 'Average Completion Time (Days)',
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Days to Complete',
      data: [14, 12, 13, 10, 9, 8],
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1,
    },
  ],
}

// Dummy data for team performance
const teamPerformanceData = {
  title: 'Team Performance',
  labels: ['Team A', 'Team B', 'Team C', 'Team D'],
  datasets: [
    {
      label: 'RFPs Completed',
      data: [12, 15, 10, 8],
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 1,
    },
    {
      label: 'Win Rate %',
      data: [60, 75, 55, 65],
      backgroundColor: 'rgba(255, 99, 132, 0.7)',
      borderColor: 'rgb(255, 99, 132)',
      borderWidth: 1,
    },
  ],
}

export function ReportsDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Win Rate Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart 
            title={winRateData.title}
            labels={winRateData.labels}
            datasets={winRateData.datasets}
            height={300}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>RFPs by Industry</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart 
            title={rfpByIndustryData.title}
            labels={rfpByIndustryData.labels}
            datasets={rfpByIndustryData.datasets}
            height={300}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Completion Time</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart 
            title={completionTimeData.title}
            labels={completionTimeData.labels}
            datasets={completionTimeData.datasets}
            height={300}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart 
            title={teamPerformanceData.title}
            labels={teamPerformanceData.labels}
            datasets={teamPerformanceData.datasets}
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  )
}
