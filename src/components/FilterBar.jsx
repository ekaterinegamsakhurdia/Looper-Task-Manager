import { Search, X } from 'lucide-react'
import BRAND from '../config/brand'

function Chip({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 10px',
        borderRadius: 99,
        fontSize: 11, fontWeight: 600,
        background: active ? (color ? `${color}25` : 'var(--violet-dim)') : 'var(--surface-3)',
        border: `1px solid ${active ? (color ?? 'var(--violet)') : 'var(--border)'}`,
        color: active ? (color ?? 'var(--violet)') : 'var(--text-second)',
        cursor: 'pointer',
        transition: 'all 0.12s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

export function FilterBar({ filters, onChange }) {
  const toggle = (key, value) => {
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value })
  }

  const clear = () => onChange({})
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div style={{
      padding: '10px 20px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface-1)',
      display: 'flex', alignItems: 'center', gap: 12,
      flexWrap: 'wrap',
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Search size={13} style={{
          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
        }} />
        <input
          value={filters.search ?? ''}
          onChange={e => onChange({ ...filters, search: e.target.value || undefined })}
          placeholder="Search tasks…"
          style={{
            padding: '5px 10px 5px 30px',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontSize: 12,
            width: 190, outline: 'none', fontFamily: 'var(--font-ui)',
          }}
        />
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

      {/* Priority */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {Object.entries(BRAND.priorities).map(([p, cfg]) => (
          <Chip
            key={p}
            label={p}
            active={filters.priority === p}
            color={cfg.color}
            onClick={() => toggle('priority', p)}
          />
        ))}
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

      {/* Department */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {Object.entries(BRAND.departments).map(([d, cfg]) => (
          <Chip
            key={d}
            label={d}
            active={filters.department === d}
            color={cfg.color}
            onClick={() => toggle('department', d)}
          />
        ))}
      </div>

      {/* Clear */}
      {hasFilters && (
        <>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <button
            onClick={clear}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', borderRadius: 99,
              background: 'none', border: '1px solid var(--border)',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11,
            }}
          >
            <X size={11} /> Clear
          </button>
        </>
      )}
    </div>
  )
}

export default FilterBar
