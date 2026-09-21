import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Boxes,
  Droplets,
  ClipboardCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { supabase } from '../lib/supabaseClient'
import StatCard from '../components/StatCard'

// Paleta consistente com o tema industrial/accent do restante do app.
const CHART_COLORS = ['#22a86e', '#748792', '#c7d1d6', '#158759', '#485762']

export default function Dashboard({ empresaId }) {
  const [lotes, setLotes] = useState([])
  const [laudos, setLaudos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const carregarDados = useCallback(async () => {
    if (!empresaId) return
    setLoading(true)
    setError(null)

    const [lotesRes, laudosRes] = await Promise.all([
      supabase
        .from('lotes')
        .select('id, codigo_lote, peso_bruto, umidade, silo')
        .eq('id_empresa', empresaId)
        .order('id', { ascending: false }),
      supabase
        .from('laudos')
        .select('id, inteiros, quebrados, impureza, gesso, mancha, descasque')
        .eq('id_empresa', empresaId),
    ])

    if (lotesRes.error) {
      setError(lotesRes.error.message)
    } else if (laudosRes.error) {
      setError(laudosRes.error.message)
    } else {
      setLotes(lotesRes.data || [])
      setLaudos(laudosRes.data || [])
    }
    setLoading(false)
  }, [empresaId])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const stats = useMemo(() => {
    const totalLotes = lotes.length
    const pesoTotal = lotes.reduce((acc, l) => acc + Number(l.peso_bruto || 0), 0)
    const umidadeMedia = totalLotes
      ? lotes.reduce((acc, l) => acc + Number(l.umidade || 0), 0) / totalLotes
      : 0
    const totalLaudos = laudos.length

    return { totalLotes, pesoTotal, umidadeMedia, totalLaudos }
  }, [lotes, laudos])

  const pesoPorSilo = useMemo(() => {
    const mapa = new Map()
    for (const lote of lotes) {
      const silo = lote.silo || 'Não informado'
      mapa.set(silo, (mapa.get(silo) || 0) + Number(lote.peso_bruto || 0))
    }
    return Array.from(mapa.entries())
      .map(([silo, peso]) => ({ silo, peso: Math.round(peso) }))
      .sort((a, b) => b.peso - a.peso)
      .slice(0, 8)
  }, [lotes])

  const composicaoMedia = useMemo(() => {
    if (laudos.length === 0) return []
    const campos = ['inteiros', 'quebrados', 'impureza', 'gesso', 'mancha']
    const nomes = {
      inteiros: 'Inteiros',
      quebrados: 'Quebrados',
      impureza: 'Impureza',
      gesso: 'Gesso',
      mancha: 'Mancha',
    }
    return campos.map((campo) => ({
      name: nomes[campo],
      value: Number(
        (laudos.reduce((acc, l) => acc + Number(l[campo] || 0), 0) / laudos.length).toFixed(2)
      ),
    }))
  }, [laudos])

  if (!empresaId) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 p-12 text-center">
        <AlertTriangle className="h-8 w-8 text-industrial-300" />
        <p className="text-sm font-medium text-industrial-500">
          Selecione uma empresa para visualizar o dashboard.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-industrial-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card flex flex-col items-center gap-2 p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-red-400" />
        <p className="text-sm font-medium text-red-600">Erro ao carregar dados: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Boxes} label="Lotes cadastrados" value={stats.totalLotes} tone="accent" />
        <StatCard
          icon={Boxes}
          label="Peso bruto total"
          value={stats.pesoTotal.toLocaleString('pt-BR')}
          suffix="kg"
        />
        <StatCard
          icon={Droplets}
          label="Umidade média"
          value={stats.umidadeMedia.toFixed(1)}
          suffix="%"
          tone={stats.umidadeMedia > 20 ? 'warn' : 'default'}
        />
        <StatCard icon={ClipboardCheck} label="Laudos emitidos" value={stats.totalLaudos} tone="accent" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="card p-5 xl:col-span-3">
          <h2 className="mb-4 text-base font-bold text-industrial-900">Peso bruto por silo</h2>
          {pesoPorSilo.length === 0 ? (
            <p className="py-12 text-center text-sm text-industrial-400">Sem dados de lotes ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pesoPorSilo} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ea" vertical={false} />
                <XAxis dataKey="silo" tick={{ fontSize: 12, fill: '#586b76' }} />
                <YAxis tick={{ fontSize: 12, fill: '#586b76' }} />
                <Tooltip
                  formatter={(value) => [`${value.toLocaleString('pt-BR')} kg`, 'Peso bruto']}
                  contentStyle={{ borderRadius: 8, borderColor: '#c7d1d6', fontSize: 13 }}
                />
                <Bar dataKey="peso" fill="#22a86e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5 xl:col-span-2">
          <h2 className="mb-4 text-base font-bold text-industrial-900">Composição média dos laudos</h2>
          {composicaoMedia.length === 0 ? (
            <p className="py-12 text-center text-sm text-industrial-400">Sem laudos ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={composicaoMedia}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {composicaoMedia.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-base font-bold text-industrial-900">Todos os lotes</h2>
        {lotes.length === 0 ? (
          <p className="py-8 text-center text-sm text-industrial-400">Nenhum lote cadastrado.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-industrial-200 text-xs uppercase tracking-wide text-industrial-500">
                  <th className="pb-2.5 pr-4 font-semibold">Código</th>
                  <th className="pb-2.5 pr-4 font-semibold">Peso bruto</th>
                  <th className="pb-2.5 pr-4 font-semibold">Umidade</th>
                  <th className="pb-2.5 font-semibold">Silo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-100">
                {lotes.map((lote) => (
                  <tr key={lote.id} className="text-industrial-700">
                    <td className="py-2.5 pr-4 font-semibold text-industrial-900">{lote.codigo_lote}</td>
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
