import { useState, useEffect } from 'react'
import { FiCamera, FiUser } from 'react-icons/fi'
import './Avatar.css'

// Props:
// src: URL de la foto (foto_url del backend)
// name: Nombre completo para iniciales
// size: 'small', 'medium', 'large'
// onUpload: Función que recibe el archivo al seleccionar uno nuevo
// editable: Booleano para mostrar el icono de cámara
const Avatar = ({ src, name, size = 'medium', onUpload, editable = false }) => {
  const [hover, setHover] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)

  // 1. Sincronización Efectiva:
  // Cada vez que la prop 'src' cambia (porque el AuthContext se actualizó),
  // actualizamos el estado local y reseteamos el error.
  useEffect(() => {
    setCurrentSrc(src)
    setImageError(false)
  }, [src])

  // Generar iniciales si no hay foto o si falla la carga
  const getInitials = () => {
    if (!name) return 'U'
    const names = name.split(' ').filter(n => n) // Evitar espacios extra
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Clases de tamaño
  const getSizeClass = () => {
    switch(size) {
      case 'small': return 'avatar-small'
      case 'large': return 'avatar-large'
      default: return 'avatar-medium'
    }
  }

  // Manejador del input de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && onUpload) {
      // Validaciones básicas de frontend
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida (JPG, PNG)')
        return
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB límite
        alert('La imagen no debe superar los 2MB')
        return
      }
      onUpload(file) // Enviamos el archivo al componente padre (PerfilUsuario)
    }
  }

  // 2. Romper Caché (Timestamp):
  // Si tenemos una URL real (no un blob de preview), le pegamos el tiempo actual
  // para forzar al navegador a descargar la versión más nueva de Naruto.
  const srcFinal = (currentSrc && !currentSrc.startsWith('blob:'))
    ? `${currentSrc}?t=${new Date().getTime()}`
    : currentSrc;

  // Renderizado Condicional (Marcador de posición o Imagen)
  if (!srcFinal || imageError) {
    return (
      <div 
        className={`avatar-container ${getSizeClass()}`}
        onMouseEnter={() => editable && setHover(true)}
        onMouseLeave={() => editable && setHover(false)}
      >
        <div className="avatar-placeholder">
          {getInitials()}
        </div>
        
        {editable && hover && (
          <div className="avatar-overlay">
            <label className="avatar-upload" title="Cambiar foto">
              <FiCamera />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      className={`avatar-container ${getSizeClass()}`}
      onMouseEnter={() => editable && setHover(true)}
      onMouseLeave={() => editable && setHover(false)}
    >
      <img 
        src={srcFinal} 
        alt={name || 'Avatar'} 
        className="avatar-image"
        // 3. Manejo de Errores Robustos:
        // Si el servidor (Laravel) aún no propaga la imagen o da un 404,
        // activamos el marcador de posición para no mostrar una imagen rota.
        onError={(e) => {
          console.warn('Error cargando avatar, usando marcador:', srcFinal);
          setImageError(true);
        }}
      />
      
      {editable && hover && (
        <div className="avatar-overlay">
          <label className="avatar-upload" title="Cambiar foto">
            <FiCamera />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      )}
    </div>
  )
}

export default Avatar