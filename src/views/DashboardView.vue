<template>
  <h2>Dashboard</h2>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card>
        <h4>Activities</h4>
        <h5>Recent posts</h5>
        <ul>
          <li>如何使用 docker 部署一个 WordPress</li>
          <li>如何使用Hugo和Github Actions搭建博客</li>
          <li>使用 Flutter 如何实现客户端证书验证 mtls</li>
          <li>如何使用 Flutter 实现一个 OTP 验证器</li>
          <li>WordPress 数据库损坏</li>
        </ul>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card>
        <h4>Overviews</h4>
        <el-button type="primary" :icon="Document" link>415 posts</el-button>
        <el-button type="primary" :icon="Document" link>7 pages</el-button>
        <el-button type="primary" :icon="Document" link>2,215 comments</el-button>
        <p>Hexo 6.3.0, use Next theme.</p>
      </el-card>
    </el-col>
  </el-row>
</template>
<script lang="ts" setup>
import { Document } from '@element-plus/icons-vue'
</script>
