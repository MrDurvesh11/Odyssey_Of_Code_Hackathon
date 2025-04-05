'use client'

import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
)

type PieChartProps = {
  title: string
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor?: string[]
    borderWidth?: number
  }[]
  height?: number | string
  className?: string
}

export function PieChart({ title, labels, datasets, height = 300, className = '' }: PieChartProps) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: title,
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
      <Pie options={options} data={data} />
    </div>
  )
}
