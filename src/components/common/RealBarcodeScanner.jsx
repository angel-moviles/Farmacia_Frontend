import { useState, useEffect, useRef } from 'react'
import { BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException } from '@zxing/library'
import { FiX, FiCamera, FiAlertCircle, FiCheck } from 'react-icons/fi'
import { BsQrCodeScan } from 'react-icons/bs'
import './BarcodeScanner.css'

const RealBarcodeScanner = ({ onScan, onClose, titulo = "Escanear Código de Barras" }) => {
  const [error, setError] = useState(null)
  const [detectedCode, setDetectedCode] = useState('')
  const [escaneando, setEscaneando] = useState(true)
  const [permisoCamara, setPermisoCamara] = useState(null)
  const videoRef = useRef(null)
  const readerRef = useRef(null)

  useEffect(() => {
    iniciarEscanner()
    return () => {
      detenerEscanner()
    }
  }, [])

  const iniciarEscanner = async () => {
    try {
      // Crear instancia del lector
      const codeReader = new BrowserMultiFormatReader()
      readerRef.current = codeReader

      // Verificar si hay cámaras disponibles
      const videoInputDevices = await codeReader.listVideoInputDevices()
      
      if (videoInputDevices.length === 0) {
        setError('No se encontraron cámaras en este dispositivo')
        return
      }

      // Usar la cámara trasera si está disponible, si no la primera disponible
      const cameraId = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      )?.deviceId || videoInputDevices[0].deviceId

      setPermisoCamara(true)

      // Iniciar escaneo
      codeReader.decodeFromVideoDevice(cameraId, videoRef.current, (result, err) => {
        if (result && escaneando) {
          const codigo = result.getText()
          setDetectedCode(codigo)
          setEscaneando(false)
          
          // Detener el escaneo después de detectar un código
          codeReader.reset()
          
          // Llamar al callback con el código detectado
          if (onScan) {
            onScan(codigo)
          }
          
          // Cerrar después de 1.5 segundos
          setTimeout(() => {
            onClose()
          }, 1500)
        }
        
        // Manejar errores (ignorar errores comunes de escaneo)
        if (err && !(err instanceof NotFoundException || 
                     err instanceof ChecksumException || 
                     err instanceof FormatException)) {
          console.error('Error de escaneo:', err)
        }
      })
      
    } catch (err) {
      console.error('Error al iniciar escáner:', err)
      setError('No se pudo acceder a la cámara. Verifica los permisos.')
      setPermisoCamara(false)
    }
  }

  const detenerEscanner = () => {
    if (readerRef.current) {
      try {
        readerRef.current.reset()
        readerRef.current = null
      } catch (e) {
        console.error('Error al detener escáner:', e)
      }
    }
  }

  const ingresarManual = () => {
    const codigo = prompt('Ingresa el código de barras manualmente:')
    if (codigo && codigo.trim()) {
      setDetectedCode(codigo.trim())
      if (onScan) {
        onScan(codigo.trim())
      }
      setTimeout(() => onClose(), 1000)
    }
  }

  const reintentar = () => {
    setError(null)
    setDetectedCode('')
    setEscaneando(true)
    iniciarEscanner()
  }

  return (
    <div className="scanner-modal-overlay">
      <div className="scanner-modal">
        <div className="scanner-header">
          <h3>
            <BsQrCodeScan /> {titulo}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="scanner-viewport">
          {error ? (
            <div className="scanner-error">
              <FiAlertCircle className="error-icon" />
              <p>{error}</p>
              <div className="error-actions">
                <button onClick={ingresarManual} className="manual-btn">
                  Ingresar manualmente
                </button>
                <button onClick={reintentar} className="retry-btn">
                  Reintentar
                </button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="scanner-video"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="scanner-overlay">
                <div className="scanner-frame">
                  <div className="scanner-line"></div>
                </div>
              </div>
              {detectedCode && (
                <div className="scanner-success">
                  <FiCheck className="success-icon" />
                  <p>Código detectado: <strong>{detectedCode}</strong></p>
                  <p className="success-message">Producto agregado correctamente</p>
                </div>
              )}
              {escaneando && !detectedCode && (
                <div className="scanner-instruction">
                  <p>Alinea el código de barras dentro del marco</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="scanner-footer">
          <button onClick={ingresarManual} className="manual-input-btn">
            Ingresar código manualmente
          </button>
          <button onClick={onClose} className="cancel-scan-btn">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default RealBarcodeScanner