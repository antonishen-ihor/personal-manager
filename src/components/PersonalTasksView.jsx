import { useState } from 'react'
import { Plus, Check, Xmark } from 'iconoir-react'
import { daysUntil, deadlineLabel } from '../lib/dates.js'

function ProjectPicker({ projects, value, onChange }) {
  const proj = projects.find((p) => p.id === value)
  return (
    <label className="todo-project">
      <span
        className="todo-project-dot"
        style={proj ? { background: proj.color } : { background: 'transparent', boxShadow: 'inset 0 0 0 1px var(--hairline)' }}
      />
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Без проєкту</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </label>
  )
}

function sortItems(items) {
  return [...items].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    return (a.deadline || '9999').localeCompare(b.deadline || '9999')
  })
}

function TodoRow({ t, projects, onUpdate, onDelete }) {
  const dl = daysUntil(t.deadline)
  const overdue = !t.done && dl !== null && dl < 0
  return (
    <div className={`todo ${t.done ? 'done' : ''}`}>
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

      <ProjectPicker projects={projects} value={t.projectId || ''} onChange={(v) => onUpdate(t.id, { projectId: v })} />

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
}

export default function PersonalTasksView({ todos, projects, onAdd, onUpdate, onDelete }) {
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState('')

  const open = todos.filter((t) => !t.done).length
  const done = todos.length - open

  // Групи по проєктах (у порядку проєктів), наприкінці — «Без проєкту».
  const groups = []
  projects.forEach((p) => {
    const items = todos.filter((t) => t.projectId === p.id)
    if (items.length) groups.push({ key: p.id, project: p, items: sortItems(items) })
  })
  const noProj = todos.filter((t) => !t.projectId || !projects.some((p) => p.id === t.projectId))
  if (noProj.length) groups.push({ key: 'none', project: null, items: sortItems(noProj) })

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim(), projectId)
    setTitle('')
    setProjectId('')
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
        <ProjectPicker projects={projects} value={projectId} onChange={setProjectId} />
        <button className="btn primary" type="submit"><Plus width={16} height={16} /> Додати</button>
      </form>

      {todos.length === 0 ? (
        <div className="empty">
          <div className="empty-emoji"><Check width={44} height={44} /></div>
          <h3>Список порожній</h3>
          <p>Додайте першу таску у поле вище.</p>
        </div>
      ) : (
        <div className="todo-groups">
          {groups.map((g) => {
            const gDone = g.items.filter((t) => t.done).length
            return (
              <div className="todo-group" key={g.key}>
                <div className="todo-group-head">
                  <span
                    className="todo-group-dot"
                    style={g.project ? { background: g.project.color } : { background: 'transparent', boxShadow: 'inset 0 0 0 1.5px var(--hairline)' }}
                  />
                  <span className="todo-group-name">{g.project ? g.project.name : 'Без проєкту'}</span>
                  <span className="todo-group-count">{gDone}/{g.items.length}</span>
                </div>
                <div className="todo-group-items">
                  {g.items.map((t) => (
                    <TodoRow key={t.id} t={t} projects={projects} onUpdate={onUpdate} onDelete={onDelete} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
