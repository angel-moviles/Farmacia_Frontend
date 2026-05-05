import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useForm } from '../hooks/useForm'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Card from '../components/common/Card'
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './Login.css'



const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  const { values, handleChange, errors, setErrors } = useForm({
    correo: '',
    contrasena: ''
  })

  const validateForm = () => {
    const newErrors = {}
    
    if (!values.correo) {
      newErrors.correo = 'El correo es requerido'
    } else if (!/\S+@\S+\.\S+/.test(values.correo)) {
      newErrors.correo = 'Correo inválido'
    }
    
    if (!values.contrasena) {
      newErrors.contrasena = 'La contraseña es requerida'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      await login(values.correo, values.contrasena)
      toast.success('¡Bienvenido a FarmaPOS!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-background">
              <img src="/../public/farmacia.png" alt="FarmaPOS" />
            </div>
            <span className="logo-icon"></span>
            <span className="logo-text">FarmaPOS</span>
          </div>
          <h1 className="login-title">Bienvenido </h1>
          <p className="login-subtitle">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            type="email"
            name="correo"
            label="Correo electrónico"
            placeholder="admin@farmapos.com"
            value={values.correo}
            onChange={handleChange}
            error={errors.correo}
            icon={<FiMail />}
            required
          />

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

          <div className="login-options">
            <label className="remember-checkbox">
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            disabled={loading}
            icon={<FiLogIn />}
          >
            {loading ? 'Ingresando...' : 'Ingresar al sistema'}
          </Button>
        </form>

        <div className="login-footer">
          <p>
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="register-link">
              Regístrate aquí
            </Link>
          </p>
          <p className="legal-text">
            © 2024 FarmaPOS. Todos los derechos reservados.
          </p>
        </div>
      </Card>
    </div>
  )
}

export default Login