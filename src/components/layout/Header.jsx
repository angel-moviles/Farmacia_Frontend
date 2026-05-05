import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext' // Importante: usamos tu contexto
import { 
  FiMenu, 
  FiSearch, 
  FiUser, 
  FiSettings, 
  FiLogOut, 
  FiChevronDown, 
  FiMaximize2, 
  FiMinimize2, 
  FiMoon, 
  FiSun, 
  FiX 
} from 'react-icons/fi'
import './Header.css'

const Header = ({ toggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDarkMode, toggleDarkMode } = useTheme() // Consumimos el estado global
  
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const userMenuRef = useRef(null)

  // Memoización de la foto con cache busting para evitar imágenes viejas
  const fotoUrlHeader = useMemo(() => {
    if (user?.foto_url) {
      return `${user.foto_url}?t=${Date.now()}`;
    }
    return null;
  }, [user]);

  // Cerrar menú al hacer clic fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/productos?search=${searchTerm}`);
      setSearchTerm('');
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="menu-toggle" 
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Contraer menú' : 'Expandir menú'}
        >
          <FiMenu />
        </button>
        
        <div className="page-info">
          <h1 className="page-title">FarmaPOS</h1>
        </div>
      </div>

      <div className="header-right">
        {/* Barra de búsqueda con colores del tema */}
        <form onSubmit={handleSearch} className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button type="button" className="search-clear" onClick={() => setSearchTerm('')}>
              <FiX />
            </button>
          )}
        </form>

        <div className="header-actions">
          <button 
            className="header-btn" 
            onClick={toggleFullscreen}
            title="Pantalla completa"
          >
            {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
          </button>

          {/* ESTE BOTÓN CAMBIA EL TEMA GLOBALMENTE */}
          <button 
            className="header-btn" 
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDarkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>

        {/* Menú de usuario */}
        <div className="user-menu-wrapper" ref={userMenuRef}>
          <button 
            className="user-menu-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar-small">
              {fotoUrlHeader ? (
                <img src={fotoUrlHeader} alt="Avatar" />
              ) : (
                <div className="user-avatar-placeholder">
                  {user?.nombre?.charAt(0)}{user?.a_paterno?.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="user-info-small">
              <span className="user-name-small">{user?.nombre} {user?.a_paterno}</span>
              <span className="user-role-small">{user?.rol?.nombre || 'Usuario'}</span>
            </div>
            <FiChevronDown className={`user-menu-arrow ${showUserMenu ? 'open' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <strong>{user?.nombre} {user?.a_paterno}</strong>
                <span>{user?.correo}</span>
              </div>
              <div className="user-dropdown-menu">
                <button onClick={() => { navigate(`/usuarios/${user?.id_usuario}`); setShowUserMenu(false); }}>
                  <FiUser /> Mi Perfil
                </button>
                <button onClick={() => { navigate('/configuracion'); setShowUserMenu(false); }}>
                  <FiSettings /> Configuración
                </button>
                <div className="dropdown-divider"></div>
                <button onClick={logout} className="logout-option">
                  <FiLogOut /> Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header;