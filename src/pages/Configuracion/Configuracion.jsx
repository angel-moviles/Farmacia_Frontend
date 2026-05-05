import { useState } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { FiSave, FiSettings, FiPercent, FiDollarSign, FiBell } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './Configuracion.css'

const Configuracion = () => {
  const [config, setConfig] = useState({
    iva: 16,
    moneda: 'MXN',
    stock_minimo_global: 10,
    alertas_caducidad: true,
    alertas_stock: true,
    notificaciones_email: true
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setConfig({
      ...config,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('Configuración guardada exitosamente')
  }

  return (
    <div className="configuracion-page">
      <div className="page-header">
        <h2>Configuración del Sistema</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="config-card">
          <h3>
            <FiSettings className="card-icon" />
            Configuración General
          </h3>
          
          <div className="config-grid">
            <Input
              type="number"
              name="iva"
              label="IVA (%)"
              value={config.iva}
              onChange={handleChange}
              icon={<FiPercent />}
              step="0.1"
              min="0"
              max="100"
            />

            <Input
              type="text"
              name="moneda"
              label="Moneda"
              value={config.moneda}
              onChange={handleChange}
              icon={<FiDollarSign />}
            />

            <Input
              type="number"
              name="stock_minimo_global"
              label="Stock Mínimo Global"
              value={config.stock_minimo_global}
              onChange={handleChange}
              min="0"
            />
          </div>
        </Card>

        <Card className="config-card">
          <h3>
            <FiBell className="card-icon" />
            Alertas y Notificaciones
          </h3>
          
          <div className="config-checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="alertas_caducidad"
                checked={config.alertas_caducidad}
                onChange={handleChange}
              />
              <span>Alertas de productos próximos a caducar</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="alertas_stock"
                checked={config.alertas_stock}
                onChange={handleChange}
              />
              <span>Alertas de stock bajo</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="notificaciones_email"
                checked={config.notificaciones_email}
                onChange={handleChange}
              />
              <span>Recibir notificaciones por email</span>
            </label>
          </div>
        </Card>

        <div className="config-actions">
          <Button type="submit" variant="primary" icon={<FiSave />}>
            Guardar Configuración
          </Button>
        </div>
      </form>
    </div>
  )
}

export default Configuracion