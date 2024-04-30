export function formatISO8601Date(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
