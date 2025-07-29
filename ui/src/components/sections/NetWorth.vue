<template>
  <div class="networth-section">
    <!-- 顶部数据概览 -->
    <div class="header">
      <div class="left-section">
        <div class="title">Net Worth</div>
        <div class="time-selector">
          <select v-model="days" @change="fetchData" class="time-dropdown">
            <option :value="5">最近5天</option>
            <option :value="7">最近7天</option>
            <option :value="30">最近30天</option>
          </select>
        </div>
      </div>
      
      <div class="center-section">
        <div class="main-amount">${{ total.toLocaleString() }}</div>
        <div class="change-info">
          <span class="change-label">LAST {{ days }} DAYS</span>
          <span v-if="changeRange !== null" :class="changeRange >= 0 ? 'up' : 'down'">
            {{ changeRange >= 0 ? '+' : '' }}${{ changeRange.toLocaleString() }}
          </span>
        </div>
      </div>
      
      <div class="right-section">
        <div class="today-change">
          <div class="change-label">TODAY'S CHANGE</div>
          <span v-if="changeToday !== null" :class="changeToday >= 0 ? 'up' : 'down'">
            {{ changeToday >= 0 ? '+' : '' }}${{ changeToday.toLocaleString() }}
          </span>
        </div>
        <div class="change-percent">
          <span v-if="changePercent !== null" :class="changePercent >= 0 ? 'up' : 'down'">
            {{ changePercent >= 0 ? '+' : '' }}{{ changePercent.toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- 中间统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-label">最高值</div>
        <div class="stat-value">${{ maxValue.toLocaleString() }}</div>
        <div class="stat-date">{{ maxDate }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">最低值</div>
        <div class="stat-value">${{ minValue.toLocaleString() }}</div>
        <div class="stat-date">{{ minDate }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">平均日增长</div>
        <div class="stat-value">${{ avgDailyChange.toLocaleString() }}</div>
        <div class="stat-trend">/ 天</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">波动率</div>
        <div class="stat-value">{{ volatility.toFixed(2) }}%</div>
        <div class="stat-trend">标准差</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-container">
      <div ref="chartRef" class="chart"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'

const days = ref(30)
const total = ref(2317371)
const changeToday = ref(3402)
const changeRange = ref(138884)
const chartRef = ref(null)
let chartInstance = null
const chartData = ref([
  { date: '2024-06-29', value: 2100000 },
  { date: '2024-06-30', value: 2100000 },
  { date: '2024-07-01', value: 2100000 },
  { date: '2024-07-02', value: 2100000 },
  { date: '2024-07-03', value: 2100000 },
  { date: '2024-07-04', value: 2100000 },
  { date: '2024-07-05', value: 2100000 },
  { date: '2024-07-06', value: 2100000 },
  { date: '2024-07-07', value: 2100000 },
  { date: '2024-07-08', value: 2100000 },
  { date: '2024-07-09', value: 2100000 },
  { date: '2024-07-10', value: 2100000 },
  { date: '2024-07-11', value: 2100000 },
  { date: '2024-07-12', value: 2100000 },
  { date: '2024-07-13', value: 2100000 },
  { date: '2024-07-14', value: 2100000 },
  { date: '2024-07-15', value: 2100000 },
  { date: '2024-07-16', value: 2100000 },
  { date: '2024-07-17', value: 2100000 },
  { date: '2024-07-18', value: 2100000 },
  { date: '2024-07-19', value: 2100000 },
  { date: '2024-07-20', value: 2100000 },
  { date: '2024-07-21', value: 2100000 },
  { date: '2024-07-22', value: 2100000 },
  { date: '2024-07-23', value: 2050000 },
  { date: '2024-07-24', value: 2100000 },
  { date: '2024-07-25', value: 2150000 },
  { date: '2024-07-26', value: 2200000 },
  { date: '2024-07-27', value: 2250000 },
  { date: '2024-07-28', value: 2317371 }
])

// 计算统计数据
const maxValue = computed(() => Math.max(...chartData.value.map(d => d.value)))
const minValue = computed(() => Math.min(...chartData.value.map(d => d.value)))
const maxDate = computed(() => {
  const maxItem = chartData.value.find(d => d.value === maxValue.value)
  return maxItem ? maxItem.date.slice(5) : ''
})
const minDate = computed(() => {
  const minItem = chartData.value.find(d => d.value === minValue.value)
  return minItem ? minItem.date.slice(5) : ''
})
const avgDailyChange = computed(() => {
  if (chartData.value.length < 2) return 0
  return Math.round((chartData.value[chartData.value.length - 1].value - chartData.value[0].value) / (chartData.value.length - 1))
})
const volatility = computed(() => {
  if (chartData.value.length < 2) return 0
  const values = chartData.value.map(d => d.value)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
  return Math.sqrt(variance) / mean * 100
})
const changePercent = computed(() => {
  if (chartData.value.length < 2) return 0
  const first = chartData.value[0].value
  const last = chartData.value[chartData.value.length - 1].value
  return ((last - first) / first) * 100
})

const fetchData = async () => {
  // 这里替换为实际的API调用
  const res = await axios.get(`/api/networth/${days.value}`)
  chartData.value = res.data.history
  total.value = res.data.total
  changeToday.value = res.data.changeToday
  
  // 模拟数据更新
  if (days.value === 5) {
    chartData.value = chartData.value.slice(-5)
  } else if (days.value === 7) {
    chartData.value = chartData.value.slice(-7)
  }
  
  changeRange.value = chartData.value[chartData.value.length - 1].value - chartData.value[0].value
  renderChart()
}

const renderChart = () => {
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  
  const dates = chartData.value.map(item => item.date.slice(5))
  const values = chartData.value.map(item => item.value)
  
  chartInstance.setOption({
    grid: { 
      left: 60, 
      right: 40, 
      top: 40, 
      bottom: 60, 
      containLabel: true 
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#e3eaf2' } },
      axisLabel: { 
        color: '#64748b', 
        fontSize: 12,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#e3eaf2' } },
      axisLabel: { 
        color: '#64748b', 
        fontSize: 12,
        formatter: (value) => `$${(value / 1000000).toFixed(1)}M`
      }
    },
    series: [{
      data: values,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#1a73e8', width: 3 },
      itemStyle: { color: '#1a73e8' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(26,115,232,0.2)' },
          { offset: 1, color: 'rgba(26,115,232,0.02)' }
        ])
      }
    }],
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#223354',
      borderColor: '#1a73e8',
      textStyle: { color: '#fff' },
      formatter: (params) => {
        const data = params[0]
        return `${data.name}<br/>$${data.value.toLocaleString()}`
      }
    }
  })
}

onMounted(() => {
  fetchData()
})

watch(days, fetchData)
</script>

<style scoped>
.networth-section {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(34,51,84,0.08);
  border: 1.5px solid #e3eaf2;
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.left-section {
  flex: 1;
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #223354;
  margin-bottom: 8px;
}

.time-dropdown {
  padding: 8px 12px;
  border: 1px solid #e3eaf2;
  border-radius: 8px;
  background: #fff;
  color: #223354;
  font-size: 0.9rem;
  cursor: pointer;
}

.center-section {
  flex: 2;
  text-align: center;
}

.main-amount {
  font-size: 3rem;
  font-weight: bold;
  color: #1a73e8;
  margin-bottom: 8px;
}

.change-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.right-section {
  flex: 1;
  text-align: right;
}

.today-change {
  margin-bottom: 8px;
}

.change-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.up {
  color: #22c55e;
  font-weight: bold;
  margin-left: 4px;
}

.down {
  color: #ef4444;
  font-weight: bold;
  margin-left: 4px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  background: #f8fafc;
  border: 1px solid #e3eaf2;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 4px;
  font-weight: 500;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #223354;
  margin-bottom: 2px;
}

.stat-date, .stat-trend {
  font-size: 0.7rem;
  color: #64748b;
}

.chart-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 280px;
}
</style>