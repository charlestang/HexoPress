<script lang="ts" setup>
import { Lock, User } from '@element-plus/icons-vue'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)

async function onLogin() {
  if (!form.username || !form.password) {
    ElMessage.warning(t('login.emptyFields'))
    return
  }

  loading.value = true
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.username, password: form.password }),
    })

    if (res.ok) {
      await router.push({ path: '/' })
    } else {
      const data = await res.json().catch(() => null)
      ElMessage.error(data?.error || t('login.failed'))
    }
  } catch {
    ElMessage.error(t('login.networkError'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <el-card class="w-96" shadow="always">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">HexoPress</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('login.subtitle') }}</p>
        </div>
      </template>
      <el-form :model="form" label-position="top" @submit.prevent="onLogin">
        <el-form-item :label="t('login.username')">
          <el-input
            v-model="form.username"
            :placeholder="t('login.usernamePlaceholder')"
            :prefix-icon="User"
            autocomplete="username" />
        </el-form-item>
        <el-form-item :label="t('login.password')">
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="t('login.passwordPlaceholder')"
            :prefix-icon="Lock"
            show-password
            autocomplete="current-password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="w-full" :loading="loading" native-type="submit">
            {{ t('login.submit') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
