import { LayoutDashboard, PackagePlus, FlaskConical, Factory, Wheat } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'recebimento', label: 'Recebimento', icon: PackagePlus },
  { id: 'laboratorio', label: 'Laboratório', icon: FlaskConical },
  { id: 'producao', label: 'Produção', icon: Factory },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

export default function Sidebar({ activePage, onNavigate, open, onClose }) {
  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-industrial-950/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed z-40 flex h-full w-64 flex-col border-r border-industrial-800 bg-industrial-950
          transition-transform duration-200 lg:static lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center gap-2.5 border-b border-industrial-800 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-600">
            <Wheat className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-white">MES Arroz</p>
            <p className="text-xs text-industrial-400">Painel do operador</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activePage === id
            return (
              <button
                key={id}
                onClick={() => {
                  onNavigate(id)
                  onClose?.()
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  ${
                    active
                      ? 'bg-accent-600 text-white'
                      : 'text-industrial-300 hover:bg-industrial-800 hover:text-white'
                  }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" size={18} />
                {label}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-industrial-800 px-5 py-4">
          <p className="text-xs text-industrial-500">
            Protótipo de TCC · Sistema MES SaaS
            <br />
            para beneficiadoras de arroz
          </p>
        </div>
      </aside>
    </>
  )
}
