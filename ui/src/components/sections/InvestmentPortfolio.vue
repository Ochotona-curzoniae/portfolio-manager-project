<template>
  <div class="portfolio-container" v-loading="loading" element-loading-text="正在加载数据..." element-loading-spinner="el-icon-loading" element-loading-background="rgba(255, 255, 255, 0.7)" >
    <el-row class="header" justify="space-between" align="middle">
      <el-col>
        <h1 class="main-title">投资组合</h1>
      </el-col>

    </el-row>

    <el-row :gutter="24">
      <!-- 投资概览卡片 -->
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>总资产</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">￥{{ totalValue }}</div>
            <div :class="totalValueRate > 0 ? 'stat-change positive' : 'stat-change negative'">
              收益率：{{ totalValueRate > 0 ? '+' : '' }}{{ totalValueRate }}%
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>今日收益</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">￥1,245.80</div>
            <div class="stat-change positive">+￥89.45 (+7.7%)</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>持仓数量</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">{{ holdingList.length }}</div>
            <div class="stat-change">--</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 投资列表上方新增资产分布饼图 -->
    <el-card class="asset-pie-card" shadow="hover" style="margin-bottom: 24px;">
      <template #header>
        <div class="card-header">
          <span>资产分布</span>
        </div>
      </template>
      <div class="chart-wrapper">
        <div id="asset-pie" style="width: 520px; height: 260px; margin: 0 auto;" />
      </div>
    </el-card>
    <!-- 投资列表 -->
    <el-card class="portfolio-list" shadow="hover">
      <template #header>
        <div class="card-header" style="display: flex; align-items: center; justify-content: space-between;">
          <span>持仓详情</span>
          <el-button type="primary" :icon="Plus" @click="openAddInvestment">添加投资</el-button>
        </div>
      </template>

      <div class="table-container">
        <el-table
          :data="holdingList"
          stripe
          highlight-current-row
          class="portfolio-table"
          :header-cell-style="{ background: '#f5f7fa', color: '#303133', fontWeight: '600' }"
          table-layout="fixed"
        >
        <el-table-column prop="symbol" label="股票名称" width="120" />
        <el-table-column prop="companyName" label="公司名称" width="150" />

        <el-table-column prop="shares" label="持股数量" align="center" width="100">
          <template #default="{ row }">
            <el-tag type="info" effect="plain" size="large" style="font-size: 16px; padding: 4px 12px;">
              {{ row.shares }} 股
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="avgPrice" label="均价" align="center" >
          <template #default="{ row }">
            <span style="color: #409EFF; font-weight: bold; font-size: 15px;">
              ￥{{ row.avgPrice }}
            </span>
            <span style="color: #999; font-size: 12px;">/股</span>
          </template>
        </el-table-column>
        <el-table-column prop="currentPrice" label="现价" align="center" >
          <template #default="{ row }">
            <span style="color: #67C23A; font-weight: bold; font-size: 15px;">
              ￥{{ row.currentPrice }}
            </span>
            <span style="color: #999; font-size: 12px;">/股</span>
          </template>
        </el-table-column>
        <el-table-column prop="marketValue" label="市值" align="center" >
          <template #default="{ row }">
            <el-tag
              :type="Number(row.marketValue) >= 10 ? 'success' : 'warning'"
              effect="dark"
              size="large"
              style="font-size: 16px; padding: 4px 12px;"
            >
              ￥{{ row.marketValue }} 亿元
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gainLossPercent" label="收益率"  align="center" >
          <template #default="{ row }">
            <span :class="row.gainLossPercent >= 0 ? 'profit-tag' : 'loss-tag'">
              {{ row.gainLossPercent >= 0 ? '+' : '' }}{{ row.gainLossPercent }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" >
          <template #default="{ row }">
            <div style="display: flex; justify-content: center; gap: 8px;">
              <el-button
                type="danger"
                size="small"
                :icon="Edit"
                class="action-btn"
                plain
                @click="openTradeDialog(row, 'buy')"
              >买入</el-button>
              <el-button
                type="primary"
                size="small"
                :icon="Edit"
                class="action-btn"
                plain
                @click="openTradeDialog(row, 'sell')"
              >卖出</el-button>
            </div>
          </template>
        </el-table-column>
              </el-table>
      </div>
    
    </el-card>

    <!-- 添加投资Dialog -->
    <el-dialog
      v-model="dialogVisible"
      title="添加投资"
      width="900px"
      :close-on-click-modal="false"
      class="investment-dialog"
    >
      <div class="dialog-content">
        <el-row :gutter="24">
          <!-- 左侧表单 -->
          <el-col :span="12">
            <el-card class="form-card" shadow="never">
              <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="add-stock-form">
                <el-form-item label="投资类型">
                  <el-input v-model="form.type" disabled class="disabled-input" />
                </el-form-item>
                <el-form-item label="选择股票" prop="symbol">
                  <el-select v-model="form.symbol" placeholder="请选择要投资的股票" style="width: 100%;" filterable class="stock-select" @change="onStockChange">
                    <el-option v-for="item in stockList" :key="item.symbol" :label="item.symbol" :value="item.symbol" />
                  </el-select>
                </el-form-item>
                <el-form-item label="每股价格" v-if="form.symbol">
                  <el-input :value="selectedStockPrice" readonly class="price-input" />
                </el-form-item>
                <el-form-item label="买入股数" prop="shares">
                  <el-input-number v-model="form.shares" :min="1" :max="100000" style="width: 100%;" class="count-input" />
                </el-form-item>
                <el-form-item label="投资总额">
                  <el-input :value="totalPrice" readonly class="total-price-input" />
                </el-form-item>
                <el-form-item label="支付方式" prop="bankCardId">
                  <el-select v-model="form.bankCardId" placeholder="请选择卡号" style="width: 100%;" filterable class="stock-select" @change="onBankChange">
                    <el-option v-for="item in bankList" :key="item.bankName" :label="item.bankName+':'+item.accountNumber" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          
          <!-- 右侧图表 -->
          <el-col :span="12">
            <el-card class="chart-card" shadow="never">
              <template #header>
                <div class="chart-header">
                  <span class="chart-title">{{ form.name ? form.name + ' 过去7天价格走势' : '选择股票查看价格走势' }}</span>
                </div>
              </template>
              <div id="stock-chart" class="stock-chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="onSubmit" class="confirm-btn">确认买入</el-button>
        </div>
      </template>
    </el-dialog>
<!-- 买入卖出Dialog -->
    <el-dialog
      v-model="tradeDialogVisible"
      :title="tradeType === 'buy' ? '买入股票' : '卖出股票'"
      width="500px"
      :close-on-click-modal="false"
      class="trade-dialog"
    >
      <div class="dialog-content">
        <el-card class="form-card" shadow="never">
          <el-form :model="tradeForm" :rules="tradeRules" ref="tradeFormRef" label-width="100px" class="add-stock-form">
            <el-form-item label="股票名称">
              <el-input v-model="tradeForm.symbol" disabled class="disabled-input" />
            </el-form-item>
            <el-form-item label="交易类型">
              <el-input v-model="tradeTypeLabel" disabled class="disabled-input" />
            </el-form-item>
            <el-form-item label="交易数量" prop="shares">
              <el-input-number v-model="tradeForm.shares" :min="1" :max="100000" style="width: 100%;" class="count-input" />
            </el-form-item>
            

            <el-form-item label="预计收益" v-if="tradeType === 'sell'">
              <el-input :value="expectedProfit" readonly class="profit-input" />
            </el-form-item>
            <el-form-item label="预估交易额" v-else>
              <el-input :value="expectedProfit" readonly class="profit-input" />
            </el-form-item>
            <el-form-item label="支付方式" prop="bankCardId" v-if="tradeType === 'buy'">
              <el-select v-model="tradeForm.bankCardId" placeholder="请选择卡号" style="width: 100%;" filterable class="stock-select">
                <el-option v-for="item in bankList" :key="item.bankName" :label="item.bankName+':'+item.accountNumber" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="tradeDialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="onTradeSubmit" class="confirm-btn">确认交易</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { Plus, Refresh, View, Edit } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const holdingList = ref([])
const cash = ref(0)
const stocks = ref(0)
const currentAllocation = ref([])
const totalValue = ref([])
const totalValueRate = ref(10)
const loading = ref(false)

const dialogVisible = ref(false)
const formRef = ref()
const stockList = ref([])
const bankList = ref([])

const getStocksAndBanks = async () => {
  try {
    const userId=1
    // 获取卡号
    const res = await axios.get(`/api/bank/${userId}`)
    bankList.value = res.data.data.map(item => {
      return {
        id: item.id,
        bankName: item.bank_name,
        accountNumber: item.account_number
      }
    })
    // 获取股票
    const res1 = await axios.get(`/api/portfolio/history/simple/symbols/default`)
    stockList.value = res1.data.data

  } catch (e) {
    stockList.value = []
  }
}

const openAddInvestment = () => {
  getStocksAndBanks()
  dialogVisible.value = true
}

const form = ref({
  type: '股票',
  symbol: '',
  shares: 1
})

const rules = {
  symbol: [{ required: true, message: '请选择股票', trigger: 'change' }],
  shares: [{ required: true, message: '请输入买入股数', trigger: 'blur' }],
  bankCardId: [{ required: true, message: '请选择支付方式', trigger: 'change' }]
}

// 计算总价
const totalPrice = computed(() => {
  const stock = stockList.value.find(item => item.symbol === form.value.symbol)
  if (!stock) return ''
  return (form.value.shares * stock.price).toFixed(2)
})

const selectedStockPrice = computed(() => {
  const stock = stockList.value.find(item => item.symbol === form.value.symbol)
  return stock ? stock.price.toFixed(2) : ''
})

const onSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 买入股票
      axios.post('/api/portfolio/buy', {
        userId: 1,
        symbol: form.value.symbol,
        companyName: form.value.companyName,
        shares: form.value.shares,
        price: selectedStockPrice.value,
        bankCardId: form.value.bankCardId
      })
      .then(res => {
        if (res.data.success) {
          ElMessage.success('买入成功')
          dialogVisible.value = false
          getInitData()
        } else {
          ElMessage.error(`买入失败:${res.data.error}`)
        }
      })
      .catch(error => {
        console.log(error)
        if (error.response && error.response.data && error.response.data.error) {
          ElMessage.error(`买入失败:${error.response.data.error}`)
        } else {
          ElMessage.error('买入失败: 网络错误或服务器异常')
        }
      })
    }
  })
}


