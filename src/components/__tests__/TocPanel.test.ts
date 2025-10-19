import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, reactive } from 'vue'
import TocPanel from '../TocPanel.vue'

const mockEditorStore = reactive({
  activeHeading: null as Heading | null,
  setActiveHeading: vi.fn(),
})

vi.mock('@/stores/editorStore', () => ({
  useEditorStore: () => mockEditorStore,
}))

type SetCurrentKeySpy = ReturnType<typeof vi.fn>

const createElTreeStub = (setCurrentKeySpy: SetCurrentKeySpy) =>
  defineComponent({
    name: 'ElTree',
    props: {
      data: { type: Array, required: true },
      props: { type: Object, required: true },
      nodeKey: { type: String, required: true },
      highlightCurrent: { type: Boolean, required: true },
      currentNodeKey: { type: String, default: undefined },
      expandOnClickNode: { type: Boolean, required: true },
      defaultExpandAll: { type: Boolean, required: true },
    },
    emits: ['node-click'],
    setup(componentProps, { slots, expose }) {
      expose({ setCurrentKey: setCurrentKeySpy })
      return () =>
        h(
          'div',
          { class: 'mock-el-tree' },
          (componentProps.data as TreeNode[]).map((item: TreeNode) =>
            h(
              'div',
              { key: item.id, class: 'mock-el-tree-node' },
              slots.default ? slots.default({ data: item }) : undefined,
            ),
          ),
        )
    },
  })

type TreeNode = Heading & { children: TreeNode[] }

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

type MountReturn = {
  wrapper: VueWrapper
  elTreeStub: ReturnType<typeof createElTreeStub>
  setCurrentKeySpy: SetCurrentKeySpy
}

const mountTocPanel = (
  headings: Heading[] = sampleHeadings,
  setCurrentKeySpy?: SetCurrentKeySpy,
): MountReturn => {
  const spy = setCurrentKeySpy ?? vi.fn()
  const elTreeStub = createElTreeStub(spy)

  const wrapper = mount(TocPanel, {
    props: { headings },
    global: {
      plugins: [createPinia()],
      stubs: {
        'el-tree': elTreeStub,
      },
    },
  })

  return {
    wrapper,
    elTreeStub,
    setCurrentKeySpy: spy,
  }
}

const getTreeDataProp = (wrapper: VueWrapper, elTreeStub: ReturnType<typeof createElTreeStub>) =>
  wrapper.findComponent(elTreeStub).props('data') as TreeNode[]

const flushTreeUpdate = async () => {
  await nextTick()
  await nextTick()
}

const getLastCallArg = (spy: SetCurrentKeySpy) => {
  const calls = spy.mock.calls
  return calls.length > 0 ? calls[calls.length - 1]?.[0] : undefined
}

