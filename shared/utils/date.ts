export function formatDate(date: string | number | Date, locale: string): string {
  const value = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  return Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

export function getRelativeTime(date: string | number | Date, locale: string): string {
  const now = new Date()
  const targetDate = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  const diffInSeconds = Math.round((targetDate.getTime() - now.getTime()) / 1000)
  const diffInMinutes = Math.trunc(diffInSeconds / 60)
  const diffInHours = Math.trunc(diffInMinutes / 60)
  const diffInDays = Math.trunc(diffInHours / 24)

  if (Math.abs(diffInDays) > 30) {
    return formatDate(targetDate, locale)
  }
  if (diffInDays !== 0) {
    return rtf.format(diffInDays, 'day')
  }
  if (diffInHours !== 0) {
    return rtf.format(diffInHours, 'hour')
  }
  if (diffInMinutes !== 0) {
    return rtf.format(diffInMinutes, 'minute')
  }
  return rtf.format(diffInSeconds, 'second')
}
