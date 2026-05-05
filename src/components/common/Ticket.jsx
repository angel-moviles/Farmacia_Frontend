import { useState, useEffect, useRef } from 'react'
import { FiPrinter, FiDownload, FiX, FiCheckCircle, FiFileText } from 'react-icons/fi'
import Button from './Button'
import Card from './Card'
import './Ticket.css'

const Ticket = ({ venta, carrito, total, metodoPago, cambio, onCerrar }) => {
  const [imprimiendo, setImprimiendo] = useState(false)
  const ticketRef = useRef(null)

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatMoneda = (valor) => {
    return `$${Number(valor).toFixed(2)}`
  }

  const generarTicketHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket de Venta</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            padding: 20px;
            background: white;
          }
          .ticket {
            max-width: 300px;
            margin: 0 auto;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .header h1 {
            font-size: 18px;
            margin: 0;
          }
          .header p {
            font-size: 10px;
            margin: 5px 0;
          }
          .info {
            margin-bottom: 15px;
            padding: 5px 0;
          }
          .info-line {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .items {
            margin: 15px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .item-name {
            flex: 2;
          }
          .item-qty {
            width: 40px;
            text-align: center;
          }
          .item-price {
            width: 70px;
            text-align: right;
          }
          .item-subtotal {
            width: 70px;
            text-align: right;
          }
          .totales {
            margin: 15px 0;
            border-top: 1px dashed #000;
            padding-top: 10px;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .total-line.total {
            font-weight: bold;
            font-size: 14px;
            margin-top: 10px;
            padding-top: 5px;
            border-top: 1px solid #000;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px dashed #000;
            font-size: 10px;
          }
          .gracias {
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <h1>FarmaPOS</h1>
            <p>Sistema de Gestión de Farmacia</p>
            <p>Av. Principal #123, Col. Centro</p>
            <p>Tel: 555-123-4567</p>
          </div>

          <div class="info">
            <div class="info-line">
              <span>Ticket: #${String(venta.id_venta || 'N/A').padStart(6, '0')}</span>
              <span>${formatFecha(venta.fecha || new Date())}</span>
            </div>
            <div class="info-line">
              <span>Cajero:</span>
              <span>${venta.usuario?.nombre || 'Admin'} ${venta.usuario?.a_paterno || ''}</span>
            </div>
          </div>

          <div class="items">
            <div class="item">
              <span class="item-name">Producto</span>
              <span class="item-qty">Cant</span>
              <span class="item-price">Precio</span>
              <span class="item-subtotal">Subtotal</span>
            </div>
            ${carrito.map(item => `
              <div class="item">
                <span class="item-name">${item.nombre}</span>
                <span class="item-qty">${item.cantidad}</span>
                <span class="item-price">${formatMoneda(item.precio_unitario)}</span>
                <span class="item-subtotal">${formatMoneda(item.subtotal)}</span>
              </div>
            `).join('')}
          </div>

          <div class="totales">
            <div class="total-line">
              <span>SUBTOTAL:</span>
              <span>${formatMoneda(total)}</span>
            </div>
            <div class="total-line">
              <span>IVA (16%):</span>
              <span>${formatMoneda(total * 0.16)}</span>
            </div>
            <div class="total-line total">
              <span>TOTAL:</span>
              <span>${formatMoneda(total)}</span>
            </div>
            ${metodoPago === 'efectivo' && cambio > 0 ? `
              <div class="total-line">
                <span>EFECTIVO:</span>
                <span>${formatMoneda(parseFloat(venta.montoRecibido) || total + cambio)}</span>
              </div>
              <div class="total-line">
                <span>CAMBIO:</span>
                <span>${formatMoneda(cambio)}</span>
              </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>Método de pago: ${metodoPago === 'efectivo' ? 'EFECTIVO' : 
                                 metodoPago === 'tarjeta' ? 'TARJETA' : 'TRANSFERENCIA'}</p>
            <p>¡Gracias por su compra!</p>
            <p>Válido como comprobante de pago</p>
            <div class="gracias">
              <p>¡Vuelva pronto!</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  const imprimirTicket = () => {
    setImprimiendo(true)
    const ventana = window.open('', '_blank')
    ventana.document.write(generarTicketHTML())
    ventana.document.close()
    ventana.print()
    ventana.onafterprint = () => {
      setImprimiendo(false)
    }
  }

  const descargarPDF = () => {
    const ventana = window.open('', '_blank')
    ventana.document.write(generarTicketHTML())
    ventana.document.close()
    ventana.print()
  }

  return (
    <div className="ticket-modal-overlay">
      <div className="ticket-modal">
        <div className="ticket-modal-header">
          <h2>
            <FiFileText /> Ticket de Venta
          </h2>
          <button className="close-btn" onClick={onCerrar}>
            <FiX />
          </button>
        </div>

        <div className="ticket-content" ref={ticketRef}>
          <div className="ticket-preview">
            <div className="ticket-header">
              <h1>FarmaPOS</h1>
              <p>Sistema de Gestión de Farmacia</p>
              <p>Av. Principal #123, Col. Centro</p>
              <p>Tel: 555-123-4567</p>
            </div>

            <div className="ticket-info">
              <div className="info-line">
                <span>Ticket: #{String(venta.id_venta || 'N/A').padStart(6, '0')}</span>
                <span>{formatFecha(venta.fecha || new Date())}</span>
              </div>
              <div className="info-line">
                <span>Cajero:</span>
                <span>{venta.usuario?.nombre || 'Admin'} {venta.usuario?.a_paterno || ''}</span>
              </div>
            </div>

            <div className="ticket-items">
              <div className="items-header">
                <span className="item-name">Producto</span>
                <span className="item-qty">Cant</span>
                <span className="item-price">Precio</span>
                <span className="item-subtotal">Subtotal</span>
              </div>
              {carrito.map((item, idx) => (
                <div key={idx} className="item-row">
                  <span className="item-name">{item.nombre}</span>
                  <span className="item-qty">{item.cantidad}</span>
                  <span className="item-price">{formatMoneda(item.precio_unitario)}</span>
                  <span className="item-subtotal">{formatMoneda(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="ticket-totales">
              <div className="total-line">
                <span>SUBTOTAL:</span>
                <span>{formatMoneda(total)}</span>
              </div>
              <div className="total-line">
                <span>IVA (16%):</span>
                <span>{formatMoneda(total * 0.16)}</span>
              </div>
              <div className="total-line total">
                <span>TOTAL:</span>
                <span>{formatMoneda(total)}</span>
              </div>
              {metodoPago === 'efectivo' && cambio > 0 && (
                <>
                  <div className="total-line">
                    <span>EFECTIVO:</span>
                    <span>{formatMoneda(parseFloat(venta.montoRecibido) || total + cambio)}</span>
                  </div>
                  <div className="total-line">
                    <span>CAMBIO:</span>
                    <span>{formatMoneda(cambio)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="ticket-footer">
              <p>Método de pago: {metodoPago === 'efectivo' ? 'EFECTIVO' : 
                                   metodoPago === 'tarjeta' ? 'TARJETA' : 'TRANSFERENCIA'}</p>
              <p>¡Gracias por su compra!</p>
              <p className="gracias">¡Vuelva pronto!</p>
            </div>
          </div>
        </div>

        <div className="ticket-actions">
          <Button 
            variant="primary" 
            onClick={imprimirTicket}
            disabled={imprimiendo}
            icon={<FiPrinter />}
          >
            {imprimiendo ? 'Imprimiendo...' : 'Imprimir Ticket'}
          </Button>
          <Button 
            variant="outline" 
            onClick={descargarPDF}
            icon={<FiDownload />}
          >
            Guardar como PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={onCerrar}
            icon={<FiCheckCircle />}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Ticket