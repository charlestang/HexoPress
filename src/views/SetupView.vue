<template>
  <div class="wrap">
    <h2>Please select your hexo directory first:</h2>
    <el-form :model="form">
      <el-form-item label="Select a directory" label-width="150px">
        <el-input v-model="form.directory" autocomplete="off" read-only="true">
          <template #append>
            <el-button @click="selectPath">Choose</el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label-width="150px">
        <el-button type="primary" @click="onSubmit">Create</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import router from '@/router'
import { reactive } from 'vue'
const form = reactive({
  directory: ''
})

async function onSubmit() {
  if (form.directory === '') return
  await window.site.setConfig('vaultPath', form.directory)
  router.replace('/')
}

function selectPath() {
  window.site.openDirDialog().then((result) => {
    form.directory = result['filePaths'][0]
  })
}
</script>

<style scoped>
.wrap {
  padding: 20px;
}
</style>
