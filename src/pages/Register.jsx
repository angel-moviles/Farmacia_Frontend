import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from '../hooks/useForm'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Card from '../components/common/Card'
import { FiUser, FiMail, FiLock, FiPhone, FiCalendar } from 'react-icons/fi'
import { usuarioService } from '../services/usuarioService'
import toast from 'react-hot-toast'
import './Register.css'

const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { values, handleChange, errors, setErrors } = useForm({
    clave_usuario: '',
    nombre: '',
    a_paterno: '',
    a_materno: '',
    fecha_nacimiento: '',
    sexo: 'M',
    telefono: '',
    correo: '',
    contrasena: '',
    contrasena_confirmation: '',
    id_rol: 2 // Por defecto Cajero
  })

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
    
    if (!values.contrasena) {
      newErrors.contrasena = 'La contraseña es requerida'
    } else if (values.contrasena.length < 6) {
      newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres'
    }
    
    if (values.contrasena !== values.contrasena_confirmation) {
      newErrors.contrasena_confirmation = 'Las contraseñas no coinciden'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      // Eliminar campo de confirmación antes de enviar
      const { contrasena_confirmation: _contrasena_confirmation, ...userData } = values
      await usuarioService.create(userData)
      toast.success('Usuario registrado exitosamente')
      navigate('/login')
    } catch (error) {
      toast.error(error.message || 'Error al registrar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <Card className="register-card">
        <div className="register-header">
          <div className="register-logo">
            <span className="logo-icon"></span>
            <span className="logo-text">FarmaPOS</span>
          </div>
          <h1 className="register-title">Crear cuenta</h1>
          <p className="register-subtitle">
            Completa el formulario para registrarte en el sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <Input
              name="clave_usuario"
              label="Clave de usuario"
              placeholder="EMP001"
              value={values.clave_usuario}
              onChange={handleChange}
              error={errors.clave_usuario}
              icon={<FiUser />}
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
              icon={<FiCalendar />}
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
              icon={<FiPhone />}
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
              icon={<FiMail />}
              required
            />
          </div>

          <div className="form-row">
            <Input
              type="password"
              name="contrasena"
              label="Contraseña"
              placeholder="••••••••"
              value={values.contrasena}
              onChange={handleChange}
              error={errors.contrasena}
              icon={<FiLock />}
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
              icon={<FiLock />}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </form>

        <div className="register-footer">
          <p>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="login-link">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}

export default Register