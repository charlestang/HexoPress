import { defineStore } from 'pinia';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface EditorState {
  currentHeadings: Heading[];
  activeHeadingId: string | null;
}

export const useEditorStore = defineStore('editor', {
  state: (): EditorState => ({
    currentHeadings: [],
    activeHeadingId: null,
  }),
  actions: {
    setHeadings(headings: Heading[]) {
      this.currentHeadings = headings;
    },
    setActiveHeadingId(id: string | null) {
      this.activeHeadingId = id;
      // Optionally, scroll to the heading here if direct editor access is too complex from outside
      // However, the plan is for EditorMain.vue to watch this and scroll.
    },
  },
});
