<template>
  <div class="networth-section">
    <el-row class="header" justify="space-between" align="middle">
      <el-col>
        <h1 class="main-title">总资产概览</h1>
      </el-col>
 
    </el-row>
    <!-- 中间统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-label">总净资产</div>
        <div class="stat-value">￥{{ totalNetWorth.toLocaleString() }}</div>
        <div class="stat-date">{{ changePercent >= 0 ? '+' : '' }}{{ changePercent.toFixed(2) }}%较上周</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">银行卡余额</div>
        <div class="stat-value">￥{{ bankBalance.toLocaleString() }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">投资资产</div>
        <div class="stat-value">￥{{investmentValue.toLocaleString() }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">总盈亏</div>
        <div class="stat-value" :style="{ color: totalGainLoss > 0 ? 'green' : (totalGainLoss < 0 ? 'red' : '') }">
          {{ totalGainLoss >= 0 ? '+' : '' }}￥{{ totalGainLoss }}
        </div>
        <div class="stat-trend">{{ gainLossPercent >= 0 ? '+' : '' }}{{ gainLossPercent.toFixed(2)}}%总收益率</div>
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
const totalNetWorth = ref(2317371)
const investmentValue = ref(12345)
const totalGainLoss = ref(10)
const gainLossPercent = ref(10)
const bankBalance = ref(0)

const chartRef = ref(null)
let chartInstance = null
const chartData = ref([])

// 计算统计数据
// const maxValue = computed(() => Math.max(...chartData.value.map(d => d.value)))
// const minValue = computed(() => Math.min(...chartData.value.map(d => d.value)))
// const maxDate = computed(() => {
//   const maxItem = chartData.value.find(d => d.value === maxValue.value)
//   return maxItem ? maxItem.date.slice(5) : ''
// })
// const minDate = computed(() => {
//   const minItem = chartData.value.find(d => d.value === minValue.value)
//   return minItem ? minItem.date.slice(5) : ''
// })


const changePercent = computed(() => {
  if (chartData.value.length < 2) return 0
  const first = chartData.value[0].net_worth
  const last = chartData.value[chartData.value.length - 1].net_worth
  return ((last - first) / first) * 100
})

const initData = async () => {
  const userId = 1
  try {
    // 使用 await 直接获取响应结果
    const res = await axios.get(`/api/overview/${userId}`)
    
    if (res.data && res.data.success && res.data.data) {
      const data = res.data.data
      
      // 更新响应式数据 - 根据后端实际返回的字段
      totalNetWorth.value = data.totalNetWorth || 0
      investmentValue.value = data.investmentValue || 0
      bankBalance.value = data.bankBalance || 0
      totalGainLoss.value = data.totalGainLoss || 0
      gainLossPercent.value = data.gainLossPercent || 0
      
      // 更新图表数据 - 使用后端返回的 netWorthHistory，并格式化 record_date
      if (data.netWorthHistory && Array.isArray(data.netWorthHistory)) {
        chartData.value = data.netWorthHistory.map(item => ({
          record_date: item.record_date
            ? new Date(item.record_date).toISOString().slice(0, 10)
            : '',
          net_worth: item.net_worth
        }))
        console.log('更新图表数据:', chartData.value)
      }
      
      // 数据更新后重新渲染图表
      renderChart()
    } else {
      console.error('API返回数据格式不正确:', res.data)
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const renderChart = () => {
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  
  const dates = chartData.value.map(item => item.record_date.slice(5))
  const values = chartData.value.map(item => item.net_worth)
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
        formatter: value => `￥${(value).toFixed(1)}`
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
        return `￥${data.value.toLocaleString()}`
      }
    }
  })
}

onMounted(() => {
  initData()
})

watch(days, initData)
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