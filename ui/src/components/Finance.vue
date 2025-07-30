<template>
  <div class="portfolio-layout">
    <!-- 左侧TabBar -->
    <aside class="tabbar">
      <div 
        v-for="(tab, index) in tabs" 
        :key="index" 
        class="tab" 
        :class="{ active: activeTab === index }"
        @click="handleTabClick(index)"
      >
        {{ tab }}
      </div>
    </aside>
    <!-- 右侧只显示当前Tab对应的内容 -->
    <main class="section">
      <component :is="sectionComponents[activeTab]" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NetWorth from './sections/NetWorth.vue'
import StockPrice from './sections/StockPrice.vue'
import InvestmentPortfolio from './sections/InvestmentPortfolio.vue'
import BankAccount from './sections/BankAccount.vue'
import AssetAnalysis from './sections/AssetAnalysis.vue'
import MarketTrends from './sections/MarketTrends.vue'

const sectionComponents = [
  NetWorth,
  StockPrice,
  InvestmentPortfolio,
  BankAccount,
  AssetAnalysis,
  MarketTrends
]
const tabs = ref(['总资产概览', '当前股票价格', '投资组合', '银行账户', '资产分析', '市场动态'])
const activeTab = ref(0)
const handleTabClick = (index) => {
  activeTab.value = index
}
</script>

<style scoped>
/* 全局布局 */
.portfolio-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  font-family: 'Segoe UI', 'PingFang SC', 'Hiragino Sans', Arial, sans-serif;
  background: #f5f6fa;
}

/* 左侧TabBar */
.tabbar {
  width: 240px;
  background: #223354;
  display: flex;
  flex-direction: column;
  padding: 32px 0;
  box-shadow: 4px 0 24px rgba(34,51,84,0.08);
  border-top-right-radius: 32px;
  border-bottom-right-radius: 32px;
  align-items: center;
}

.tab {
  width: 180px;
  margin: 8px 0;
  padding: 18px 0 18px 24px;
  text-align: left;
  cursor: pointer;
  font-size: 1.15rem;
  color: #e9ecef;
  border-radius: 16px 0 0 16px;
  transition: 
    background 0.3s, 
    color 0.3s, 
    box-shadow 0.3s, 
    transform 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0.85;
}

.tab.active {
  background: linear-gradient(90deg, #1a73e8 0%, #22c55e 100%);
  color: #fff;
  font-weight: bold;
  box-shadow: 2px 4px 16px rgba(34,51,84,0.10);
  transform: scale(1.04);
  opacity: 1;
}

.tab.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 18px;
  bottom: 18px;
  width: 6px;
  border-radius: 4px;
  background: #22c55e;
}

.tab:hover:not(.active) {
  background: #1a2330;
  color: #fff;
  transform: translateX(4px) scale(1.02);
  opacity: 1;
}

/* 右侧滚动容器 */
.scroll-container {
  flex: 1;
  overflow-y: scroll;
  scroll-behavior: smooth;
  padding: 0 0 0 32px;
  background: #f5f6fa;
}

/* 自定义滚动条 */
.scroll-container::-webkit-scrollbar {
  width: 8px;
  background: transparent;
}
.scroll-container::-webkit-scrollbar-thumb {
  background: #e3eaf2;
  border-radius: 8px;
}

/* Section */
.section {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none !important;
  position: relative;
  transition: background 0.5s;
}

.section-content {
  width: 100%;
  height: 100%;
  background: #fff;
  backdrop-filter: none;
  padding: 48px 40px;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(34,51,84,0.08);
  border: 1.5px solid #e3eaf2;
  text-align: center;
  animation: fadeIn 0.7s;
}

.section-content h2 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #223354;
  margin-bottom: 18px;
  letter-spacing: 1px;
}

.section-content p {
  font-size: 1.15rem;
  color: #64748b;
  margin-top: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(40px);}
  to { opacity: 1; transform: none;}
}
</style>