<template>
  <div class="bank-container">
    <el-row class="header" justify="space-between" align="middle">
      <el-col>
        <h1 class="main-title">银行账户</h1>
      </el-col>
      <el-col>
        <el-button type="primary" :icon="Plus">添加账户</el-button>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <!-- 账户概览 -->
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总余额</span>
            </div>
          </template>
          <div class="stat-value">$45,230.50</div>
          <div class="stat-change">本月 +$2,450</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>储蓄账户</span>
            </div>
          </template>
          <div class="stat-value">$28,450.00</div>
          <div class="stat-change positive">+$1,200</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>支票账户</span>
            </div>
          </template>
          <div class="stat-value">$12,780.50</div>
          <div class="stat-change">-$450</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>投资账户</span>
            </div>
          </template>
          <div class="stat-value">$4,000.00</div>
          <div class="stat-change positive">+$700</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 账户列表 -->
    <el-card class="account-list" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>我的账户</span>
          <el-button type="text" :icon="Refresh">刷新</el-button>
        </div>
      </template>

      <el-table :data="accountData" style="width: 100%">
        <el-table-column prop="name" label="账户名称" width="200">
          <template #default="{ row }">
            <div class="account-name">
              <el-avatar :size="32" :src="row.icon" />
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="账户类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getAccountTypeColor(row.type)">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="balance" label="余额" width="150" />
        <el-table-column prop="accountNumber" label="账号" width="200" />
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="row.status === '活跃' ? 'success' : 'warning'"
              size="small"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="text" size="small" :icon="View">查看</el-button>
            <el-button type="text" size="small" :icon="Edit">编辑</el-button>
            <el-button type="text" size="small" :icon="Money">转账</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Refresh, View, Edit, Money } from '@element-plus/icons-vue'

const accountData = ref([
  {
    name: '工商银行储蓄账户',
    type: '储蓄账户',
    balance: '$28,450.00',
    accountNumber: '**** **** **** 1234',
    status: '活跃',
    icon: 'https://via.placeholder.com/32'
  },
  {
    name: '建设银行支票账户',
    type: '支票账户',
    balance: '$12,780.50',
    accountNumber: '**** **** **** 5678',
    status: '活跃',
    icon: 'https://via.placeholder.com/32'
  },
  {
    name: '招商银行投资账户',
    type: '投资账户',
    balance: '$4,000.00',
    accountNumber: '**** **** **** 9012',
    status: '活跃',
    icon: 'https://via.placeholder.com/32'
  }
])

const getAccountTypeColor = (type) => {
  const colors = {
    '储蓄账户': 'success',
    '支票账户': 'primary',
    '投资账户': 'warning'
  }
  return colors[type] || 'info'
}
</script>

<style scoped>
.bank-container {
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

.account-list {
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

.account-name {
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