// 资产分布饼图数据计算
function getPieData() {

  return [
    { value: cash.value, name: '现金' },
    { value: stocks.value, name: '股票' }
  ]
}


const getInitData = async () => {
  loading.value = true
  const userId = 1
  try {
    // 使用 await 直接获取响应结果
    const res = await axios.get(`/api/portfolio/${userId}`)
    if (res.data && res.data.success && res.data.data) {
      const data = res.data.data
      
      // 批量更新数据，减少重渲染次数
      await nextTick(() => {
        // 更新响应式数据 - 字段名转换为驼峰
        holdingList.value = (data.stockHoldings || []).map(item => {
          return {
            userId: item.user_id,
            symbol: item.symbol,
            companyName: item.company_name,
            shares: item.shares,
            avgPrice: Number(item.avg_price).toFixed(2),
            currentPrice: Number(item.current_price).toFixed(2),
            marketValue: Number(item.market_value).toFixed(2),
            gainLoss: item.gain_loss,
            gainLossPercent: Number(item.gain_loss_percent).toFixed(2),
            createdAt: item.created_at,
            updatedAt: item.updated_at
          }
        })
        
        // 修正：应先找到对应项再取 value
        cash.value = (data.currentAllocation || []).find(item => item.name === 'cash')?.value.toFixed(2) || 0
        stocks.value = (data.currentAllocation || []).find(item => item.name === 'stocks')?.value.toFixed(2)  || 0

        currentAllocation.value = data.currentAllocation || []
        totalValue.value = Number(data.totalValue || 0).toFixed(2)
      })
      
    } else {
      console.error('API返回数据格式不正确:', res.data)
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

let chart = null

onMounted(() => {
  getInitData()
  
  // 延迟初始化图表，确保DOM和数据都已准备好
  nextTick(() => {
    initChart()
  })
})

const initChart = () => {
  const chartDom = document.getElementById('asset-pie')
  if (!chartDom) return
  
  chart = echarts.init(chartDom)
  const option = {
    tooltip: { 
      trigger: 'item',
      appendToBody: true
    },
    legend: {
      orient: 'vertical',
      right: 30,
      top: 'center',
      textStyle: { fontWeight: 500, color: '#223354' }
    },
    series: [
      {
        name: '资产分布',
        type: 'pie',
        radius: ['50%', '80%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b} {d}%',
          fontSize: 16,
          color: '#223354',
          fontWeight: 600
        },
        emphasis: {
          label: { show: true, fontSize: 18, fontWeight: 'bold' }
        },
        data: getPieData(),
        color: ['#409EFF', '#FFB300']
      }
    ]
  }
  chart.setOption(option)
}

// 响应式更新
watch([holdingList, cash, stocks], () => {
  if (chart) {
    const option = chart.getOption()
    option.series[0].data = getPieData()
    chart.setOption(option)
  }
}, { deep: true })

const tradeDialogVisible = ref(false)
const tradeFormRef = ref()
const tradeForm = ref({
  userId:1,
  symbol: '',
  companyName: '',
  price: 0,
  shares: 1,
  bankCardId: ''
})



const tradeType = ref('buy') // 'buy' 或 'sell'
const tradeTypeLabel = computed(() => tradeType.value === 'buy' ? '买入' : '卖出')
// 收益率计算
const expectedProfit = computed(() => {
  // 查找当前股票的持仓信息
  const holding = holdingList.value.find(item => item.symbol === tradeForm.value.symbol)
  if (!holding) return '-'
  // 取当前价和成本价
  const currentPrice = holding.currentPrice || 0
  const avgPrice = holding.avgPrice || 0
  const shares = tradeForm.value.shares || 0
  const profit = (currentPrice - avgPrice) * shares
  if (tradeType.value !== 'sell') return (currentPrice*shares).toFixed(2)

  return profit.toFixed(2)
})

const tradeRules = {
  shares: [{ required: true, message: '请输入交易数量', trigger: 'blur' }],
  bankCardId: [{ required: true, message: '请选择支付方式', trigger: 'change' }]
}


// 模拟股票历史数据 - 只展示过去7天
const stockHistoryData = ref({})

let stockChart = null

// 股票选择变化时更新图表
const onStockChange = async() => {
  if (form.value.symbol) {
    const res = await axios.get(`/api/portfolio/history/${form.value.symbol}`)
    console.log(res.data.data)
    stockHistoryData.value = res.data.data
    updateStockChart()
    form.value.companyName = stockList.value.find(item => item.symbol === form.value.symbol).symbol
  }
}


// 更新股票图表
const updateStockChart = () => {
  
  let chartData = stockHistoryData.value.history
  
  const chartDom = document.getElementById('stock-chart')
  if (!chartDom) {
    return
  }
  
  if (stockChart) {
    stockChart.dispose()
  }
  
  stockChart = echarts.init(chartDom)
  
  const option = {
    grid: {
      left: '15%',
      right: '5%',
      top: '10%',
      bottom: '5%'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const data = params[0]
        return `${data.name}<br/>价格: ￥${data.value}`
      }
    },
    xAxis: {
      type: 'category',
      data: chartData.map(item => item.date),
      axisLine: {
        lineStyle: {
          color: '#e4e7ed'
        }
      },
      axisLabel: {
        color: '#606266',
        fontSize: 10,
        rotate: 0,
        margin: 5
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#e4e7ed'
        }
      },
      axisLabel: {
        color: '#606266',
        fontSize: 12,
        formatter: '￥{value}'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    series: [
      {
        name: '价格',
        type: 'line',
        data: chartData.map(item => item.close),
        smooth: true,
        lineStyle: {
          color: '#409eff',
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ]
          }
        },
        itemStyle: {
          color: '#409eff',
          borderWidth: 2,
          borderColor: '#fff'
        }
      }
    ]
  }
  
  stockChart.setOption(option)
}

// 打开买入/卖出Dialog
const openTradeDialog = (row, type) => {
  if (type === 'buy') {
    getStocksAndBanks() // 只在买入时加载银行列表
  }
  tradeForm.value={
    userId:row.userId,
    symbol:row.symbol,
    companyName:row.companyName,
    price:row.currentPrice,
    bankCardId: ''
  }
  tradeType.value = type
  tradeDialogVisible.value = true
}

// 提交买入/卖出
const onTradeSubmit = () => {
  tradeFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 这里可以根据 tradeType.value 判断是买入还是卖出
        // 发送请求到后端
        if(tradeType.value==='buy'){
          const res = await axios.post('/api/portfolio/buy', { 
            ...tradeForm.value,
            bankCardId: tradeForm.value.bankCardId
          }).then(res=>{
            if(res.data.success){
              ElMessage.success('买入成功')
            }else{
              ElMessage.error('买入失败')
            }
          }).catch(error=>{
            ElMessage.error(`买入失败:${error.response.data.error}`)
          })
 
        }else{
          const res = await axios.post('/api/portfolio/sell', { 
            userId: tradeForm.value.userId,
            symbol: tradeForm.value.symbol,
            companyName: tradeForm.value.companyName,
            price: tradeForm.value.price,
            shares: tradeForm.value.shares
          })
          if(res.data.success){
            ElMessage.success('卖出成功')
          }else{
            ElMessage.error('卖出失败')
          }
        }
        tradeDialogVisible.value = false
        getInitData()
      } catch (error) {
        ElMessage.error(tradeType.value === 'buy' ? '买入失败' : '卖出失败')
      }
    }
  })
}
</script>

