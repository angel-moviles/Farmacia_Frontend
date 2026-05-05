import { useNavigate } from 'react-router-dom'
import { FiAlertTriangle } from 'react-icons/fi'
import Button from '../components/common/Button'
import './NoAutorizado.css'

const NoAutorizado = () => {
  const navigate = useNavigate()

  return (
    <div className="no-autorizado">
      <FiAlertTriangle className="icono" />
      <h1>Acceso No Autorizado</h1>
      <p>No tienes permisos suficientes para acceder a esta página.</p>
      <Button variant="primary" onClick={() => navigate('/ventas')}>
        Volver a las Ventas
      </Button>
    </div>
  )
}

export default NoAutorizado