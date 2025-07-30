<template>
  <div class="portfolio-container">
    <el-row class="header" justify="space-between" align="middle">
      <el-col>
        <h1 class="main-title">投资组合</h1>
      </el-col>

    </el-row>

    <el-row :gutter="24">
      <!-- 投资概览卡片 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总资产</span>
            </div>
          </template>
          <div class="stat-value">$125,430.50</div>
          <div class="stat-change positive">+$2,340.25 (+1.9%)</div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日收益</span>
            </div>
          </template>
          <div class="stat-value">$1,245.80</div>
          <div class="stat-change positive">+$89.45 (+7.7%)</div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>持仓数量</span>
            </div>
          </template>
          <div class="stat-value">12</div>
          <div class="stat-change">3个新增</div>
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
      <div id="asset-pie" style="width: 520px; height: 260px; margin: 0 auto;" />
    </el-card>
    <!-- 投资列表 -->
    <el-card class="portfolio-list" shadow="hover">
      <template #header>
        <div class="card-header" style="display: flex; align-items: center; justify-content: space-between;">
          <span>持仓详情</span>
          <el-button type="primary" :icon="Plus" @click="openAddInvestment">添加投资</el-button>
        </div>
      </template>

      <el-table
        :data="holdingList"
        stripe
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column prop="name" label="股票名称"  />
        <el-table-column prop="count" label="持股数量"   align="center"/>
        <el-table-column prop="beforePrice" label="成本价"  align="center"/>
        <el-table-column prop="currentPrice" label="现价" align="center" />
        <el-table-column prop="amount" label="投资金额" align="center"/>
        <el-table-column prop="currentValue" label="当前价值" align="center"/>
        <el-table-column prop="return" label="收益率"  align="center">
          <template #default="{ row }">
            <span :class="row.return >= 0 ? 'profit-tag' : 'loss-tag'">
              {{ row.return >= 0 ? '+' : '' }}{{ row.return }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
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
    
    </el-card>

    <!-- 添加投资Dialog -->
    <el-dialog
      v-model="dialogVisible"
      title="添加投资"
      width="500px"
      :close-on-click-modal="false"
      class="investment-dialog"
    >
      <div class="dialog-content">
        <el-card class="form-card" shadow="never">
          <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="add-stock-form">
            <el-form-item label="投资类型">
              <el-input v-model="form.type" disabled class="disabled-input" />
            </el-form-item>
            <el-form-item label="选择股票" prop="name">
              <el-select v-model="form.name" placeholder="请选择要投资的股票" style="width: 100%;" filterable class="stock-select">
                <el-option v-for="item in stockList" :key="item.name" :label="item.name" :value="item.name" />
              </el-select>
            </el-form-item>
            <el-form-item label="每股价格" v-if="form.name">
              <el-input :value="selectedStockPrice" readonly class="price-input" />
            </el-form-item>
            <el-form-item label="买入股数" prop="count">
              <el-input-number v-model="form.count" :min="1" :max="100000" style="width: 100%;" class="count-input" />
            </el-form-item>
            <el-form-item label="投资总额">
              <el-input :value="totalPrice" readonly class="total-price-input" />
            </el-form-item>
          </el-form>
        </el-card>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="onSubmit" class="confirm-btn">确认买入</el-button>
        </div>
      </template>
    </el-dialog>

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
              <el-input v-model="tradeForm.name" disabled class="disabled-input" />
            </el-form-item>
            <el-form-item label="交易类型">
              <el-input v-model="tradeTypeLabel" disabled class="disabled-input" />
            </el-form-item>
            <el-form-item label="交易数量" prop="count">
              <el-input-number v-model="tradeForm.count" :min="1" :max="100000" style="width: 100%;" class="count-input" />
            </el-form-item>
            <el-form-item label="预计收益" v-if="tradeType === 'sell'">
              <el-input :value="expectedProfit" readonly class="profit-input" />
            </el-form-item>
            <el-form-item label="预计收益" v-else>
              <el-input value="-" readonly class="profit-input" />
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
import { ref, onMounted, watch, computed } from 'vue'
import { Plus, Refresh, View, Edit } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import axios from 'axios'

const holdingList = ref([
  {
    name: '苹果公司',
    count: 100,
    beforePrice:150,
    currentPrice:162.45,
    amount: '$15,000',
    currentValue: '$16,245',
    return: 8.3,
    icon: 'https://via.placeholder.com/32'
  },
  {
    name: '特斯拉',
    count: 100, 
    beforePrice:150,
    currentPrice:162.45,
    amount: '$15,000',
    currentValue: '$16,245',
    return: 8.3,
    icon: 'https://via.placeholder.com/32'
  },
])
const cash =ref(0)
const stocks =ref(0)


const dialogVisible = ref(false)
const formRef = ref()
const stockList = ref([])

const fetchStocks = async () => {
  try {
    // const res = await axios.get('/api/stocks')
    // stockList.value = res.data
    stockList.value=[{
      name:'tsl',
      price:158
    },{
      name:'apple',
      price:164
    }]
  } catch (e) {
    stockList.value = []
  }
}

const openAddInvestment = () => {
  fetchStocks()
  dialogVisible.value = true
}

const form = ref({
  type: '股票',
  name: '',
  count: 1
})

const rules = {
  name: [{ required: true, message: '请选择股票', trigger: 'change' }],
  count: [{ required: true, message: '请输入买入股数', trigger: 'blur' }]
}

// 计算总价
const totalPrice = computed(() => {
  const stock = stockList.value.find(item => item.name === form.value.name)
  if (!stock) return ''
  return (form.value.count * stock.price).toFixed(2)
})

const selectedStockPrice = computed(() => {
  const stock = stockList.value.find(item => item.name === form.value.name)
  return stock ? stock.price.toFixed(2) : ''
})

const onSubmit = () => {
  formRef.value.validate(valid => {
    if (valid) {
      
      // axios.post('')
      dialogVisible.value = false
    }
  })
}

// 资产分布饼图数据计算
function getPieData() {
  let cash = 10000, stock = 1000
  holdingList.value.forEach(item => {
    // 只区分现金和股票
    if (item.name === '现金' || item.type === '现金') {
      cash += Number((item.currentValue || '').toString().replace(/[^0-9.]/g, '') || 0)
    } else {
      stock += Number((item.currentValue || '').toString().replace(/[^0-9.]/g, '') || 0)
    }
  })

  
  return [
    { value: cash, name: '现金' },
    { value: stock, name: '股票' }
  ]
}


function getInitData(){
  // axios.get

}
onMounted(() => {
  const chart = echarts.init(document.getElementById('asset-pie'))
  const option = {
    tooltip: { 
      trigger: 'item',
      appendToBody: true
    },
    legend: {
      orient: 'vertical',
      right: 30, // 或 bottom: 10
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

  // 响应式更新
  watch(holdingList, () => {
    option.series[0].data = getPieData()
    chart.setOption(option)
  }, { deep: true })
})

const tradeDialogVisible = ref(false)
const tradeFormRef = ref()
const tradeForm = ref({
  name: '',
  count: 1
})



const tradeType = ref('buy') // 'buy' 或 'sell'
const tradeTypeLabel = computed(() => tradeType.value === 'buy' ? '买入' : '卖出')

const expectedProfit = computed(() => {
  if (tradeType.value !== 'sell') return '-'
  // 查找当前股票的持仓信息
  const holding = holdingList.value.find(item => item.name === tradeForm.value.name)
  if (!holding) return '-'
  // 取当前价和成本价
  const currentPrice = holding.currentPrice || 0
  const beforePrice = holding.beforePrice || 0
  const count = tradeForm.value.count || 0
  const profit = (currentPrice - beforePrice) * count
  return profit.toFixed(2)
})

const tradeRules = {
  count: [{ required: true, message: '请输入数量', trigger: 'blur' }]
}

// 打开买入/卖出Dialog
const openTradeDialog = (row, type) => {
  tradeForm.value.name = row.name
  tradeForm.value.count = 1
  tradeType.value = type
  tradeDialogVisible.value = true
}

// 提交买入/卖出
const onTradeSubmit = () => {
  tradeFormRef.value.validate(valid => {
    if (valid) {
      // 这里可以根据 tradeType.value 判断是买入还是卖出
      // 发送请求到后端
      // axios.post('/api/trade', { ...tradeForm.value, type: tradeType.value })
      tradeDialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.portfolio-container {
  width: 100%;
  height: 100%;
  padding: 32px;
  overflow-y: auto;
  background: #f8f9fa;
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

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #223354;
  margin-bottom: 8px;
}

.stat-change {
  font-size: 0.9rem;
  color: #64748b;
}

.stat-change.positive {
  color: #10b981;
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
</style> 