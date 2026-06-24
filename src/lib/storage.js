// Зберігання та читання стану застосунку в localStorage.

const STORAGE_KEY = 'pm.state.v1'

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (err) {
    console.warn('Не вдалося прочитати збережений стан:', err)
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.warn('Не вдалося зберегти стан:', err)
  }
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// Приводить завантажений стан до актуальної моделі (міграція старих завдань).
export function normalizeState(state) {
  if (!state) return null
  return {
    projects: (state.projects || []).map((p) => ({
      id: p.id,
      name: p.name || 'Без назви',
      color: p.color || '#6366f1',
      photo: p.photo || '',
      createdAt: p.createdAt || Date.now(),
    })),
    todos: (state.todos || []).map((t) => ({
      id: t.id || uid(),
      title: t.title || '',
      done: !!t.done,
      deadline: t.deadline || '',
      createdAt: t.createdAt || Date.now(),
    })),
    tasks: (state.tasks || []).map((t) => ({
      id: t.id,
      projectId: t.projectId,
      title: t.title || '',
      // Старе поле done → новий статус.
      status: t.status || (t.done ? 'done' : 'not_started'),
      price: Number(t.price) || 0,
      advance: Number(t.advance) || 0,
      payment: t.payment || 'unpaid',
      details: t.details || '',
      photo: t.photo || '',
      deadline: t.deadline || '',
      createdAt: t.createdAt || Date.now(),
    })),
  }
}

// Демонстраційні дані для першого запуску.
export function seedState() {
  const today = new Date()
  const inDays = (n) => {
    const d = new Date(today)
    d.setDate(d.getDate() + n)
    return d.toISOString().slice(0, 10)
  }
  const p1 = uid()
  const p2 = uid()
  const task = (projectId, title, status, price, advance, details, deadline) => ({
    id: uid(), projectId, title, status, price, advance, details, deadline, createdAt: Date.now(),
    payment: advance <= 0 ? 'unpaid' : advance >= price ? 'paid' : 'advance',
  })
  const todo = (title, done, deadline) => ({ id: uid(), title, done, deadline, createdAt: Date.now() })
  return {
    todos: [
      todo('Передзвонити клієнту', false, inDays(0)),
      todo('Оплатити хостинг', false, inDays(3)),
      todo('Записатись до стоматолога', true, ''),
    ],
    projects: [
      {
        id: p1,
        name: 'UTMOST',
        description: 'Брендинг та промо-матеріали.',
        color: '#00262b',
        deadline: inDays(20),
        createdAt: Date.now(),
      },
      {
        id: p2,
        name: 'Мобільний застосунок',
        description: 'MVP застосунку для iOS та Android.',
        color: '#437278',
        deadline: inDays(45),
        createdAt: Date.now(),
      },
    ],
    tasks: [
      task(p1, 'Бутилка, папка, сумка', 'done', 800, 800, 'Замовлено в друкарні', inDays(-3)),
      task(p1, 'Стиль Болгарія', 'done', 2000, 1000, 'Гайдлайн + лого', inDays(2)),
      task(p1, 'Пост співпраця Вінниця Інфо', 'done', 500, 500, '', inDays(-1)),
      task(p1, 'Баннер Болгарія', 'done', 1000, 500, 'Формат 3×2 м', inDays(5)),
      task(p1, 'Прапор', 'done', 1200, 0, '', inDays(7)),
      task(p1, 'Бейджі, таблички', 'not_started', 700, 0, 'Уточнити кількість', inDays(12)),
      task(p2, 'Прототип у Figma', 'done', 3000, 1500, '', inDays(3)),
      task(p2, 'Налаштувати API', 'in_progress', 5000, 2000, 'Auth + бек', inDays(15)),
      task(p2, 'Екран авторизації', 'not_started', 2500, 0, '', inDays(25)),
    ],
  }
}
