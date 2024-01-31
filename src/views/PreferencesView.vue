<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <h2>{{ t('preferences.preferences') }}</h2>
  <el-form>
    <el-form-item :label="t('settings.language')">
      <el-select>
        <el-option
          v-for="lang in $i18n.availableLocales"
          :key="lang"
          :label="$t(`settings.languages.${lang}`)"
          :value="lang"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="t('settings.darkMode')">
      <el-select>
        <el-option key="light" :label="t('settings.light')" value="light" />
        <el-option key="dark" :label="t('settings.dark')" value="dark" />
        <el-option key="system" :label="t('settings.system')" value="system" />
      </el-select>
    </el-form-item>
    <el-form-item :label="t('settings.editorMode')">
      <el-radio-group>
        <el-radio label="normal"> {{ t('settings.editorNormal') }}</el-radio>
        <el-radio label="vim"> {{ t('settings.editorVim') }} </el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>
