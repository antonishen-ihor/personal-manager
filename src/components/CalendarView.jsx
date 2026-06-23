import { useMemo, useState } from 'react'
import { NavArrowLeft, NavArrowRight } from 'iconoir-react'
import { MONTHS, WEEKDAYS, monthGrid, toISO, isSameDay, formatDate } from '../lib/dates.js'

export default function CalendarView({ projects, tasks }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState(toISO(now))

  const projectById = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.id, p])),
    [projects]
  )

  // Подія = завдання з дедлайном або сам проєкт із дедлайном.
  const eventsByDate = useMemo(() => {
    const map = {}
    const push = (iso, ev) => {
      if (!iso) return
      ;(map[iso] = map[iso] || []).push(ev)
    }
    tasks.forEach((t) => {
      if (t.deadline) push(t.deadline, { type: 'task', task: t, project: projectById[t.projectId] })
    })
    return map
  }, [tasks, projects, projectById])

  const weeks = monthGrid(year, month)

  function shift(delta) {
    let m = month + delta
    let y = year
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setMonth(m)
    setYear(y)
  }

  const selectedEvents = eventsByDate[selected] || []

  return (
    <div className="view">
      <header className="view-head">
        <div>
          <h1 className="view-title">Календар</h1>
          <p className="view-sub">Дедлайни проєктів і завдань</p>
        </div>
        <div className="cal-nav">
          <button className="btn ghost small icon-only" onClick={() => shift(-1)}><NavArrowLeft width={18} height={18} /></button>
          <span className="cal-month">{MONTHS[month]} {year}</span>
          <button className="btn ghost small icon-only" onClick={() => shift(1)}><NavArrowRight width={18} height={18} /></button>
        </div>
      </header>

      <div className="calendar-layout">
        <div className="card calendar">
          <div className="cal-weekdays">
            {WEEKDAYS.map((w) => <div key={w} className="cal-weekday">{w}</div>)}
          </div>
          <div className="cal-grid">
            {weeks.flat().map((date) => {
              const iso = toISO(date)
              const inMonth = date.getMonth() === month
              const isToday = isSameDay(date, new Date())
              const evs = eventsByDate[iso] || []
              return (
                <button
                  key={iso}
                  className={`cal-cell ${inMonth ? '' : 'muted'} ${isToday ? 'today' : ''} ${selected === iso ? 'selected' : ''}`}
                  onClick={() => setSelected(iso)}
                >
                  <span className="cal-day">{date.getDate()}</span>
                  <div className="cal-dots">
                    {evs.slice(0, 4).map((ev, i) => (
                      <span
                        key={i}
                        className="cal-dot"
                        style={{ background: ev.project ? ev.project.color : '#94a3b8' }}
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="card day-panel">
          <h3 className="day-panel-title">{formatDate(selected)}</h3>
          {selectedEvents.length === 0 ? (
            <p className="day-empty">Немає дедлайнів на цей день.</p>
          ) : (
            <div className="day-events">
              {selectedEvents.map((ev, i) => (
                <div key={i} className="day-event" style={{ borderLeftColor: ev.project ? ev.project.color : '#94a3b8' }}>
                  {ev.type === 'project' ? (
                    <>
                      <span className="day-event-kind">Дедлайн проєкту</span>
                      <span className="day-event-title">{ev.project.name}</span>
                    </>
                  ) : (
                    <>
                      <span className="day-event-kind">{ev.project ? ev.project.name : 'Завдання'}</span>
                      <span className={`day-event-title ${ev.task.status === 'done' ? 'struck' : ''}`}>{ev.task.title}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
