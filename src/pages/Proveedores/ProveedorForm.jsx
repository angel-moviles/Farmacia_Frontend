import { useState } from 'react'
import { useForm } from '../../hooks/useForm'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import { proveedorService } from '../../services/proveedorService'
import toast from 'react-hot-toast'
import './ProveedorForm.css'

const ProveedorForm = ({ proveedor, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  const { values, handleChange, errors, setErrors } = useForm({
    nombre: proveedor?.nombre || '',
    direccion: proveedor?.direccion || '',
    telefono: proveedor?.telefono || '',
    correo: proveedor?.correo || '',
    nombre_contacto: proveedor?.nombre_contacto || '',
    fecha_ingreso: proveedor?.fecha_ingreso || new Date().toISOString().split('T')[0],
    activo: proveedor?.activo ?? true
  })

  const validateForm = () => {
    const newErrors = {}
    
    if (!values.nombre) newErrors.nombre = 'El nombre es requerido'
    
    if (values.correo && !/\S+@\S+\.\S+/.test(values.correo)) {
      newErrors.correo = 'Correo inválido'
    }
    
    if (!values.fecha_ingreso) newErrors.fecha_ingreso = 'La fecha de ingreso es requerida'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      if (proveedor) {
        await proveedorService.update(proveedor.id_proveedor, values)
        toast.success('Proveedor actualizado')
      } else {
        await proveedorService.create(values)
        toast.success('Proveedor creado')
      }
      onSuccess()
    } catch (error) {
      toast.error(error.message || 'Error al guardar proveedor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} title={proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
      <form onSubmit={handleSubmit} className="proveedor-form">
        <div className="form-row">
          <Input
            name="nombre"
            label="Nombre del Proveedor"
            placeholder="Distribuidora Farmacéutica S.A."
            value={values.nombre}
            onChange={handleChange}
            error={errors.nombre}
            required
          />
        </div>

        <div className="form-row">
          <Input
            name="direccion"
            label="Dirección"
            placeholder="Av. Principal #123"
            value={values.direccion}
            onChange={handleChange}
          />
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
            placeholder="contacto@distribuidora.com"
            value={values.correo}
            onChange={handleChange}
            error={errors.correo}
          />
        </div>

        <div className="form-row">
          <Input
            name="nombre_contacto"
            label="Nombre del Contacto"
            placeholder="Juan Pérez"
            value={values.nombre_contacto}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <Input
            type="date"
            name="fecha_ingreso"
            label="Fecha de Ingreso"
            value={values.fecha_ingreso}
            onChange={handleChange}
            error={errors.fecha_ingreso}
            required
          />
        </div>

        {proveedor && (
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
              <span>Proveedor Activo</span>
            </label>
          </div>
        )}

        <div className="form-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Guardando...' : (proveedor ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ProveedorForm