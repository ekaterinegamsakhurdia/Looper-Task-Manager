import BRAND from '../config/brand'

export function PriorityChip({ priority, size = 'sm' }) {
  const cfg = BRAND.priorities[priority]
  if (!cfg) return null
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '2px 7px' : '3px 10px',
        borderRadius: 99,
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.04em',
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}30`,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  )
}

export default PriorityChip
