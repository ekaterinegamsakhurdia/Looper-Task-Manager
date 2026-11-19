import { useState } from 'react'
import { Search } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import TaskDrawer from '../components/TaskDrawer'
import { BRAND } from '../config/brand'

export default function MyTasksPage({ currentEmployee }) {
  const [selectedTask, setSelectedTask] = useState(null)
  const [search, setSearch] = useState('')
  const baseFilters = currentEmployee ? { assigned_to: currentEmployee.id } : {}
  const { tasks, loading, reload } = useTasks({ ...baseFilters, search: search || undefined })

  const initials = name => name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Tasks</div>
          <div className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Client</th>
              <th>Stage</th>
              <th>Priority</th>
              <th>Department</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="loading-row">Loading…</td></tr>}
            {!loading && tasks.length === 0 && <tr><td colSpan={6} className="loading-row">No tasks assigned to you.</td></tr>}
            {!loading && tasks.map(task => {
              const stageCfg = BRAND.stages.find(s => s.id === task.stage)
              const priorityCfg = BRAND.priorities[task.priority]
              return (
                <tr key={task.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedTask(task)}>
                  <td><span style={{ fontWeight: 500 }}>{task.title}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{task.client_name || '—'}</td>
                  <td>
                    {stageCfg && (
                      <span className="stage-pill" style={{ background: stageCfg.color + '22', color: stageCfg.color }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: stageCfg.color, display: 'inline-block' }} />
                        {task.stage}
                      </span>
                    )}
                  </td>
                  <td>
                    {priorityCfg && (
                      <span className="priority-pill" style={{ background: priorityCfg.bg, color: priorityCfg.color }}>
                        {task.priority}
                      </span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{task.department || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedTask && (
        <TaskDrawer task={selectedTask} onClose={() => setSelectedTask(null)} currentEmployee={currentEmployee} onUpdate={reload} />
      )}
    </div>
  )
}
