/**
 * Date formatting utility functions
 */

/**
 * Format date to localized string
 * @param date Date string
 * @param locale Locale setting
 * @returns Formatted date string
 */
export function formatDate(date: string, locale: string): string {
  return Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

/**
 * Get relative time (e.g., 3 days ago, just now, etc.)
 * @param date Date string
 * @param locale Locale setting
 * @returns Relative time string
 */
export function getRelativeTime(date: string, locale: string): string {
  const now = new Date();
  const targetDate = new Date(date);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const diffInSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (Math.abs(diffInDays) > 30) {
    return formatDate(date, locale);
  } else if (diffInDays !== 0) {
    return rtf.format(diffInDays, 'day');
  } else if (diffInHours !== 0) {
    return rtf.format(diffInHours, 'hour');
  } else if (diffInMinutes !== 0) {
    return rtf.format(diffInMinutes, 'minute');
  } else {
    return rtf.format(diffInSeconds, 'second');
  }
}
