<template>
  <div class="stock-price-container">
    <!-- 股票搜索区域 -->
    <el-card class="search-section" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>股票搜索</span>
        </div>
      </template>
      <p class="section-subtitle">搜索股票代码或公司名称</p>
      <el-row :gutter="12">
        <el-col :span="16">
          <el-input
            v-model="searchQuery"
            placeholder="输入股票代码或公司名称"
            :prefix-icon="Search"
            clearable
            size="small"
          />
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="handleSearch" :icon="Search" :loading="loading" size="small">
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
        :data="stocks" 
        style="width: 100%"
        :row-class-name="tableRowClassName"
        @row-click="handleRowClick"
        v-loading="loading"
        element-loading-text="正在加载股票数据..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        size="small"
      >
        <!-- <el-table-column width="40">
          <template #default="{ row }">
            <el-button
              :icon="row.isFavorite ? Star : StarFilled"
              :type="row.isFavorite ? 'warning' : 'info'"
              circle
              size="small"
              @click.stop="toggleFavorite(row.symbol)"
            />
          </template>
        </el-table-column> -->  
        
        <el-table-column prop="symbol" label="代码" >
          <template #default="{ row }">
            <div class="stock-symbol">{{ row.symbol }}</div>
            <div class="stock-name">{{ row.name }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="price" label="价格" >
          <template #default="{ row }">
            <div class="current-price">{{ row.price }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="change" label="涨跌" >
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
              {{ row.change > 0 ? '+' : (row.change < 0 ? '' : '') }}{{ row.change }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { Loading, Search, Star, StarFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 响应式数据
const searchQuery = ref('')
// const stocks = ref([])
const loading = ref(false)
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
// const filteredStocks = computed(() => {
//   if (!searchQuery.value) return stocks.value
  
//   const query = searchQuery.value.toLowerCase()
//   return stocks.value.filter(stock => 
//     stock.symbol.toLowerCase().includes(query) ||
//     stock.name.toLowerCase().includes(query)
//   )
// })

onMounted(() => {
  getList()
})




// 方法
import { onMounted, onUnmounted } from 'vue'

let timer = null

const getList = async () => {
  try {
    loading.value = true
    const res = await axios.get(`/api/portfolio/history/simple/symbols`)
    await nextTick(() => {
      stocks.value = res.data.data
    })
  } catch (error) {
    ElMessage.error('获取股票数据失败')
    console.error('获取股票数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 定时器实现实时刷新
onMounted(() => {
  getList()

})


const handleSearch = async() => {
  try {
    loading.value = true
    if(searchQuery.value===''){
      await getList()
      return
    }
    const res = await axios.get(`/api/portfolio/history/simple/${searchQuery.value}`)
    console.log(res.data)
    // stocks 是一个 ref，需要通过 .value 赋值
    stocks.value = res.data.data
  } catch (error) {
    ElMessage.error('搜索股票失败')
    console.error('搜索股票失败:', error)
  } finally {
    loading.value = false
  }
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
  padding: 16px;
  overflow-y: auto;
  background: #fff;
}

.card-header {
  font-size: 1.2rem;
  font-weight: 600;
  color: #223354;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-subtitle {
  font-size: 0.9rem;
  color: #94a3b8;
  margin: 0 0 12px 0;
  letter-spacing: 0.5px;
}

.el-card {
  border-radius: 12px !important;
  box-shadow: 0 2px 12px 0 rgba(99,102,241,0.08);
  transition: box-shadow 0.3s;
  margin-bottom: 16px;
}
.el-card:hover {
  box-shadow: 0 4px 20px 0 rgba(99,102,241,0.16);
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  font-size: 0.9rem;
}
:deep(.el-table th) {
  background: #f1f5f9;
  color: #223354;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 8px 0;
}
:deep(.el-table tr:hover) {
  background: linear-gradient(90deg, #e0e7ff 0%, #f8fafc 100%) !important;
  transition: background 0.3s;
}
:deep(.el-table td) {
  padding: 8px 0;
  font-size: 0.85rem;
}

.favorite-row {
  background-color: #fef3c7 !important;
  transition: background 0.3s;
}

.stock-symbol {
  font-weight: 600;
  color: #223354;
  font-size: 0.9rem;
}

.stock-name {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
}

.current-price {
  font-size: 1rem;
  font-weight: 700;
  color: #2563eb;
  letter-spacing: 0.5px;
}

:deep(.el-tag) {
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  padding: 1px 8px;
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