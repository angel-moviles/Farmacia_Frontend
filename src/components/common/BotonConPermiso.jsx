import { usePermissions } from '../../hooks/usePermissions'

const BotonConPermiso = ({ 
  children, 
  permiso, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  icon,
  disabled = false,
  className = '',
  ...props 
}) => {
  const { tienePermiso } = usePermissions()

  if (!tienePermiso(permiso)) {
    return null
  }

  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-text">{children}</span>
    </button>
  )
}

export default BotonConPermiso