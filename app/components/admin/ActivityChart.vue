<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'

const props = defineProps<{ data: DayActivity[] }>()

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface DayActivity {
  date: string
  posts: number
  threads: number
}

const colorMode = useColorMode()

// Tailwind yellow-500
const primaryRgb = '234,179,8'

const labelColor = computed(() =>
  colorMode.value === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'
)

const gridColor = computed(() =>
  colorMode.value === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
)

const chartData = computed(() => ({
  labels: props.data.map((d) => {
    const [, month, day] = d.date.split('-')
    return `${month}/${day}`
  }),
  datasets: [
    {
      label: '投稿',
      data: props.data.map(d => d.posts),
      backgroundColor: `rgba(${primaryRgb},0.8)`,
      borderRadius: 4,
      borderSkipped: false
    },
    {
      label: 'コメント',
      data: props.data.map(d => d.threads),
      backgroundColor: `rgba(${primaryRgb},0.3)`,
      borderRadius: 4,
      borderSkipped: false
    }
  ]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      align: 'end' as const,
      labels: {
        color: labelColor.value,
        boxWidth: 12,
        boxHeight: 12,
        borderRadius: 3,
        useBorderRadius: true,
        font: { size: 12 }
      }
    },
    tooltip: {
      callbacks: {
        title: (items: { dataIndex: number }[]) =>
          props.data[items[0]?.dataIndex ?? 0]?.date ?? ''
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: labelColor.value,
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 10,
        font: { size: 11 }
      },
      grid: { display: false },
      border: { display: false }
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: labelColor.value,
        precision: 0,
        font: { size: 11 }
      },
      grid: { color: gridColor.value },
      border: { display: false }
    }
  }
}))
</script>

<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>
