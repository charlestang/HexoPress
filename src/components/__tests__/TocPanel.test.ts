import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'

// Mock the editorStore
const mockEditorStore = reactive({
  activeHeading: null as Heading | null,
  setActiveHeading: vi.fn(),
})

vi.mock('@/stores/editorStore', () => ({
  useEditorStore: () => mockEditorStore,
}))

const setCurrentKey = vi.fn()

// Mock Element Plus Tree component
const MockElTree = {
  name: 'ElTree',
  template: '<div class="mock-el-tree"><slot /></div>',
  props: {
    data: {
      type: Array,
      required: true
    },
    props: {
      type: Object,
      required: true
    },
    nodeKey: {
      type: String,
      required: true
    },
    highlightCurrent: {
      type: Boolean,
      required: true
    },
    currentNodeKey: {
      type: String,
      default: undefined
    },
    expandOnClickNode: {
      type: Boolean,
      required: true
    },
    defaultExpandAll: {
      type: Boolean,
      required: true
    }
  },
  emits: ['node-click'],
  methods: {
    setCurrentKey: setCurrentKey,
  },
  watch: {
    currentNodeKey: {
      handler(this: {setCurrentKey: typeof setCurrentKey}, newVal: string | undefined) {
        if (newVal) {
          this.setCurrentKey(newVal)
        }
      },
      immediate: true
    }
  }
}

import TocPanel from '../TocPanel.vue' // Must be imported after the mock

// Type for tree node data
interface TreeNode {
  id: string
  text: string
  level: number
  line: number
  children: TreeNode[]
}

// Type for the component instance
interface TocPanelInstance {
  treeData: TreeNode[]
  handleNodeClick: (data: TreeNode) => void
}

