import PriorityChip from './PriorityChip'
import Avatar from './Avatar'
import BRAND from '../config/brand'

const deptColor = dept => BRAND.departments[dept]?.color ?? '#8B9BB8'

export function TaskCard({ task, onClick }) {
  const { title, priority, stage, department, task_type, client_name, brief_title,
          internal_deadline, launch_date, bounce_internal, bounce_client,
          client_revision_count, internal_revision_count } = task

  const hasBounce = bounce_internal || bounce_client
  const stageCfg  = BRAND.stages.find(s => s.id === stage)

  const deadline = launch_date || internal_deadline
  const isOverdue = deadline && new Date(deadline) < new Date() && stage !== 'Delivered' && stage !== 'Archive'

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface-2)',
        border: `1px solid ${hasBounce ? 'var(--s-bounced)40' : 'var(--border)'}`,
        borderRadius: 'var(--r-md)',
        padding: '10px 12px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-mid)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = hasBounce ? 'var(--s-bounced)40' : 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Top row: priority + bounce flags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <PriorityChip priority={priority} />
        {hasBounce && (
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
            color: 'var(--s-bounced)', background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 99, padding: '2px 6px',
          }}>
            {bounce_internal ? `↩ INT${internal_revision_count > 1 ? ` ×${internal_revision_count}` : ''}` : ''}
            {bounce_client   ? `↩ CLT${client_revision_count   > 1 ? ` ×${client_revision_count}` : ''}` : ''}
          </span>
        )}
        {department && (
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
            color: deptColor(department),
          }}>
            {department}
          </span>
        )}
      </div>

      {/* Title */}
      <p style={{
        fontSize: 13, fontWeight: 500,
        color: 'var(--text-primary)', lineHeight: 1.4,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {title}
      </p>

      {/* Meta row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 6, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
          {client_name ?? brief_title ?? '—'}
        </span>
        {deadline && (
          <span style={{
            fontSize: 10, fontFamily: 'var(--font-mono)',
            color: isOverdue ? 'var(--p1)' : 'var(--text-muted)',
            fontWeight: isOverdue ? 700 : 400,
          }}>
            {new Date(deadline).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
          </span>
        )}
      </div>

      {/* Stage indicator strip at bottom */}
      <div style={{
        height: 2, borderRadius: 1,
        background: stageCfg?.color ?? '#6B7280',
        opacity: 0.6,
        marginTop: 2,
      }} />
    </div>
  )
}

export default TaskCard
