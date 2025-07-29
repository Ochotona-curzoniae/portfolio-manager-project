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
        <el-col :span="18">
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
    <el-card class="stock-list-section" shadow="hover">
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
        
        <el-table-column prop="symbol" label="代码" width="100">
          <template #default="{ row }">
            <div class="stock-symbol">{{ row.symbol }}</div>
            <div class="stock-name">{{ row.name }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="volume" label="成交量" width="120" />
        <el-table-column prop="marketCap" label="市值" width="120" />
        
        <el-table-column prop="price" label="当前价格" width="120">
          <template #default="{ row }">
            <div class="current-price">{{ row.price }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="change" label="涨跌幅" width="120">
          <template #default="{ row }">
            <el-tag 
              :type="row.change > 0 ? 'success' : 'danger'"
              size="small"
            >
              {{ row.change > 0 ? '+' : '' }}{{ row.change }} ({{ row.changePercent }})
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

// 方法
const handleSearch = () => {
  ElMessage.success(`搜索: ${searchQuery.value}`)
}

const toggleFavorite = (symbol) => {
  const stock = stocks.value.find(s => s.symbol === symbol)
  if (stock) {
    stock.isFavorite = !stock.isFavorite
    ElMessage.success(`${stock.isFavorite ? '添加' : '移除'}收藏: ${symbol}`)
  }
}

const handleRowClick = (row) => {
  ElMessage.info(`点击了 ${row.symbol} - ${row.name}`)
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
  background: #f8f9fa;
}

/* 头部样式 */
.header {
  margin-bottom: 32px;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #223354;
  margin: 0;
}

/* 卡片样式 */
.search-section {
  margin-bottom: 24px;
}

.stock-list-section {
  margin-bottom: 24px;
}

.card-header {
  font-size: 1.5rem;
  font-weight: 600;
  color: #223354;
}

.section-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 16px 0;
}

/* 股票信息样式 */
.stock-symbol {
  font-size: 1.1rem;
  font-weight: 600;
  color: #223354;
}

.stock-name {
  font-size: 0.9rem;
  color: #64748b;
}

.current-price {
  font-size: 1.2rem;
  font-weight: 600;
  color: #223354;
}

/* 表格行样式 */
.favorite-row {
  background-color: #fef3c7 !important;
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  color: #223354;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 12px 0;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style>