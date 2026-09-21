import { useEffect } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

/**
 * Notificação simples de sucesso/erro, auto-descartável.
 * toast: { type: 'success' | 'error', message: string } | null
 */
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  const isSuccess = toast.type === 'success'

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border bg-white p-4 shadow-lg animate-in fade-in slide-in-from-bottom-2"
      style={{ borderColor: isSuccess ? '#7edcab' : '#fca5a5' }}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-600" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0 text-red-500" />
      )}
      <p className="flex-1 text-sm font-medium text-industrial-800">{toast.message}</p>
      <button onClick={onClose} className="text-industrial-400 hover:text-industrial-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
