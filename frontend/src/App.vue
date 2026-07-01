<script setup lang="ts">
import VehicleList from './views/VehicleList.vue'
</script>

<template>
  <div class="app-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>车辆运营管理系统</h1>
        </div>
      </el-header>
      <el-main>
        <VehicleList />
      </el-main>
    </el-container>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  background-color: #f5f7fa;
}

.app-container {
  min-height: 100vh;
}

.el-header {
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.header-content h1 {
  font-size: 20px;
  font-weight: 600;
}

.el-main {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}
</style>
