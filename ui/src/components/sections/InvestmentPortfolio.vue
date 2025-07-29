<template>
  <div class="portfolio-container">
    <el-row class="header" justify="space-between" align="middle">
      <el-col>
        <h1 class="main-title">投资组合</h1>
      </el-col>
      <el-col>
        <el-button type="primary" :icon="Plus">添加投资</el-button>
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

    <!-- 投资列表 -->
    <el-card class="portfolio-list" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>我的投资</span>
          <el-button type="text" :icon="Refresh">刷新</el-button>
        </div>
      </template>

      <el-table :data="portfolioData" style="width: 100%">
        <el-table-column prop="name" label="投资名称" width="200">
          <template #default="{ row }">
            <div class="investment-name">
              <el-avatar :size="32" :src="row.icon" />
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === '股票' ? 'primary' : 'success'">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="amount" label="投资金额" width="150" />
        <el-table-column prop="currentValue" label="当前价值" width="150" />
        
        <el-table-column prop="return" label="收益率" width="120">
          <template #default="{ row }">
            <el-tag 
              :type="row.return >= 0 ? 'success' : 'danger'"
              size="small"
            >
              {{ row.return >= 0 ? '+' : '' }}{{ row.return }}%
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="text" size="small" :icon="View">查看</el-button>
            <el-button type="text" size="small" :icon="Edit">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Refresh, View, Edit } from '@element-plus/icons-vue'

const portfolioData = ref([
  {
    name: '苹果公司',
    type: '股票',
    amount: '$15,000',
    currentValue: '$16,245',
    return: 8.3,
    icon: 'https://via.placeholder.com/32'
  },
  {
    name: '特斯拉',
    type: '股票',
    amount: '$8,500',
    currentValue: '$9,120',
    return: 7.3,
    icon: 'https://via.placeholder.com/32'
  },
  {
    name: '债券基金',
    type: '基金',
    amount: '$25,000',
    currentValue: '$25,680',
    return: 2.7,
    icon: 'https://via.placeholder.com/32'
  }
])
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
  gap: 12px;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style> 