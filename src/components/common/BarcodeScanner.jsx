import { useState, useEffect, useRef } from 'react'
import { FiCamera, FiX, FiCameraOff } from 'react-icons/fi'
import { BsQrCodeScan } from 'react-icons/bs'
import './BarcodeScanner.css'

const BarcodeScanner = ({ onScan, onClose, productoService }) => {
  const [videoStream, setVideoStream] = useState(null)
  const [scanning, setScanning] = useState(true)
  const [error, setError] = useState(null)
  const [detectedCode, setDetectedCode] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    iniciarCamara()
    return () => {
      detenerCamara()
    }
  }, [])

  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      setVideoStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      iniciarDeteccion()
    } catch (err) {
      console.error('Error al acceder a la cámara:', err)
      setError('No se pudo acceder a la cámara. Verifica los permisos.')
    }
  }

  const detenerCamara = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
      setVideoStream(null)
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }

  let animationFrameId = null

  const iniciarDeteccion = () => {
    const detectar = async () => {
      if (!videoRef.current || !canvasRef.current || !scanning) return

      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')

      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Simulación de detección de código de barras
        // En producción, aquí usarías una librería real como @zxing/library o QuaggaJS
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        
        // Simulación: detectar si hay cambios en la imagen (simulando un código)
        // Esto es solo para demostración - reemplazar con librería real
        const hasCode = Math.random() > 0.95
        
        if (hasCode && detectedCode === '') {
          const codigosSimulados = [
            '7501234567890',
            '7509876543210',
            '7501112223334',
            '7504445556667'
          ]
          const codigo = codigosSimulados[Math.floor(Math.random() * codigosSimulados.length)]
          setDetectedCode(codigo)
          await procesarCodigo(codigo)
        }
      }

      animationFrameId = requestAnimationFrame(detectar)
    }

    detectar()
  }

  const procesarCodigo = async (codigo) => {
    if (!onScan) return
    
    try {
      const producto = await productoService.buscarPorCodigoBarras(codigo)
      if (producto) {
        onScan(producto)
        setScanning(false)
        setTimeout(() => {
          detenerCamara()
          onClose()
        }, 1500)
      } else {
        setError(`Producto no encontrado: ${codigo}`)
        setTimeout(() => setError(null), 2000)
      }
    } catch (error) {
      console.error('Error al procesar código:', error)
      setError('Error al buscar el producto')
      setTimeout(() => setError(null), 2000)
    }
  }

  const ingresarManual = () => {
    const codigo = prompt('Ingresa el código de barras manualmente:')
    if (codigo && codigo.trim()) {
      procesarCodigo(codigo.trim())
    }
  }

  return (
    <div className="scanner-modal-overlay">
      <div className="scanner-modal">
        <div className="scanner-header">
          <h3>
            <BsQrCodeScan /> Escanear Código de Barras
          </h3>
          <button className="close-btn" onClick={() => { detenerCamara(); onClose(); }}>
            <FiX />
          </button>
        </div>

        <div className="scanner-viewport">
          {error ? (
            <div className="scanner-error">
              <FiCameraOff />
              <p>{error}</p>
              <button onClick={ingresarManual} className="manual-btn">
                Ingresar manualmente
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="scanner-video"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div className="scanner-overlay">
                <div className="scanner-frame">
                  <div className="scanner-line"></div>
                </div>
              </div>
              {detectedCode && (
                <div className="scanner-success">
                  <p>✓ Producto encontrado</p>
                  <p>Código: {detectedCode}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="scanner-footer">
          <button onClick={ingresarManual} className="manual-input-btn">
            Ingresar código manualmente
          </button>
          <button onClick={() => { detenerCamara(); onClose(); }} className="cancel-scan-btn">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default BarcodeScanner