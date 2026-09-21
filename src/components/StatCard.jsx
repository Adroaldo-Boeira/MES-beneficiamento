export default function StatCard({ icon: Icon, label, value, suffix, tone = 'default' }) {
  const toneClasses = {
    default: 'bg-industrial-100 text-industrial-600',
    accent: 'bg-accent-100 text-accent-700',
    warn: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-600',
  }

  return (
    <div className="card flex items-center gap-4 p-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
        <Icon className="h-5 w-5" size={20} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-industrial-500">{label}</p>
        <p className="text-xl font-bold text-industrial-900">
          {value}
          {suffix && <span className="ml-1 text-sm font-medium text-industrial-400">{suffix}</span>}
        </p>
      </div>
    </div>
  )
}
