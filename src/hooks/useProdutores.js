import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Carrega a lista de produtores (tabela `produtores`: id, nome) e expõe
 * uma função para cadastrar um novo produtor rapidamente a partir do
 * próprio formulário de recebimento.
 */
export function useProdutores() {
  const [produtores, setProdutores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('produtores')
      .select('id, nome')
      .order('nome', { ascending: true })

    if (err) {
      setError(err.message)
    } else {
      setError(null)
      setProdutores(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  /**
   * Cadastra um novo produtor e retorna o registro criado
   * (já atualiza a lista local, sem precisar recarregar tudo).
   */
  async function criarProdutor(nome) {
    const nomeLimpo = nome.trim()
    if (!nomeLimpo) {
      return { data: null, error: { message: 'Informe o nome do produtor.' } }
    }

    const { data, error: err } = await supabase
      .from('produtores')
      .insert({ nome: nomeLimpo })
      .select('id, nome')
      .single()

    if (!err && data) {
      setProdutores((prev) =>
        [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      )
    }

    return { data, error: err }
  }

  return { produtores, loading, error, criarProdutor, recarregar: carregar }
}
