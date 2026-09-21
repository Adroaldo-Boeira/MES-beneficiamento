import { useEffect, useState } from 'react'
import { UserPlus, Loader2, X } from 'lucide-react'

/**
 * Modal simples de cadastro rápido de produtor, usado no formulário
 * de Recebimento para não obrigar o operador a sair da tela.
 */
export default function NovoProdutorModal({ open, onClose, onCreate }) {
  const [nome, setNome] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setNome('')
  }, [open])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim()) return
    setSaving(true)
    await onCreate(nome)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-industrial-950/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100">
              <UserPlus className="h-4.5 w-4.5 text-accent-700" size={18} />
            </div>
            <h2 className="text-base font-bold text-industrial-900">Novo Produtor</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-industrial-400 hover:bg-industrial-100 hover:text-industrial-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Nome do produtor</label>
            <input
              autoFocus
              type="text"
              className="field-input"
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={saving || !nome.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {saving ? 'Salvando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
