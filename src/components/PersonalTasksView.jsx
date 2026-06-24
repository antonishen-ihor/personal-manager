import { useState } from 'react'
import { Plus, Check, Xmark } from 'iconoir-react'
import { daysUntil, deadlineLabel } from '../lib/dates.js'

export default function PersonalTasksView({ todos, onAdd, onUpdate, onDelete }) {
  const [title, setTitle] = useState('')

  const open = todos.filter((t) => !t.done).length
  const done = todos.length - open

  const sorted = [...todos].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    return (a.deadline || '9999').localeCompare(b.deadline || '9999')
  })

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim())
    setTitle('')
  }

  return (
    <div className="view">
      <header className="view-head">
        <div>
          <h1 className="view-title">Таски</h1>
          <p className="view-sub">{open} активних · {done} виконано</p>
        </div>
      </header>

      <form className="todo-add" onSubmit={submit}>
        <input
          className="input"
          placeholder="Нова таска…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="btn primary" type="submit"><Plus width={16} height={16} /> Додати</button>
      </form>

      {todos.length === 0 ? (
        <div className="empty">
          <div className="empty-emoji"><Check width={44} height={44} /></div>
          <h3>Список порожній</h3>
          <p>Додайте першу таску у поле вище.</p>
        </div>
      ) : (
        <div className="todo-list">
          {sorted.map((t) => {
            const dl = daysUntil(t.deadline)
            const overdue = !t.done && dl !== null && dl < 0
            return (
              <div className={`todo ${t.done ? 'done' : ''}`} key={t.id}>
                <button
                  className={`checkbox ${t.done ? 'checked' : ''}`}
                  onClick={() => onUpdate(t.id, { done: !t.done })}
                  aria-label="Готово"
                >
                  {t.done && <Check width={14} height={14} />}
                </button>

                <input
                  className="cell-input todo-title"
                  value={t.title}
                  placeholder="Назва таски"
                  onChange={(e) => onUpdate(t.id, { title: e.target.value })}
                />

                {t.deadline && !t.done && (
                  <span className={`todo-when ${overdue ? 'overdue' : ''}`}>{deadlineLabel(t.deadline)}</span>
                )}

                <input
                  type="date"
                  className="cell-input date-input todo-date"
                  value={t.deadline || ''}
                  onChange={(e) => onUpdate(t.id, { deadline: e.target.value })}
                />

                <button className="icon-btn danger small" onClick={() => onDelete(t.id)} title="Видалити">
                  <Xmark width={15} height={15} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
