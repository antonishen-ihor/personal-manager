import { useState } from 'react'
import { Xmark } from 'iconoir-react'
import SortHead from './SortHead.jsx'
import { StatusIcon, PaymentIcon } from './IconStatus.jsx'
import { daysUntil } from '../lib/dates.js'
import { STATUS, STATUS_ORDER, PAYMENT, PAYMENT_ORDER, isDone, money } from '../lib/status.js'

export default function AllTasksView({ projects, tasks, onUpdateTask, onDeleteTask, onSelectProject }) {
  const [sort, setSort] = useState({ key: null, dir: 'asc' })
  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  const projectById = Object.fromEntries(projects.map((p) => [p.id, p]))
  const budget = tasks.reduce((s, t) => s + (t.price || 0), 0)
  const advance = tasks.reduce((s, t) => s + (t.advance || 0), 0)
  const remaining = budget - advance

  const sorted = [...tasks]
  if (sort.key) {
    const val = (t) =>
      sort.key === 'project' ? (projectById[t.projectId]?.name || '').toLowerCase()
      : sort.key === 'status' ? STATUS_ORDER.indexOf(t.status)
      : sort.key === 'payment' ? PAYMENT_ORDER.indexOf(t.payment)
      : sort.key === 'price' ? (t.price || 0)
      : (t.price || 0) - (t.advance || 0)
    sorted.sort((a, b) => {
      const va = val(a), vb = val(b)
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb
      return cmp * (sort.dir === 'asc' ? 1 : -1)
    })
  } else {
    sorted.sort((a, b) => {
      const ad = isDone(a), bd = isDone(b)
      if (ad !== bd) return ad ? 1 : -1
      return (a.deadline || '9999').localeCompare(b.deadline || '9999')
    })
  }

  return (
    <div className="view-wide">
      <header className="view-head">
        <div>
          <h1 className="view-title">Всі завдання</h1>
          <p className="view-sub">
            {tasks.length} завдань · {projects.length} проєктів · бюджет {money(budget)} · аванс {money(advance)} · залишок {money(remaining)}
          </p>
        </div>
      </header>

      <div className="task-table-wrap">
        <div className="task-table all">
          <div className="tt-head">
            <SortHead label="Проєкт" sortKey="project" sort={sort} onSort={toggleSort} />
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

          {sorted.length === 0 && <div className="tt-empty">Немає завдань у жодному проєкті.</div>}

          {sorted.map((t) => {
            const p = projectById[t.projectId]
            const rem = (t.price || 0) - (t.advance || 0)
            const overdue = !isDone(t) && t.deadline && daysUntil(t.deadline) < 0
            return (
              <div className={`tt-row ${isDone(t) ? 'done' : ''}`} key={t.id}>
                <button className="row-project" onClick={() => onSelectProject(t.projectId)} title={p?.name}>
                  <span className="side-dot" style={{ background: p?.color || '#ccc' }} />
                  <span className="row-project-name">{p?.name || '—'}</span>
                </button>

                <input className="cell-input title-input" value={t.title} placeholder="Назва завдання"
                  onChange={(e) => onUpdateTask(t.id, { title: e.target.value })} />

                <StatusIcon value={t.status} onChange={(v) => onUpdateTask(t.id, { status: v })} />

                <input type="number" className="cell-input num" value={t.price || ''} placeholder="0"
                  onChange={(e) => onUpdateTask(t.id, { price: Number(e.target.value) || 0 })} />
                <input type="number" className="cell-input num" value={t.advance || ''} placeholder="0"
                  onChange={(e) => onUpdateTask(t.id, { advance: Number(e.target.value) || 0 })} />

                <span className={`num cell-remaining ${rem > 0 ? 'pos' : 'zero'}`}>{money(rem)}</span>

                <PaymentIcon value={t.payment || 'unpaid'} onChange={(v) => onUpdateTask(t.id, { payment: v })} />

                <input type="date" className={`cell-input date-input ${overdue ? 'overdue' : ''}`} value={t.deadline || ''}
                  onChange={(e) => onUpdateTask(t.id, { deadline: e.target.value })} />

                <input className="cell-input details-input" value={t.details} placeholder="—"
                  onChange={(e) => onUpdateTask(t.id, { details: e.target.value })} />

                <button className="icon-btn danger small" onClick={() => onDeleteTask(t.id)} title="Видалити"><Xmark width={15} height={15} /></button>
              </div>
            )
          })}

          {tasks.length > 0 && (
            <div className="tt-foot">
              <span />
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
    </div>
  )
}
