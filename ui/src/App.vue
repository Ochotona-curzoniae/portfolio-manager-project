<script setup>
import Finance from './components/Finance.vue'
</script>

<template>
  <main class="app-root">
    <Finance />
  </main>
</template>

<style scoped>
.app-root {
  width: 100vw;   /* 覆盖视口宽度（包括滚动条） */
  height: 100vh;  /* 覆盖视口高度 */
  overflow: hidden; /* 禁止全局滚动，交给内部组件 */
  margin: 0 !important;      /* 消除默认边距 */
  padding: 0 !important;     /* 消除默认内边距 */
}

</style>
