<template>
  <div class="toc-wrapper">
    <ul class="toc-panel">
      <li
        v-for="h1 in processedHeadings"
        :key="h1.id || h1.text"
        :class="['toc-item', `toc-level-${h1.level}`, { 'active-heading': h1.id === activeHeading?.id }]"
        @click="handleClick(h1)"
      >
        {{ h1.text }}
        <ul v-if="h1.children?.length > 0" class="toc-nested-list">
          <li
            v-for="h2 in h1.children"
            :key="h2.id || h2.text"
            :class="['toc-item', `toc-level-${h2.level}`, { 'active-heading': h2.id === activeHeading?.id }]"
            @click.stop="handleClick(h2)"
          >
            {{ h2.text }}
            <ul v-if="h2.children?.length > 0" class="toc-nested-list">
              <li
                v-for="h3 in h2.children"
                :key="h3.id || h3.text"
                :class="['toc-item', `toc-level-${h3.level}`, { 'active-heading': h3.id === activeHeading?.id }]"
                @click.stop="handleClick(h3)"
              >
                {{ h3.text }}
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore';
import { computed } from 'vue';

interface HeadingWithChildren extends Heading {
  children: HeadingWithChildren[];
}

interface Props {
  headings: Heading[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'scrollToHeading', heading: Heading): void;
}>();

const editorStore = useEditorStore();
const activeHeading = computed(() => editorStore.activeHeading);

const processedHeadings = computed(() => {
  const headings = props.headings;
  if (!headings || headings.length === 0) {
    return [];
  }

  const result: HeadingWithChildren[] = [];
  let currentH1: HeadingWithChildren | null = null;
  let currentH2: HeadingWithChildren | null = null;

  for (const heading of headings) {
    const headingWithChildren: HeadingWithChildren = {
      ...heading,
      children: []
    };

    if (heading.level === 1) {
      currentH1 = headingWithChildren;
      result.push(currentH1);
      currentH2 = null;
    } else if (heading.level === 2) {
      if (currentH1) {
        currentH2 = headingWithChildren;
        currentH1.children.push(currentH2);
      } else {
        currentH2 = headingWithChildren;
        result.push(currentH2);
        currentH1 = null;
      }
    } else if (heading.level === 3) {
      if (currentH2) {
        currentH2.children.push(headingWithChildren);
      } else if (currentH1) {
        currentH1.children.push(headingWithChildren);
      } else {
        result.push(headingWithChildren);
      }
    }
  }
  return result;
});

const handleClick = (heading: Heading) => {
  editorStore.setActiveHeading(heading);
  emit('scrollToHeading', heading);
};
</script>

<style scoped>
.toc-wrapper {
  padding: 5px 8px; /* Consistent with FileExplorer-like padding */
  height: 100%; /* Ensure wrapper takes full height of its container */
  box-sizing: border-box;
}

.toc-panel {
  list-style-type: none;
  padding-left: 0;
  /* font-family: sans-serif; Removed to inherit global styles */
  height: 100%; /* Allow panel to fill wrapper */
  overflow-y: auto; /* Enable scrolling for long lists */
  box-sizing: border-box;
}

.toc-item {
  padding: 10px 12px; /* Increased padding, closer to FileExplorer */
  cursor: pointer;
  border-radius: 4px;
  /* margin-bottom: 4px; Removed for potentially tighter packing, or can be adjusted */
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
  line-height: 1.4; /* Improved line height */
  word-wrap: break-word; /* Ensure long headings wrap */
  white-space: normal; /* Allow text to wrap */
}

.toc-item:hover {
  background-color: #e9ecef; /* Subtle hover effect */
}

.toc-level-1 {
  font-weight: 600; /* Slightly bolder for H1 */
  /* margin-left: 0; Default, no specific margin needed unless overriding */
}

.toc-level-2 {
  margin-left: 18px; /* Adjusted indentation */
}

.toc-level-3 {
  margin-left: 36px; /* Adjusted indentation */
}

.active-heading {
  background-color: #007bff; /* Element Plus primary color */
  color: #ffffff;
  font-weight: 600;
}

.active-heading:hover {
  background-color: #0069d9; /* Darker shade for hover on active */
  color: #ffffff;
}

.toc-nested-list {
  list-style-type: none;
  padding-left: 0;
  margin-top: 2px; /* Reduced space for tighter nesting */
  margin-bottom: 2px;
}
</style>
