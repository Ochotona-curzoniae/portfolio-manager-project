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
          <div class="stat-value">￥{{ formatCurrency(accountStats.totalBalance) }}</div>
          <div class="stat-change" :class="{ positive: accountStats.totalBalance > 0 }">
            {{ accountStats.totalBalance > 0 ? '+' : '' }}￥{{ Math.abs(accountStats.totalBalance).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>储蓄账户</span>
            </div>
          </template>
          <div class="stat-value">￥{{ formatCurrency(accountStats.savingsBalance) }}</div>
          <div class="stat-change positive">+￥{{ accountStats.savingsBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>定期存款</span>
            </div>
          </template>
          <div class="stat-value">￥{{ formatCurrency(accountStats.fixedDepositBalance) }}</div>
          <div class="stat-change" :class="{ positive: accountStats.fixedDepositBalance > 0 }">
            {{ accountStats.fixedDepositBalance > 0 ? '+' : '' }}￥{{ accountStats.fixedDepositBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>信用卡</span>
            </div>
          </template>
          <div class="stat-value">￥{{ formatCurrency(accountStats.creditCardBalance) }}</div>
          <div class="stat-change" :class="{ positive: accountStats.creditCardBalance > 0 }">
            {{ accountStats.creditCardBalance > 0 ? '+' : '' }}￥{{ accountStats.creditCardBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
          </div>
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
        
        <el-table-column prop="accountType" label="账户类型" align="center">
          <template #default="{ row }">
            <el-tag :type="getAccountTypeColor(row.accountType)">
              {{ getAccountTypeName(row.accountType) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="balance" label="余额"  align="center"/>
        <el-table-column prop="accountNumber" label="账号"  align="center"/>
        
        <el-table-column prop="interestRate" label="利率" align="center" >
          <template #default="{ row }">
            <el-tag 
              :type="row.interestRate > 2 ? 'success' : 'warning'"
              size="large"
            >
              {{ row.interestRate }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" align="center"> 
          <template #default="{ row, $index }">
            <el-button type="text" size="small" :icon="Edit" @click="openAccountDialog('edit', row, $index)">编辑</el-button>
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
          <el-select v-model="accountForm.accountType" placeholder="请选择">
            <el-option label="储蓄账户" value="savings" />
            <el-option label="定期存款" value="fixed_deposit" />
            <el-option label="信用卡" value="credit_card" />
          </el-select>
        </el-form-item>
        <el-form-item label="余额">
          <el-input v-model="accountForm.balance" />
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="accountForm.accountNumber" />
        </el-form-item>
        <el-form-item label="信用限额" v-if="accountForm.accountType === 'credit_card'">
          <el-input v-model="accountForm.creditLimit" placeholder="请输入信用限额" />
        </el-form-item>
        <el-form-item label="利率">
          <el-input v-model="accountForm.interestRate" placeholder="请输入信用限额" />
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
import { ref, onMounted, computed, watch } from 'vue'
import { Plus, Refresh, View, Edit, Money } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const accountData = ref([])

// 计算属性：根据账户数据计算各种余额
const accountStats = computed(() => {
  const stats = {
    totalBalance: 0,
    savingsBalance: 0,
    fixedDepositBalance: 0,
    creditCardBalance: 0
  }
  
  accountData.value.forEach(account => {
    const balance = parseFloat(account.balance) || 0
    
    // 根据账户类型累加余额
    switch (account.accountType) {
      case 'savings':
        stats.savingsBalance += balance
        break
      case 'fixed_deposit':
        stats.fixedDepositBalance += balance
        break
      case 'credit_card':
        stats.creditCardBalance += balance
        break
    }
    
    // 总余额（信用卡余额为负数）
    if (account.accountType === 'credit_card') {
      stats.totalBalance += 0
    } else {
      stats.totalBalance += balance
    }
  })
  
  return stats
})

const accountDialogVisible = ref(false)
const dialogMode = ref('add') // 'add' or 'edit'
const accountForm = ref({
  name: '',
  accountType: '',
  balance: '',
  accountNumber: '',
  interestRate: '0',
  icon: '',
  creditLimit: '0'
})
let editIndex = -1
const loading = ref(false)

onMounted(() => {
  getAccountData()
})

// 监听账户类型变化，自动重置信用限额
watch(() => accountForm.value.accountType, (newType) => {
  if (newType !== 'credit_card') {
    accountForm.value.creditLimit = '0'
  }
})

function openAccountDialog(mode, row = null, index = -1) {
  dialogMode.value = mode
  accountDialogVisible.value = true
  if (mode === 'edit' && row) {
    accountForm.value = { ...row }
    editIndex = index
  } else {
    accountForm.value = {
      name: '',
      accountType: '',
      balance: '',
      accountNumber: '',
      interestRate: '0',
      icon: '',
      creditLimit: '0'
    }
    editIndex = -1
  }
}

async function handleAccountDialogConfirm() {
  const userId=1
  if (!accountForm.value.name || !accountForm.value.accountType || !accountForm.value.balance || !accountForm.value.accountNumber) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (dialogMode.value === 'add') {
    let formData = {
      userId: userId,
      bankName: accountForm.value.name,
      accountType: accountForm.value.accountType,
      balance: accountForm.value.balance,
      accountNumber: accountForm.value.accountNumber,
      currency: "CNY",
      interestRate: accountForm.value.interestRate,
      creditLimit: accountForm.value.accountType === 'credit_card' ? accountForm.value.creditLimit : '0'
    }
   
    const res = await axios.post('/api/bank', formData)
    if (res.status === 200) {
      ElMessage.success('添加成功')
    } else {
      ElMessage.error('添加失败')
    }
    // accountData.value.push({ ...accountForm.value })
  } else if (dialogMode.value === 'edit' && editIndex !== -1) {
    const res = await axios.put('/api/bank', {
      userId: userId,
      bankName: accountForm.value.name,
      accountType: accountForm.value.accountType,
      balance: accountForm.value.balance,
      accountNumber: accountForm.value.accountNumber,
      interestRate: accountForm.value.interestRate,
      creditLimit: accountForm.value.accountType === 'credit_card' ? accountForm.value.creditLimit : '0'
    })
    if (res.status === 200) {
      ElMessage.success('编辑成功')
    } else {
      ElMessage.error('编辑失败')
    }
    //  accountData.value[editIndex] = { ...accountForm.value }
  }
  accountDialogVisible.value = false
  getAccountData()
}

const getAccountData = async () => {
  loading.value = true
  try {
    const userId = 1
    const res = await axios.get(`/api/bank/${userId}`)
    if (res.data.success) {
      const data=res.data.data
      console.log(data)
      accountData.value = data.map(item => {
        return {
        name: item.bank_name,
        accountType: item.account_type,
        balance: item.balance,
        accountNumber: item.account_number,
        interestRate: item.interest_rate,
        creditLimit: item.credit_limit || '0'
      }
    })
    } else {
      ElMessage.error('获取数据失败')
    }
  } catch (error) {
    ElMessage.error('网络请求失败')
  } finally {
    loading.value = false
  }
}

const getAccountTypeColor = (type) => {
  const colors = {
    'saving': 'success',
    'fixed_deposit': 'primary',
    'credit_card': 'warning'
  }
  return colors[type] || 'info'
}

const getAccountTypeName = (type) => {
  const names = {
    'savings': '储蓄账户',
    'fixed_deposit': '定期存款',
    'credit_card': '信用卡'
  }
  return names[type] || type
}

// 格式化金额显示
const formatCurrency = (amount) => {
  return amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
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