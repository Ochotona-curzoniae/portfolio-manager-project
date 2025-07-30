<template>
  <div class="stock-price-container">
    <!-- 顶部标题和用户头像 -->
    <el-row class="header" justify="space-between" align="middle">
      <el-col>
        <h1 class="main-title">当前股票价格</h1>
      </el-col>
 
    </el-row>

    <!-- 股票搜索区域 -->
    <el-card class="search-section" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>股票搜索</span>
        </div>
      </template>
      <p class="section-subtitle">搜索股票代码或公司名称</p>
      <el-row :gutter="12">
        <el-col :span="6">
          <el-input
            v-model="searchQuery"
            placeholder="输入股票代码或公司名称"
            :prefix-icon="Search"
            @keyup.enter="handleSearch"
            clearable
          />
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handleSearch" :icon="Search">
            搜索
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 实时股价区域 -->
    <el-card class="stock-list-section" style="margin-top:20px" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>实时股价</span>
        </div>
      </template>
      <p class="section-subtitle">主要股票的实时价格信息</p>
      
      <el-table 
        :data="filteredStocks" 
        style="width: 100%"
        :row-class-name="tableRowClassName"
        @row-click="handleRowClick"
      >
        <el-table-column width="60">
          <template #default="{ row }">
            <el-button
              :icon="row.isFavorite ? Star : StarFilled"
              :type="row.isFavorite ? 'warning' : 'info'"
              circle
              size="small"
              @click.stop="toggleFavorite(row.symbol)"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="symbol" label="代码">
          <template #default="{ row }">
            <div class="stock-symbol">{{ row.symbol }}</div>
            <div class="stock-name">{{ row.name }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="volume" label="成交量" />
        <el-table-column prop="marketCap" label="市值" />
        
        <el-table-column prop="price" label="当前价格">
          <template #default="{ row }">
            <div class="current-price">{{ row.price }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="change" label="涨跌幅">
          <template #default="{ row }">
            <el-tag 
              :type="row.change > 0 ? 'success' : (row.change < 0 ? 'danger' : 'info')"
              size="small"
              :style="{
                color: row.change > 0 ? '#16a34a' : (row.change < 0 ? '#dc2626' : '#64748b'),
                background: row.change > 0 ? 'rgba(22,163,74,0.08)' : (row.change < 0 ? 'rgba(220,38,38,0.08)' : 'rgba(100,116,139,0.08)'),
                borderColor: row.change > 0 ? '#bbf7d0' : (row.change < 0 ? '#fecaca' : '#e3eaf2'),
                fontWeight: 700
              }"
            >
              {{ row.change > 0 ? '+' : (row.change < 0 ? '' : '') }}{{ row.change }} ({{ row.changePercent }})
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, Star, StarFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const searchQuery = ref('')
const stocks = ref([
  {
    symbol: 'AAPL',
    name: '苹果公司',
    volume: '52.3M',
    marketCap: '$2.75T',
    price: '$175.43',
    change: 2.34,
    changePercent: '1.35%',
    isFavorite: true
  },
  {
    symbol: 'TSLA',
    name: '特斯拉',
    volume: '89.1M',
    marketCap: '$789.2B',
    price: '$248.5',
    change: -5.67,
    changePercent: '-2.23%',
    isFavorite: true
  },
  {
    symbol: 'MSFT',
    name: '微软',
    volume: '28.7M',
    marketCap: '$2.81T',
    price: '$378.85',
    change: 4.12,
    changePercent: '1.1%',
    isFavorite: true
  },
  {
    symbol: 'GOOGL',
    name: '谷歌',
    volume: '31.2M',
    marketCap: '$1.74T',
    price: '$138.21',
    change: 1.85,
    changePercent: '1.36%',
    isFavorite: false
  }
])

// 计算属性：过滤股票
const filteredStocks = computed(() => {
  if (!searchQuery.value) return stocks.value
  
  const query = searchQuery.value.toLowerCase()
  return stocks.value.filter(stock => 
    stock.symbol.toLowerCase().includes(query) ||
    stock.name.toLowerCase().includes(query)
  )
})

onMounted(() => {
  // getList()
})




// 方法
import { onMounted, onUnmounted } from 'vue'

let timer = null

const getList = async () => {
  const res = await axios.get(`/api/allStocks/${searchQuery.value}`)
  stocks.value = res.data.stocks
  // chartData.value = res.data.history
  // totalNetWorth.value = res.data.totalNetWorth
}

// 定时器实现实时刷新
onMounted(() => {
  getList()
  timer = setInterval(() => {
    getList()
  }, 5000) // 每5秒刷新一次，可根据需要调整
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})


const handleSearch = async() => {
  const res = await axios.get(`/api/getStocks/${searchQuery.value}`)
  stocks = res.data.stocks
  // chartData.value = res.data.history
  // totalNetWorth.value = res.data.totalNetWorth
}

const toggleFavorite = (symbol) => {
  const stock = stocks.value.find(s => s.symbol === symbol)
  if (stock) {
    stock.isFavorite = !stock.isFavorite
    ElMessage.success(`${stock.isFavorite ? '添加' : '移除'}收藏: ${symbol}`)
  }
}

const handleRowClick = (row) => {
  // ElMessage.info(`点击了 ${row.symbol} - ${row.name}`)
}

const tableRowClassName = ({ row, rowIndex }) => {
  return row.isFavorite ? 'favorite-row' : ''
}
</script>

<style scoped>
.stock-price-container {
  width: 100%;
  height: 100%;
  padding: 32px;
  overflow-y: auto;
  background: linear-gradient(135deg, #f8f9fa 60%, #e0e7ff 100%);
}


.card-header {
  font-size: 1.5rem;
  font-weight: 600;
  color: #223354;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-subtitle {
  font-size: 1rem;
  color: #94a3b8;
  margin: 0 0 16px 0;
  letter-spacing: 1px;
}

.el-card {
  border-radius: 16px !important;
  box-shadow: 0 4px 24px 0 rgba(99,102,241,0.08);
  transition: box-shadow 0.3s;
}
.el-card:hover {
  box-shadow: 0 8px 32px 0 rgba(99,102,241,0.16);
}

:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
  font-size: 1.08rem;
}
:deep(.el-table th) {
  background: #f1f5f9;
  color: #223354;
  font-weight: 700;
  font-size: 1.08rem;
}
:deep(.el-table tr:hover) {
  background: linear-gradient(90deg, #e0e7ff 0%, #f8fafc 100%) !important;
  transition: background 0.3s;
}
:deep(.el-table td) {
  padding: 14px 0;
  font-size: 1.08rem;
}

.favorite-row {
  background-color: #fef3c7 !important;
  transition: background 0.3s;
}

.current-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2563eb;
  letter-spacing: 1px;
}

:deep(.el-tag) {
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 8px;
  padding: 2px 12px;
  background: linear-gradient(90deg, #f87171 0%, #fbbf24 100%);
  color: #fff;
  border: none;
}
:deep(.el-tag[type="success"]) {
  background: linear-gradient(90deg, #34d399 0%, #60a5fa 100%);
}
:deep(.el-tag[type="danger"]) {
  background: linear-gradient(90deg, #f87171 0%, #fbbf24 100%);
}

.el-button {
  transition: transform 0.15s;
}
.el-button:active {
  transform: scale(0.92);
}
</style>