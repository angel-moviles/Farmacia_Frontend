import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Carrito from './Carrito'
import PagoMejorado from './PagoMejorado'
import RealBarcodeScanner from '../../components/common/RealBarcodeScanner'
import { FiSearch, FiShoppingCart, FiDollarSign, FiX, FiCamera } from 'react-icons/fi'
import { productoService } from '../../services/productoService'
import { ventaService } from '../../services/ventaService'
import { debounce } from '../../utils/helpers'
import toast from 'react-hot-toast'
import './Ventas.css'

const Ventas = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [carrito, setCarrito] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [modoBusqueda, setModoBusqueda] = useState('texto')
  const [showScanner, setShowScanner] = useState(false)
  const inputRef = useRef(null)
  const [pago, setPago] = useState({
    metodo: 'efectivo',
    montoRecibido: '',
    cambio: 0
  })

  const handleProductoEscaneado = async (codigo) => {
    try {
      console.log('Código escaneado en ventas:', codigo)
      
      const producto = await productoService.buscarPorCodigoBarras(codigo)
      
      if (producto) {
        console.log('Producto encontrado:', producto.nombre)
        agregarAlCarrito(producto)
        toast.success(`Producto encontrado: ${producto.nombre}`, {
          icon: '✅',
          duration: 2000
        })
      } else {
        toast.error(`No se encontró producto con código: ${codigo}`, {
          icon: '❌',
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Error al buscar producto:', error)
      toast.error('Error al buscar el producto')
    }
  }
  const handleVentaCompletada = (pagoInfo) => {
    console.log('Venta completada:', pagoInfo)
    setCarrito([])
    setPago({
      metodo: 'efectivo',
      montoRecibido: '',
      cambio: 0
    })
    toast.success('Venta procesada exitosamente')
  }

  useEffect(() => {
    let barcode = ''
    let lastKeyTime = Date.now()

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (barcode.length > 0) {
          e.preventDefault()
          handleProductoEscaneado(barcode)
          barcode = ''
        }
        return
      }

      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') {
        return
      }

      const currentTime = Date.now()
      if (currentTime - lastKeyTime > 50) {
        barcode = e.key
      } else {
        barcode += e.key
      }
      
      lastKeyTime = currentTime
    }

    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const buscarProductos = useCallback(
    debounce(async (term) => {
      if (term.length < 2) {
        setSearchResults([])
        setShowSearchResults(false)
        return
      }

      setSearching(true)
      try {
        const productos = await productoService.getAll()
        const filtered = productos.filter(p => 
          p.nombre?.toLowerCase().includes(term.toLowerCase()) ||
          p.lote?.toLowerCase().includes(term.toLowerCase()) ||
          (p.codigo_barras && p.codigo_barras.toLowerCase().includes(term.toLowerCase())) ||
          p.id_producto?.toString().includes(term)
        )
        setSearchResults(filtered)
        setShowSearchResults(true)
      } catch (error) {
        console.error('Error al buscar productos:', error)
        toast.error('Error al buscar productos')
      } finally {
        setSearching(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    if (modoBusqueda === 'texto') {
      buscarProductos(searchTerm)
    }
  }, [searchTerm, buscarProductos, modoBusqueda])

  const handleSearchChange = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    setModoBusqueda('texto')
  }

  const cambiarModoBusqueda = (modo) => {
    setModoBusqueda(modo)
    setSearchTerm('')
    setSearchResults([])
    setShowSearchResults(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const agregarAlCarrito = (producto) => {
  if (producto.stock <= 0) {
        toast.error('Producto sin stock disponible')
        return
      }

      console.log('Producto agregado al carrito:', {
        id: producto.id_producto,
        nombre: producto.nombre,
        foto_url: producto.foto_url
      })

      const precioUnitario = Number(producto.precio_venta) || 0
      const cantidad = 1
      const subtotal = precioUnitario * cantidad

      const existe = carrito.find(item => item.id_producto === producto.id_producto)
      
      if (existe) {
        if (existe.cantidad >= producto.stock) {
          toast.error('No hay suficiente stock')
          return
        }
        
        const nuevaCantidad = existe.cantidad + 1
        const nuevoSubtotal = existe.precio_unitario * nuevaCantidad
        
        setCarrito(carrito.map(item =>
          item.id_producto === producto.id_producto
            ? { 
                ...item, 
                cantidad: nuevaCantidad, 
                subtotal: nuevoSubtotal
              }
            : item
        ))
        toast.success(`${producto.nombre} x${nuevaCantidad}`, {
          icon: '➕'
        })
      } else {
        setCarrito([...carrito, {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          precio_unitario: precioUnitario,
          cantidad: cantidad,
          subtotal: subtotal,
          stock: producto.stock,
          lote: producto.lote,
          codigo_barras: producto.codigo_barras,
          foto_url: producto.foto_url  // <-- IMPORTANTE: foto_url
        }])
        toast.success(`${producto.nombre} agregado`, {
          icon: '✅'
        })
      }
      
      setSearchTerm('')
      setSearchResults([])
      setShowSearchResults(false)
    }

  const eliminarDelCarrito = (id, nombre) => {
    setCarrito(carrito.filter(item => item.id_producto !== id))
    toast.success(`${nombre} eliminado`, {
      icon: '🗑️'
    })
  }

  const actualizarCantidad = (id, nuevaCantidad, stock) => {
  if (nuevaCantidad < 1) {
    const producto = carrito.find(item => item.id_producto === id)
    if (window.confirm('¿Eliminar producto del carrito?')) {
      eliminarDelCarrito(id, producto.nombre)
    }
    return
  }
  
  if (nuevaCantidad > stock) {
    toast.error(`Solo hay ${stock} unidades disponibles`)
    return
  }
  
  setCarrito(carrito.map(item =>
    item.id_producto === id
      ? { 
          ...item, 
          cantidad: nuevaCantidad, 
          subtotal: item.precio_unitario * nuevaCantidad
        }
      : item
  ))
}
  

  const cancelarVenta = () => {
    if (carrito.length === 0) return
    
    if (window.confirm('¿Estás seguro de cancelar la venta?')) {
      setCarrito([])
      setPago({
        metodo: 'efectivo',
        montoRecibido: '',
        cambio: 0
      })
      toast.success('Venta cancelada')
    }
  }

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + item.subtotal, 0)
  }

  return (
    <div className="ventas-page">
      <div className="ventas-grid">
        {/* Columna izquierda - Búsqueda */}
        <div className="ventas-col left-col">
          <Card className="search-section">
            <div className="search-header">
              <h3>Buscar Productos</h3>
              <div className="modos-busqueda">
                <button
                  className={`modo-btn ${modoBusqueda === 'texto' ? 'active' : ''}`}
                  onClick={() => cambiarModoBusqueda('texto')}
                >
                  <FiSearch /> Texto
                </button>
                <button
                  className={`modo-btn ${modoBusqueda === 'codigo' ? 'active' : ''}`}
                  onClick={() => cambiarModoBusqueda('codigo')}
                >
                  <FiCamera /> Código
                </button>
                <button
                  className="modo-btn scanner-btn"
                  onClick={() => setShowScanner(true)}
                  title="Abrir escáner de cámara"
                >
                  <FiCamera /> Escáner
                </button>
              </div>
            </div>

            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                ref={inputRef}
                type="text"
                placeholder={modoBusqueda === 'codigo' 
                  ? "Escanee o ingrese código de barras..." 
                  : "Nombre, lote o código de barras..."}
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                className="search-input"
                autoFocus
              />
              {searchTerm && (
                <button 
                  className="search-clear"
                  onClick={() => {
                    setSearchTerm('')
                    setSearchResults([])
                    setShowSearchResults(false)
                  }}
                >
                  <FiX />
                </button>
              )}
            </div>

            {modoBusqueda === 'codigo' && (
              <div className="codigo-info">
                <p>Escanea un código de barras o ingrésalo manualmente y presiona Enter</p>
              </div>
            )}
            
            {searching && (
              <div className="search-loading">
                <div className="spinner"></div>
                <span>Buscando productos...</span>
              </div>
            )}
            
            {modoBusqueda === 'texto' && showSearchResults && searchResults.length > 0 && (
              <div className="search-results">
                <div className="search-results-header">
                  <span>{searchResults.length} producto(s) encontrado(s)</span>
                </div>
                {searchResults.map(producto => (
                  <div
                    key={producto.id_producto}
                    className={`search-result-item ${producto.stock <= 0 ? 'sin-stock' : ''}`}
                    onClick={() => producto.stock > 0 && agregarAlCarrito(producto)}
                  >
                      <div className="result-foto">
                        {producto.foto_url ? (
                          <img src={producto.foto_url} alt={producto.nombre} />
                        ) : (
                          <span></span>
                        )}
                      </div>
                    <div className="result-info">
                      <span className="result-nombre">{producto.nombre}</span>
                      <span className="result-detalles">
                        {producto.codigo_barras && (
                          <span className="codigo-badge">Código: {producto.codigo_barras}</span>
                        )}
                        Lote: {producto.lote} | Stock: {producto.stock}
                      </span>
                    </div>
                    <div className="result-precio">
                      <span className="precio">${producto.precio_venta?.toFixed(2)}</span>
                      {producto.stock <= 0 && (
                        <span className="sin-stock-badge">Sin stock</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Teclado numérico solo para modo texto */}
          {modoBusqueda === 'texto' && (
            <Card className="teclado-section">
              <h3>Búsqueda Rápida</h3>
              <div className="teclado-numerico">
                {[1,2,3,4,5,6,7,8,9,0].map(num => (
                  <button
                    key={num}
                    className="tecla"
                    onClick={() => setSearchTerm(searchTerm + num)}
                  >
                    {num}
                  </button>
                ))}
                <button
                  className="tecla tecla-clear"
                  onClick={() => setSearchTerm(searchTerm.slice(0, -1))}
                >
                  ⌫
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* Columna central - Carrito */}
        <div className="ventas-col center-col">
          <Card className="carrito-section">
            <Carrito
              items={carrito}
              onActualizarCantidad={actualizarCantidad}
              onEliminar={eliminarDelCarrito}
              onCancelarVenta={cancelarVenta}
              total={calcularTotal()}
            />
          </Card>
        </div>

        {/* Columna derecha - Pago Mejorado */}
        <div className="ventas-col right-col">
          <Card className="pago-section">
            <PagoMejorado
              total={calcularTotal()}
              carrito={carrito}
              usuarioId={user?.id_usuario}
              onVentaCompletada={handleVentaCompletada}
              onCancelar={cancelarVenta}
            />
          </Card>
        </div>
      </div>

      {/* Modal del escáner de ventas */}
      {showScanner && (
        <RealBarcodeScanner
          onScan={handleProductoEscaneado}
          onClose={() => setShowScanner(false)}
          titulo="Escanear Producto para Venta"
        />
      )}
    </div>
  )
}

export default Ventas