<style scoped>
.portfolio-container {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  padding: 32px;
  overflow-y: auto;
  background: #f8f9fa;
  position: relative;
  box-sizing: border-box;
}



.header {
  margin-bottom: 32px;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #223354;
  margin: 0;
}

.portfolio-list {
  margin-top: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: #223354;
}





.stat-change.positive {
  color: #10b981;
}
.stat-change.negative {
  color: #f30d0d;
}

/* 统计卡片统一样式 */
.stat-card {
  height: 100%;
}

.stat-card :deep(.el-card__body) {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  text-align: center;
  width: 100%;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #223354;
  margin-bottom: 8px;
  line-height: 1.2;
}

.stat-change {
  font-size: 0.9rem;
  color: #64748b;
  min-height: 20px;
  line-height: 1.2;
}
.investment-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.investment-name .el-avatar {
  border: 1px solid #e4e7ed;
}

.profit-tag {
  background: #e8f8f2;
  color: #10b981;
  border-radius: 12px;
  padding: 2px 12px;
  font-weight: 500;
  font-size: 15px;
}

.loss-tag {
  background: #fbeaea;
  color: #f56c6c;
  border-radius: 12px;
  padding: 2px 12px;
  font-weight: 500;
  font-size: 15px;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.el-card__body) {
  padding: 20px;
}

