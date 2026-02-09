<script lang="ts" setup>
import router from '@/router'
import { useAppStore } from '@/stores/app'
import { Delete } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const appStore = useAppStore()
const { t } = useI18n()

function unbindBasePath() {
  console.log('call unbind basePath')
  appStore.setBasePath('')
  console.log('call router.push, to /')
  router.push({ path: '/', replace: true })
}

const darkMode = computed({
  get: () => appStore.darkMode,
  set: (val) => {
    console.log('preferences set darkMode as:', val)
    appStore.setDarkMode(val)
  },
})

const editMode = computed({
  get: () => appStore.editMode,
  set: (val) => {
    console.log('preferences set editMode as:', val)
    appStore.setEditMode(val)
  },
})

const locale = computed({
  get: () => appStore.locale,
  set: (val) => {
    console.log('preferences set locale as:', val)
    appStore.setLocale(val)
  },
})

const autoSave = computed({
  get: () => appStore.autoSave,
  set: (val) => {
    console.log('preferences set autoSave as:', val)
    appStore.setAutoSave(val)
  },
})

function addProvider() {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  appStore.addAiProvider({ id, name: '', baseUrl: '', apiKey: '', provider: 'openai', modelId: '' })
}

function removeProvider(id: string) {
  appStore.removeAiProvider(id)
}

function updateProviderField(id: string, field: keyof AiProvider, value: string) {
  appStore.updateAiProvider(id, { [field]: value })
}

const activeTab = ref('general')
</script>
<template>
  <h2>{{ t('preferences.preferences') }}</h2>
  <el-tabs v-model="activeTab" style="max-width: 750px">
    <el-tab-pane :label="t('settings.tabGeneral')" name="general">
      <el-form label-width="180px" label-position="top">
        <el-form-item :label="t('settings.basePath')">
          <el-input v-model="appStore.basePath" disabled />
        </el-form-item>
        <el-form-item>
          <el-button type="danger" plain @click="unbindBasePath">{{
            t('settings.unbind')
          }}</el-button>
        </el-form-item>
        <el-form-item :label="t('settings.language')">
          <el-select v-model="locale">
            <el-option key="zh-CN" :label="t(`settings.languages.zh-CN`)" value="zh-CN" />
            <el-option key="en" :label="t(`settings.languages.en`)" value="en" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('settings.darkMode')">
          <el-select v-model="darkMode">
            <el-option key="light" :label="t('settings.light')" value="light" />
            <el-option key="dark" :label="t('settings.dark')" value="dark" />
            <el-option key="system" :label="t('settings.system')" value="system" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('settings.autoSave')">
          <el-radio-group v-model="autoSave">
            <el-radio value="autoSaveOn"> {{ t('settings.autoSaveOn') }}</el-radio>
            <el-radio value="autoSaveOff"> {{ t('settings.autoSaveOff') }} </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('settings.editorMode')">
          <el-radio-group v-model="editMode">
            <el-radio value="normal"> {{ t('settings.editorNormal') }}</el-radio>
            <el-radio value="vim"> {{ t('settings.editorVim') }} </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('settings.defaultFilename')">
          <el-radio-group>
            <el-radio value="title"> {{ t('settings.alwaysTitle') }}</el-radio>
            <el-radio value="permalink"> {{ t('settings.permalinkFirst') }} </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-tab-pane>

    <el-tab-pane :label="t('settings.tabAi')" name="ai">
      <el-form label-width="180px" label-position="top">
        <el-form-item :label="t('settings.aiProviders')">
          <div v-for="provider in appStore.aiProviders" :key="provider.id" class="ai-provider-card">
            <el-input
              :model-value="provider.name"
              :placeholder="t('settings.aiProviderName')"
              size="small"
              class="ai-provider-field"
              @update:model-value="
                (val: string) => updateProviderField(provider.id, 'name', val)
              " />
            <el-input
              :model-value="provider.baseUrl"
              :placeholder="t('settings.aiProviderEndpoint')"
              size="small"
              class="ai-provider-field"
              @update:model-value="
                (val: string) => updateProviderField(provider.id, 'baseUrl', val)
              " />
            <el-input
              :model-value="provider.apiKey"
              type="password"
              show-password
              :placeholder="t('settings.aiProviderApiKey')"
              size="small"
              class="ai-provider-field"
              @update:model-value="
                (val: string) => updateProviderField(provider.id, 'apiKey', val)
              " />
            <el-select
              :model-value="provider.provider"
              :placeholder="t('settings.aiProviderSpec')"
              size="small"
              class="ai-provider-field"
              @update:model-value="
                (val: string) => updateProviderField(provider.id, 'provider', val)
              ">
              <el-option key="openai" label="OpenAI Compatible" value="openai" />
            </el-select>
            <el-input
              :model-value="provider.modelId"
              :placeholder="t('settings.aiProviderModelId')"
              size="small"
              class="ai-provider-field"
              @update:model-value="
                (val: string) => updateProviderField(provider.id, 'modelId', val)
              " />
            <el-button
              type="danger"
              plain
              size="small"
              :icon="Delete"
              @click="removeProvider(provider.id)">
              {{ t('settings.aiProviderDelete') }}
            </el-button>
          </div>
          <el-button type="primary" plain size="small" @click="addProvider">
            {{ t('settings.aiProviderAdd') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>
  </el-tabs>

  <el-form label-width="180px" label-position="top" style="max-width: 750px">
    <el-form-item>
      <el-button type="primary">{{ t('settings.save') }}</el-button>
    </el-form-item>
  </el-form>
</template>
<style scoped>
.el-form:deep(.el-form-item__label) {
  font-weight: bold;
}
.ai-provider-card {
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}
.ai-provider-field {
  margin-bottom: 8px;
}
</style>
