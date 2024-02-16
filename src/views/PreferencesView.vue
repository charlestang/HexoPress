<script lang="ts" setup>
import router from '@/router'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

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
  set: val => {
    console.log('preferences set darkMode as:', val)
    appStore.setDarkMode(val)
  },
})

const editMode = computed({
  get: () => appStore.editMode,
  set: val => {
    console.log('preferences set editMode as:', val)
    appStore.setEditMode(val)
  },
})
</script>
<template>
  <h2>{{ t('preferences.preferences') }}</h2>
  <el-form label-width="180px" label-position="top" style="max-width: 750px">
    <el-form-item :label="t('settings.basePath')">
      <el-input v-model="appStore.basePath" disabled />
    </el-form-item>
    <el-form-item>
      <el-button type="danger" plain @click="unbindBasePath">{{ t('settings.unbind') }}</el-button>
    </el-form-item>
  </el-form>

  <el-form label-width="180px" label-position="top" style="max-width: 750px">
    <el-form-item :label="t('settings.language')">
      <el-select>
        <el-option
          v-for="lang in $i18n.availableLocales"
          :key="lang"
          :label="$t(`settings.languages.${lang}`)"
          :value="lang" />
      </el-select>
    </el-form-item>
    <el-form-item :label="t('settings.darkMode')">
      <el-select v-model="darkMode">
        <el-option key="light" :label="t('settings.light')" value="light" />
        <el-option key="dark" :label="t('settings.dark')" value="dark" />
        <el-option key="system" :label="t('settings.system')" value="system" />
      </el-select>
    </el-form-item>
    <el-form-item :label="t('settings.editorMode')">
      <el-radio-group v-model="editMode">
        <el-radio label="normal"> {{ t('settings.editorNormal') }}</el-radio>
        <el-radio label="vim"> {{ t('settings.editorVim') }} </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="t('settings.defaultFilename')">
      <el-radio-group>
        <el-radio label="title"> {{ t('settings.alwaysTitle') }}</el-radio>
        <el-radio label="permalink"> {{ t('settings.permalinkFirst') }} </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary">{{ t('settings.save') }}</el-button>
    </el-form-item>
  </el-form>
</template>
