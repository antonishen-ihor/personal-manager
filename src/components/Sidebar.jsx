import { Calendar, StatsReport, Plus, List } from 'iconoir-react'
import { isDone } from '../lib/status.js'

const OVERVIEW = [
  { id: 'calendar', label: 'Календар', Icon: Calendar },
  { id: 'stats', label: 'Статистика', Icon: StatsReport },
]

export default function Sidebar({ projects, tasks, active, selectedId, onSelectView, onSelectProject, onSelectAll, onNewProject, progress }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="/logo.svg" alt="antonishen" className="brand-logo" />
      </div>

      <nav className="nav">
        {OVERVIEW.map((v) => (
          <button
            key={v.id}
            className={`nav-item ${active.type === v.id ? 'active' : ''}`}
            onClick={() => onSelectView(v.id)}
          >
            <span className="nav-icon"><v.Icon width={19} height={19} /></span>
            {v.label}
          </button>
        ))}
      </nav>

      <div className="side-section">
        <div className="side-section-head">
          <span>Проєкти</span>
          <button className="side-add" onClick={onNewProject} title="Новий проєкт">
            <Plus width={17} height={17} />
          </button>
        </div>
        <div className="side-projects">
          <button
            className={`side-project side-all ${active.type === 'all' ? 'active' : ''}`}
            onClick={onSelectAll}
          >
            <span className="side-all-icon"><List width={15} height={15} /></span>
            <span className="side-project-name">Всі завдання</span>
            <span className="side-project-count">{tasks.length}</span>
          </button>

          {projects.length === 0 ? (
            <p className="side-empty">Ще немає проєктів</p>
          ) : (
            projects.map((p) => {
              const pt = tasks.filter((t) => t.projectId === p.id)
              const done = pt.filter(isDone).length
              const isActive = active.type === 'project' && selectedId === p.id
              return (
                <button
                  key={p.id}
                  className={`side-project ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectProject(p.id)}
                >
                  <span className="side-dot" style={{ background: p.color }} />
                  <span className="side-project-name">{p.name}</span>
                  <span className="side-project-count">{done}/{pt.length}</span>
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className="sidebar-foot">
        <div className="mini-progress">
          <div className="mini-progress-bar" style={{ width: `${progress.percent}%` }} />
        </div>
        <span className="mini-progress-label">
          Виконано {progress.done}/{progress.total} завдань
        </span>
      </div>
    </aside>
  )
}
