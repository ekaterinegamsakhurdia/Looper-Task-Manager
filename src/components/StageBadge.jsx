import BRAND from '../config/brand'

export function StageBadge({ stage, size = 'sm' }) {
  const cfg = BRAND.stages.find(s => s.id === stage)
  const color = cfg?.color ?? '#6B7280'
  const label = cfg?.label ?? stage
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: size === 'sm' ? '2px 8px' : '3px 10px',
        borderRadius: 99,
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 500,
        color,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: color, flexShrink: 0,
      }} />
      {label}
    </span>
  )
}

export default StageBadge
