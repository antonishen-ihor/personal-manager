// Статуси завдань (як у Notion: Not started / In progress / Done).
export const STATUS = {
  not_started: { label: 'Не почато', cls: 'ns' },
  in_progress: { label: 'В роботі', cls: 'ip' },
  done: { label: 'Готово', cls: 'done' },
}

export const STATUS_ORDER = ['not_started', 'in_progress', 'done']

// Статуси оплати.
export const PAYMENT = {
  unpaid: { label: 'Не оплачено', cls: 'unpaid' },
  advance: { label: 'Аванс', cls: 'advance' },
  paid: { label: 'Оплачено', cls: 'paid' },
}

export const PAYMENT_ORDER = ['unpaid', 'advance', 'paid']

export function isDone(task) {
  return task.status === 'done'
}

// Форматування грошей: 1200 → "1 200"
export function money(n) {
  const v = Number(n) || 0
  return v.toLocaleString('uk-UA')
}
