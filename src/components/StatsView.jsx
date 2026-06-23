import { useMemo } from 'react'
import { isDone, money } from '../lib/status.js'

export default function StatsView({ projects, tasks }) {
  const s = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter(isDone).length
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length
    const notStarted = tasks.filter((t) => t.status === 'not_started').length
    const budget = tasks.reduce((a, t) => a + (t.price || 0), 0)
    const advance = tasks.reduce((a, t) => a + (t.advance || 0), 0)
    return {
      total, done, inProgress, notStarted,
      budget, advance, remaining: budget - advance,
      percent: total ? Math.round((done / total) * 100) : 0,
    }
  }, [tasks])

  const perProject = useMemo(() =>
    projects.map((p) => {
      const pt = tasks.filter((t) => t.projectId === p.id)
      const done = pt.filter(isDone).length
      const budget = pt.reduce((a, t) => a + (t.price || 0), 0)
      const advance = pt.reduce((a, t) => a + (t.advance || 0), 0)
      return {
        ...p, total: pt.length, done, budget, advance, remaining: budget - advance,
        percent: pt.length ? Math.round((done / pt.length) * 100) : 0,
      }
    }), [projects, tasks])

  const statusTotal = s.done + s.inProgress + s.notStarted

  return (
    <div className="view">
      <header className="view-head">
        <div>
          <h1 className="view-title">Статистика</h1>
          <p className="view-sub">Прогрес і фінанси по всіх проєктах</p>
        </div>
      </header>

      <div className="stat-cards">
        <StatCard label="Бюджет" value={money(s.budget)} accent="#6366f1" />
        <StatCard label="Отримано (аванс)" value={money(s.advance)} accent="#10b981" />
        <StatCard label="Залишок до сплати" value={money(s.remaining)} accent="#f59e0b" />
        <StatCard label="Завдань виконано" value={`${s.done}/${s.total}`} accent="#06b6d4" />
      </div>

      <div className="stat-grid">
        <div className="card">
          <h3 className="card-h">Загальний прогрес</h3>
          <Ring percent={s.percent} />
          <p className="ring-caption">{s.done} із {s.total} завдань виконано</p>
        </div>

        <div className="card">
          <h3 className="card-h">Завдання за статусом</h3>
          {statusTotal === 0 ? (
            <p className="day-empty">Немає завдань.</p>
          ) : (
            <div className="bars">
              <PriorityBar label="Готово" value={s.done} total={statusTotal} color="#10b981" />
              <PriorityBar label="В роботі" value={s.inProgress} total={statusTotal} color="#f59e0b" />
              <PriorityBar label="Не почато" value={s.notStarted} total={statusTotal} color="#94a3b8" />
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="card-h">Прогрес і оплати по проєктах</h3>
        {perProject.length === 0 ? (
          <p className="day-empty">Немає проєктів.</p>
        ) : (
          <div className="proj-progress-list">
            {perProject.map((p) => (
              <div key={p.id} className="proj-progress-row">
                <div className="proj-progress-head">
                  <span className="dot" style={{ background: p.color }} />
                  <span className="proj-progress-name">{p.name}</span>
                  <span className="proj-progress-money">
                    {money(p.advance)} / {money(p.budget)}
                    {p.remaining > 0 && <span className="proj-remaining"> · залишок {money(p.remaining)}</span>}
                  </span>
                  <span className="proj-progress-count">{p.done}/{p.total}</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${p.percent}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className="card stat-card" style={{ '--accent': accent }}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function PriorityBar({ label, value, total, color }) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="progress"><div className="progress-bar" style={{ width: `${pct}%`, background: color }} /></div>
      <span className="bar-value">{value}</span>
    </div>
  )
}

function Ring({ percent }) {
  const r = 54
  const c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c
  return (
    <div className="ring-wrap">
      <svg className="ring" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} className="ring-track" />
        <circle
          cx="70" cy="70" r={r}
          className="ring-fill"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div className="ring-value">{percent}%</div>
    </div>
  )
}
