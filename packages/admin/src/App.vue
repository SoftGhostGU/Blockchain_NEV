<template>
  <n-config-provider>
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { NConfigProvider, NMessageProvider } from "naive-ui"
</script>

<style>
/* 全局样式或 App 容器样式 */
#app {
  height: 100vh;
  width: 100vw;
}
</style>
