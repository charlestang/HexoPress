<script lang="ts" setup>
import router from '@/router'
import { useAppStore } from '@/stores/app'
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const form = reactive({
  directory: '',
})

const appStore = useAppStore()

async function onSubmit() {
  console.log('form directory:', form.directory)
  if (form.directory === '') return
  console.log('env is:', import.meta.env)
  console.log('base url is:', import.meta.env.BASE_URL)
  appStore.setBasePath(form.directory)
  const res = await router.push({ path: '/' })
  console.log('router result: ', res)
}

function selectPath() {
  window.site.openDirDialog().then(result => {
    form.directory = result['filePaths'][0]
  })
}
</script>

<template>
  <el-container>
    <el-header class="topbar">
      <header-bar></header-bar>
    </el-header>
    <el-container class="main">
      <el-aside class="nav" width="collapse"></el-aside>
      <el-main class="main-content">
        <h2>{{ t('common.setup') }}</h2>
        <el-form label-position="top" :model="form" label-width="200px" style="max-width: 500px">
          <el-space fill>
            <el-form-item :label="t('common.selectDir')" label-width="150px">
              <el-input v-model="form.directory" autocomplete="off" read-only="true">
                <template #append>
                  <el-button @click="selectPath">{{ t('setup.choose') }}</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-alert type="info" show-icon :closable="false">
              {{ t('setup.selectDirTips') }}
            </el-alert>
          </el-space>
          <el-form-item label-width="150px" style="margin-top: 20px">
            <el-button type="primary" @click="onSubmit">{{ t('setup.confirm') }}</el-button>
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.main {
  flex: 1;
}
.nav {
  height: calc(100vh - 62px);
  color: #fff;
  background: #59524c;
}
.main-content {
  height: calc(100vh - 62px);
  padding-top: 10px;
  padding-bottom: 10px;
}
.new {
  height: 40px;
  margin: 4px 0;
  color: #fff;
  -webkit-app-region: no-drag;
}
.new:hover {
  color: #c7a589;
}
</style>
