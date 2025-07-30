<template>
  <div class="bank-container">
    <el-row class="header" justify="space-between" align="middle">
      <el-col>
        <h1 class="main-title">银行账户</h1>
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
          <el-button type="primary" :icon="Plus" @click="openAccountDialog('add')">添加账户</el-button>
        </div>
      </template>

      <el-table :data="accountData" style="width: 100%">
        <el-table-column prop="name" label="账户名称" align="center">
          <template #default="{ row }">
            <div >
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="账户类型" align="center">
          <template #default="{ row }">
            <el-tag :type="getAccountTypeColor(row.type)">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="balance" label="余额"  align="center"/>
        <el-table-column prop="accountNumber" label="账号"  align="center"/>
        
        <el-table-column prop="status" label="状态" align="center" >
          <template #default="{ row }">
            <el-tag 
              :type="row.status === '活跃' ? 'success' : 'warning'"
              size="large"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" align="center">
          <template #default="{ row, $index }">
            <el-button type="text" size="small" :icon="Edit" @click="openAccountDialog('edit', row, $index)">编辑</el-button>
            <el-button type="text" size="small" :icon="Money">转账</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="accountDialogVisible" :title="dialogMode === 'add' ? '添加账户' : '编辑账户'" width="400px">
      <el-form :model="accountForm" label-width="80px">
        <el-form-item label="账户名称">
          <el-input v-model="accountForm.name" />
        </el-form-item>
        <el-form-item label="账户类型">
          <el-select v-model="accountForm.type" placeholder="请选择">
            <el-option label="储蓄账户" value="储蓄账户" />
            <el-option label="支票账户" value="支票账户" />
            <el-option label="投资账户" value="投资账户" />
          </el-select>
        </el-form-item>
        <el-form-item label="余额">
          <el-input v-model="accountForm.balance" />
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="accountForm.accountNumber" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="accountForm.status">
            <el-option label="活跃" value="活跃" />
            <el-option label="冻结" value="冻结" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="accountDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAccountDialogConfirm">{{ dialogMode === 'add' ? '确定' : '保存' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Refresh, View, Edit, Money } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const accountData = ref([
  {
    name: '工商银行储蓄账户',
    type: '储蓄账户',
    balance: '$28,450.00',
    accountNumber: '**** **** **** 1234',
    status: '活跃',
  },
  {
    name: '建设银行支票账户',
    type: '支票账户',
    balance: '$12,780.50',
    accountNumber: '**** **** **** 5678',
    status: '活跃',
  },
  {
    name: '招商银行投资账户',
    type: '投资账户',
    balance: '$4,000.00',
    accountNumber: '**** **** **** 9012',
    status: '活跃',
  }
])

const accountDialogVisible = ref(false)
const dialogMode = ref('add') // 'add' or 'edit'
const accountForm = ref({
  name: '',
  type: '',
  balance: '',
  accountNumber: '',
  status: '活跃',
  icon: ''
})
let editIndex = -1

function openAccountDialog(mode, row = null, index = -1) {
  dialogMode.value = mode
  accountDialogVisible.value = true
  if (mode === 'edit' && row) {
    accountForm.value = { ...row }
    editIndex = index
  } else {
    accountForm.value = {
      name: '',
      type: '',
      balance: '',
      accountNumber: '',
      status: '活跃',
      icon: ''
    }
    editIndex = -1
  }
}

function handleAccountDialogConfirm() {
  if (!accountForm.value.name || !accountForm.value.type || !accountForm.value.balance || !accountForm.value.accountNumber) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (dialogMode.value === 'add') {
    accountData.value.push({ ...accountForm.value })
  } else if (dialogMode.value === 'edit' && editIndex !== -1) {
    accountData.value[editIndex] = { ...accountForm.value }
  }
  accountDialogVisible.value = false
}

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


:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style> 