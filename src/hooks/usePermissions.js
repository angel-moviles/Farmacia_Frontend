import { useAuth } from './useAuth'

// Definir permisos por rol
const PERMISOS = {
  ADMINISTRADOR: {
    puedeVerDashboard: true,
    puedeVerVentas: true,
    puedeRealizarVentas: true,
    puedeVerProductos: true,
    puedeCrearProductos: true,
    puedeEditarProductos: true,
    puedeEliminarProductos: true,
    puedeVerUsuarios: true,
    puedeCrearUsuarios: true,
    puedeEditarUsuarios: true,
    puedeEliminarUsuarios: true,
    puedeCambiarRol: true,
    puedeVerProveedores: true,
    puedeCrearProveedores: true,
    puedeEditarProveedores: true,
    puedeEliminarProveedores: true,
    puedeVerCatalogos: true,
    puedeEditarCatalogos: true,
    puedeVerReportes: true,
    puedeExportarReportes: true,
    puedeVerConfiguracion: true,
    puedeEditarConfiguracion: true,
    puedeVerAuditoria: true
  },

    FARMACÉUTICO: {
    puedeVerDashboard: false,
    puedeVerVentas: true, // Puede ver ventas pero no realizarlas
    puedeRealizarVentas: false,
    puedeVerProductos: true,
    puedeCrearProductos: true, // Puede crear productos
    puedeEditarProductos: true, // Puede editar productos
    puedeEliminarProductos: false, // No puede eliminar productos
    puedeVerUsuarios: false, // No puede ver usuarios
    puedeCrearUsuarios: false,
    puedeEditarUsuarios: false,
    puedeEliminarUsuarios: false,
    puedeCambiarRol: false,
    puedeVerProveedores: true, // Puede ver proveedores
    puedeCrearProveedores: true, // Puede crear proveedores
    puedeEditarProveedores: true, // Puede editar proveedores
    puedeEliminarProveedores: false, // No puede eliminar proveedores
    puedeVerCatalogos: true, // Puede ver catálogos
    puedeEditarCatalogos: true, // Puede editar catálogos
    puedeVerReportes: true, // Puede ver reportes
    puedeExportarReportes: true, // Puede exportar reportes
    puedeVerConfiguracion: false,
    puedeEditarConfiguracion: false,
    puedeVerAuditoria: false
  },

  CAJERO: {
    puedeVerDashboard: false,
    puedeVerVentas: true,
    puedeRealizarVentas: true,
    puedeVerProductos: false,
    puedeCrearProductos: false,
    puedeEditarProductos: false,
    puedeEliminarProductos: false,
    puedeVerUsuarios: false,
    puedeCrearUsuarios: false,
    puedeEditarUsuarios: false,
    puedeEliminarUsuarios: false,
    puedeCambiarRol: false,
    puedeVerProveedores: false,
    puedeCrearProveedores: false,
    puedeEditarProveedores: false,
    puedeEliminarProveedores: false,
    puedeVerCatalogos: false,
    puedeEditarCatalogos: false,
    puedeVerReportes: false,
    puedeExportarReportes: false,
    puedeVerConfiguracion: false,
    puedeEditarConfiguracion: false,
    puedeVerAuditoria: false
  },

  AUXILIAR: {
    puedeVerDashboard: true,
    puedeVerVentas: false,
    puedeRealizarVentas: false,
    puedeVerProductos: true,
    puedeCrearProductos: true,
    puedeEditarProductos: true,
    puedeEliminarProductos: false,
    puedeVerUsuarios: false,
    puedeCrearUsuarios: false,
    puedeEditarUsuarios: false,
    puedeEliminarUsuarios: false,
    puedeCambiarRol: false,
    puedeVerProveedores: true,
    puedeCrearProveedores: false,
    puedeEditarProveedores: false,
    puedeEliminarProveedores: false,
    puedeVerCatalogos: true,
    puedeEditarCatalogos: false,
    puedeVerReportes: false,
    puedeExportarReportes: false,
    puedeVerConfiguracion: false,
    puedeEditarConfiguracion: false,
    puedeVerAuditoria: false
  }
}

// ... resto del código igual

// Permisos por defecto
const PERMISOS_POR_DEFECTO = {
  puedeVerDashboard: true,
  puedeVerVentas: false,
  puedeRealizarVentas: false,
  puedeVerProductos: false,
  puedeCrearProductos: false,
  puedeEditarProductos: false,
  puedeEliminarProductos: false,
  puedeVerUsuarios: false,
  puedeCrearUsuarios: false,
  puedeEditarUsuarios: false,
  puedeEliminarUsuarios: false,
  puedeCambiarRol: false,
  puedeVerProveedores: false,
  puedeCrearProveedores: false,
  puedeEditarProveedores: false,
  puedeEliminarProveedores: false,
  puedeVerCatalogos: false,
  puedeEditarCatalogos: false,
  puedeVerReportes: false,
  puedeExportarReportes: false,
  puedeVerConfiguracion: false,
  puedeEditarConfiguracion: false,
  puedeVerAuditoria: false
}

export const usePermissions = () => {
  const { user } = useAuth()

  const getRolNombre = () => {
    if (!user || !user.rol) return null
    if (typeof user.rol === 'object' && user.rol.nombre) {
      return user.rol.nombre.toUpperCase()
    }
    if (typeof user.rol === 'string') {
      return user.rol.toUpperCase()
    }
    return null
  }

  const rolNombre = getRolNombre()
  
  // Obtener permisos según el rol
  const permisos = PERMISOS[rolNombre] || PERMISOS_POR_DEFECTO

  // Función para verificar un permiso específico
  const tienePermiso = (permiso) => {
    return permisos[permiso] || false
  }

  // Verificar si es administrador
  const esAdmin = () => {
    return rolNombre === 'ADMINISTRADOR'
  }

  // Verificar si es farmacéutico
  const esFarmaceutico = () => {
    return rolNombre === 'FARMACEUTICO'
  }

  // Verificar si es cajero
  const esCajero = () => {
    return rolNombre === 'CAJERO'
  }

  // Verificar si es auxiliar
  const esAuxiliar = () => {
    return rolNombre === 'AUXILIAR'
  }

  return {
    permisos,
    tienePermiso,
    esAdmin,
    esFarmaceutico,
    esCajero,
    esAuxiliar,
    rol: rolNombre
  }
}