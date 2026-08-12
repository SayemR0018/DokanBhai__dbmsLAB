import { BUSINESS_TYPES } from '../lib/verticals'

export default function BusinessTypeChips({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {BUSINESS_TYPES.map((b) => {
        const active = value === b.key
        return (
          <button
            key={b.key}
            type="button"
            onClick={() => onChange(b.key)}
            className={`text-left px-3 py-2.5 rounded-xl border transition w-full sm:w-auto flex-1 min-w-[180px] ${
              active
                ? 'bg-brand-50 border-brand-500 text-brand-800 shadow-sm'
                : 'bg-white border-steel-200 text-steel-600 hover:border-brand-200 hover:bg-brand-50/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">{b.icon}</span>
              <span className="font-bold text-sm">{b.label}</span>
            </div>
            <p className="mt-1 text-[11px] text-steel-500 leading-snug">{b.blurb}</p>
          </button>
        )
      })}
    </div>
  )
}