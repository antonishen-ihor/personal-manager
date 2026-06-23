import { useRef, useState } from 'react'
import { Wallet, EditPencil, Trash, Plus, Xmark, MediaImagePlus, MediaImage } from 'iconoir-react'
import SortHead from './SortHead.jsx'
import { StatusIcon, PaymentIcon } from './IconStatus.jsx'
import { daysUntil } from '../lib/dates.js'
import { STATUS, STATUS_ORDER, PAYMENT, PAYMENT_ORDER, isDone, money } from '../lib/status.js'
import { fileToDataURL } from '../lib/image.js'

export default function ProjectDetail({ project, tasks, onUpdateProject, onEdit, onDelete, onAddTask, onUpdateTask, onDeleteTask }) {
  const done = tasks.filter(isDone).length
  const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  const budget = tasks.reduce((s, t) => s + (t.price || 0), 0)
  const advance = tasks.reduce((s, t) => s + (t.advance || 0), 0)
  const remaining = budget - advance

  const [sort, setSort] = useState({ key: null, dir: 'asc' })
  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  const sorted = [...tasks]
  if (sort.key) {
    const val = (t) =>
      sort.key === 'status' ? STATUS_ORDER.indexOf(t.status)
      : sort.key === 'payment' ? PAYMENT_ORDER.indexOf(t.payment)
      : sort.key === 'price' ? (t.price || 0)
      : (t.price || 0) - (t.advance || 0)
    sorted.sort((a, b) => (val(a) - val(b)) * (sort.dir === 'asc' ? 1 : -1))
  } else {
    sorted.sort((a, b) => {
      const ad = isDone(a), bd = isDone(b)
      if (ad !== bd) return ad ? 1 : -1
      return (a.deadline || '9999').localeCompare(b.deadline || '9999')
    })
  }

  return (
    <div className="project-detail" style={{ '--accent': project.color }}>
      <header className="detail-head">
        <div className="detail-title-row">
          <ProjectAvatar project={project} onUpdate={onUpdateProject} />
          <h1 className="detail-title">{project.name}</h1>
          <div className="card-actions">
            <button className="btn ghost small" onClick={onEdit}><EditPencil width={15} height={15} /> Редагувати</button>
            <button className="icon-btn danger" title="Видалити проєкт" onClick={onDelete}><Trash width={17} height={17} /></button>
          </div>
        </div>

        <div className="project-meta">
          <span className="chip">{done}/{tasks.length} завдань · {percent}%</span>
          <span className="chip"><Wallet width={14} height={14} /> бюджет {money(budget)}</span>
          <span className="chip chip-green">аванс {money(advance)}</span>
          <span className={`chip ${remaining > 0 ? 'chip-amber' : ''}`}>залишок {money(remaining)}</span>
        </div>

      </header>

      <div className="task-table-wrap detail-table">
        <div className="task-table">
          <div className="tt-head">
            <span>Завдання</span>
            <SortHead label="Статус" sortKey="status" sort={sort} onSort={toggleSort} />
            <SortHead label="Ціна" sortKey="price" sort={sort} onSort={toggleSort} num />
            <span className="num">Аванс</span>
            <SortHead label="Залишок" sortKey="remaining" sort={sort} onSort={toggleSort} num />
            <SortHead label="Оплата" sortKey="payment" sort={sort} onSort={toggleSort} />
            <span>Дедлайн</span>
            <span>Деталі</span>
            <span />
          </div>

          {sorted.length === 0 && (
            <div className="tt-empty">Ще немає завдань. Додайте перше нижче ↓</div>
          )}

          {sorted.map((t) => (
            <TaskRow key={t.id} task={t} onUpdate={onUpdateTask} onDelete={onDeleteTask} />
          ))}

          {tasks.length > 0 && (
            <div className="tt-foot">
              <span className="tt-sum-label">Σ {tasks.length} завдань</span>
              <span />
              <span className="num">{money(budget)}</span>
              <span className="num">{money(advance)}</span>
              <span className="num">{money(remaining)}</span>
              <span />
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
      </div>

      <div className="task-table-wrap add-block-wrap">
        <div className="task-table">
          <div className="add-block-title">Нове завдання</div>
          <AddTaskForm onAdd={(data) => onAddTask(project.id, data)} />
        </div>
      </div>
    </div>
  )
}

function ProjectAvatar({ project, onUpdate }) {
  const fileRef = useRef(null)
  const [lightbox, setLightbox] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const dataUrl = await fileToDataURL(file)
      onUpdate({ photo: dataUrl })
    } catch {
      alert('Не вдалося завантажити зображення.')
    }
    setBusy(false)
  }

  return (
    <>
      {project.photo ? (
        <button
          type="button"
          className="project-avatar has-photo"
          style={{ '--accent': project.color }}
          onClick={() => setLightbox(true)}
          title="Фото проєкту"
        >
          <img src={project.photo} alt="" />
        </button>
      ) : (
        <button
          type="button"
          className="project-avatar"
          style={{ '--accent': project.color }}
          onClick={() => fileRef.current?.click()}
          title="Додати фото проєкту"
          disabled={busy}
        >
          <MediaImage width={20} height={20} />
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />

      {lightbox && (
        <div className="modal-overlay" onClick={() => setLightbox(false)}>
          <div className="photo-modal" onClick={(e) => e.stopPropagation()}>
            <img src={project.photo} alt={project.name} />
            <div className="photo-actions">
              <button className="btn ghost small" onClick={() => fileRef.current?.click()}>Замінити</button>
              <button
                className="btn ghost small btn-danger-text"
                onClick={() => { onUpdate({ photo: '' }); setLightbox(false) }}
              >
                <Trash width={15} height={15} /> Видалити
              </button>
              <button className="btn primary small" onClick={() => setLightbox(false)}>Закрити</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function TaskRow({ task, onUpdate, onDelete }) {
  const fileRef = useRef(null)
  const [lightbox, setLightbox] = useState(false)
  const [busy, setBusy] = useState(false)

  const dl = daysUntil(task.deadline)
  const overdue = !isDone(task) && dl !== null && dl < 0
  const remaining = (task.price || 0) - (task.advance || 0)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const dataUrl = await fileToDataURL(file)
      onUpdate(task.id, { photo: dataUrl })
    } catch {
      alert('Не вдалося завантажити зображення.')
    }
    setBusy(false)
  }

  return (
    <div className={`tt-row ${isDone(task) ? 'done' : ''}`}>
      <input
        className="cell-input title-input"
        value={task.title}
        placeholder="Назва завдання"
        onChange={(e) => onUpdate(task.id, { title: e.target.value })}
      />

      <StatusIcon value={task.status} onChange={(v) => onUpdate(task.id, { status: v })} />

      <input
        type="number"
        className="cell-input num"
        value={task.price || ''}
        placeholder="0"
        onChange={(e) => onUpdate(task.id, { price: Number(e.target.value) || 0 })}
      />

      <input
        type="number"
        className="cell-input num"
        value={task.advance || ''}
        placeholder="0"
        onChange={(e) => onUpdate(task.id, { advance: Number(e.target.value) || 0 })}
      />

      <span className={`num cell-remaining ${remaining > 0 ? 'pos' : 'zero'}`}>{money(remaining)}</span>

      <PaymentIcon value={task.payment || 'unpaid'} onChange={(v) => onUpdate(task.id, { payment: v })} />

      <input
        type="date"
        className={`cell-input date-input ${overdue ? 'overdue' : ''}`}
        value={task.deadline || ''}
        onChange={(e) => onUpdate(task.id, { deadline: e.target.value })}
      />

      <div className="details-cell">
        <input
          className="cell-input details-input"
          value={task.details}
          placeholder="—"
          onChange={(e) => onUpdate(task.id, { details: e.target.value })}
        />
        {task.photo ? (
          <button type="button" className="thumb" onClick={() => setLightbox(true)} title="Переглянути фото">
            <img src={task.photo} alt="" />
          </button>
        ) : (
          <button
            type="button"
            className="attach-btn"
            onClick={() => fileRef.current?.click()}
            title="Додати фото"
            disabled={busy}
          >
            <MediaImagePlus width={16} height={16} />
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      </div>

      <button className="icon-btn danger small" onClick={() => onDelete(task.id)} title="Видалити"><Xmark width={15} height={15} /></button>

      {lightbox && (
        <div className="modal-overlay" onClick={() => setLightbox(false)}>
          <div className="photo-modal" onClick={(e) => e.stopPropagation()}>
            <img src={task.photo} alt={task.title} />
            <div className="photo-actions">
              <button className="btn ghost small" onClick={() => fileRef.current?.click()}>Замінити</button>
              <button
                className="btn ghost small btn-danger-text"
                onClick={() => { onUpdate(task.id, { photo: '' }); setLightbox(false) }}
              >
                <Trash width={15} height={15} /> Видалити
              </button>
              <button className="btn primary small" onClick={() => setLightbox(false)}>Закрити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AddTaskForm({ onAdd }) {
  const empty = { title: '', status: 'not_started', price: '', advance: '', payment: 'unpaid', deadline: '', details: '' }
  const [form, setForm] = useState(empty)
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  function submit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    onAdd({ ...form, title: form.title.trim() })
    setForm(empty)
  }

  return (
    <form className="tt-row tt-add" onSubmit={submit}>
      <input className="cell-input title-input" placeholder="Нове завдання…" value={form.title} onChange={(e) => set({ title: e.target.value })} />
      <StatusIcon value={form.status} onChange={(v) => set({ status: v })} />
      <input type="number" className="cell-input num" placeholder="Ціна" value={form.price} onChange={(e) => set({ price: e.target.value })} />
      <input type="number" className="cell-input num" placeholder="Аванс" value={form.advance} onChange={(e) => set({ advance: e.target.value })} />
      <span className="num cell-remaining zero">—</span>
      <PaymentIcon value={form.payment} onChange={(v) => set({ payment: v })} />
      <input type="date" className="cell-input date-input" value={form.deadline} onChange={(e) => set({ deadline: e.target.value })} />
      <input className="cell-input details-input" placeholder="Деталі" value={form.details} onChange={(e) => set({ details: e.target.value })} />
      <button className="icon-btn add" type="submit" title="Додати"><Plus width={18} height={18} /></button>
    </form>
  )
}