describe('TocPanel.vue', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    // Reset the mock store state before each test
    mockEditorStore.activeHeading = null
    vi.clearAllMocks()
    setCurrentKey.mockClear()
  })

  const sampleHeadings: Heading[] = [
    { id: 'h1-1', text: 'Chapter 1', level: 1, line: 1 },
    { id: 'h2-1', text: 'Section 1.1', level: 2, line: 5 },
    { id: 'h3-1', text: 'Subsection 1.1.1', level: 3, line: 10 },
    { id: 'h2-2', text: 'Section 1.2', level: 2, line: 15 },
    { id: 'h1-2', text: 'Chapter 2', level: 1, line: 20 },
  ]

  const nestedHeadings: Heading[] = [
    { id: 'parent1', text: 'Parent 1 (H1)', level: 1, line: 1 },
    { id: 'child1-1', text: 'Child 1.1 (H2)', level: 2, line: 5 },
    { id: 'grandchild1-1-1', text: 'Grandchild 1.1.1 (H3)', level: 3, line: 10 },
    { id: 'child1-2', text: 'Child 1.2 (H2)', level: 2, line: 15 },
    { id: 'parent2', text: 'Parent 2 (H1)', level: 1, line: 20 },
    { id: 'child2-1', text: 'Child 2.1 (H2)', level: 2, line: 25 },
  ]

  it('renders correctly with no headings', () => {
    const wrapper = mount(TocPanel, {
      props: { headings: [] },
      global: {
        plugins: [pinia],
        stubs: {
          'el-tree': MockElTree,
        },
      },
    })
    expect(wrapper.find('.toc-wrapper').exists()).toBe(true)
    expect(wrapper.find('.mock-el-tree').exists()).toBe(true)
  })

  it('processes headings into correct tree structure', () => {
    const wrapper = mount(TocPanel, {
      props: { headings: sampleHeadings },
      global: {
        plugins: [pinia],
        stubs: {
          'el-tree': MockElTree,
        },
      },
    })

    // Access the computed treeData through the component instance
    const treeData = (wrapper.vm as unknown as TocPanelInstance).treeData
    expect(treeData.length).toBe(2) // Two H1s at the top level

    // Check first H1 structure
    expect(treeData[0].text).toBe('Chapter 1')
    expect(treeData[0].level).toBe(1)
    expect(treeData[0].children.length).toBe(2) // Two H2 children

    // Check H2 structure
    expect(treeData[0].children[0].text).toBe('Section 1.1')
    expect(treeData[0].children[0].level).toBe(2)
    expect(treeData[0].children[0].children.length).toBe(1) // One H3 child

    // Check H3 structure
    expect(treeData[0].children[0].children[0].text).toBe('Subsection 1.1.1')
    expect(treeData[0].children[0].children[0].level).toBe(3)
  })

  it('processes nested headings correctly', () => {
    const wrapper = mount(TocPanel, {
      props: { headings: nestedHeadings },
      global: {
        plugins: [pinia],
        stubs: {
          'el-tree': MockElTree,
        },
      },
    })

    const treeData = (wrapper.vm as unknown as TocPanelInstance).treeData
    expect(treeData.length).toBe(2) // Two H1s at the top level
    expect(treeData[0].children.length).toBe(2) // First H1 has two H2 children
    expect(treeData[0].children[0].children.length).toBe(1) // First H2 child has one H3 grandchild

    // Verify structure
    expect(treeData[0].text).toBe('Parent 1 (H1)')
    expect(treeData[0].children[0].text).toBe('Child 1.1 (H2)')
    expect(treeData[0].children[0].children[0].text).toBe('Grandchild 1.1.1 (H3)')
  })

  it('emits scrollToHeading event and calls store when node is clicked', async () => {
    const wrapper = mount(TocPanel, {
      props: { headings: sampleHeadings },
      global: {
        plugins: [pinia],
        stubs: {
          'el-tree': MockElTree,
        },
      },
    })

    // Simulate node click by calling the handleNodeClick method directly
    const nodeData: TreeNode = {
      id: 'h2-1',
      text: 'Section 1.1',
      level: 2,
      line: 5,
      children: [],
    }

    await (wrapper.vm as unknown as TocPanelInstance).handleNodeClick(nodeData)

    // Check that the store method was called
    expect(mockEditorStore.setActiveHeading).toHaveBeenCalledWith({
      id: 'h2-1',
      text: 'Section 1.1',
      level: 2,
      line: 5,
    })

    // Check that the event was emitted
    expect(wrapper.emitted().scrollToHeading).toBeTruthy()
    expect(wrapper.emitted().scrollToHeading![0]).toEqual([
      {
        id: 'h2-1',
        text: 'Section 1.1',
        level: 2,
        line: 5,
      },
    ])
  })

  it('passes correct props to el-tree', () => {
    const wrapper = mount(TocPanel, {
      props: { headings: sampleHeadings },
      global: {
        plugins: [pinia],
        stubs: {
          'el-tree': MockElTree,
        },
      },
    })

    const elTree = wrapper.findComponent(MockElTree)
    expect(elTree.exists()).toBe(true)

    const props = elTree.props()
    expect(props.nodeKey).toBe('id')
    expect(props.highlightCurrent).toBe(true)
    expect(props.expandOnClickNode).toBe(false)
    expect(props.defaultExpandAll).toBe(true)
    expect(props.data).toEqual((wrapper.vm as unknown as TocPanelInstance).treeData)
  })

  it('updates current node key when activeHeading changes', async () => {
    const wrapper = mount(TocPanel, {
      props: { headings: sampleHeadings },
      global: {
        plugins: [pinia],
        stubs: {
          'el-tree': MockElTree,
        },
      },
    })

    // Set active heading
    mockEditorStore.activeHeading = { id: 'h2-1', text: 'Section 1.1', level: 2, line: 5 }

    // Trigger reactivity
    await nextTick()
    await wrapper.vm.$nextTick()

    expect(setCurrentKey).toHaveBeenCalledWith('h2-1')

    // Test changing to a different heading
    mockEditorStore.activeHeading = { id: 'h1-1', text: 'Chapter 1', level: 1, line: 1 }

    // Trigger reactivity again
    await nextTick()
    await wrapper.vm.$nextTick()
    expect(setCurrentKey).toHaveBeenCalledWith('h1-1')

  })

  it('handles null activeHeading correctly', async () => {
    const wrapper = mount(TocPanel, {
      props: { headings: sampleHeadings },
      global: {
        plugins: [pinia],
        stubs: {
          'el-tree': MockElTree,
        },
      },
    })

    // Ensure activeHeading is null
    mockEditorStore.activeHeading = null

    await nextTick()
    await wrapper.vm.$nextTick()

    const elTree = wrapper.findComponent(MockElTree)
    expect(elTree.props('currentNodeKey')).toBeUndefined()
  })

  it('renders node labels with correct classes and titles', () => {
    const wrapper = mount(TocPanel, {
      props: { headings: sampleHeadings },
      global: {
        plugins: [pinia],
        stubs: {
          'el-tree': {
            name: 'ElTree',
            template: `
              <div class="mock-el-tree">
                <div v-for="item in data" :key="item.id">
                  <slot :data="item" />
                </div>
              </div>
            `,
            props: [
              'data',
              'props',
              'nodeKey',
              'highlightCurrent',
              'currentNodeKey',
              'expandOnClickNode',
              'defaultExpandAll',
            ],
          },
        },
      },
    })

    const nodeLabels = wrapper.findAll('.toc-node-label')
    expect(nodeLabels.length).toBeGreaterThan(0)

    // Check that the first node has correct classes and title
    const firstLabel = nodeLabels[0]
    expect(firstLabel.classes()).toContain('toc-node-label')
    expect(firstLabel.classes()).toContain('toc-level-1')
    expect(firstLabel.attributes('title')).toBe('Chapter 1')
    expect(firstLabel.text()).toBe('Chapter 1')
  })
})
