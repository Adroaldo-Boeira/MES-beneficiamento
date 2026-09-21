// Regras de validação de negócio do domínio de beneficiamento de arroz.
// Centralizadas aqui para reuso entre formulários e para facilitar testes.

export const UMIDADE_MIN = 10
export const UMIDADE_MAX = 25

/**
 * Valida os campos de um Lote antes do envio ao banco.
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validarLote(lote) {
  const errors = {}

  if (!lote.codigo_lote?.trim()) {
    errors.codigo_lote = 'Informe o código do lote.'
  }

  if (!lote.produtor?.trim()) {
    errors.produtor = 'Informe o produtor.'
  }

  // Placa é opcional — só valida formato/tamanho se algo foi digitado.
  if (lote.placa?.trim() && lote.placa.trim().length > 8) {
    errors.placa = 'Placa inválida.'
  }

  const pesoBruto = Number(lote.peso_bruto)
  if (!lote.peso_bruto || Number.isNaN(pesoBruto) || pesoBruto <= 0) {
    errors.peso_bruto = 'Peso bruto deve ser um número maior que zero.'
  }

  const umidade = Number(lote.umidade)
  if (lote.umidade === '' || Number.isNaN(umidade)) {
    errors.umidade = 'Informe a umidade.'
  } else if (umidade < UMIDADE_MIN || umidade > UMIDADE_MAX) {
    errors.umidade = `Umidade deve estar entre ${UMIDADE_MIN}% e ${UMIDADE_MAX}%.`
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

/**
 * Valida os campos de um Laudo antes do envio ao banco.
 * Regra principal: inteiros + quebrados + impureza não pode ultrapassar 100.
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validarLaudo(laudo) {
  const errors = {}

  if (!laudo.id_lote) {
    errors.id_lote = 'Selecione o lote correspondente.'
  }

  const campos = ['inteiros', 'quebrados', 'impureza', 'gesso', 'mancha', 'descasque']
  const valores = {}

  for (const campo of campos) {
    const valor = Number(laudo[campo])
    if (laudo[campo] === '' || Number.isNaN(valor) || valor < 0) {
      errors[campo] = 'Valor inválido.'
    } else {
      valores[campo] = valor
    }
  }

  if (!errors.inteiros && !errors.quebrados && !errors.impureza) {
    const soma = valores.inteiros + valores.quebrados + valores.impureza
    if (soma > 100) {
      const msg = `A soma de inteiros + quebrados + impureza não pode ultrapassar 100% (atual: ${soma.toFixed(2)}%).`
      errors.inteiros = msg
      errors.quebrados = msg
      errors.impureza = msg
    }
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
