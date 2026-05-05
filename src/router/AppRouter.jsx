import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePermissions } from '../hooks/usePermissions'
import MainLayout from '../components/layout/MainLayout'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import Ventas from '../pages/Ventas/Ventas'
import Productos from '../pages/Productos/Productos'
import Usuarios from '../pages/Usuarios/Usuarios'
import PerfilUsuario from '../pages/Usuarios/PerfilUsuario'
import Proveedores from '../pages/Proveedores/Proveedores'
import Reportes from '../pages/Reportes/Reportes'
import Configuracion from '../pages/Configuracion/Configuracion'
import Catalogos from '../pages/Catalogos'
import NoAutorizado from '../pages/NoAutorizado'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div className="loading-screen">Cargando...</div>
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />
}

const RouteWithPermissions = ({ children, permiso, fallback = <Navigate to="/no-autorizado" /> }) => {
  const { isAuthenticated, loading } = useAuth()
  const { tienePermiso } = usePermissions()
  
  if (loading) {
    return <div className="loading-screen">Cargando...</div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  if (!tienePermiso(permiso)) {
    console.log(`Acceso denegado: falta permiso ${permiso}`)
    return fallback
  }
  
  return children
}

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/no-autorizado" element={<NoAutorizado />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        
        {/* Dashboard - todos pueden verlo */}
        <Route path="dashboard" element={
          <RouteWithPermissions permiso="puedeVerDashboard">
            <Dashboard />
          </RouteWithPermissions>
        } />
        
        {/* Ventas - solo admin, farmacéutico y cajero */}
        <Route path="ventas" element={
          <RouteWithPermissions permiso="puedeVerVentas">
            <Ventas />
          </RouteWithPermissions>
        } />
        
        {/* Productos - todos excepto cajero? No, cajero solo ve, no edita */}
        <Route path="productos" element={
          <RouteWithPermissions permiso="puedeVerProductos">
            <Productos />
          </RouteWithPermissions>
        } />
        
        {/* Catálogos - admin, farmacéutico y auxiliar */}
        <Route path="catalogos/*" element={
          <RouteWithPermissions permiso="puedeVerCatalogos">
            <Catalogos />
          </RouteWithPermissions>
        } />
        
        {/* Usuarios - solo admin */}
        <Route path="usuarios" element={
          <RouteWithPermissions permiso="puedeVerUsuarios">
            <Usuarios />
          </RouteWithPermissions>
        } />
        
        <Route path="usuarios/:id" element={
          <RouteWithPermissions permiso="puedeVerUsuarios">
            <PerfilUsuario />
          </RouteWithPermissions>
        } />
        
        {/* Proveedores - admin, farmacéutico y auxiliar */}
        <Route path="proveedores" element={
          <RouteWithPermissions permiso="puedeVerProveedores">
            <Proveedores />
          </RouteWithPermissions>
        } />
        
        {/* Reportes - admin y farmacéutico */}
        <Route path="reportes" element={
          <RouteWithPermissions permiso="puedeVerReportes">
            <Reportes />
          </RouteWithPermissions>
        } />
        
        {/* Configuración - solo admin */}
        <Route path="configuracion" element={
          <RouteWithPermissions permiso="puedeVerConfiguracion">
            <Configuracion />
          </RouteWithPermissions>
        } />
      </Route>
    </Routes>
  )
}

export default AppRouter