// Допоміжні функції для роботи з датами (українська локаль).

export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
export const MONTHS = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
]

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

// Кількість днів до дедлайну: 0 = сьогодні, від'ємне = прострочено.
export function daysUntil(iso) {
  if (!iso) return null
  const diff = startOfDay(iso) - startOfDay(new Date())
  return Math.round(diff / 86400000)
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()].toLowerCase()}`
}

export function deadlineLabel(iso) {
  const n = daysUntil(iso)
  if (n === null) return ''
  if (n < 0) return `прострочено на ${Math.abs(n)} дн.`
  if (n === 0) return 'сьогодні'
  if (n === 1) return 'завтра'
  return `через ${n} дн.`
}

// Будує сітку місяця: масив тижнів, кожен — 7 дат (Date) починаючи з понеділка.
export function monthGrid(year, month) {
  const first = new Date(year, month, 1)
  // getDay(): 0=Нд..6=Сб → зсуваємо так, щоб тиждень починався з Пн.
  const offset = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - offset)
  const weeks = []
  for (let w = 0; w < 6; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const cur = new Date(start)
      cur.setDate(start.getDate() + w * 7 + d)
      week.push(cur)
    }
    weeks.push(week)
  }
  return weeks
}

export function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
