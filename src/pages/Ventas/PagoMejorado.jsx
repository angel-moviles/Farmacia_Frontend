import { useState, useEffect } from 'react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Ticket from '../../components/common/Ticket'
import { 
  FiDollarSign, 
  FiCreditCard, 
  FiSmartphone, 
  FiCheckCircle,
  FiPrinter,
  FiMail,
  FiX,
  FiAlertCircle,
  FiCamera,
  FiCameraOff
} from 'react-icons/fi'
import { BsQrCodeScan } from 'react-icons/bs'
import { ventaService } from '../../services/ventaService'
import { productoService } from '../../services/productoService'
import toast from 'react-hot-toast'
import './PagoMejorado.css'

const PagoMejorado = ({ total, carrito, usuarioId, onVentaCompletada, onCancelar }) => {
  const [metodo, setMetodo] = useState('efectivo')
  const [montoRecibido, setMontoRecibido] = useState('')
  const [cambio, setCambio] = useState(0)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [pagoExitoso, setPagoExitoso] = useState(false)
  const [ventaRealizada, setVentaRealizada] = useState(null)
  const [mostrarTicket, setMostrarTicket] = useState(false)
  const [escaneando, setEscaneando] = useState(false)
  const [codigoEscaneado, setCodigoEscaneado] = useState('')
  const [soporteCamara, setSoporteCamara] = useState(false)
  const [videoStream, setVideoStream] = useState(null)
  const [datosFactura, setDatosFactura] = useState({
    requiereFactura: false,
    rfc: '',
    razonSocial: '',
    email: ''
  })
  useEffect(() => {
    verificarSoporteCamara()
  }, [])

  const verificarSoporteCamara = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const tieneCamara = devices.some(device => device.kind === 'videoinput')
      setSoporteCamara(tieneCamara)
    } catch (error) {
      console.log('Error verificando cámara:', error)
      setSoporteCamara(false)
    }
  }

  const iniciarEscaneo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      })
      setVideoStream(stream)
      setEscaneando(true)
      iniciarDeteccionSimulada()
    } catch (error) {
      console.error('Error al acceder a la cámara:', error)
      toast.error('No se pudo acceder a la cámara')
    }
  }

  const detenerEscaneo = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
      setVideoStream(null)
    }
    setEscaneando(false)
    setCodigoEscaneado('')
  }

  const iniciarDeteccionSimulada = () => {
    setTimeout(() => {
      if (escaneando) {
        const codigosSimulados = ['7501234567890', '7509876543210', '7501112223334']
        const codigo = codigosSimulados[Math.floor(Math.random() * codigosSimulados.length)]
        setCodigoEscaneado(codigo)
        procesarCodigoBarras(codigo)
      }
    }, 3000)
  }

  const procesarCodigoBarras = async (codigo) => {
    try {
      const producto = await productoService.buscarPorCodigoBarras(codigo)
      if (producto) {
        toast.success(`Producto encontrado: ${producto.nombre}`)
        detenerEscaneo()
      } else {
        toast.error(`No se encontró producto con código: ${codigo}`)
      }
    } catch (error) {
      toast.error('Error al buscar el producto')
    }
  }

  const metodosPago = [
    { id: 'efectivo', nombre: 'Efectivo', icon: <FiDollarSign />, color: '#27AE60' },
    { id: 'tarjeta', nombre: 'Tarjeta', icon: <FiCreditCard />, color: '#2C3E50' },
    { id: 'transferencia', nombre: 'Transferencia', icon: <FiSmartphone />, color: '#3498DB' }
  ]

  const calcularCambio = (monto) => {
    const montoNum = parseFloat(monto) || 0
    const cambioNum = montoNum - total
    setCambio(cambioNum > 0 ? cambioNum : 0)
    setError('')
  }

  const handleMontoChange = (e) => {
    const monto = e.target.value
    setMontoRecibido(monto)
    calcularCambio(monto)
  }

  const handleMetodoChange = (metodoId) => {
    setMetodo(metodoId)
    setMontoRecibido('')
    setCambio(0)
    setError('')
  }

  const validarPago = () => {
    if (carrito.length === 0) {
      setError('No hay productos en el carrito')
      return false
    }

    if (metodo === 'efectivo') {
      const monto = parseFloat(montoRecibido)
      if (!monto || isNaN(monto)) {
        setError('Ingrese el monto recibido')
        return false
      }
      if (monto < total) {
        setError(`Monto insuficiente. Faltan $${(total - monto).toFixed(2)}`)
        return false
      }
    }

    if (datosFactura.requiereFactura) {
      if (!datosFactura.rfc || datosFactura.rfc.length < 12) {
        setError('RFC inválido')
        return false
      }
      if (!datosFactura.razonSocial) {
        setError('La razón social es requerida para facturar')
        return false
      }
      if (datosFactura.email && !/^\S+@\S+\.\S+$/.test(datosFactura.email)) {
        setError('El email no es válido')
        return false
      }
    }

    setError('')
    return true
  }

  const procesarVenta = async () => {
    if (!validarPago()) return

    setProcesando(true)
    
    try {
      const ventaData = {
        total: total,
        id_usuario: usuarioId,
        productos: carrito.map(item => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal
        }))
      }

      console.log('Enviando venta:', ventaData)
      
      const response = await ventaService.create(ventaData)
      
      console.log('Venta registrada:', response)

      const pagoInfo = {
        metodo,
        total,
        cambio: metodo === 'efectivo' ? cambio : 0,
        fecha: new Date().toISOString(),
        folio: response.data?.id_venta || 'N/A',
        factura: datosFactura.requiereFactura ? datosFactura : null,
        montoRecibido: metodo === 'efectivo' ? parseFloat(montoRecibido) : total,
        usuario: response.data?.usuario || null
      }

      setVentaRealizada(pagoInfo)
      setPagoExitoso(true)
      
      if (onVentaCompletada) {
        onVentaCompletada(pagoInfo)
      }
      
    } catch (error) {
      console.error('Error al procesar venta:', error)
      setError(error.message || 'Error al procesar el pago')
    } finally {
      setProcesando(false)
    }
  }

  const formatMoneda = (valor) => {
    return `$${Number(valor).toFixed(2)}`
  }
  if (pagoExitoso && ventaRealizada) {
    return (
      <Ticket
        venta={{
          id_venta: ventaRealizada.folio,
          fecha: ventaRealizada.fecha,
          usuario: ventaRealizada.usuario,
          montoRecibido: ventaRealizada.montoRecibido
        }}
        carrito={carrito}
        total={total}
        metodoPago={metodo}
        cambio={cambio}
        onCerrar={() => {
          setPagoExitoso(false)
          setMostrarTicket(false)
          setVentaRealizada(null)
          onCancelar()
        }}
      />
    )
  }

  return (
    <div className="pago-mejorado">
      <h3>Método de Pago</h3>
      
      {/* Escáner de código de barras para móvil */}
      {soporteCamara && (
        <div className="scanner-section">
          {!escaneando ? (
            <button 
              className="scanner-btn"
              onClick={iniciarEscaneo}
            >
              <BsQrCodeScan /> Escanear código de barras
            </button>
          ) : (
            <div className="scanner-activo">
              <div className="scanner-header">
                <span>Escaneando...</span>
                <button onClick={detenerEscaneo}>
                  <FiX />
                </button>
              </div>
              <div className="scanner-preview">
                <video 
                  ref={videoRef => {
                    if (videoRef && videoStream) {
                      videoRef.srcObject = videoStream
                      videoRef.play()
                    }
                  }}
                  autoPlay
                  playsInline
                />
                <div className="scanner-overlay">
                  <div className="scanner-line"></div>
                </div>
              </div>
              {codigoEscaneado && (
                <div className="codigo-detectado">
                  Código: {codigoEscaneado}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selector de método de pago */}
      <div className="metodos-grid">
        {metodosPago.map(m => (
          <button
            key={m.id}
            className={`metodo-card ${metodo === m.id ? 'active' : ''}`}
            onClick={() => handleMetodoChange(m.id)}
            style={{ borderColor: metodo === m.id ? m.color : 'var(--borde)' }}
          >
            <div className="metodo-icono" style={{ backgroundColor: `${m.color}20`, color: m.color }}>
              {m.icon}
            </div>
            <span className="metodo-nombre">{m.nombre}</span>
          </button>
        ))}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="pago-error">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {/* Detalles del pago */}
      <div className="detalles-pago">
        <div className="total-pago">
          <span>Total a pagar:</span>
          <span className="total-monto">{formatMoneda(total)}</span>
        </div>

        {metodo === 'efectivo' && (
          <div className="pago-efectivo">
            <Input
              type="number"
              label="Monto recibido"
              placeholder="0.00"
              value={montoRecibido}
              onChange={handleMontoChange}
              icon={<FiDollarSign />}
              min="0"
              step="0.01"
              autoFocus
            />
            
            {montoRecibido && parseFloat(montoRecibido) >= total && (
              <div className="cambio-info">
                <div className="cambio-label">Cambio:</div>
                <div className="cambio-valor">{formatMoneda(cambio)}</div>
              </div>
            )}
          </div>
        )}

        {metodo === 'tarjeta' && (
          <div className="pago-tarjeta">
            <p className="info-mensaje">
              <FiCreditCard /> Inserte o acerque la tarjeta al terminal
            </p>
            <div className="terminal-simulado">
              <div className="terminal-luz verde"></div>
              <span>Terminal lista para procesar pago de {formatMoneda(total)}</span>
            </div>
          </div>
        )}

        {metodo === 'transferencia' && (
          <div className="pago-transferencia">
            <p className="info-mensaje">
              <FiSmartphone /> Datos para transferencia:
            </p>
            <div className="datos-transferencia">
              <p><strong>Banco:</strong> FarmaPOS Bank</p>
              <p><strong>Cuenta:</strong> 1234 5678 9012 3456</p>
              <p><strong>CLABE:</strong> 123456789012345678</p>
              <p><strong>Monto:</strong> {formatMoneda(total)}</p>
              <p><strong>Referencia:</strong> VENTA-{Date.now()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Opción de factura */}
      <div className="factura-opcion">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={datosFactura.requiereFactura}
            onChange={(e) => setDatosFactura({
              ...datosFactura,
              requiereFactura: e.target.checked
            })}
          />
          <span>¿Requiere factura?</span>
        </label>

        {datosFactura.requiereFactura && (
          <div className="factura-datos">
            <Input
              label="RFC"
              placeholder="XXXX000000XXX"
              value={datosFactura.rfc}
              onChange={(e) => setDatosFactura({...datosFactura, rfc: e.target.value.toUpperCase()})}
              maxLength="13"
            />
            <Input
              label="Razón Social"
              placeholder="Nombre o razón social"
              value={datosFactura.razonSocial}
              onChange={(e) => setDatosFactura({...datosFactura, razonSocial: e.target.value})}
            />
            <Input
              type="email"
              label="Email (opcional)"
              placeholder="correo@ejemplo.com"
              value={datosFactura.email}
              onChange={(e) => setDatosFactura({...datosFactura, email: e.target.value})}
            />
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="acciones-pago">
        <Button
          variant="primary"
          size="large"
          fullWidth
          onClick={procesarVenta}
          disabled={procesando || carrito.length === 0}
        >
          {procesando ? 'Procesando...' : 'Cobrar'}
        </Button>
        
        <Button
          variant="outline"
          size="large"
          fullWidth
          onClick={onCancelar}
          className="cancelar-btn"
        >
          Cancelar Venta
        </Button>
      </div>
    </div>
  )
}

export default PagoMejorado