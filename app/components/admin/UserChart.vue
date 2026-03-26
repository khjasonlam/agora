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

const props = defineProps<{ data: UserStat[] }>()

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface UserStat {
  name: string
  total: number
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
  labels: props.data.map(u => u.name),
  datasets: [
    {
      label: '投稿',
      data: props.data.map(u => u.posts),
      backgroundColor: `rgba(${primaryRgb},0.8)`,
      borderRadius: 4,
      borderSkipped: false
    },
    {
      label: 'コメント',
      data: props.data.map(u => u.threads),
      backgroundColor: `rgba(${primaryRgb},0.3)`,
      borderRadius: 4,
      borderSkipped: false
    }
  ]
}))

const chartOptions = computed(() => ({
  indexAxis: 'y' as const,
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
        label: (item: { dataset: { label?: string }, raw: unknown }) =>
          ` ${item.dataset.label ?? ''}: ${item.raw}`
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      stacked: true,
      ticks: {
        color: labelColor.value,
        precision: 0,
        font: { size: 11 }
      },
      grid: { color: gridColor.value },
      border: { display: false }
    },
    y: {
      stacked: true,
      ticks: {
        color: labelColor.value,
        font: { size: 12 }
      },
      grid: { display: false },
      border: { display: false }
    }
  }
}))
</script>

<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>
