import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the editorStore
const mockEditorStore = {
  activeHeadingId: null as string | null,
  // We don't need implementations for actions in this mock for TocPanel,
  // as TocPanel only reads activeHeadingId.
  // If it were dispatching actions, we'd mock them here.
};

vi.mock('@/stores/editorStore', () => ({
  useEditorStore: () => mockEditorStore,
}));

import TocPanel from '../TocPanel.vue'; // Must be imported after the mock

describe('TocPanel.vue', () => {
  let pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    // Reset the mock store state before each test
    mockEditorStore.activeHeadingId = null; 
  });

  const sampleHeadings = [
    { id: 'h1-1', text: 'Chapter 1', level: 1 },
    { id: 'h2-1', text: 'Section 1.1', level: 2 },
    { id: 'h3-1', text: 'Subsection 1.1.1', level: 3 },
    { id: 'h2-2', text: 'Section 1.2', level: 2 },
    { id: 'h1-2', text: 'Chapter 2', level: 1 },
  ];

  const nestedHeadings = [
    { id: 'parent1', text: 'Parent 1 (H1)', level: 1 },
    { id: 'child1-1', text: 'Child 1.1 (H2)', level: 2 },
    { id: 'grandchild1-1-1', text: 'Grandchild 1.1.1 (H3)', level: 3 },
    { id: 'child1-2', text: 'Child 1.2 (H2)', level: 2 },
    { id: 'parent2', text: 'Parent 2 (H1)', level: 1 },
    { id: 'child2-1', text: 'Child 2.1 (H2)', level: 2 },
  ];

  it('renders correctly with no headings', () => {
    const wrapper = mount(TocPanel, {
      props: { headings: [] },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('ul.toc-panel').exists()).toBe(true);
    expect(wrapper.findAll('li.toc-item').length).toBe(0);
  });

  it('renders a flat list of headings with correct text and levels', () => {
    const wrapper = mount(TocPanel, {
      props: { headings: sampleHeadings },
      global: { plugins: [pinia] },
    });
    const items = wrapper.findAll('li.toc-item');
    expect(items.length).toBe(2); // Only H1s are direct children of the root ul

    // Check top-level H1s (processedHeadings structure)
    const h1Items = wrapper.vm.processedHeadings;
    expect(h1Items.length).toBe(2);
    expect(h1Items[0].text).toBe('Chapter 1');
    expect(h1Items[0].level).toBe(1);
    expect(wrapper.html()).toContain('Chapter 1');
    expect(wrapper.html()).toContain('Section 1.1');
    expect(wrapper.html()).toContain('Subsection 1.1.1');

    // Check classes for levels (more complex due to nesting in DOM vs. processedHeadings)
    // We'll look for specific text content within elements having the correct classes
    const allListItems = wrapper.findAll('li'); // Get all li elements for deeper inspection
    
    const item1 = allListItems.find(li => li.text().includes('Chapter 1'));
    expect(item1?.classes()).toContain('toc-level-1');
    
    const item2 = allListItems.find(li => li.text().includes('Section 1.1'));
    expect(item2?.classes()).toContain('toc-level-2');

    const item3 = allListItems.find(li => li.text().includes('Subsection 1.1.1'));
    expect(item3?.classes()).toContain('toc-level-3');
  });

  it('renders nested headings correctly', () => {
    const wrapper = mount(TocPanel, {
      props: { headings: nestedHeadings },
      global: { plugins: [pinia] },
    });

    const processed = wrapper.vm.processedHeadings;
    expect(processed.length).toBe(2); // Two H1s at the top level
    expect(processed[0].children.length).toBe(2); // First H1 has two H2 children
    expect(processed[0].children[0].children.length).toBe(1); // First H2 child has one H3 grandchild

    // Check DOM structure (simplified check)
    const parent1Li = wrapper.findAll('li.toc-level-1').at(0);
    expect(parent1Li?.text()).toContain('Parent 1 (H1)');
    const child1_1Li = parent1Li?.find('li.toc-level-2'); // Find within the H1
    expect(child1_1Li?.text()).toContain('Child 1.1 (H2)');
    const grandchild1_1_1Li = child1_1Li?.find('li.toc-level-3');
    expect(grandchild1_1_1Li?.text()).toContain('Grandchild 1.1.1 (H3)');
  });

  it('emits scrollToHeading event with correct id on click', async () => {
    const wrapper = mount(TocPanel, {
      props: { headings: sampleHeadings },
      global: { plugins: [pinia] },
    });
    // Find a specific list item to click, e.g., the one containing "Section 1.1"
    const allListItems = wrapper.findAllComponents({ name: 'HTMLLIElement' }); // Find all <li>
    const targetItem = allListItems.find(li => li.text().includes('Section 1.1'));
    
    expect(targetItem).toBeDefined();
    if (!targetItem) return;

    await targetItem.trigger('click');
    
    expect(wrapper.emitted().scrollToHeading).toBeTruthy();
    expect(wrapper.emitted().scrollToHeading[0]).toEqual(['h2-1']);
  });
  
  it('emits scrollToHeading for top-level items', async () => {
    const wrapper = mount(TocPanel, {
      props: { headings: sampleHeadings },
      global: { plugins: [pinia] },
    });
    const firstH1 = wrapper.findAll('li.toc-item.toc-level-1').at(0);
    expect(firstH1).toBeDefined();
    if(!firstH1) return;

    await firstH1.trigger('click');
    expect(wrapper.emitted().scrollToHeading).toBeTruthy();
    expect(wrapper.emitted().scrollToHeading[0]).toEqual(['h1-1']);
  });


  it('applies active-heading class when activeHeadingId matches', async () => {
    const wrapper = mount(TocPanel, {
      props: { headings: sampleHeadings },
      global: { plugins: [pinia] },
    });

    mockEditorStore.activeHeadingId = 'h2-1';
    await wrapper.vm.$nextTick(); // Wait for Vue to react to store change

    const allListItems = wrapper.findAll('li');
    const activeItem = allListItems.find(li => li.text().includes('Section 1.1'));
    expect(activeItem?.classes()).toContain('active-heading');

    const inactiveItem = allListItems.find(li => li.text().includes('Chapter 1'));
    expect(inactiveItem?.classes()).not.toContain('active-heading');
  });

  it('moves active-heading class when activeHeadingId changes', async () => {
    const wrapper = mount(TocPanel, {
      props: { headings: sampleHeadings },
      global: { plugins: [pinia] },
    });

    mockEditorStore.activeHeadingId = 'h2-1';
    await wrapper.vm.$nextTick();
    
    let allListItems = wrapper.findAll('li');
    let activeItem = allListItems.find(li => li.text().includes('Section 1.1'));
    expect(activeItem?.classes()).toContain('active-heading');

    mockEditorStore.activeHeadingId = 'h1-2';
    await wrapper.vm.$nextTick();

    allListItems = wrapper.findAll('li'); // Re-query after update
    activeItem = allListItems.find(li => li.text().includes('Chapter 2'));
    expect(activeItem?.classes()).toContain('active-heading');
    
    const previouslyActiveItem = allListItems.find(li => li.text().includes('Section 1.1'));
    expect(previouslyActiveItem?.classes()).not.toContain('active-heading');
  });

  it('removes active-heading class when activeHeadingId is null', async () => {
    const wrapper = mount(TocPanel, {
      props: { headings: sampleHeadings },
      global: { plugins: [pinia] },
    });

    mockEditorStore.activeHeadingId = 'h1-1';
    await wrapper.vm.$nextTick();
    
    let allListItems = wrapper.findAll('li');
    let activeItem = allListItems.find(li => li.text().includes('Chapter 1'));
    expect(activeItem?.classes()).toContain('active-heading');

    mockEditorStore.activeHeadingId = null;
    await wrapper.vm.$nextTick();
    
    allListItems = wrapper.findAll('li'); // Re-query
    activeItem = allListItems.find(li => li.text().includes('Chapter 1'));
    expect(activeItem?.classes()).not.toContain('active-heading');
  });
});
