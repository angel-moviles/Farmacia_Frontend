import { useState } from 'react'
import './Reportes.css'
import { FiDownload, FiPrinter, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const TablaReporte = ({ 
  columnas, 
  datos, 
  titulo,
  onExportar,
  onImprimir,
  paginable = true,
  rowsPerPage = 10
}) => {
  const [paginaActual, setPaginaActual] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const [ordenColumna, setOrdenColumna] = useState(null)
  const [ordenDireccion, setOrdenDireccion] = useState('asc')

  // Función segura para formatear valores
  const formatearValor = (valor, columna) => {
    if (valor === undefined || valor === null) {
      return columna.formato ? columna.formato(null) : '—'
    }
    
    if (columna.formato) {
      return columna.formato(valor)
    }
    
    // Si es un número, formatearlo
    if (typeof valor === 'number' && !isNaN(valor)) {
      return valor.toLocaleString()
    }
    
    return valor
  }

  // Filtrar datos
  const datosFiltrados = datos.filter(fila => {
    if (!busqueda) return true
    return Object.values(fila).some(valor => 
      String(valor).toLowerCase().includes(busqueda.toLowerCase())
    )
  })

  // Ordenar datos
  const datosOrdenados = [...datosFiltrados].sort((a, b) => {
    if (!ordenColumna) return 0
    let aVal = a[ordenColumna]
    let bVal = b[ordenColumna]
    
    // Manejar valores nulos/undefined
    if (aVal === undefined || aVal === null) aVal = ''
    if (bVal === undefined || bVal === null) bVal = ''
    
    if (ordenDireccion === 'asc') {
      return aVal > bVal ? 1 : -1
    }
    return aVal < bVal ? 1 : -1
  })

  // Paginar datos
  const totalPaginas = Math.ceil(datosOrdenados.length / rowsPerPage)
  const datosPaginados = paginable
    ? datosOrdenados.slice((paginaActual - 1) * rowsPerPage, paginaActual * rowsPerPage)
    : datosOrdenados

  const handleOrdenar = (columna) => {
    if (ordenColumna === columna) {
      setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc')
    } else {
      setOrdenColumna(columna)
      setOrdenDireccion('asc')
    }
  }

  const formatValor = (fila, columna) => {
    if (columna.render) {
      return columna.render(fila)
    }
    const valor = fila[columna.campo]
    return formatearValor(valor, columna)
  }

  if (!datos || datos.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid var(--borde)'
      }}>
        <FiSearch style={{ fontSize: 48, color: 'var(--texto-secundario)', marginBottom: 16, opacity: 0.5 }} />
        <h4 style={{ fontSize: 18, fontWeight: 600, color: 'var(--texto-principal)', marginBottom: 8 }}>
          No hay datos para mostrar
        </h4>
        <p style={{ color: 'var(--texto-secundario)' }}>
          Intenta con otros filtros o fechas diferentes
        </p>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid var(--borde)',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--borde)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        backgroundColor: 'var(--fondo-principal)'
      }}>
        {titulo && <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--texto-principal)', margin: 0 }}>{titulo}</h3>}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <FiSearch style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--texto-secundario)',
              fontSize: 14
            }} />
            <input
              type="text"
              placeholder="Buscar en tabla..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                padding: '8px 12px 8px 36px',
                border: '1px solid var(--borde)',
                borderRadius: '8px',
                fontSize: 13,
                width: '250px',
                outline: 'none'
              }}
            />
          </div>
          {onExportar && (
            <button 
              onClick={onExportar} 
              style={{
                width: '36px',
                height: '36px',
                border: '1px solid var(--borde)',
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--texto-secundario)'
              }}
              title="Exportar"
            >
              <FiDownload />
            </button>
          )}
          {onImprimir && (
            <button 
              onClick={onImprimir} 
              style={{
                width: '36px',
                height: '36px',
                border: '1px solid var(--borde)',
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--texto-secundario)'
              }}
              title="Imprimir"
            >
              <FiPrinter />
            </button>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '800px'
        }}>
          <thead>
            <tr>
              {columnas.map((col, index) => (
                <th 
                  key={index} 
                  onClick={() => col.ordenable !== false && handleOrdenar(col.campo)}
                  style={{
                    backgroundColor: 'var(--fondo-principal)',
                    padding: '16px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: 'var(--texto-principal)',
                    borderBottom: '2px solid var(--borde)',
                    position: 'sticky',
                    top: 0,
                    cursor: col.ordenable !== false ? 'pointer' : 'default',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {col.titulo}
                    {ordenColumna === col.campo && (
                      <span style={{ color: '#27AE60', fontSize: 12 }}>
                        {ordenDireccion === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datosPaginados.map((fila, index) => (
              <tr key={index}>
                {columnas.map((col, colIndex) => (
                  <td key={colIndex} style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--borde)',
                    color: 'var(--texto-principal)',
                    whiteSpace: 'nowrap'
                  }}>
                    {formatValor(fila, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginable && totalPaginas > 1 && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--borde)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          backgroundColor: 'var(--fondo-principal)'
        }}>
          <button
            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            style={{
              width: '36px',
              height: '36px',
              border: '1px solid var(--borde)',
              background: 'white',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
              opacity: paginaActual === 1 ? 0.3 : 1
            }}
          >
            <FiChevronLeft />
          </button>
          <span style={{ fontSize: 14, color: 'var(--texto-principal)' }}>
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
            style={{
              width: '36px',
              height: '36px',
              border: '1px solid var(--borde)',
              background: 'white',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
              opacity: paginaActual === totalPaginas ? 0.3 : 1
            }}
          >
            <FiChevronRight />
          </button>
        </div>
      )}

      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid var(--borde)',
        backgroundColor: 'var(--fondo-principal)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 13,
        color: 'var(--texto-secundario)'
      }}>
        <span>Total: {datosOrdenados.length} registros</span>
        {datosFiltrados.length !== datos.length && (
          <span>(mostrando {datosFiltrados.length} de {datos.length})</span>
        )}
      </div>
    </div>
  )
}

export default TablaReporte