import { useEffect, useMemo, useState, useCallback } from 'react'
import { FlaskConical, ClipboardList, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { validarLaudo } from '../lib/validation'
import FormField from '../components/FormField'

const LAUDO_VAZIO = {
  id_lote: '',
  inteiros: '',
  quebrados: '',
  impureza: '',
  gesso: '',
  mancha: '',
  descasque: '',
}

const CAMPOS_PERCENTUAL = [
  { key: 'inteiros', label: 'Grãos inteiros (%)' },
  { key: 'quebrados', label: 'Grãos quebrados (%)' },
  { key: 'impureza', label: 'Impureza (%)' },
  { key: 'gesso', label: 'Gesso (%)' },
  { key: 'mancha', label: 'Mancha (%)' },
  { key: 'descasque', label: 'Descasque (%)' },
]

export default function Laboratorio({ empresaId, onToast }) {
  const [form, setForm] = useState(LAUDO_VAZIO)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [lotes, setLotes] = useState([])
  const [laudosRecentes, setLaudosRecentes] = useState([])
  const [loadingLaudos, setLoadingLaudos] = useState(true)

  const carregarLotes = useCallback(async () => {
    if (!empresaId) return
    const { data, error } = await supabase
      .from('lotes')
      .select('id, codigo_lote, produtor')
      .eq('id_empresa', empresaId)
      .order('id', { ascending: false })
      .limit(50)

    if (!error) setLotes(data || [])
  }, [empresaId])

  const carregarLaudosRecentes = useCallback(async () => {
    if (!empresaId) return
    setLoadingLaudos(true)
    const { data, error } = await supabase
      .from('laudos')
      .select('id, id_lote, inteiros, quebrados, impureza, gesso, mancha, descasque, lotes(codigo_lote)')
      .eq('id_empresa', empresaId)
      .order('id', { ascending: false })
      .limit(8)

    if (!error) setLaudosRecentes(data || [])
    setLoadingLaudos(false)
  }, [empresaId])

  useEffect(() => {
    carregarLotes()
    carregarLaudosRecentes()
  }, [carregarLotes, carregarLaudosRecentes])

  const somaPrincipal = useMemo(() => {
    const i = Number(form.inteiros) || 0
    const q = Number(form.quebrados) || 0
    const imp = Number(form.impureza) || 0
    return i + q + imp
  }, [form.inteiros, form.quebrados, form.impureza])

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    if (errors[campo]) setErrors((prev) => ({ ...prev, [campo]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!empresaId) {
      onToast({ type: 'error', message: 'Selecione uma empresa antes de cadastrar um laudo.' })
      return
    }

    const { valid, errors: validationErrors } = validarLaudo(form)
    setErrors(validationErrors)
    if (!valid) return

    setSaving(true)
    const { error } = await supabase.from('laudos').insert({
      id_empresa: empresaId,
      id_lote: form.id_lote,
      inteiros: Number(form.inteiros),
      quebrados: Number(form.quebrados),
      impureza: Number(form.impureza),
      gesso: Number(form.gesso),
      mancha: Number(form.mancha),
      descasque: Number(form.descasque),
    })
    setSaving(false)

    if (error) {
      onToast({ type: 'error', message: `Erro ao salvar laudo: ${error.message}` })
      return
    }

    onToast({ type: 'success', message: 'Laudo registrado com sucesso.' })
    setForm(LAUDO_VAZIO)
    carregarLaudosRecentes()
  }

  const somaEstourada = somaPrincipal > 100

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <div className="card p-5 xl:col-span-2">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100">
            <FlaskConical className="h-4.5 w-4.5 text-accent-700" size={18} />
          </div>
          <h2 className="text-base font-bold text-industrial-900">Novo Laudo</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Lote"
            as="select"
            value={form.id_lote}
            onChange={(e) => handleChange('id_lote', e.target.value)}
            error={errors.id_lote}
          >
            <option value="">Selecione um lote...</option>
            {lotes.map((lote) => (
              <option key={lote.id} value={lote.id}>
                {lote.codigo_lote} — {lote.produtor}
              </option>
            ))}
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            {CAMPOS_PERCENTUAL.map(({ key, label }) => (
              <FormField
                key={key}
                label={label}
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="0,00"
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                error={errors[key]}
              />
            ))}
          </div>

          <div
            className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${
              somaEstourada
                ? 'border-red-300 bg-red-50 text-red-700'
                : 'border-industrial-200 bg-industrial-50 text-industrial-600'
            }`}
          >
            Soma (inteiros + quebrados + impureza): {somaPrincipal.toFixed(2)}%
            {somaEstourada && ' — excede o limite de 100%'}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
            {saving ? 'Salvando...' : 'Registrar laudo'}
          </button>
        </form>
      </div>

      <div className="card p-5 xl:col-span-3">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-industrial-100">
            <ClipboardList className="h-4.5 w-4.5 text-industrial-600" size={18} />
          </div>
          <h2 className="text-base font-bold text-industrial-900">Laudos recentes</h2>
        </div>

        {loadingLaudos ? (
          <div className="flex items-center justify-center py-12 text-industrial-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : laudosRecentes.length === 0 ? (
          <p className="py-8 text-center text-sm text-industrial-400">
            Nenhum laudo cadastrado ainda para esta empresa.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-industrial-200 text-xs uppercase tracking-wide text-industrial-500">
                  <th className="pb-2.5 pr-4 font-semibold">Lote</th>
                  <th className="pb-2.5 pr-4 font-semibold">Inteiros</th>
                  <th className="pb-2.5 pr-4 font-semibold">Quebrados</th>
                  <th className="pb-2.5 pr-4 font-semibold">Impureza</th>
                  <th className="pb-2.5 pr-4 font-semibold">Gesso</th>
                  <th className="pb-2.5 font-semibold">Mancha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-100">
                {laudosRecentes.map((laudo) => (
                  <tr key={laudo.id} className="text-industrial-700">
                    <td className="py-2.5 pr-4 font-semibold text-industrial-900">
                      {laudo.lotes?.codigo_lote || `#${laudo.id_lote}`}
                    </td>
                    <td className="py-2.5 pr-4">{Number(laudo.inteiros).toFixed(1)}%</td>
                    <td className="py-2.5 pr-4">{Number(laudo.quebrados).toFixed(1)}%</td>
                    <td className="py-2.5 pr-4">{Number(laudo.impureza).toFixed(1)}%</td>
                    <td className="py-2.5 pr-4">{Number(laudo.gesso).toFixed(1)}%</td>
                    <td className="py-2.5">{Number(laudo.mancha).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
