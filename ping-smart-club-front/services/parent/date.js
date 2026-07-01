export const pad = value => String(value).padStart(2, '0')

export const clone = value => JSON.parse(JSON.stringify(value))

export const addDays = (date, offset) => {
  const next = new Date(date)
  next.setDate(next.getDate() + offset)
  return next
}

export const formatDateKey = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const at = (dayOffset, clock) => {
  const [hours, minutes] = clock.split(':').map(Number)
  const date = addDays(new Date(), dayOffset)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

export const nowIso = () => new Date().toISOString()

export const isSameDate = (dateTime, dateKey) => formatDateKey(new Date(dateTime)) === dateKey

export const getDateOptions = days => {
  const today = new Date()
  return Array.from({ length: days || 7 }, (_, index) => {
    const date = addDays(today, index)
    return {
      label: index === 0 ? '今天' : index === 1 ? '明天' : `${pad(date.getMonth() + 1)}/${pad(date.getDate())}`,
      value: formatDateKey(date)
    }
  })
}

export const formatClock = dateTime => {
  const date = new Date(dateTime)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const formatDateLabel = dateTime => {
  const date = new Date(dateTime)
  const today = formatDateKey(new Date())
  const tomorrow = formatDateKey(addDays(new Date(), 1))
  const key = formatDateKey(date)
  if (key === today) return '今天'
  if (key === tomorrow) return '明天'
  return `${pad(date.getMonth() + 1)}月${pad(date.getDate())}日`
}

export const formatTimeRange = (startTime, endTime) => `${formatDateLabel(startTime)} ${formatClock(startTime)}-${formatClock(endTime)}`

export const minutesBetween = (from, to) => Math.round((to.getTime() - from.getTime()) / 60000)
