import { useState } from 'react'
import useTasks from '../hooks/useTasks'
import PriorityChip from '../components/PriorityChip'
import StageBadge from '../components/StageBadge'
import TaskDrawer from '../components/TaskDrawer'

export function MyTasks({ currentUser }) {
  const [activeTask, setActiveTask] = useState(null)
  const { tasks, loading } = useTasks(
    currentUser ? { assigned_to: currentUser.id } : {}
  )

  const sorted = [...tasks].sort((a, b) => {
    const pOrder = { P1: 0, P2: 1, P3: 2, P4: 3 }
    return (pOrder[a.priority] ?? 9) - (pOrder[b.priority] ?? 9)
  })

  return (
    <div style={{ padding: 24, maxWidth: 900, flex: 1 }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
        My Tasks {!loading && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 14 }}>({tasks.length})</span>}
      </h1>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : sorted.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No tasks assigned to you.</p>
      ) : (
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
        }}>
          {sorted.map((task, i) => (
            <div
              key={task.id}
              onClick={() => setActiveTask(task)}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 130px 100px 90px',
                alignItems: 'center',
                gap: 12,
                padding: '11px 16px',
                background: i % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)',
                borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)'}
            >
              <PriorityChip priority={task.priority} />
              <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {task.title}
              </span>
              <StageBadge stage={task.stage} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {task.client_name ?? '—'}
              </span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {task.launch_date
                  ? new Date(task.launch_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTask && (
        <TaskDrawer
          task={activeTask}
          onClose={() => setActiveTask(null)}
          currentUser={currentUser}
          onUpdated={setActiveTask}
        />
      )}
    </div>
  )
}

export default MyTasks
