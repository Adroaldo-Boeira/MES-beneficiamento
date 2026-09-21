import { useEffect, useState, useCallback } from 'react'
import { PackagePlus, Truck, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { validarLote, UMIDADE_MIN, UMIDADE_MAX } from '../lib/validation'
import FormField from '../components/FormField'

const LOTE_VAZIO = {
  codigo_lote: '',
  produtor: '',
  placa: '',
  peso_bruto: '',
  umidade: '',
  silo: '',
}

export default function Recebimento({ empresaId, onToast }) {
  const [form, setForm] = useState(LOTE_VAZIO)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [lotesRecentes, setLotesRecentes] = useState([])
  const [loadingLotes, setLoadingLotes] = useState(true)

  const carregarLotesRecentes = useCallback(async () => {
    if (!empresaId) return
    setLoadingLotes(true)
    const { data, error } = await supabase
      .from('lotes')
      .select('id, codigo_lote, produtor, placa, peso_bruto, umidade, silo')
      .eq('id_empresa', empresaId)
      .order('id', { ascending: false })
      .limit(8)

    if (!error) setLotesRecentes(data || [])
    setLoadingLotes(false)
  }, [empresaId])

  useEffect(() => {
    carregarLotesRecentes()
  }, [carregarLotesRecentes])

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    if (errors[campo]) setErrors((prev) => ({ ...prev, [campo]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!empresaId) {
      onToast({ type: 'error', message: 'Selecione uma empresa antes de cadastrar um lote.' })
      return
    }

    const { valid, errors: validationErrors } = validarLote(form)
    setErrors(validationErrors)
    if (!valid) return

    setSaving(true)
    const { error } = await supabase.from('lotes').insert({
      id_empresa: empresaId,
      codigo_lote: form.codigo_lote.trim(),
      produtor: form.produtor.trim(),
      placa: form.placa.trim().toUpperCase(),
      peso_bruto: Number(form.peso_bruto),
      umidade: Number(form.umidade),
      silo: form.silo.trim(),
    })
    setSaving(false)

    if (error) {
      onToast({ type: 'error', message: `Erro ao salvar lote: ${error.message}` })
      return
    }

    onToast({ type: 'success', message: `Lote "${form.codigo_lote}" cadastrado com sucesso.` })
    setForm(LOTE_VAZIO)
    carregarLotesRecentes()
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <div className="card p-5 xl:col-span-2">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100">
            <PackagePlus className="h-4.5 w-4.5 text-accent-700" size={18} />
          </div>
          <h2 className="text-base font-bold text-industrial-900">Novo Lote</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Código do lote"
            placeholder="Ex.: LT-2026-0142"
            value={form.codigo_lote}
            onChange={(e) => handleChange('codigo_lote', e.target.value)}
            error={errors.codigo_lote}
          />

          <FormField
            label="Produtor"
            placeholder="Nome do produtor rural"
            value={form.produtor}
            onChange={(e) => handleChange('produtor', e.target.value)}
            error={errors.produtor}
          />

          <FormField
            label="Placa do veículo"
            placeholder="Ex.: ABC1D23"
            value={form.placa}
            onChange={(e) => handleChange('placa', e.target.value.toUpperCase())}
            error={errors.placa}
            maxLength={8}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Peso bruto (kg)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={form.peso_bruto}
              onChange={(e) => handleChange('peso_bruto', e.target.value)}
              error={errors.peso_bruto}
            />
            <FormField
              label={`Umidade (${UMIDADE_MIN}–${UMIDADE_MAX}%)`}
              type="number"
              step="0.1"
              min={UMIDADE_MIN}
              max={UMIDADE_MAX}
              placeholder="Ex.: 18.5"
              value={form.umidade}
              onChange={(e) => handleChange('umidade', e.target.value)}
              error={errors.umidade}
            />
          </div>

          <FormField
            label="Silo de destino"
            placeholder="Ex.: Silo 3"
            value={form.silo}
            onChange={(e) => handleChange('silo', e.target.value)}
            error={errors.silo}
          />

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
            {saving ? 'Salvando...' : 'Registrar lote'}
          </button>
        </form>
      </div>

      <div className="card p-5 xl:col-span-3">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-industrial-100">
            <Truck className="h-4.5 w-4.5 text-industrial-600" size={18} />
          </div>
          <h2 className="text-base font-bold text-industrial-900">Lotes recentes</h2>
        </div>

        {loadingLotes ? (
          <div className="flex items-center justify-center py-12 text-industrial-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : lotesRecentes.length === 0 ? (
          <p className="py-8 text-center text-sm text-industrial-400">
            Nenhum lote cadastrado ainda para esta empresa.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-industrial-200 text-xs uppercase tracking-wide text-industrial-500">
                  <th className="pb-2.5 pr-4 font-semibold">Código</th>
                  <th className="pb-2.5 pr-4 font-semibold">Produtor</th>
                  <th className="pb-2.5 pr-4 font-semibold">Placa</th>
                  <th className="pb-2.5 pr-4 font-semibold">Peso bruto</th>
                  <th className="pb-2.5 pr-4 font-semibold">Umidade</th>
                  <th className="pb-2.5 font-semibold">Silo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-100">
                {lotesRecentes.map((lote) => (
                  <tr key={lote.id} className="text-industrial-700">
                    <td className="py-2.5 pr-4 font-semibold text-industrial-900">{lote.codigo_lote}</td>
                    <td className="py-2.5 pr-4">{lote.produtor}</td>
                    <td className="py-2.5 pr-4">{lote.placa}</td>
                    <td className="py-2.5 pr-4">{Number(lote.peso_bruto).toLocaleString('pt-BR')} kg</td>
                    <td className="py-2.5 pr-4">{Number(lote.umidade).toFixed(1)}%</td>
                    <td className="py-2.5">{lote.silo}</td>
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
