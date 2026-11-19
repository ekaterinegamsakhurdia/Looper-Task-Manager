import { useState } from 'react'
import { Search } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import KanbanBoard from '../components/KanbanBoard'
import TaskDrawer from '../components/TaskDrawer'
import { BRAND } from '../config/brand'

export default function BoardPage({ currentEmployee }) {
  const [filters, setFilters] = useState({})
  const [search, setSearch] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  const { tasks, loading, moveTask, reload } = useTasks({ ...filters, search: search || undefined })

  const setFilter = (key, val) => setFilters(prev => val ? { ...prev, [key]: val } : (({ [key]: _, ...rest }) => rest)(prev))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <div className="page-title">Board</div>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" onChange={e => setFilter('priority', e.target.value)}>
          <option value="">All Priorities</option>
          {Object.keys(BRAND.priorities).map(p => <option key={p}>{p}</option>)}
        </select>
        <select className="filter-select" onChange={e => setFilter('department', e.target.value)}>
          <option value="">All Departments</option>
          {Object.keys(BRAND.departments).map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-row">Loading…</div>
      ) : (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <KanbanBoard tasks={tasks} onMoveTask={moveTask} onTaskClick={setSelectedTask} />
        </div>
      )}

      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          currentEmployee={currentEmployee}
          onUpdate={reload}
        />
      )}
    </div>
  )
}
