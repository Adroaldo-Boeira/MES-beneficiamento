import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Carrega a lista de empresas cadastradas e mantém a empresa ativa
 * selecionada (persistida em localStorage entre sessões do operador).
 */
export function useEmpresas() {
  const [empresas, setEmpresas] = useState([])
  const [empresaAtivaId, setEmpresaAtivaId] = useState(
    () => localStorage.getItem('mes_empresa_ativa') || ''
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('empresas')
        .select('id, nome')
        .order('nome', { ascending: true })

      if (cancelado) return

      if (err) {
        setError(err.message)
      } else {
        setEmpresas(data || [])
        if (!empresaAtivaId && data?.length) {
          setEmpresaAtivaId(String(data[0].id))
        }
      }
      setLoading(false)
    }

    carregar()
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function selecionarEmpresa(id) {
    setEmpresaAtivaId(id)
    localStorage.setItem('mes_empresa_ativa', id)
  }

  return { empresas, empresaAtivaId, selecionarEmpresa, loading, error }
}
