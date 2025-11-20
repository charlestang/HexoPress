import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '../SearchBar.vue'

describe('SearchBar.vue', () => {
  it('emits update on input', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        total: 0,
        currentIndex: 0,
      },
    })

    const input = wrapper.find('input')
    await input.setValue('foo')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['foo'])
  })

  it('emits navigate events', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        total: 3,
        currentIndex: 1,
      },
    })

    const buttons = wrapper.findAll('.search-bar__nav')
    expect(buttons).toHaveLength(2)
    await buttons[0]!.trigger('click')
    await buttons[1]!.trigger('click')

    expect(wrapper.emitted('navigate')).toHaveLength(2)
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['prev'])
    expect(wrapper.emitted('navigate')?.[1]).toEqual(['next'])
  })

  it('disables navigation when total is zero', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        total: 0,
        currentIndex: 0,
      },
    })

    const buttons = wrapper.findAll('.search-bar__nav')
    expect(buttons).toHaveLength(2)
    await buttons[0]!.trigger('click')
    expect(wrapper.emitted('navigate')).toBeUndefined()
  })
})
