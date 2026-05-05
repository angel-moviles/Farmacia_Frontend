import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usuarioService } from '../../services/usuarioService'
import { rolService } from '../../services/rolService'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Avatar from '../../components/common/Avatar'
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiEdit2,
  FiSave,
  FiX,
  FiAward,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiArrowLeft
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import './PerfilUsuario.css'

const PerfilUsuario = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser, updateUser } = useAuth()
  
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [roles, setRoles] = useState([])
  const [formData, setFormData] = useState({})
  const [fotoFile, setFotoFile] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isOwnProfile = currentUser?.id_usuario === parseInt(id)
  const isAdmin = currentUser?.rol?.nombre === 'Administrador'

  useEffect(() => {
    loadUsuario()
    loadRoles()
  }, [id])

  const loadUsuario = async () => {
    try {
      setLoading(true)
      const data = await usuarioService.getById(id)
      setUsuario(data)
      
      // Formatear fecha para el input type="date"
      let fechaFormateada = ''
      if (data.fecha_nacimiento) {
        fechaFormateada = data.fecha_nacimiento.split('T')[0]
      }

      setFormData({
        nombre: data.nombre || '',
        a_paterno: data.a_paterno || '',
        a_materno: data.a_materno || '',
        telefono: data.telefono || '',
        correo: data.correo || '',
        fecha_nacimiento: fechaFormateada,
        sexo: data.sexo || 'M',
        id_rol: data.id_rol || ''
      })
      
      // Usar la URL que viene del backend (foto_url)
      setFotoPreview(data.foto_url)
    } catch (error) {
      toast.error('Error al cargar usuario')
      navigate('/usuarios')
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const data = await rolService.getAll()
      setRoles(data)
    } catch (error) {
      console.error('Error al cargar roles:', error)
    }
  }

  const handleFotoUpload = (file) => {
    setFotoFile(file)
    // Crear preview local temporal
    const previewUrl = URL.createObjectURL(file)
    setFotoPreview(previewUrl)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    setLoading(true)
    const dataToSend = { ...formData }
    if (fotoFile) dataToSend.foto = fotoFile

    // 1. Enviamos a Laravel
    const response = await usuarioService.update(id, dataToSend)
    
    // 2. Actualizamos el estado local del componente
    setUsuario(response.usuario)
    setFotoPreview(response.usuario.foto_url)
    
    // 3. ¡IMPORTANTE! Si es mi propio perfil, actualizamos el Sidebar y Header
    if (isOwnProfile) {
      updateUser(response.usuario) // <--- Aquí ocurre la magia
    }
    
    setEditMode(false)
    setFotoFile(null)
    toast.success('Perfil y foto actualizados')
  } catch (error) {
    toast.error('Error al guardar cambios')
  } finally {
    setLoading(false)
  }
}

  const handleDelete = async () => {
    try {
      await usuarioService.delete(id)
      toast.success('Usuario eliminado correctamente')
      navigate('/usuarios')
    } catch (error) {
      toast.error('Error al eliminar usuario')
    }
  }

  const cancelarEdicion = () => {
    setEditMode(false)
    setFotoFile(null)
    setFotoPreview(usuario.foto_url)
    // Resetear formData a los valores originales del usuario
    setFormData({
      nombre: usuario.nombre,
      a_paterno: usuario.a_paterno,
      a_materno: usuario.a_materno || '',
      telefono: usuario.telefono || '',
      correo: usuario.correo,
      fecha_nacimiento: usuario.fecha_nacimiento?.split('T')[0] || '',
      sexo: usuario.sexo,
      id_rol: usuario.id_rol
    })
  }

  const formatDate = (date) => {
    if (!date) return 'No especificada'
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  if (loading && !usuario) return <div className="perfil-loading"><div className="spinner"></div></div>

  const roleName = roles.find(r => r.id_rol === usuario?.id_rol)?.nombre || 'Usuario'

  return (
    <div className="perfil-page">
      <div className="perfil-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/usuarios')}><FiArrowLeft /></button>
          <h2><FiUser className="title-icon" /> Perfil de Usuario</h2>
          {isOwnProfile && <span className="own-profile-badge">Mi Perfil</span>}
        </div>
        <div className="header-actions">
          {!editMode ? (
            <>
              {(isAdmin || isOwnProfile) && (
                <Button variant="primary" onClick={() => setEditMode(true)} icon={<FiEdit2 />}>Editar Perfil</Button>
              )}
              {isAdmin && !isOwnProfile && (
                <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} icon={<FiTrash2 />}>Eliminar</Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" onClick={cancelarEdicion} icon={<FiX />}>Cancelar</Button>
              <Button variant="primary" onClick={handleSubmit} icon={<FiSave />}>Guardar</Button>
            </>
          )}
        </div>
      </div>

      <div className="perfil-grid">
        <div className="perfil-col-left">
          <Card className="foto-card">
            <div className="foto-container">
              <Avatar
                src={fotoPreview}
                name={`${usuario.nombre} ${usuario.a_paterno}`}
                size="large"
                editable={editMode}
                onUpload={handleFotoUpload}
              />
            </div>
            <h3 className="usuario-nombre">{`${usuario.nombre} ${usuario.a_paterno}`}</h3>
            <div className="usuario-rol">
              <FiAward /> <span>{roleName}</span>
            </div>
            <div className="usuario-estado">
              <div className={`estado-indicador ${usuario.activo ? 'activo' : 'inactivo'}`}>
                {usuario.activo ? <FiCheckCircle /> : <FiXCircle />}
                <span>{usuario.activo ? 'Activo' : 'Inactivo'}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="perfil-col-right">
          <Card className="form-card">
            <h4>Datos personales</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre</label>
                {editMode ? <Input name="nombre" value={formData.nombre} onChange={handleChange} /> : <div className="campo-valor">{usuario.nombre}</div>}
              </div>
              <div className="form-group">
                <label>Apellido Paterno</label>
                {editMode ? <Input name="a_paterno" value={formData.a_paterno} onChange={handleChange} /> : <div className="campo-valor">{usuario.a_paterno}</div>}
              </div>
              <div className="form-group">
                <label>Correo</label>
                {editMode ? <Input type="email" name="correo" value={formData.correo} onChange={handleChange} icon={<FiMail />} /> : <div className="campo-valor"><FiMail /> {usuario.correo}</div>}
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                {editMode ? <Input name="telefono" value={formData.telefono} onChange={handleChange} icon={<FiPhone />} /> : <div className="campo-valor"><FiPhone /> {usuario.telefono || '—'}</div>}
              </div>
              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                {editMode ? <Input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} /> : <div className="campo-valor"><FiCalendar /> {formatDate(usuario.fecha_nacimiento)}</div>}
              </div>
              <div className="form-group">
                <label>Sexo</label>
                {editMode ? (
                  <select name="sexo" value={formData.sexo} onChange={handleChange} className="select-input">
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                ) : <div className="campo-valor">{usuario.sexo === 'M' ? 'Masculino' : 'Femenino'}</div>}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-container confirm-modal">
            <div className="modal-header"><h3>Confirmar eliminación</h3></div>
            <div className="modal-content">
              <p>¿Estás seguro de eliminar a <strong>{usuario.nombre}</strong>?</p>
              <p className="warning-text">Esta acción es permanente.</p>
            </div>
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
              <Button variant="danger" onClick={handleDelete}>Eliminar Definitivamente</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerfilUsuario