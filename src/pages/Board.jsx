import { useState } from 'react'
import KanbanBoard from '../components/KanbanBoard'
import FilterBar from '../components/FilterBar'
import TaskDrawer from '../components/TaskDrawer'
import useTasks from '../hooks/useTasks'

export function Board({ currentUser }) {
  const [filters, setFilters]       = useState({})
  const [activeTask, setActiveTask] = useState(null)

  const { tasks, loading, error, moveTask } = useTasks(filters)

  const handleUpdated = updated => {
    setActiveTask(updated)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <FilterBar filters={filters} onChange={setFilters} />

      {error && (
        <div style={{
          padding: '10px 20px', background: 'rgba(248,92,92,0.1)',
          color: 'var(--p1)', fontSize: 12, borderBottom: '1px solid var(--border)',
        }}>
          Error: {error}
        </div>
      )}

      {loading ? (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', fontSize: 13,
        }}>
          Loading tasks…
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <KanbanBoard
            tasks={tasks}
            onTaskClick={setActiveTask}
            onMoveTask={moveTask}
          />
        </div>
      )}

      {activeTask && (
        <TaskDrawer
          task={activeTask}
          onClose={() => setActiveTask(null)}
          currentUser={currentUser}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  )
}

export default Board
