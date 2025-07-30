<template>
  <div class="market-container">
    <el-row class="header" justify="space-between" align="middle">
      <el-col>
        <h1 class="main-title">市场动态</h1>
      </el-col>
      <el-col>
        <el-button type="primary" :icon="Refresh">刷新数据</el-button>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <!-- 市场概览 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>道琼斯指数</span>
            </div>
          </template>
          <div class="market-value">34,580.25</div>
          <div class="market-change positive">+245.80 (+0.72%)</div>
          <el-progress :percentage="72" :color="progressColors" />
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>纳斯达克</span>
            </div>
          </template>
          <div class="market-value">14,230.45</div>
          <div class="market-change positive">+189.30 (+1.35%)</div>
          <el-progress :percentage="85" :color="progressColors" />
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>标普500</span>
            </div>
          </template>
          <div class="market-value">4,580.15</div>
          <div class="market-change negative">-12.45 (-0.27%)</div>
          <el-progress :percentage="45" :color="progressColors" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 热门股票 -->
    <el-card class="hot-stocks" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>热门股票</span>
          <el-button type="text" :icon="TrendCharts">更多</el-button>
        </div>
      </template>

      <el-table :data="hotStocks" style="width: 100%">
        <el-table-column prop="symbol" label="代码" width="100" />
        <el-table-column prop="name" label="名称" width="150" />
        <el-table-column prop="price" label="价格" width="120" />
        <el-table-column prop="change" label="涨跌幅" width="120">
          <template #default="{ row }">
            <el-tag 
              :type="row.change >= 0 ? 'success' : 'danger'"
              size="small"
            >
              {{ row.change >= 0 ? '+' : '' }}{{ row.change }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="volume" label="成交量" width="120" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="text" size="small" :icon="View">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 市场新闻 -->
    <el-card class="market-news" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>市场新闻</span>
          <el-button type="text" :icon="Document">全部</el-button>
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
import { ref } from 'vue'
import { Refresh, TrendCharts, View, Document } from '@element-plus/icons-vue'

const progressColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 }
]

const hotStocks = ref([
  {
    symbol: 'AAPL',
    name: '苹果公司',
    price: '$175.43',
    change: 1.35,
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
  }
])

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

.hot-stocks {
  margin-top: 24px;
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
</style> 