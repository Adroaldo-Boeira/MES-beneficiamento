// Geração do código sugerido de lote no formato AAAAMMDD-XX.
// O operador pode sempre sobrescrever o valor sugerido no input.

/**
 * Monta o prefixo de hoje no formato AAAAMMDD.
 */
export function prefixoDeHoje() {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return `${ano}${mes}${dia}`
}

/**
 * Gera o próximo código sugerido (AAAAMMDD-XX) com base nos códigos de
 * lote já existentes hoje para a empresa. XX é sequencial (01, 02, ...).
 *
 * @param {string[]} codigosExistentes - códigos de lote já cadastrados
 */
export function gerarCodigoLoteSugerido(codigosExistentes = []) {
  const prefixo = prefixoDeHoje()

  const sequenciaisDeHoje = codigosExistentes
    .filter((codigo) => codigo?.startsWith(`${prefixo}-`))
    .map((codigo) => Number(codigo.split('-')[1]))
    .filter((n) => Number.isInteger(n))

  const proximoNumero = sequenciaisDeHoje.length > 0 ? Math.max(...sequenciaisDeHoje) + 1 : 1

  return `${prefixo}-${String(proximoNumero).padStart(2, '0')}`
}
