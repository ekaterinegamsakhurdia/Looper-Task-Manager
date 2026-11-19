// Avatar — coloured initials circle
export function Avatar({ name, initials, color = '#7C5CFC', size = 28, className = '' }) {
  return (
    <div
      className={`avatar ${className}`}
      title={name}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-ui)',
        fontSize: size * 0.38,
        fontWeight: 600,
        color: '#fff',
        flexShrink: 0,
        userSelect: 'none',
        letterSpacing: '-0.02em',
      }}
    >
      {initials || (name ? name.slice(0, 2).toUpperCase() : '?')}
    </div>
  )
}

export default Avatar
