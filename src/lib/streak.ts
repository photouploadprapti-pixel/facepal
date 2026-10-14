/**
 * Counts consecutive local days that include at least one check-in.
 * Today with no photo still counts if yesterday continued the run.
 * @param isoDates Capture timestamps from saved check-ins.
 */
export const streakFromDates = (isoDates: string[]): number => {
  const days = new Set(
    isoDates.map((value) => {
      const date = new Date(value)
      const month = `${date.getMonth() + 1}`.padStart(2, '0')
      const day = `${date.getDate()}`.padStart(2, '0')
      return `${date.getFullYear()}-${month}-${day}`
    }),
  )
  const cursor = new Date()
  const keyFor = (date: Date): string => {
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
  }
  if (!days.has(keyFor(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(keyFor(cursor))) return 0
  }
  let count = 0
  while (days.has(keyFor(cursor))) {
    count += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return count
}
