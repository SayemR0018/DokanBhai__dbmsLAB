import { Select } from './ui'
import { UNIT_CATALOG } from '../lib/units'

export default function UnitSelect({ value, onChange, className = '' }) {
  return (
    <Select value={value || 'pcs'} onChange={(e) => onChange?.(e.target.value)} className={className}>
      {UNIT_CATALOG.map((u) => (
        <option key={u.key} value={u.key}>
          {u.bn} ({u.short})
        </option>
      ))}
    </Select>
  )
}