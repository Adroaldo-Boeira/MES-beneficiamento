import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Toast from './components/Toast'
import Recebimento from './pages/Recebimento'
import Laboratorio from './pages/Laboratorio'
import Producao from './pages/Producao'
import Dashboard from './pages/Dashboard'
import { useEmpresas } from './hooks/useEmpresas'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const { empresas, empresaAtivaId, selecionarEmpresa } = useEmpresas()

  function renderPage() {
    switch (activePage) {
      case 'recebimento':
        return <Recebimento empresaId={empresaAtivaId} onToast={setToast} />
      case 'laboratorio':
        return <Laboratorio empresaId={empresaAtivaId} onToast={setToast} />
      case 'producao':
        return <Producao empresaId={empresaAtivaId} onToast={setToast} />
      case 'dashboard':
      default:
        return <Dashboard empresaId={empresaAtivaId} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-industrial-100">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          activePage={activePage}
          onMenuClick={() => setSidebarOpen(true)}
          empresas={empresas}
          empresaAtivaId={empresaAtivaId}
          onSelecionarEmpresa={selecionarEmpresa}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{renderPage()}</main>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