describe('TocPanel.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockEditorStore.activeHeading = null
    mockEditorStore.setActiveHeading.mockReset()
  })

  it('空目录时仍渲染容器', () => {
    const { wrapper } = mountTocPanel([])
    expect(wrapper.find('.toc-wrapper').exists()).toBe(true)
    expect(wrapper.find('.mock-el-tree').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ElTree' }).exists()).toBe(true)
  })

  it('将线性标题转换为树结构', () => {
    const { wrapper, elTreeStub } = mountTocPanel()
    const treeData = getTreeDataProp(wrapper, elTreeStub)

    expect(treeData).toHaveLength(2)
    const firstRoot = treeData[0]!
    expect(firstRoot).toMatchObject({
      id: 'h1-1',
      text: 'Chapter 1',
      level: 1,
    })
    expect(firstRoot.children).toHaveLength(2)
    const firstChild = firstRoot.children[0]!
    expect(firstChild).toMatchObject({
      id: 'h2-1',
      text: 'Section 1.1',
      level: 2,
    })
    expect(firstChild.children).toHaveLength(1)
    const firstGrandChild = firstChild.children[0]!
    expect(firstGrandChild).toMatchObject({
      id: 'h3-1',
      text: 'Subsection 1.1.1',
      level: 3,
    })
  })

  it('保持深层嵌套结构', () => {
    const { wrapper, elTreeStub } = mountTocPanel(nestedHeadings)
    const treeData = getTreeDataProp(wrapper, elTreeStub)

    expect(treeData).toHaveLength(2)
    const firstRoot = treeData[0]!
    expect(firstRoot.children).toHaveLength(2)
    const firstChild = firstRoot.children[0]!
    expect(firstChild.children).toHaveLength(1)
    expect(firstChild.children[0]!.text).toBe('Grandchild 1.1.1 (H3)')
  })

  it('点击节点会设置当前标题并向外发出事件', async () => {
    const { wrapper, elTreeStub } = mountTocPanel()
    const elTree = wrapper.findComponent(elTreeStub)
    const nodeData: Heading = { id: 'h2-1', text: 'Section 1.1', level: 2, line: 5 }

    elTree.vm.$emit('node-click', nodeData)
    await nextTick()

    expect(mockEditorStore.setActiveHeading).toHaveBeenCalledWith(nodeData)
    expect(wrapper.emitted('scrollToHeading')?.[0]).toEqual([nodeData])
  })

  it('向 el-tree 传递正确的属性', () => {
    const { wrapper, elTreeStub } = mountTocPanel()
    const elTree = wrapper.findComponent(elTreeStub)

    expect(elTree.props('nodeKey')).toBe('id')
    expect(elTree.props('highlightCurrent')).toBe(true)
    expect(elTree.props('expandOnClickNode')).toBe(false)
    expect(elTree.props('defaultExpandAll')).toBe(true)
    expect(elTree.props('props')).toEqual({ children: 'children', label: 'text' })
  })

  it('activeHeading 变化时调用 setCurrentKey', async () => {
    const setCurrentKeySpy = vi.fn()
    const { wrapper } = mountTocPanel(sampleHeadings, setCurrentKeySpy)

    mockEditorStore.activeHeading = { id: 'h2-1', text: 'Section 1.1', level: 2, line: 5 }
    await flushTreeUpdate()

    expect(setCurrentKeySpy).toHaveBeenCalled()
    expect(getLastCallArg(setCurrentKeySpy)).toBe('h2-1')

    mockEditorStore.activeHeading = { id: 'h1-1', text: 'Chapter 1', level: 1, line: 1 }
    await flushTreeUpdate()

    expect(getLastCallArg(setCurrentKeySpy)).toBe('h1-1')

    await wrapper.unmount()
  })

  it('挂载前存在 activeHeading 时立即同步', async () => {
    mockEditorStore.activeHeading = {
      id: 'grandchild1-1-1',
      text: 'Grandchild 1.1.1 (H3)',
      level: 3,
      line: 10,
    }
    const setCurrentKeySpy = vi.fn()
    mountTocPanel(nestedHeadings, setCurrentKeySpy)
    await flushTreeUpdate()

    expect(getLastCallArg(setCurrentKeySpy)).toBe('grandchild1-1-1')
  })

  it('activeHeading 为空时不会设置 currentNodeKey', async () => {
    const { wrapper, elTreeStub } = mountTocPanel()
    mockEditorStore.activeHeading = null
    await flushTreeUpdate()

    expect(wrapper.findComponent(elTreeStub).props('currentNodeKey')).toBeUndefined()
  })

  it('渲染默认插槽中的节点标签', () => {
    const wrapper = mount(TocPanel, {
      props: { headings: sampleHeadings },
      global: {
        plugins: [createPinia()],
        stubs: {
          'el-tree': defineComponent({
            name: 'ElTree',
            props: {
              data: { type: Array, required: true },
              props: { type: Object, required: true },
              nodeKey: { type: String, required: true },
              highlightCurrent: { type: Boolean, required: true },
              currentNodeKey: { type: String, default: undefined },
              expandOnClickNode: { type: Boolean, required: true },
              defaultExpandAll: { type: Boolean, required: true },
            },
            setup(componentProps, { slots }) {
              return () =>
                h(
                  'div',
                  { class: 'mock-el-tree' },
                  (componentProps.data as TreeNode[]).map((item: TreeNode) =>
                    h(
                      'div',
                      { key: item.id },
                      slots.default ? slots.default({ data: item }) : undefined,
                    ),
                  ),
                )
            },
          }),
        },
      },
    })

    const labels = wrapper.findAll('.toc-node-label')
    expect(labels).not.toHaveLength(0)
    const firstLabel = labels[0]!
    expect(firstLabel.classes()).toEqual(expect.arrayContaining(['toc-node-label', 'toc-level-1']))
    expect(firstLabel.attributes('title')).toBe('Chapter 1')
    expect(firstLabel.text()).toBe('Chapter 1')
  })
})
