export const PALETTE = [
  '#6B7280', '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#22C55E', '#10B981',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F472B6', '#94A3B8',
]

const isHex = (h) => /^#([0-9a-f]{6})$/i.test(h || '')

function rgb(hex) {
  const h = isHex(hex) ? hex : '#6B7280'
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
}

export const alpha = (hex, a) => {
  const [r, g, b] = rgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

export function darken(hex, amount = 0.12) {
  const [r, g, b] = rgb(hex).map((c) => Math.max(0, Math.round(c * (1 - amount))))
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')
}

export const badgeStyle = (hex) => ({ color: hex || '#94A3B8', background: alpha(hex || '#94A3B8', 0.16) })

export const nextColor = (used = []) => PALETTE.find((c) => !used.includes(c)) || PALETTE[used.length % PALETTE.length]
