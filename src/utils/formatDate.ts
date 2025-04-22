/**
 * Formats a date into a human-readable string
 * @param date - Date to format (string, number, or Date)
 * @returns Formatted date string (e.g. "April 19, 2025")
 */
export function formatDate(date: string | number | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
} 