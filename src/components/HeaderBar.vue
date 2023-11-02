<script lang="ts" setup></script>

<template>
  <el-row><el-col :span="24" class="control-bar" /></el-row>
  <el-row>
    <el-col :span="24">
      <img alt="HexoPress" height="30" width="30" src="../assets/logo.svg" />
      <div class="app-name">HexoPress</div>
      <slot></slot>
    </el-col>
  </el-row>
</template>

<style scoped>
.control-bar {
  height: 14px;
  display: block;
}
img {
  float: left;
  margin: 10px 17px 10px 17px;
}
.app-name {
  float: left;
  line-height: 48px;
  padding: 0 12px 0 0;
  margin-left: -12px;
  font-weight: bold;
}
</style>
