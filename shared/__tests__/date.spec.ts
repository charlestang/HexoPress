import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatDate, getRelativeTime } from '../utils/date'

describe('shared/utils/date', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats date according to locale', () => {
    const target = new Date('2024-01-01T08:00:00Z')
    const expected = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(target)
    expect(formatDate(target, 'en-US')).toBe(expected)
  })

  it('returns relative time for recent dates', () => {
    const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })
    expect(getRelativeTime(new Date('2024-01-01T11:59:00Z'), 'en-US')).toBe(rtf.format(-1, 'minute'))
    expect(getRelativeTime(new Date('2024-01-01T12:00:30Z'), 'en-US')).toBe(rtf.format(30, 'second'))
  })

  it('falls back to formatted date when difference is large', () => {
    const target = new Date('2023-11-01T00:00:00Z')
    const expected = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(target)
    expect(getRelativeTime(target, 'en-US')).toBe(expected)
  })
})
