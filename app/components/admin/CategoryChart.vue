<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
} from 'chart.js'

const props = defineProps<{ data: CategoryStat[] }>()

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

interface CategoryStat {
  name: string
  count: number
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
  labels: props.data.map(d => d.name),
  datasets: [
    {
      label: '投稿数',
      data: props.data.map(d => d.count),
      backgroundColor: `rgba(${primaryRgb},0.8)`,
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
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (item: { raw: unknown }) => ` ${item.raw} 投稿`
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        color: labelColor.value,
        precision: 0,
        font: { size: 11 }
      },
      grid: { color: gridColor.value },
      border: { display: false }
    },
    y: {
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
