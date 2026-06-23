import { useState } from 'react'

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
]

export default function ProjectModal({ project, onSave, onClose }) {
  const [name, setName] = useState(project.name || '')
  const [color, setColor] = useState(project.color || COLORS[0])
  const isEdit = Boolean(project.id)

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ id: project.id, name: name.trim(), color })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{isEdit ? 'Редагувати проєкт' : 'Новий проєкт'}</h2>
        <form onSubmit={submit} className="form">
          <label className="field">
            <span className="field-label">Назва</span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Напр. UTMOST"
              autoFocus
            />
          </label>

          <div className="field">
            <span className="field-label">Колір</span>
            <div className="color-row">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`color-dot ${color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={onClose}>
              Скасувати
            </button>
            <button type="submit" className="btn primary">
              {isEdit ? 'Зберегти' : 'Створити'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
