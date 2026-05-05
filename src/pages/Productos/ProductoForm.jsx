import { useState, useEffect } from 'react'
import { productoService } from '../../services/productoService'
import { proveedorService } from '../../services/proveedorService'
import { laboratorioService } from '../../services/laboratorioService'
import { tipoProductoService } from '../../services/tipoProductoService'
import { presentacionService } from '../../services/presentacionService'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import RealBarcodeScanner from '../../components/common/RealBarcodeScanner'
import { useForm } from '../../hooks/useForm'
import { FiCamera, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './ProductoForm.css'

const ProductoForm = ({ producto, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [proveedores, setProveedores] = useState([])
  const [laboratorios, setLaboratorios] = useState([])
  const [tiposProducto, setTiposProducto] = useState([])
  const [presentaciones, setPresentaciones] = useState([])
  const [showScanner, setShowScanner] = useState(false)
  const [buscandoCodigo, setBuscandoCodigo] = useState(false)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoFile, setFotoFile] = useState(null)

  const { values, setValues, handleChange, errors, setErrors } = useForm({
    lote: producto?.lote || '',
    codigo_barras: producto?.codigo_barras || '',
    nombre: producto?.nombre || '',
    fecha_produccion: producto?.fecha_produccion ? new Date(producto.fecha_produccion).toISOString().split('T')[0] : '',
    fecha_caducidad: producto?.fecha_caducidad ? new Date(producto.fecha_caducidad).toISOString().split('T')[0] : '',
    costo: producto?.costo || '',
    precio_venta: producto?.precio_venta || '',
    stock: producto?.stock || 0,
    stock_minimo: producto?.stock_minimo || 0,
    activo: producto?.activo === undefined ? 1 : (producto.activo ? 1 : 0), // IMPORTANTE: 1 o 0, no true/false
    id_laboratorio: producto?.id_laboratorio || '',
    id_tipo_producto: producto?.id_tipo_producto || '',
    id_presentacion: producto?.id_presentacion || '',
    id_proveedor: producto?.id_proveedor || ''
  })

  useEffect(() => {
    loadSelectData()
    if (producto?.foto_url) {
      setFotoPreview(producto.foto_url)
    }
  }, [])

  const loadSelectData = async () => {
    try {
      const [provData, labData, tipoData, presData] = await Promise.all([
        proveedorService.getAll(),
        laboratorioService.getAll(),
        tipoProductoService.getAll(),
        presentacionService.getAll()
      ])
      setProveedores(provData || [])
      setLaboratorios(labData || [])
      setTiposProducto(tipoData || [])
      setPresentaciones(presData || [])
    } catch (error) {
      toast.error('Error al cargar datos')
    }
  }

  const handleCodigoEscaneado = async (codigo) => {
    setBuscandoCodigo(true)
    try {
      const productoExistente = await productoService.buscarPorCodigoBarras(codigo)
      
      if (productoExistente) {
        toast.error(`El producto "${productoExistente.nombre}" ya existe con este código de barras`)
        setShowScanner(false)
        setBuscandoCodigo(false)
        return
      }

      setValues(prev => ({
        ...prev,
        codigo_barras: codigo
      }))
      
      toast.success(`Código de barras registrado: ${codigo}`)
      setShowScanner(false)
      
    } catch (error) {
      console.error('Error al procesar código:', error)
      toast.error('Error al procesar el código de barras')
    } finally {
      setBuscandoCodigo(false)
    }
  }

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona una imagen válida')
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 2MB')
        return
      }
      setFotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFoto = () => {
    setFotoFile(null)
    setFotoPreview(null)
    setValues(prev => ({ ...prev, foto: null }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!values.lote) newErrors.lote = 'El lote es requerido'
    if (!values.nombre) newErrors.nombre = 'El nombre es requerido'
    if (!values.fecha_produccion) newErrors.fecha_produccion = 'La fecha de producción es requerida'
    if (!values.fecha_caducidad) newErrors.fecha_caducidad = 'La fecha de caducidad es requerida'
    if (!values.costo) newErrors.costo = 'El costo es requerido'
    if (!values.precio_venta) newErrors.precio_venta = 'El precio de venta es requerido'
    if (!values.id_laboratorio) newErrors.id_laboratorio = 'Seleccione un laboratorio'
    if (!values.id_tipo_producto) newErrors.id_tipo_producto = 'Seleccione un tipo de producto'
    if (!values.id_presentacion) newErrors.id_presentacion = 'Seleccione una presentación'
    if (!values.id_proveedor) newErrors.id_proveedor = 'Seleccione un proveedor'
    
    if (values.fecha_produccion && values.fecha_caducidad) {
      if (new Date(values.fecha_caducidad) <= new Date(values.fecha_produccion)) {
        newErrors.fecha_caducidad = 'La fecha de caducidad debe ser posterior a la de producción'
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
      const dataToSend = {
        lote: values.lote,
        codigo_barras: values.codigo_barras || null,
        nombre: values.nombre,
        fecha_produccion: values.fecha_produccion,
        fecha_caducidad: values.fecha_caducidad,
        costo: parseFloat(values.costo) || 0,
        precio_venta: parseFloat(values.precio_venta) || 0,
        stock: parseInt(values.stock) || 0,
        stock_minimo: parseInt(values.stock_minimo) || 0,
        activo: values.activo === 1 || values.activo === true ? 1 : 0, // Asegurar que sea 1 o 0
        id_laboratorio: parseInt(values.id_laboratorio),
        id_tipo_producto: parseInt(values.id_tipo_producto),
        id_presentacion: parseInt(values.id_presentacion),
        id_proveedor: parseInt(values.id_proveedor)
      }

      if (fotoFile) {
        dataToSend.foto = fotoFile
      }

      console.log('Enviando datos:', dataToSend)

      if (producto) {
        await productoService.update(producto.id_producto, dataToSend)
        toast.success('Producto actualizado')
      } else {
        await productoService.create(dataToSend)
        toast.success('Producto creado')
      }
      onSuccess()
    } catch (error) {
      console.error('Error:', error)
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
        console.log('Errores detallados:', validationErrors)
        Object.keys(validationErrors).forEach(key => {
          toast.error(`${key}: ${validationErrors[key][0]}`)
        })
        setErrors(validationErrors)
      } else {
        toast.error(error.response?.data?.message || 'Error al guardar producto')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} title={producto ? 'Editar Producto' : 'Nuevo Producto'}>
      <form onSubmit={handleSubmit} className="producto-form">
        {/* Código de barras con escáner */}
        <div className="form-row">
          <div className="barcode-input-group">
            <Input
              name="codigo_barras"
              label="Código de Barras"
              placeholder="7501234567890"
              value={values.codigo_barras}
              onChange={handleChange}
              error={errors.codigo_barras}
            />
            <button
              type="button"
              className="scan-barcode-btn"
              onClick={() => setShowScanner(true)}
              disabled={buscandoCodigo}
              title="Escanear código de barras"
            >
              <FiCamera />
            </button>
          </div>
          <small className="field-hint">
            Escanea el código de barras para registrar automáticamente
          </small>
        </div>

        {/* Lote */}
        <div className="form-row">
          <Input
            name="lote"
            label="Lote"
            placeholder="LOT-001"
            value={values.lote}
            onChange={handleChange}
            error={errors.lote}
            required
          />
        </div>

        {/* Nombre */}
        <div className="form-row">
          <Input
            name="nombre"
            label="Nombre del Producto"
            placeholder="Paracetamol 500mg"
            value={values.nombre}
            onChange={handleChange}
            error={errors.nombre}
            required
          />
        </div>

        {/* Foto del producto */}
        <div className="form-row">
          <label className="input-label">Foto del Producto</label>
          <div className="foto-producto-container">
            {fotoPreview ? (
              <div className="foto-preview">
                <img src={fotoPreview} alt="Producto" />
                <button 
                  type="button" 
                  className="remove-foto-btn"
                  onClick={removeFoto}
                >
                  <FiX />
                </button>
              </div>
            ) : (
              <div className="foto-upload-area">
                <input
                  type="file"
                  id="producto_foto"
                  accept="image/*"
                  onChange={handleFotoChange}
                />
                <label htmlFor="producto_foto" className="upload-label">
                  <FiCamera /> Subir foto
                </label>
                <small>Formatos: JPG, PNG (max 2MB)</small>
              </div>
            )}
          </div>
        </div>

        {/* Fechas */}
        <div className="form-row">
          <Input
            type="date"
            name="fecha_produccion"
            label="Fecha de Producción"
            value={values.fecha_produccion}
            onChange={handleChange}
            error={errors.fecha_produccion}
            required
          />
        </div>

        <div className="form-row">
          <Input
            type="date"
            name="fecha_caducidad"
            label="Fecha de Caducidad"
            value={values.fecha_caducidad}
            onChange={handleChange}
            error={errors.fecha_caducidad}
            required
          />
        </div>

        {/* Precios */}
        <div className="form-row">
          <Input
            type="number"
            name="costo"
            label="Costo"
            placeholder="0.00"
            step="0.01"
            value={values.costo}
            onChange={handleChange}
            error={errors.costo}
            required
          />
        </div>

        <div className="form-row">
          <Input
            type="number"
            name="precio_venta"
            label="Precio de Venta"
            placeholder="0.00"
            step="0.01"
            value={values.precio_venta}
            onChange={handleChange}
            error={errors.precio_venta}
            required
          />
        </div>

        {/* Stock */}
        <div className="form-row">
          <Input
            type="number"
            name="stock"
            label="Stock Inicial"
            value={values.stock}
            onChange={handleChange}
            error={errors.stock}
          />
        </div>

        <div className="form-row">
          <Input
            type="number"
            name="stock_minimo"
            label="Stock Mínimo"
            value={values.stock_minimo}
            onChange={handleChange}
            error={errors.stock_minimo}
          />
        </div>

        {/* Selectores */}
        <div className="form-row">
          <label className="input-label">Laboratorio</label>
          <select
            name="id_laboratorio"
            value={values.id_laboratorio}
            onChange={handleChange}
            className={`select-input ${errors.id_laboratorio ? 'error' : ''}`}
          >
            <option value="">Seleccione un laboratorio</option>
            {laboratorios.map(lab => (
              <option key={lab.id_laboratorio} value={lab.id_laboratorio}>
                {lab.nombre}
              </option>
            ))}
          </select>
          {errors.id_laboratorio && (
            <span className="input-error-message">{errors.id_laboratorio}</span>
          )}
        </div>

        <div className="form-row">
          <label className="input-label">Tipo de Producto</label>
          <select
            name="id_tipo_producto"
            value={values.id_tipo_producto}
            onChange={handleChange}
            className={`select-input ${errors.id_tipo_producto ? 'error' : ''}`}
          >
            <option value="">Seleccione un tipo</option>
            {tiposProducto.map(tipo => (
              <option key={tipo.id_tipo_producto} value={tipo.id_tipo_producto}>
                {tipo.nombre}
              </option>
            ))}
          </select>
          {errors.id_tipo_producto && (
            <span className="input-error-message">{errors.id_tipo_producto}</span>
          )}
        </div>

        <div className="form-row">
          <label className="input-label">Presentación</label>
          <select
            name="id_presentacion"
            value={values.id_presentacion}
            onChange={handleChange}
            className={`select-input ${errors.id_presentacion ? 'error' : ''}`}
          >
            <option value="">Seleccione una presentación</option>
            {presentaciones.map(pres => (
              <option key={pres.id_presentacion} value={pres.id_presentacion}>
                {pres.nombre}
              </option>
            ))}
          </select>
          {errors.id_presentacion && (
            <span className="input-error-message">{errors.id_presentacion}</span>
          )}
        </div>

        <div className="form-row">
          <label className="input-label">Proveedor</label>
          <select
            name="id_proveedor"
            value={values.id_proveedor}
            onChange={handleChange}
            className={`select-input ${errors.id_proveedor ? 'error' : ''}`}
          >
            <option value="">Seleccione un proveedor</option>
            {proveedores.map(prov => (
              <option key={prov.id_proveedor} value={prov.id_proveedor}>
                {prov.nombre}
              </option>
            ))}
          </select>
          {errors.id_proveedor && (
            <span className="input-error-message">{errors.id_proveedor}</span>
          )}
        </div>

        {/* Activo - IMPORTANTE: usar valores 1 o 0 */}
        <div className="form-row checkbox-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="activo"
              checked={values.activo === 1 || values.activo === true}
              onChange={(e) => {
                const newValue = e.target.checked ? 1 : 0
                handleChange({
                  target: {
                    name: 'activo',
                    value: newValue
                  }
                })
              }}
            />
            <span>Producto Activo</span>
          </label>
        </div>

        {/* Botones */}
        <div className="form-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Guardando...' : (producto ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </form>

      {showScanner && (
        <RealBarcodeScanner
          onScan={handleCodigoEscaneado}
          onClose={() => setShowScanner(false)}
          titulo="Escanear Código de Barras"
        />
      )}
    </Modal>
  )
}

export default ProductoForm