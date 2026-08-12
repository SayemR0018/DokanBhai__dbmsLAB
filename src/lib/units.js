// Unit catalog for all retail verticals in DokanBhai.
// `decimals` controls how many decimal places the POS input allows for fractional
// quantities (e.g. 2.5 kg, 12.5 cft, 1.5 bag). `short` is the compact label used
// in receipts and cart chips.

export const UNIT_CATALOG = [
  { key: 'pcs',     bn: 'পিস',    short: 'pcs', decimals: 0 },
  { key: 'kg',      bn: 'কেজি',   short: 'kg',  decimals: 3 },
  { key: 'litre',   bn: 'লিটার',  short: 'ltr', decimals: 2 },
  { key: 'bag',     bn: 'ব্যাগ',   short: 'bag', decimals: 2 },
  { key: 'feet',    bn: 'ফিট',    short: 'ft',  decimals: 2 },
  { key: 'cft',     bn: 'সিএফটি', short: 'cft', decimals: 2 },
  { key: 'ton',     bn: 'টন',     short: 'ton', decimals: 3 },
  { key: 'gaj',     bn: 'গজ',     short: 'gaj', decimals: 2 },
  { key: 'box',     bn: 'কার্টন', short: 'ctn', decimals: 0 },
  { key: 'pack',    bn: 'প্যাক',   short: 'pack', decimals: 0 },
  { key: 'dozen',   bn: 'ডজন',    short: 'doz', decimals: 0 },
  { key: 'bundle',  bn: 'বান্ডিল', short: 'bdl', decimals: 0 },
]

export const getUnit = (key) => UNIT_CATALOG.find((u) => u.key === key) || UNIT_CATALOG[0]

export const decimalsFor = (key) => getUnit(key).decimals

export const stepFor = (key) => {
  const d = decimalsFor(key)
  if (d <= 0) return 1
  return Number((10 ** -d).toFixed(d))
}

export const formatQty = (value = 0, unitKey) => {
  const u = getUnit(unitKey)
  const n = Number(value || 0)
  if (!Number.isFinite(n)) return `0 ${u.short}`
  const trimmed = n.toFixed(u.decimals).replace(/\.?0+$/, '')
  return `${trimmed} ${u.short}`
}

// Round an arbitrary quantity to the unit's allowed decimals to avoid
// floating-point drift in the cart (e.g. 0.1 + 0.2 = 0.30000000000000004).
export const roundQty = (value, unitKey) => {
  const d = decimalsFor(unitKey)
  const n = Number(value || 0)
  if (!Number.isFinite(n)) return 0
  // Two extra digits of precision guards against repeat-add drift.
  return Number(n.toFixed(d + 2))
}

// Legacy aliases used by older code paths (e.g. 'piece' / 'pack').
export const normalizeUnitKey = (key) => {
  if (!key) return 'pcs'
  const k = String(key).toLowerCase()
  if (k === 'piece' || k === 'pieces') return 'pcs'
  if (k === 'liter' || k === 'liters' || k === 'litre' || k === 'litres') return 'litre'
  if (k === 'kilogram' || k === 'kilograms') return 'kg'
  if (k === 'bag') return 'bag'
  if (k === 'box' || k === 'carton' || k === 'ctn') return 'box'
  if (k === 'feet' || k === 'foot' || k === 'ft') return 'feet'
  if (k === 'tonne' || k === 'tonnes') return 'ton'
  if (k === 'gaj' || k === 'gaz') return 'gaj'
  if (k === 'dozen' || k === 'dz') return 'dozen'
  if (k === 'bundle') return 'bundle'
  if (k === 'pack' || k === 'packet') return 'pack'
  if (k === 'cft' || k === 'cuft' || k === 'cubic-feet') return 'cft'
  return UNIT_CATALOG.some((u) => u.key === k) ? k : 'pcs'
}
