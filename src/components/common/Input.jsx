import './Input.css'

const Input = ({
  type = 'text',
  name,
  value = '', // Asegurar que siempre tenga un valor por defecto
  onChange,
  placeholder,
  label,
  error,
  icon,
  required = false,
  disabled = false,
  ...props
}) => {
  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div className={`input-container ${error ? 'input-error' : ''}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="input-field"
          {...props}
        />
      </div>
      {error && <span className="input-error-message">{error}</span>}
    </div>
  )
}

export default Input