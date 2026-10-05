export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function daysBetween(dateISO: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateISO + 'T00:00:00')
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDate(dateISO: string) {
  return new Date(dateISO + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatShortDate(dateISO: string) {
  return new Date(dateISO + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function relativeDay(dateISO: string) {
  const diff = daysBetween(dateISO)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 1) return `In ${diff} days`
  return `${Math.abs(diff)} days ago`
}
