<script lang="ts" setup>
import { ref } from 'vue'
defineProps({
  modelValue: []
})
defineEmits(['update:modelValue'])
let tagsInputActive = ref('')
</script>
<template>
  <div class="tags-area" :class="tagsInputActive">
    <div class="tags-field">
      <el-tag v-for="tag in tagsList" :key="tag" closable @close="onTagClose(tag)">
        {{ tag }}
      </el-tag>
      <el-input
        v-model="tagInputing"
        type="text"
        autocomplete="off"
        class="tags-input"
        @focus="tagsInputActive = 'is-active'"
        @blur="tagsInputActive = ''"
        @change="onTagInputingChange"
        @input="onTagInputingChar"
        @keydown.delete="onTagInputingDel"
      />
    </div>
  </div>
</template>
<style scoped></style>
