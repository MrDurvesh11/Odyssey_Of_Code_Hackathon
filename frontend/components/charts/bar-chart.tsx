'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

type BarChartProps = {
  title: string
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string
    borderColor?: string
    borderWidth?: number
  }[]
  height?: number | string
  className?: string
}

export function BarChart({ title, labels, datasets, height = 300, className = '' }: BarChartProps) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  }

  const data = {
    labels,
    datasets,
  }

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Bar options={options} data={data} />
    </div>
  )
}
