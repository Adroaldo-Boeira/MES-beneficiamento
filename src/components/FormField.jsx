/**
 * Campo de formulário padronizado (label + input + mensagem de erro).
 */
export default function FormField({
  label,
  error,
  type = 'text',
  as = 'input',
  children,
  ...inputProps
}) {
  const inputClass = `field-input ${error ? 'field-input-error' : ''}`

  return (
    <div>
      <label className="field-label">{label}</label>
      {as === 'select' ? (
        <select className={inputClass} {...inputProps}>
          {children}
        </select>
      ) : (
        <input type={type} className={inputClass} {...inputProps} />
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