.asset-pie-card {
  background: #fff;
  margin-top: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px #f0f1f2;
}

.chart-wrapper {
  height: 260px;
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}


.add-stock-form .el-form-item {
  margin-bottom: 18px;
}
.add-stock-form .el-input,
.add-stock-form .el-select,
.add-stock-form .el-input-number {
  font-size: 16px;
}
.add-stock-form .el-input[readonly] input {
  background: #f5f7fa;
  color: #223354;
  font-weight: 600;
}

/* 对话框样式 */
.investment-dialog,
.trade-dialog {
  border-radius: 16px;
}

.investment-dialog :deep(.el-dialog__header),
.trade-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
  padding: 20px 24px;
}

.investment-dialog :deep(.el-dialog__title),
.trade-dialog :deep(.el-dialog__title) {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.investment-dialog :deep(.el-dialog__headerbtn .el-dialog__close),
.trade-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 18px;
}

.investment-dialog :deep(.el-dialog__body),
.trade-dialog :deep(.el-dialog__body) {
  padding: 0;
  background: #f8f9fa;
}

.dialog-content {
  padding: 24px;
}

.form-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.form-card :deep(.el-card__body) {
  padding: 24px;
}

.add-stock-form .el-form-item {
  margin-bottom: 20px;
}

.add-stock-form .el-form-item__label {
  font-weight: 600;
  color: #223354;
  font-size: 14px;
}

