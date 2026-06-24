import { useEffect, useMemo, useState } from 'react'
import { Folder, Plus } from 'iconoir-react'
import { loadState, normalizeState, saveState, seedState, uid } from './lib/storage.js'
import Sidebar from './components/Sidebar.jsx'
import ProjectDetail from './components/ProjectDetail.jsx'
import AllTasksView from './components/AllTasksView.jsx'
import PersonalTasksView from './components/PersonalTasksView.jsx'
import CalendarView from './components/CalendarView.jsx'
import StatsView from './components/StatsView.jsx'
import ProjectModal from './components/ProjectModal.jsx'

export default function App() {
  const [state, setState] = useState(() => normalizeState(loadState()) || seedState())
  // active.type: 'project' | 'calendar' | 'stats'
  const [active, setActive] = useState({ type: 'project', id: null })
  const [editingProject, setEditingProject] = useState(null)

  useEffect(() => {
    saveState(state)
  }, [state])

  const { projects, tasks } = state
  const todos = state.todos || []

  // Який проєкт показувати: явно обраний або перший зі списку.
  const selectedId = active.type === 'project' ? (active.id ?? projects[0]?.id ?? null) : null
  const currentProject = projects.find((p) => p.id === selectedId) || null

  // --- Дії з проєктами ---
  function saveProject(data) {
    if (data.id) {
      setState((s) => ({ ...s, projects: s.projects.map((p) => (p.id === data.id ? { ...p, ...data } : p)) }))
    } else {
      const id = uid()
      const project = { ...data, id, createdAt: Date.now() }
      setState((s) => ({ ...s, projects: [project, ...s.projects] }))
      setActive({ type: 'project', id })
    }
    setEditingProject(null)
  }

  function updateProject(id, patch) {
    setState((s) => ({ ...s, projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
  }

  function deleteProject(id) {
    setState((s) => ({
      ...s,
      projects: s.projects.filter((p) => p.id !== id),
      tasks: s.tasks.filter((t) => t.projectId !== id),
    }))
    if (selectedId === id) setActive({ type: 'project', id: null })
  }

  // --- Дії з завданнями ---
  function addTask(projectId, data) {
    const task = {
      id: uid(),
      projectId,
      title: data.title,
      status: data.status || 'not_started',
      price: Number(data.price) || 0,
      advance: Number(data.advance) || 0,
      payment: data.payment || 'unpaid',
      details: data.details || '',
      photo: data.photo || '',
      deadline: data.deadline || '',
      createdAt: Date.now(),
    }
    setState((s) => ({ ...s, tasks: [...s.tasks, task] }))
  }

  function updateTask(id, patch) {
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }))
  }

  function deleteTask(id) {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }))
  }

  // --- Особисті таски ---
  function addTodo(title, projectId = '') {
    const t = { id: uid(), title, done: false, projectId, deadline: '', createdAt: Date.now() }
    setState((s) => ({ ...s, todos: [...(s.todos || []), t] }))
  }

  function updateTodo(id, patch) {
    setState((s) => ({ ...s, todos: (s.todos || []).map((t) => (t.id === id ? { ...t, ...patch } : t)) }))
  }

  function deleteTodo(id) {
    setState((s) => ({ ...s, todos: (s.todos || []).filter((t) => t.id !== id) }))
  }

  // --- Резервна копія ---
  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `проєкти-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importData(file) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = normalizeState(JSON.parse(reader.result))
        if (!parsed) throw new Error('bad')
        if (confirm('Замінити поточні дані вмістом файлу?')) {
          setState(parsed)
          setActive({ type: 'project', id: null })
        }
      } catch {
        alert('Не вдалося прочитати файл резервної копії.')
      }
    }
    reader.readAsText(file)
  }

  const progress = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((t) => t.status === 'done').length
    return { total, done, percent: total ? Math.round((done / total) * 100) : 0 }
  }, [tasks])

  return (
    <div className="app">
      <Sidebar
        projects={projects}
        tasks={tasks}
        active={active}
        selectedId={selectedId}
        onSelectView={(view) => setActive({ type: view, id: null })}
        onSelectProject={(id) => setActive({ type: 'project', id })}
        onSelectAll={() => setActive({ type: 'all', id: null })}
        onNewProject={() => setEditingProject({})}
        onExport={exportData}
        onImport={importData}
        progress={progress}
      />

      <main className="content">
        {active.type === 'tasks' && (
          <PersonalTasksView todos={todos} projects={projects} onAdd={addTodo} onUpdate={updateTodo} onDelete={deleteTodo} />
        )}
        {active.type === 'calendar' && <CalendarView projects={projects} tasks={tasks} />}
        {active.type === 'stats' && <StatsView projects={projects} tasks={tasks} />}
        {active.type === 'all' && (
          <AllTasksView
            projects={projects}
            tasks={tasks}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onSelectProject={(id) => setActive({ type: 'project', id })}
          />
        )}
        {active.type === 'project' && (
          currentProject ? (
            <ProjectDetail
              project={currentProject}
              tasks={tasks.filter((t) => t.projectId === currentProject.id)}
              onUpdateProject={(patch) => updateProject(currentProject.id, patch)}
              onEdit={() => setEditingProject(currentProject)}
              onDelete={() => {
                if (confirm(`Видалити проєкт «${currentProject.name}» разом із завданнями?`)) deleteProject(currentProject.id)
              }}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
            />
          ) : (
            <div className="view">
              <div className="empty">
                <div className="empty-emoji"><Folder width={46} height={46} /></div>
                <h3>Поки немає проєктів</h3>
                <p>Створіть перший проєкт у меню зліва, щоб почати.</p>
                <button className="btn primary" onClick={() => setEditingProject({})}><Plus width={17} height={17} /> Створити проєкт</button>
              </div>
            </div>
          )
        )}
      </main>

      {editingProject !== null && (
        <ProjectModal
          project={editingProject}
          onSave={saveProject}
          onClose={() => setEditingProject(null)}
        />
      )}
    </div>
  )
}
