<script lang="ts" setup></script>

<template>
  <el-row><el-col :span="24" class="h-14px block" /></el-row>
  <el-row>
    <el-col :span="24">
      <img alt="HexoPress" height="30" width="30" src="../assets/logo.svg" class="float-left m-10px mx-17px" />
      <div class="float-left leading-48px px-12px -ml-12px font-bold">HexoPress</div>
      <slot></slot>
    </el-col>
  </el-row>
</template>