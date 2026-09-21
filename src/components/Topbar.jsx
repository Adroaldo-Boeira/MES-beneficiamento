import { Menu, Building2 } from 'lucide-react'

const PAGE_TITLES = {
  recebimento: 'Recebimento de Lotes',
  laboratorio: 'Laboratório — Laudos de Qualidade',
  producao: 'Produção',
  dashboard: 'Dashboard Geral',
}

export default function Topbar({ activePage, onMenuClick, empresas, empresaAtivaId, onSelecionarEmpresa }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-industrial-200 bg-white px-4 py-3.5 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-industrial-600 hover:bg-industrial-100 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-industrial-900 lg:text-xl">
          {PAGE_TITLES[activePage] || ''}
        </h1>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-industrial-200 bg-industrial-50 px-3 py-2">
        <Building2 className="h-4 w-4 shrink-0 text-industrial-500" />
        <select
          value={empresaAtivaId}
          onChange={(e) => onSelecionarEmpresa(e.target.value)}
          className="max-w-[160px] truncate bg-transparent text-sm font-medium text-industrial-800 focus:outline-none sm:max-w-none"
        >
          {empresas.length === 0 && <option value="">Nenhuma empresa</option>}
          {empresas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.nome}
            </option>
          ))}
        </select>
      </div>
    </header>
  )
}
