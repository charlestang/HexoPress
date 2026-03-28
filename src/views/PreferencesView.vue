<script lang="ts" setup>
import {
  appThemeOptions,
  codeFontPresetOptions,
  codeThemeGroups,
  editorFontPresetOptions,
  type AppThemePreference,
  type AppearanceCodeTheme,
  type CodeFontPresetId,
  type EditorFontPresetId,
} from '@/constants/appearance'
import router from '@/router'
import { useAppStore } from '@/stores/app'
import { Delete } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const appStore = useAppStore()
const { t } = useI18n()

function unbindBasePath() {
  appStore.setBasePath('')
  router.push({ path: '/', replace: true })
}

const themePreference = computed<AppThemePreference>({
  get: () => appStore.darkMode,
  set: (val) => {
    appStore.setDarkMode(val)
  },
})

const editMode = computed({
  get: () => appStore.editMode,
  set: (val) => {
    appStore.setEditMode(val)
  },
})

const locale = computed({
  get: () => appStore.locale,
  set: (val) => {
    appStore.setLocale(val)
  },
})

const autoSave = computed({
  get: () => appStore.autoSave,
  set: (val) => {
    appStore.setAutoSave(val)
  },
})

const editorFontSize = computed({
  get: () => appStore.editorFontSize,
  set: (val: number | undefined) => {
    if (val !== undefined) {
      appStore.setEditorFontSize(val)
    }
  },
})

const editorLineWrap = computed({
  get: () => appStore.editorLineWrap,
  set: (val: boolean) => {
    appStore.setEditorLineWrap(val)
  },
})

const editorFontFamily = computed<EditorFontPresetId>({
  get: () => appStore.editorFontFamily,
  set: (val) => {
    appStore.setEditorFontFamily(val)
  },
})

const codeTheme = computed<AppearanceCodeTheme>({
  get: () => appStore.codeTheme,
  set: (val) => {
    appStore.setCodeTheme(val)
  },
})

const codeLineNumbers = computed({
  get: () => appStore.codeLineNumbers,
  set: (val: boolean) => {
    appStore.setCodeLineNumbers(val)
  },
})

const codeFontFamily = computed<CodeFontPresetId>({
  get: () => appStore.codeFontFamily,
  set: (val) => {
    appStore.setCodeFontFamily(val)
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
  <el-tabs v-model="activeTab" class="preferences-tabs">
    <el-tab-pane :label="t('settings.tabGeneral')" name="general">
      <el-form label-width="180px" label-position="top" class="settings-form">
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

    <el-tab-pane :label="t('settings.tabAppearance')" name="appearance">
      <el-form label-width="180px" label-position="top" class="settings-form">
        <div class="preferences-note">{{ t('settings.applyImmediately') }}</div>

        <section class="settings-section">
          <h3 class="settings-section__title">{{ t('settings.appearanceThemeSection') }}</h3>
          <el-form-item :label="t('settings.theme')">
            <el-select v-model="themePreference">
              <el-option
                v-for="option in appThemeOptions"
                :key="option.value"
                :label="t(option.labelKey)"
                :value="option.value" />
            </el-select>
          </el-form-item>
        </section>

        <section class="settings-section">
          <h3 class="settings-section__title">{{ t('settings.appearanceEditorSection') }}</h3>
          <el-form-item :label="t('settings.editorLineWrap')">
            <el-switch v-model="editorLineWrap" />
          </el-form-item>
          <el-form-item :label="t('settings.editorFontSize')">
            <el-input-number v-model="editorFontSize" :min="10" :max="28" :step="1" />
          </el-form-item>
          <el-form-item :label="t('settings.editorFontFamily')">
            <el-select v-model="editorFontFamily">
              <el-option
                v-for="option in editorFontPresetOptions"
                :key="option.value"
                :label="t(option.labelKey)"
                :value="option.value" />
            </el-select>
          </el-form-item>
        </section>

        <section class="settings-section">
          <h3 class="settings-section__title">{{ t('settings.appearanceCodeBlockSection') }}</h3>
          <el-form-item :label="t('settings.codeBlockTheme')">
            <el-select v-model="codeTheme">
              <el-option-group
                v-for="group in codeThemeGroups"
                :key="group.id"
                :label="t(group.labelKey)">
                <el-option
                  v-for="option in group.themes"
                  :key="option.value"
                  :label="t(option.labelKey)"
                  :value="option.value" />
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item :label="t('settings.codeLineNumbers')">
            <el-switch v-model="codeLineNumbers" />
          </el-form-item>
          <el-form-item :label="t('settings.codeFontFamily')">
            <el-select v-model="codeFontFamily">
              <el-option
                v-for="option in codeFontPresetOptions"
                :key="option.value"
                :label="t(option.labelKey)"
                :value="option.value" />
            </el-select>
          </el-form-item>
        </section>
      </el-form>
    </el-tab-pane>

    <el-tab-pane :label="t('settings.tabAi')" name="ai">
      <el-form label-width="180px" label-position="top" class="settings-form">
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
</template>
<style scoped>
.preferences-tabs {
  max-width: 750px;
}
.settings-form {
  max-width: 750px;
}
.el-form:deep(.el-form-item__label) {
  font-weight: bold;
}
.preferences-note {
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.settings-section {
  margin-bottom: 24px;
}
.settings-section__title {
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 700;
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
