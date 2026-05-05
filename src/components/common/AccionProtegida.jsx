import { usePermissions } from '../../hooks/usePermissions'

const AccionProtegida = ({ 
  children, 
  permiso, 
  fallback = null,
  mostrarMensaje = false 
}) => {
  const { tienePermiso } = usePermissions()

  if (tienePermiso(permiso)) {
    return children
  }

  if (mostrarMensaje) {
    return (
      <div className="mensaje-sin-permiso">
        <p>No tienes permisos para realizar esta acción</p>
      </div>
    )
  }

  return fallback
}

export default AccionProtegida