.disabled-input :deep(.el-input__wrapper) {
  background: #f8f9fa;
  border-color: #e4e7ed;
}

.disabled-input :deep(.el-input__inner) {
  color: #606266;
  font-weight: 500;
}

.stock-select :deep(.el-input__wrapper) {
  border-radius: 8px;
  border-color: #dcdfe6;
  transition: all 0.3s ease;
}

.stock-select :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
}

.price-input :deep(.el-input__wrapper) {
  background: #f0f9ff;
  border-color: #409eff;
}

.price-input :deep(.el-input__inner) {
  color: #409eff;
  font-weight: 600;
  font-size: 16px;
}

.count-input :deep(.el-input-number__decrease),
.count-input :deep(.el-input-number__increase) {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
}

.count-input :deep(.el-input-number__decrease:hover),
.count-input :deep(.el-input-number__increase:hover) {
  background: #409eff;
  color: white;
}

.total-price-input :deep(.el-input__wrapper) {
  background: #f6ffed;
  border-color: #52c41a;
}

.total-price-input :deep(.el-input__inner) {
  color: #52c41a;
  font-weight: 700;
  font-size: 18px;
}

.profit-input :deep(.el-input__wrapper) {
  background: #fff7e6;
  border-color: #faad14;
}

.profit-input :deep(.el-input__inner) {
  color: #faad14;
  font-weight: 600;
  font-size: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e4e7ed;
  border-radius: 0 0 16px 16px;
}

.cancel-btn {
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #f5f7fa;
  border-color: #dcdfe6;
}

.confirm-btn {
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 图表卡片样式 */
.chart-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.chart-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #fafbfc;
}

.chart-card :deep(.el-card__body) {
  padding: 20px;
  height: calc(100% - 60px);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #223354;
}

.chart-periods {
  display: flex;
  gap: 8px;
}

.period-btn {
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.period-btn:hover {
  transform: translateY(-1px);
}

.stock-chart-container {
  width: 100%;
  height: 350px;
  background: white;
  border-radius: 8px;
  padding: 10px;
}

/* 表格容器样式 */
.table-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.portfolio-table {
  min-width: 1080px;
  width: 100%;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .portfolio-container {
    padding: 16px;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .investment-dialog {
    width: 95% !important;
  }
  
  .dialog-content .el-row {
    flex-direction: column;
  }
  
  .dialog-content .el-col {
    width: 100% !important;
    margin-bottom: 20px;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .chart-periods {
    width: 100%;
    justify-content: space-between;
  }
  
  .table-container {
    margin: 0 -16px;
    border-radius: 0;
  }
  
  .portfolio-table {
    min-width: 1080px;
  }
}
</style> 