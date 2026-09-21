import { useEffect, useState, useCallback } from 'react'
import { Factory, Loader2, ListChecks } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import FormField from '../components/FormField'

const PRODUCAO_VAZIA = {
  id_lote: '',
  turno: '',
  fardos_produzidos: '',
  fardos_expedidos: '',
  rejeicao: '',
}

const TURNOS = ['Manhã', 'Tarde', 'Noite']

export default function Producao({ empresaId, onToast }) {
  const [form, setForm] = useState(PRODUCAO_VAZIA)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [lotes, setLotes] = useState([])
  const [registros, setRegistros] = useState([])
  const [loadingRegistros, setLoadingRegistros] = useState(true)

  const carregarLotes = useCallback(async () => {
    if (!empresaId) return
    const { data, error } = await supabase
      .from('lotes')
      .select('id, codigo_lote')
      .eq('id_empresa', empresaId)
      .order('id', { ascending: false })
      .limit(50)
    if (!error) setLotes(data || [])
  }, [empresaId])

  const carregarRegistros = useCallback(async () => {
    if (!empresaId) return
    setLoadingRegistros(true)
    const { data, error } = await supabase
      .from('producao')
      .select('id, turno, fardos_produzidos, fardos_expedidos, rejeicao, lotes(codigo_lote)')
      .eq('id_empresa', empresaId)
      .order('id', { ascending: false })
      .limit(8)
    if (!error) setRegistros(data || [])
    setLoadingRegistros(false)
  }, [empresaId])

  useEffect(() => {
    carregarLotes()
    carregarRegistros()
  }, [carregarLotes, carregarRegistros])

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    if (errors[campo]) setErrors((prev) => ({ ...prev, [campo]: undefined }))
  }

  function validar() {
    const errs = {}
    if (!form.id_lote) errs.id_lote = 'Selecione o lote.'
    if (!form.turno) errs.turno = 'Selecione o turno.'
    const produzidos = Number(form.fardos_produzidos)
    if (form.fardos_produzidos === '' || Number.isNaN(produzidos) || produzidos < 0) {
      errs.fardos_produzidos = 'Valor inválido.'
    }
    const expedidos = Number(form.fardos_expedidos)
    if (form.fardos_expedidos === '' || Number.isNaN(expedidos) || expedidos < 0) {
      errs.fardos_expedidos = 'Valor inválido.'
    }
    const rejeicao = Number(form.rejeicao)
    if (form.rejeicao === '' || Number.isNaN(rejeicao) || rejeicao < 0 || rejeicao > 100) {
      errs.rejeicao = 'Informe um percentual entre 0 e 100.'
    }
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!empresaId) {
      onToast({ type: 'error', message: 'Selecione uma empresa antes de lançar produção.' })
      return
    }

    const validationErrors = validar()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSaving(true)
    const { error } = await supabase.from('producao').insert({
      id_empresa: empresaId,
      id_lote: form.id_lote,
      turno: form.turno,
      fardos_produzidos: Number(form.fardos_produzidos),
      fardos_expedidos: Number(form.fardos_expedidos),
      rejeicao: Number(form.rejeicao),
    })
    setSaving(false)

    if (error) {
      onToast({ type: 'error', message: `Erro ao salvar produção: ${error.message}` })
      return
    }

    onToast({ type: 'success', message: 'Lançamento de produção registrado.' })
    setForm(PRODUCAO_VAZIA)
    carregarRegistros()
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <div className="card p-5 xl:col-span-2">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100">
            <Factory className="h-4.5 w-4.5 text-accent-700" size={18} />
          </div>
          <h2 className="text-base font-bold text-industrial-900">Lançamento de Produção</h2>
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
                {lote.codigo_lote}
              </option>
            ))}
          </FormField>

          <FormField
            label="Turno"
            as="select"
            value={form.turno}
            onChange={(e) => handleChange('turno', e.target.value)}
            error={errors.turno}
          >
            <option value="">Selecione...</option>
            {TURNOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Fardos produzidos"
              type="number"
              min="0"
              placeholder="0"
              value={form.fardos_produzidos}
              onChange={(e) => handleChange('fardos_produzidos', e.target.value)}
              error={errors.fardos_produzidos}
            />
            <FormField
              label="Fardos expedidos"
              type="number"
              min="0"
              placeholder="0"
              value={form.fardos_expedidos}
              onChange={(e) => handleChange('fardos_expedidos', e.target.value)}
              error={errors.fardos_expedidos}
            />
          </div>

          <FormField
            label="Rejeição (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0,00"
            value={form.rejeicao}
            onChange={(e) => handleChange('rejeicao', e.target.value)}
            error={errors.rejeicao}
          />

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Factory className="h-4 w-4" />}
            {saving ? 'Salvando...' : 'Registrar produção'}
          </button>
        </form>
      </div>

      <div className="card p-5 xl:col-span-3">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-industrial-100">
            <ListChecks className="h-4.5 w-4.5 text-industrial-600" size={18} />
          </div>
          <h2 className="text-base font-bold text-industrial-900">Lançamentos recentes</h2>
        </div>

        {loadingRegistros ? (
          <div className="flex items-center justify-center py-12 text-industrial-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : registros.length === 0 ? (
          <p className="py-8 text-center text-sm text-industrial-400">
            Nenhum lançamento de produção ainda para esta empresa.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-industrial-200 text-xs uppercase tracking-wide text-industrial-500">
                  <th className="pb-2.5 pr-4 font-semibold">Lote</th>
                  <th className="pb-2.5 pr-4 font-semibold">Turno</th>
                  <th className="pb-2.5 pr-4 font-semibold">Produzidos</th>
                  <th className="pb-2.5 pr-4 font-semibold">Expedidos</th>
                  <th className="pb-2.5 font-semibold">Rejeição</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-100">
                {registros.map((r) => (
                  <tr key={r.id} className="text-industrial-700">
                    <td className="py-2.5 pr-4 font-semibold text-industrial-900">
                      {r.lotes?.codigo_lote || `#${r.id_lote}`}
                    </td>
                    <td className="py-2.5 pr-4">{r.turno}</td>
                    <td className="py-2.5 pr-4">{r.fardos_produzidos}</td>
                    <td className="py-2.5 pr-4">{r.fardos_expedidos}</td>
                    <td className="py-2.5">{Number(r.rejeicao).toFixed(1)}%</td>
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
