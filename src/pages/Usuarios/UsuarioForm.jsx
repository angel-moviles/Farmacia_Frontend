import { useState, useEffect } from 'react'
import { usuarioService } from '../../services/usuarioService'
import { rolService } from '../../services/rolService'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Avatar from '../../components/common/Avatar'
import { useForm } from '../../hooks/useForm'
import toast from 'react-hot-toast'
import './UsuarioForm.css'

const UsuarioForm = ({ usuario, onClose, onSuccess }) => {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState([])
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoFile, setFotoFile] = useState(null)

  const { values, handleChange, errors, setErrors } = useForm({
    clave_usuario: usuario?.clave_usuario || '',
    nombre: usuario?.nombre || '',
    a_paterno: usuario?.a_paterno || '',
    a_materno: usuario?.a_materno || '',
    fecha_nacimiento: usuario?.fecha_nacimiento || '',
    sexo: usuario?.sexo || 'M',
    telefono: usuario?.telefono || '',
    correo: usuario?.correo || '',
    contrasena: '',
    contrasena_confirmation: '',
    id_rol: usuario?.id_rol || '',
    activo: usuario?.activo ?? true
  })

  useEffect(() => {
    loadRoles()
    if (usuario?.foto_url) {
      setFotoPreview(usuario.foto_url)
    }
  }, [usuario])

  const loadRoles = async () => {
    try {
      const data = await rolService.getAll()
      setRoles(data)
    } catch (error) {
      toast.error('Error al cargar roles')
    }
  }

  const handleFotoUpload = (file) => {
    setFotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setFotoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!values.clave_usuario) newErrors.clave_usuario = 'La clave es requerida'
    if (!values.nombre) newErrors.nombre = 'El nombre es requerido'
    if (!values.a_paterno) newErrors.a_paterno = 'El apellido paterno es requerido'
    if (!values.fecha_nacimiento) newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida'
    
    if (!values.correo) {
      newErrors.correo = 'El correo es requerido'
    } else if (!/\S+@\S+\.\S+/.test(values.correo)) {
      newErrors.correo = 'Correo inválido'
    }
    
    if (!values.id_rol) {
      newErrors.id_rol = 'Seleccione un rol'
    }
    
    if (!usuario) {
      if (!values.contrasena) {
        newErrors.contrasena = 'La contraseña es requerida'
      } else if (values.contrasena.length < 6) {
        newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres'
      }
      
      if (values.contrasena !== values.contrasena_confirmation) {
        newErrors.contrasena_confirmation = 'Las contraseñas no coinciden'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      const userData = { ...values }
      
      if (fotoFile) {
        userData.foto = fotoFile
      }
      
      let response
      if (usuario) {
        response = await usuarioService.update(usuario.id_usuario, userData)
        
        // Si el usuario actualizado es el mismo que está logueado
        if (user && user.id_usuario === usuario.id_usuario) {
          console.log('Actualizando usuario logueado en contexto')
          updateUser(response.usuario)
          toast.success('Tu perfil ha sido actualizado')
        } else {
          toast.success('Usuario actualizado correctamente')
        }
      } else {
        response = await usuarioService.create(userData)
        toast.success('Usuario creado correctamente')
      }
      
      onSuccess()
    } catch (error) {
      console.error('Error al guardar usuario:', error)
      toast.error(error.response?.data?.message || 'Error al guardar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} title={usuario ? 'Editar Usuario' : 'Nuevo Usuario'}>
      <form onSubmit={handleSubmit} className="usuario-form">
        <div className="foto-section">
          <Avatar
            src={fotoPreview}
            name={`${values.nombre} ${values.a_paterno}`}
            size="large"
            editable={true}
            onUpload={handleFotoUpload}
          />
          <p className="foto-ayuda">
            {fotoFile ? 'Foto lista para subir' : 'Haz clic para cambiar foto'}
          </p>
        </div>

        <div className="form-row">
          <Input
            name="clave_usuario"
            label="Clave de usuario"
            placeholder="EMP001"
            value={values.clave_usuario}
            onChange={handleChange}
            error={errors.clave_usuario}
            required
          />
        </div>

        <div className="form-row">
          <Input
            name="nombre"
            label="Nombre"
            placeholder="Juan"
            value={values.nombre}
            onChange={handleChange}
            error={errors.nombre}
            required
          />
        </div>

        <div className="form-row">
          <Input
            name="a_paterno"
            label="Apellido Paterno"
            placeholder="Pérez"
            value={values.a_paterno}
            onChange={handleChange}
            error={errors.a_paterno}
            required
          />
        </div>

        <div className="form-row">
          <Input
            name="a_materno"
            label="Apellido Materno"
            placeholder="García"
            value={values.a_materno}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <Input
            type="date"
            name="fecha_nacimiento"
            label="Fecha de Nacimiento"
            value={values.fecha_nacimiento}
            onChange={handleChange}
            error={errors.fecha_nacimiento}
            required
          />
        </div>

        <div className="form-row">
          <label className="input-label">Sexo</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="sexo"
                value="M"
                checked={values.sexo === 'M'}
                onChange={handleChange}
              />
              <span>Masculino</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="sexo"
                value="F"
                checked={values.sexo === 'F'}
                onChange={handleChange}
              />
              <span>Femenino</span>
            </label>
          </div>
        </div>

        <div className="form-row">
          <Input
            name="telefono"
            label="Teléfono"
            placeholder="555-123-4567"
            value={values.telefono}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <Input
            type="email"
            name="correo"
            label="Correo electrónico"
            placeholder="juan@example.com"
            value={values.correo}
            onChange={handleChange}
            error={errors.correo}
            required
          />
        </div>

        <div className="form-row">
          <label className="input-label">Rol</label>
          <select
            name="id_rol"
            value={values.id_rol}
            onChange={handleChange}
            className={`select-input ${errors.id_rol ? 'error' : ''}`}
          >
            <option value="">Seleccione un rol</option>
            {roles.map(rol => (
              <option key={rol.id_rol} value={rol.id_rol}>
                {rol.nombre}
              </option>
            ))}
          </select>
          {errors.id_rol && (
            <span className="input-error-message">{errors.id_rol}</span>
          )}
        </div>

        {!usuario && (
          <>
            <div className="form-row">
              <Input
                type="password"
                name="contrasena"
                label="Contraseña"
                placeholder="••••••••"
                value={values.contrasena}
                onChange={handleChange}
                error={errors.contrasena}
                required
              />
            </div>

            <div className="form-row">
              <Input
                type="password"
                name="contrasena_confirmation"
                label="Confirmar Contraseña"
                placeholder="••••••••"
                value={values.contrasena_confirmation}
                onChange={handleChange}
                error={errors.contrasena_confirmation}
                required
              />
            </div>
          </>
        )}

        {usuario && (
          <div className="form-row checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="activo"
                checked={values.activo}
                onChange={(e) => handleChange({
                  target: {
                    name: 'activo',
                    value: e.target.checked
                  }
                })}
              />
              <span>Usuario Activo</span>
            </label>
          </div>
        )}

        <div className="form-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Guardando...' : (usuario ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default UsuarioForm