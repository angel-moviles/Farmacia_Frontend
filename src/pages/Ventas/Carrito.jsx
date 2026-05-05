import { FiShoppingCart, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi'
import './Carrito.css'

const Carrito = ({ 
  items = [], 
  onActualizarCantidad, 
  onEliminar, 
  onCancelarVenta, 
  total 
}) => {
  
  const calcularTotal = () => {
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  }

  const totalArticulos = items.reduce((sum, item) => sum + (item.cantidad || 0), 0)

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '$0.00'
    const numPrice = Number(price)
    if (isNaN(numPrice)) return '$0.00'
    return `$${numPrice.toFixed(2)}`
  }

  console.log('Items en carrito:', items.map(item => ({
    nombre: item.nombre,
    foto_url: item.foto_url
  })))

  if (items.length === 0) {
    return (
      <div className="carrito-vacio">
        <FiShoppingCart className="empty-icon" />
        <p>No hay productos en el carrito</p>
        <small>Busca productos en la columna izquierda</small>
      </div>
    )
  }

  return (
    <div className="carrito">
      <div className="carrito-header">
        <h3>Carrito de Compras</h3>
        <button className="limpiar-carrito" onClick={onCancelarVenta}>
          <FiTrash2 /> Cancelar venta
        </button>
      </div>

      <div className="carrito-items">
        {items.map(item => (
          <div key={item.id_producto} className="carrito-item">
            {/* Foto del producto */}
            <div className="item-foto-container">
              {item.foto_url ? (
                <img 
                  src={item.foto_url} 
                  alt={item.nombre}
                  className="item-foto-img"
                  onError={(e) => {
                    console.log('Error cargando imagen:', item.foto_url)
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = '<div class="item-foto-placeholder">💊</div>'
                  }}
                />
              ) : (
                <div className="item-foto-placeholder"></div>
              )}
            </div>

            {/* Información del producto */}
            <div className="item-info-container">
              <div className="item-info">
                <span className="item-nombre">{item.nombre}</span>
                <span className="item-lote">Lote: {item.lote || 'N/A'}</span>
                <span className="item-precio">{formatPrice(item.precio_unitario)}</span>
              </div>
              
              <div className="item-actions">
                <div className="item-cantidad">
                  <button 
                    onClick={() => onActualizarCantidad(
                      item.id_producto, 
                      (item.cantidad || 1) - 1,
                      item.stock
                    )}
                    className="cantidad-btn"
                    disabled={item.cantidad <= 1}
                  >
                    <FiMinus />
                  </button>
                  <span className="cantidad">{item.cantidad || 0}</span>
                  <button 
                    onClick={() => onActualizarCantidad(
                      item.id_producto, 
                      (item.cantidad || 1) + 1,
                      item.stock
                    )}
                    className="cantidad-btn"
                    disabled={item.cantidad >= item.stock}
                  >
                    <FiPlus />
                  </button>
                </div>
                
                <span className="item-subtotal">{formatPrice(item.subtotal)}</span>
                
                <button 
                  onClick={() => onEliminar(item.id_producto, item.nombre)}
                  className="eliminar-btn"
                  title="Eliminar"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>

            {item.cantidad >= item.stock && (
              <div className="stock-warning">
                ¡Últimas unidades!
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="carrito-resumen">
        <div className="resumen-linea">
          <span>Subtotal:</span>
          <span>{formatPrice(calcularTotal())}</span>
        </div>
        <div className="resumen-linea">
          <span>Artículos:</span>
          <span>{totalArticulos}</span>
        </div>
        <div className="resumen-linea total">
          <span>Total:</span>
          <span className="total-monto">{formatPrice(calcularTotal())}</span>
        </div>
      </div>
    </div>
  )
}

export default Carrito