import { useState, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  FiHome, FiShoppingCart, FiPackage, FiUsers, FiTruck, 
  FiBarChart2, FiSettings, FiLogOut, FiLayers, FiChevronRight 
} from 'react-icons/fi'
import './Sidebar.css'
import farmaciaLogo from '../../assets/images/farmacia.png'

const Sidebar = ({ collapsed }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [catalogosOpen, setCatalogosOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  const isCatalogosActive = location.pathname.includes('/catalogos')

  // Abrir catálogos si estamos en una ruta de catálogos
  useState(() => {
    if (isCatalogosActive) {
      setCatalogosOpen(true)
    }
  }, [isCatalogosActive])

  // Rompemos la caché de la imagen para que se actualice al instante
  const fotoUrl = useMemo(() => 
    user?.foto_url ? `${user.foto_url}?t=${Date.now()}` : null
  , [user?.foto_url])

  const menuItems = [
    { path: '/dashboard', icon: <FiHome />, label: 'Panel Control' },
    { path: '/ventas', icon: <FiShoppingCart />, label: 'Ventas POS' },
    { path: '/productos', icon: <FiPackage />, label: 'Inventario' },
    { 
      path: '#', 
      icon: <FiLayers />, 
      label: 'Catálogos',
      hasSubmenu: true,
      subItems: [
        { path: '/catalogos/laboratorios', label: 'Laboratorios' },
        { path: '/catalogos/tipos', label: 'Categorías' },
        { path: '/catalogos/presentaciones', label: 'Presentaciones' }
      ]
    },
    { path: '/usuarios', icon: <FiUsers />, label: 'Personal' },
    { path: '/proveedores', icon: <FiTruck />, label: 'Proveedores' },
    { path: '/reportes', icon: <FiBarChart2 />, label: 'Estadísticas' },
  ]

  const getRoleColor = () => {
    const role = user?.rol?.nombre?.toLowerCase() || ''
    switch(role) {
      case 'administrador': return 'var(--rol-admin)'
      case 'cajero': return 'var(--rol-cajero)'
      case 'farmacéutico': return 'var(--rol-farmaceutico)'
      case 'auxiliar': return 'var(--rol-auxiliar)'
      default: return 'var(--text-secondary)'
    }
  }

  const getInitials = () => {
    if (!user) return 'U'
    const first = user.nombre?.charAt(0) || ''
    const last = user.a_paterno?.charAt(0) || ''
    return (first + last).toUpperCase()
  }

  return (
    <aside className={`sidebar-container ${collapsed ? 'is-collapsed' : ''}`}>
      {/* Brand Logo */}
      <div className="sidebar-brand">
        <div className="logo-box">
          <img src={farmaciaLogo} alt="FarmaPOS Logo" />
        </div>
        {!collapsed && <span className="brand-name">Farma<span>POS</span></span>}
      </div>

      {/* User Section con Glassmorphism */}
      <div className="sidebar-user-card" style={{ borderLeftColor: getRoleColor() }}>
        <div className="user-avatar-wrapper">
          {fotoUrl && !imageError ? (
            <img 
              src={fotoUrl} 
              alt={user?.nombre} 
              className="user-img" 
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="user-initials" style={{ backgroundColor: getRoleColor() }}>
              {getInitials()}
            </div>
          )}
          <div className="user-online-badge" style={{ backgroundColor: getRoleColor() }} />
        </div>
        {!collapsed && (
          <div className="user-meta">
            <p className="user-full-name">{user?.nombre} {user?.a_paterno}</p>
            <span className="user-role-badge" style={{ backgroundColor: `${getRoleColor()}20`, color: getRoleColor() }}>
              {user?.rol?.nombre || 'Usuario'}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-links">
        {menuItems.map((item) => (
          <div key={item.path} className="nav-group">
            <NavLink 
              to={item.hasSubmenu ? '#' : item.path} 
              className={({ isActive }) => `nav-item ${isActive && !item.hasSubmenu ? 'is-active' : ''}`}
              onClick={(e) => {
                if (item.hasSubmenu) {
                  e.preventDefault()
                  setCatalogosOpen(!catalogosOpen)
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-text">{item.label}</span>}
              {item.hasSubmenu && !collapsed && (
                <FiChevronRight className={`arrow-icon ${catalogosOpen ? 'is-rotated' : ''}`} />
              )}
            </NavLink>
            
            {item.hasSubmenu && catalogosOpen && !collapsed && (
              <div className="sub-menu-list">
                {item.subItems.map(sub => (
                  <NavLink 
                    key={sub.path} 
                    to={sub.path} 
                    className={({ isActive }) => `sub-item ${isActive ? 'is-active' : ''}`}
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer Acciones */}
      <div className="sidebar-extra">
        <NavLink to="/configuracion" className="nav-item">
          <span className="nav-icon"><FiSettings /></span>
          {!collapsed && <span className="nav-text">Ajustes</span>}
        </NavLink>
        <button onClick={logout} className="logout-btn-modern">
          <FiLogOut />
          {!collapsed && <span>Salir</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar