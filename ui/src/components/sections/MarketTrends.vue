<template>
  <div class="market-container">
    <el-row class="header" justify="space-between" align="middle">
      <el-col>
        <h1 class="main-title">市场动态</h1>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <!-- 市场概览 -->
      <el-col :span="8" v-for="index in marketTrends.indices" :key="index.name">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>{{ index.name }}</span>
            </div>
          </template>
          <div class="market-value">{{ index.value }}</div>  
          <div class="market-change" :class="index.changePercent >= 0 ? 'positive' : 'negative'">
            {{ index.changePercent>0?'+':'' }}({{ index.changePercent }}%)
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热门股票（分为三个板块） -->
    <el-row :gutter="24" class="hot-stocks-container">
      <!-- 涨幅最大板块 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>涨幅最大</span>
            </div>
          </template>

          <el-table :data="topGainers" style="width: 100%">
            <el-table-column prop="symbol" label="代码" width="80" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="price" label="价格" width="100" />
            <el-table-column prop="change" label="涨跌幅" width="100">
              <template #default="{ row }">
                <el-tag type="success" size="small">
                  +{{ row.change }}%
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 上涨股票板块 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>上涨股票</span>
            </div>
          </template>

          <el-table :data="risingStocks" style="width: 100%">
            <el-table-column prop="symbol" label="代码" width="80" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="price" label="价格" width="100" />
            <el-table-column prop="change" label="涨跌幅" width="100">
              <template #default="{ row }">
                <el-tag type="success" size="small">
                  +{{ row.change }}%
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 下跌股票板块 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>下跌股票</span>
            </div>
          </template>

          <el-table :data="fallingStocks" style="width: 100%">
            <el-table-column prop="symbol" label="代码" width="80" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="price" label="价格" width="100" />
            <el-table-column prop="change" label="涨跌幅" width="100">
              <template #default="{ row }">
                <el-tag type="danger" size="small">
                  {{ row.change }}%
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 市场新闻 -->
    <el-card class="market-news" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>市场新闻</span>
        </div>
      </template>

      <el-timeline>
        <el-timeline-item
          v-for="news in marketNews"
          :key="news.id"
          :timestamp="news.time"
          :type="news.type"
        >
          <el-card>
            <h4>{{ news.title }}</h4>
            <p>{{ news.summary }}</p>
            <el-tag size="small" :type="news.category === '重要' ? 'danger' : 'info'">
              {{ news.category }}
            </el-tag>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Refresh, TrendCharts, View, Document } from '@element-plus/icons-vue'
import axios from 'axios'
import { onMounted } from 'vue'

const marketTrends = ref({
  indices: [] // 实际数据会从API获取
})

const getMarketTrends = async () => {
  try {
    const res = await axios.get('/api/stocks/market-movers')
    marketTrends.value = res.data.data
  } catch (error) {
    console.error('获取市场趋势数据失败:', error)
    // 可以在这里设置默认数据或显示错误提示
    marketTrends.value = {
      indices: [
        { name: '上证指数', value: '3,285.47', changePercent: 0.32 },
        { name: '深证成指', value: '11,050.32', changePercent: -0.15 },
        { name: '创业板指', value: '2,243.68', changePercent: 0.57 }
      ]
    }
  }
}

onMounted(() => {
  getMarketTrends()
})

// 股票数据
const allStocks = ref([
  {
    symbol: 'AAPL',
    name: '苹果公司',
    price: '$175.43',
    change: 3.52,
    volume: '52.3M'
  },
  {
    symbol: 'TSLA',
    name: '特斯拉',
    price: '$248.50',
    change: -2.23,
    volume: '89.1M'
  },
  {
    symbol: 'MSFT',
    name: '微软',
    price: '$378.85',
    change: 1.10,
    volume: '28.7M'
  },
  {
    symbol: 'GOOGL',
    name: '谷歌',
    price: '$138.21',
    change: 1.36,
    volume: '31.2M'
  },
  {
    symbol: 'AMZN',
    name: '亚马逊',
    price: '$178.45',
    change: 2.89,
    volume: '42.5M'
  },
  {
    symbol: 'META',
    name: '元宇宙',
    price: '$345.12',
    change: -1.78,
    volume: '23.9M'
  },
  {
    symbol: 'NVDA',
    name: '英伟达',
    price: '$987.65',
    change: 5.23,
    volume: '67.8M'
  },
  {
    symbol: 'BABA',
    name: '阿里巴巴',
    price: '$78.90',
    change: -0.45,
    volume: '19.2M'
  },
  {
    symbol: 'PDD',
    name: '拼多多',
    price: '$156.78',
    change: 2.15,
    volume: '34.6M'
  }
])

// 计算属性：将股票分为三个板块
const topGainers = computed(() => {
  // 筛选出涨幅大于0的股票，按涨幅降序排列，取前3名作为涨幅最大
  return [...allStocks.value]
    .filter(stock => stock.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, 3)
})

const risingStocks = computed(() => {
  // 筛选出涨幅大于0但不在涨幅最大列表中的股票
  const topGainerSymbols = topGainers.value.map(stock => stock.symbol)
  return allStocks.value.filter(
    stock => stock.change > 0 && !topGainerSymbols.includes(stock.symbol)
  )
})

const fallingStocks = computed(() => {
  // 筛选出跌幅的股票，按跌幅降序排列
  return [...allStocks.value]
    .filter(stock => stock.change < 0)
    .sort((a, b) => a.change - b.change)
})

const marketNews = ref([
  {
    id: 1,
    title: '美联储宣布维持利率不变',
    summary: '美联储在最新会议上决定维持基准利率在5.25%-5.50%区间不变，符合市场预期。',
    time: '2024-01-15 14:30',
    type: 'primary',
    category: '重要'
  },
  {
    id: 2,
    title: '科技股领涨市场',
    summary: '受益于AI技术发展，科技股今日表现强劲，纳斯达克指数上涨1.35%。',
    time: '2024-01-15 13:45',
    type: 'success',
    category: '一般'
  },
  {
    id: 3,
    title: '原油价格小幅下跌',
    summary: '由于供应充足，国际原油价格今日小幅下跌，WTI原油下跌0.8%。',
    time: '2024-01-15 12:20',
    type: 'warning',
    category: '一般'
  }
])
</script>

<style scoped>
.market-container {
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

.hot-stocks-container {
  margin-top: 24px;
  margin-bottom: 24px;
}

.market-news {
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

.count-badge {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: normal;
  margin-left: 8px;
}

.market-value {
  font-size: 2rem;
  font-weight: 700;
  color: #223354;
  margin-bottom: 8px;
}

.market-change {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 16px;
}

.market-change.positive {
  color: #10b981;
}

.market-change.negative {
  color: #ef4444;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-timeline-item__content) {
  margin-bottom: 16px;
}

:deep(.el-timeline-item__content h4) {
  margin: 0 0 8px 0;
  color: #223354;
}

:deep(.el-timeline-item__content p) {
  margin: 0 0 12px 0;
  color: #64748b;
  line-height: 1.5;
}

:deep(.el-table) {
  font-size: 0.9rem;
}

:deep(.el-table th) {
  background-color: #f8fafc;
  font-weight: 600;
}
</style>
