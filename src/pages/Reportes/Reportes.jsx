import { useState, useEffect } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import GraficaVentas from '../../components/reportes/GraficaVentas'
import GraficaProductos from '../../components/reportes/GraficaProductos'
import GraficaInventario from '../../components/reportes/GraficaInventario'
import TablaReporte from '../../components/reportes/TablaReporte'
import { reporteService } from '../../services/reporteService'
import { 
  FiDownload, 
  FiBarChart2, 
  FiTrendingUp,
  FiFilter,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiPackage,
  FiUsers,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import './Reportes.css'
import { exportService } from '../../services/exportService'

const Reportes = () => {
  const [tipoReporte, setTipoReporte] = useState('ventas')
  const [tipoGrafica, setTipoGrafica] = useState('linea')
  const [tipoGraficaInventario, setTipoGraficaInventario] = useState('barras')
  const [loading, setLoading] = useState(false)
  const [datos, setDatos] = useState(null)
  const [fechas, setFechas] = useState({
    fecha_inicio: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0]
  })
  const [filtros, setFiltros] = useState({
    tipo: '',
    laboratorio: '',
    estado: 'todos'
  })
  const [vista, setVista] = useState('completa')

  useEffect(() => {
    generarReporte()
  }, [tipoReporte])

  const generarReporte = async () => {
    setLoading(true)
    try {
      let data
      switch(tipoReporte) {
        case 'ventas':
          data = await reporteService.getVentasPorPeriodo(fechas.fecha_inicio, fechas.fecha_fin)
          break
        case 'productos':
          data = await reporteService.getProductosMasVendidos(fechas.fecha_inicio, fechas.fecha_fin, 10)
          break
        case 'inventario':
          const filtrosInventario = {}
          if (filtros.estado !== 'todos') {
            filtrosInventario.estado = filtros.estado
          }
          if (filtros.tipo) {
            filtrosInventario.tipo = filtros.tipo
          }
          if (filtros.laboratorio) {
            filtrosInventario.laboratorio = filtros.laboratorio
          }
          data = await reporteService.getInventario(filtrosInventario)
          break
        case 'movimientos':
          data = await reporteService.getMovimientosInventario(fechas.fecha_inicio, fechas.fecha_fin)
          break
        case 'usuarios':
          data = await reporteService.getVentasPorUsuario(fechas.fecha_inicio, fechas.fecha_fin)
          break
        default:
          data = null
      }
      
      console.log('Datos recibidos:', data)
      
      if (data && data.success) {
        setDatos(data)
        toast.success('Reporte generado correctamente')
      } else {
        toast.error(data?.message || 'Error al generar reporte')
      }
    } catch (error) {
      console.error('Error al generar reporte:', error)
      toast.error('Error al generar el reporte')
    } finally {
      setLoading(false)
    }
  }

  const formatMoneda = (valor) => {
    if (valor === undefined || valor === null) return '$0.00'
    const numValor = Number(valor)
    if (isNaN(numValor)) return '$0.00'
    return `$${numValor.toFixed(2)}`
  }

  const getEstadoBadge = (estado) => {
    switch(estado) {
      case 'normal':
        return { icon: <FiCheckCircle />, text: 'Normal', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
      case 'bajo':
        return { icon: <FiAlertTriangle />, text: 'Stock Bajo', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }
      case 'sin_stock':
        return { icon: <FiXCircle />, text: 'Sin Stock', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
      default:
        return { icon: <FiPackage />, text: 'Normal', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' }
    }
  }

  // ==========================================
  // RENDER DE VENTAS
  // ==========================================
  const renderVentas = () => {
    if (!datos) return null

    const ventasPorDia = datos.ventas_por_dia || []
    const totales = datos.totales || {}

    return (
      <>
        <div className="totales-grid">
          <div className="total-card">
            <span className="label">Total Ventas</span>
            <span className="value">{totales.total_ventas || 0}</span>
          </div>
          <div className="total-card">
            <span className="label">Total Ingresos</span>
            <span className="value">{formatMoneda(totales.total_ingresos)}</span>
          </div>
          <div className="total-card">
            <span className="label">Ticket Promedio</span>
            <span className="value">{formatMoneda(totales.ticket_promedio)}</span>
          </div>
        </div>
        {ventasPorDia.length > 0 && (vista === 'completa' || vista === 'grafica') && (
          <GraficaVentas data={ventasPorDia} tipo={tipoGrafica} />
        )}
        {(vista === 'completa' || vista === 'tabla') && (
          <TablaReporte
            titulo="Ventas por Día"
            columnas={[
              { titulo: 'Fecha', campo: 'fecha', ordenable: true },
              { titulo: 'Cantidad', campo: 'cantidad', ordenable: true },
              { titulo: 'Total', campo: 'total', formato: (val) => formatMoneda(val), ordenable: true }
            ]}
            datos={ventasPorDia}
            onExportar={() => handleExportar('csv', 'ventas')}
          />
        )}
      </>
    )
  }

  // ==========================================
  // RENDER DE PRODUCTOS MÁS VENDIDOS
  // ==========================================
  const renderProductosMasVendidos = () => {
    if (!datos) return null

    const productos = datos.productos || []

    return (
      <>
        <div className="totales-grid">
          <div className="total-card">
            <span className="label">Total Unidades</span>
            <span className="value">{datos.total_cantidad || 0}</span>
          </div>
          <div className="total-card">
            <span className="label">Total Ingresos</span>
            <span className="value">{formatMoneda(datos.total_ingresos)}</span>
          </div>
        </div>
        {productos.length > 0 && (vista === 'completa' || vista === 'grafica') && (
          <GraficaProductos data={productos} tipo={tipoGrafica === 'linea' ? 'barras' : 'pastel'} />
        )}
        {(vista === 'completa' || vista === 'tabla') && (
          <TablaReporte
            titulo="Productos Más Vendidos"
            columnas={[
              { titulo: 'Producto', campo: 'nombre', ordenable: true },
              { titulo: 'Cantidad', campo: 'cantidad', ordenable: true },
              { titulo: 'Total', campo: 'total', formato: (val) => formatMoneda(val), ordenable: true }
            ]}
            datos={productos}
            onExportar={() => handleExportar('csv', 'productos')}
          />
        )}
      </>
    )
  }

  // ==========================================
  // RENDER DE INVENTARIO
  // ==========================================
  const renderInventario = () => {
    if (!datos || !datos.productos) return null

    const { productos, resumen } = datos

    let productosFiltrados = productos
    if (filtros.estado !== 'todos') {
      productosFiltrados = productos.filter(p => p.estado === filtros.estado)
    }

    // Preparar datos para la gráfica
    const datosGrafica = productosFiltrados.map(producto => ({
      nombre: producto.nombre,
      stock: producto.stock,
      stockMinimo: producto.stock_minimo,
      estado: producto.estado
    }))

    return (
      <>
        <div className="totales-grid">
          <div className="total-card">
            <span className="label">Total Productos</span>
            <span className="value">{resumen?.total_productos || 0}</span>
          </div>
          <div className="total-card">
            <span className="label">Con Stock</span>
            <span className="value">{resumen?.con_stock || 0}</span>
          </div>
          <div className="total-card">
            <span className="label">Sin Stock</span>
            <span className="value">{resumen?.sin_stock || 0}</span>
          </div>
          <div className="total-card">
            <span className="label">Stock Bajo</span>
            <span className="value">{resumen?.stock_bajo || 0}</span>
          </div>
          <div className="total-card">
            <span className="label">Valor Inventario</span>
            <span className="value">{formatMoneda(resumen?.valor_total)}</span>
          </div>
        </div>

        {/* Selector de tipo de gráfica para inventario */}
        {(vista === 'completa' || vista === 'grafica') && (
          <div className="grafica-selector">
            <button
              className={`grafica-btn ${tipoGraficaInventario === 'barras' ? 'active' : ''}`}
              onClick={() => setTipoGraficaInventario('barras')}
            >
              Barras
            </button>
            <button
              className={`grafica-btn ${tipoGraficaInventario === 'linea' ? 'active' : ''}`}
              onClick={() => setTipoGraficaInventario('linea')}
            >
              Línea
            </button>
            <button
              className={`grafica-btn ${tipoGraficaInventario === 'pastel' ? 'active' : ''}`}
              onClick={() => setTipoGraficaInventario('pastel')}
            >
              Pastel
            </button>
          </div>
        )}

        <div className="filtros-inventario">
          <select 
            className="filtro-select"
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          >
            <option value="todos">Todos los productos</option>
            <option value="bajo">Stock bajo</option>
            <option value="sin_stock">Sin stock</option>
          </select>
        </div>

        {datosGrafica.length > 0 && (vista === 'completa' || vista === 'grafica') && (
          <GraficaInventario data={datosGrafica} tipo={tipoGraficaInventario} />
        )}

        {(vista === 'completa' || vista === 'tabla') && (
          <TablaReporte
            titulo="Inventario Detallado"
            columnas={[
              { titulo: 'Producto', campo: 'nombre', ordenable: true },
              { titulo: 'Lote', campo: 'lote', ordenable: true },
              { 
                titulo: 'Stock', 
                campo: 'stock', 
                render: (row) => (
                  <span style={{ 
                    fontWeight: row.stock <= row.stock_minimo ? 'bold' : 'normal',
                    color: row.stock <= 0 ? '#ef4444' : (row.stock <= row.stock_minimo ? '#f59e0b' : '#10b981')
                  }}>
                    {row.stock}
                  </span>
                ),
                ordenable: true 
              },
              { titulo: 'Stock Mínimo', campo: 'stock_minimo', ordenable: true },
              { titulo: 'Precio', campo: 'precio', formato: (val) => formatMoneda(val), ordenable: true },
              { titulo: 'Laboratorio', campo: 'laboratorio', ordenable: true },
              { titulo: 'Tipo', campo: 'tipo', ordenable: true },
              { 
                titulo: 'Estado', 
                campo: 'estado', 
                render: (row) => {
                  const badge = getEstadoBadge(row.estado)
                  return (
                    <span style={{ backgroundColor: badge.bg, color: badge.color, padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                      {badge.icon} {badge.text}
                    </span>
                  )
                }
              }
            ]}
            datos={productosFiltrados}
            onExportar={() => handleExportar('csv', 'inventario')}
          />
        )}
      </>
    )
  }

  // ==========================================
  // RENDER DE MOVIMIENTOS
  // ==========================================
  const renderMovimientos = () => {
    if (!datos || !datos.movimientos) return null

    const { movimientos, resumen } = datos

    return (
      <>
        <div className="totales-grid">
          <div className="total-card">
            <span className="label">Total Movimientos</span>
            <span className="value">{resumen?.total_movimientos || 0}</span>
          </div>
          <div className="total-card">
            <span className="label">Total Salidas</span>
            <span className="value" style={{ color: '#e74c3c' }}>{resumen?.total_salidas || 0}</span>
          </div>
          <div className="total-card">
            <span className="label">Total Entradas</span>
            <span className="value" style={{ color: '#27ae60' }}>{resumen?.total_entradas || 0}</span>
          </div>
        </div>

        {(vista === 'completa' || vista === 'tabla') && (
          <TablaReporte
            titulo="Movimientos de Inventario"
            columnas={[
              { titulo: 'Fecha', campo: 'fecha', ordenable: true },
              { titulo: 'Producto', campo: 'producto', ordenable: true },
              { 
                titulo: 'Tipo', 
                campo: 'tipo', 
                render: (row) => (
                  <span style={{ 
                    color: row.tipo === 'Salida' ? '#e74c3c' : '#27ae60',
                    fontWeight: 600,
                    backgroundColor: row.tipo === 'Salida' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(39, 174, 96, 0.1)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    {row.tipo}
                  </span>
                ),
                ordenable: true 
              },
              { titulo: 'Cantidad', campo: 'cantidad', ordenable: true },
              { 
                titulo: 'Total', 
                campo: 'total', 
                formato: (val) => formatMoneda(val), 
                ordenable: true 
              },
              { titulo: 'Motivo', campo: 'motivo', ordenable: true }
            ]}
            datos={movimientos}
            onExportar={() => handleExportar('csv', 'movimientos')}
          />
        )}
      </>
    )
  }

  // ==========================================
  // RENDER DE USUARIOS
  // ==========================================
  const renderUsuarios = () => {
    if (!datos || !datos.ventas_por_usuario) return null

    const { ventas_por_usuario, totales } = datos

    return (
      <>
        <div className="totales-grid">
          <div className="total-card">
            <span className="label">Usuarios con Ventas</span>
            <span className="value">{totales?.total_usuarios || 0}</span>
          </div>
          <div className="total-card">
            <span className="label">Total Ventas</span>
            <span className="value">{totales?.total_ventas || 0}</span>
          </div>
          <div className="total-card">
            <span className="label">Total Ingresos</span>
            <span className="value">{formatMoneda(totales?.total_ingresos)}</span>
          </div>
        </div>

        {(vista === 'completa' || vista === 'tabla') && (
          <TablaReporte
            titulo="Ventas por Usuario"
            columnas={[
              { titulo: 'Usuario', campo: 'usuario', ordenable: true },
              { 
                titulo: 'Rol', 
                campo: 'rol', 
                render: (row) => (
                  <span style={{ 
                    backgroundColor: 'rgba(44, 62, 80, 0.1)',
                    color: '#2c3e50',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    {row.rol}
                  </span>
                ),
                ordenable: true 
              },
              { titulo: 'Cantidad Ventas', campo: 'cantidad_ventas', ordenable: true },
              { titulo: 'Total Ventas', campo: 'total_ventas', formato: (val) => formatMoneda(val), ordenable: true }
            ]}
            datos={ventas_por_usuario}
            onExportar={() => handleExportar('csv', 'usuarios')}
          />
        )}
      </>
    )
  }

  // ==========================================
  // RENDER PRINCIPAL SEGÚN TIPO
  // ==========================================
  const renderContenido = () => {
    if (!datos) return null

    switch(tipoReporte) {
      case 'ventas':
        return renderVentas()
      case 'productos':
        return renderProductosMasVendidos()
      case 'inventario':
        return renderInventario()
      case 'movimientos':
        return renderMovimientos()
      case 'usuarios':
        return renderUsuarios()
      default:
        return null
    }
  }

  const handleExportar = async (formato, tipo) => {
    if (!datos) {
      toast.error('Primero genere el reporte')
      return
    }

    try {
      let titulo = ''
      let columnas = []
      let datosExportar = []
      let subtitulo = ''

      switch(tipo) {
        case 'ventas':
          titulo = 'Reporte de Ventas'
          subtitulo = `${fechas.fecha_inicio} al ${fechas.fecha_fin}`
          columnas = [
            { titulo: 'Fecha', campo: 'fecha' },
            { titulo: 'Cantidad de Ventas', campo: 'cantidad' },
            { titulo: 'Total', campo: 'total', formato: (val) => `$${Number(val).toFixed(2)}` }
          ]
          datosExportar = datos.ventas_por_dia || []
          break

        case 'productos':
          titulo = 'Productos Más Vendidos'
          subtitulo = `${fechas.fecha_inicio} al ${fechas.fecha_fin}`
          columnas = [
            { titulo: 'Producto', campo: 'nombre' },
            { titulo: 'Cantidad Vendida', campo: 'cantidad' },
            { titulo: 'Total Ingresos', campo: 'total', formato: (val) => `$${Number(val).toFixed(2)}` }
          ]
          datosExportar = datos.productos || []
          break

        case 'inventario':
          titulo = 'Reporte de Inventario'
          columnas = [
            { titulo: 'Producto', campo: 'nombre' },
            { titulo: 'Lote', campo: 'lote' },
            { titulo: 'Stock', campo: 'stock' },
            { titulo: 'Stock Mínimo', campo: 'stock_minimo' },
            { titulo: 'Precio', campo: 'precio', formato: (val) => `$${Number(val).toFixed(2)}` },
            { titulo: 'Laboratorio', campo: 'laboratorio' },
            { titulo: 'Tipo', campo: 'tipo' },
            { titulo: 'Estado', campo: 'estado' }
          ]
          datosExportar = datos.productos || []
          break

        case 'movimientos':
          titulo = 'Movimientos de Inventario'
          subtitulo = `${fechas.fecha_inicio} al ${fechas.fecha_fin}`
          columnas = [
            { titulo: 'Fecha', campo: 'fecha' },
            { titulo: 'Producto', campo: 'producto' },
            { titulo: 'Tipo', campo: 'tipo' },
            { titulo: 'Cantidad', campo: 'cantidad' },
            { titulo: 'Total', campo: 'total', formato: (val) => `$${Number(val).toFixed(2)}` },
            { titulo: 'Motivo', campo: 'motivo' }
          ]
          datosExportar = datos.movimientos || []
          break

        case 'usuarios':
          titulo = 'Ventas por Usuario'
          subtitulo = `${fechas.fecha_inicio} al ${fechas.fecha_fin}`
          columnas = [
            { titulo: 'Usuario', campo: 'usuario' },
            { titulo: 'Rol', campo: 'rol' },
            { titulo: 'Cantidad Ventas', campo: 'cantidad_ventas' },
            { titulo: 'Total Ventas', campo: 'total_ventas', formato: (val) => `$${Number(val).toFixed(2)}` }
          ]
          datosExportar = datos.ventas_por_usuario || []
          break

        default:
          return
      }

      if (datosExportar.length === 0) {
        toast.error('No hay datos para exportar')
        return
      }

      if (formato === 'pdf') {
        exportService.exportToPDF(titulo, columnas, datosExportar, subtitulo)
        toast.success('PDF generado correctamente')
      } else if (formato === 'excel') {
        exportService.exportToExcel(titulo, columnas, datosExportar)
        toast.success('Excel generado correctamente')
      } else if (formato === 'csv') {
        exportService.exportToCSV(titulo, columnas, datosExportar)
        toast.success('CSV generado correctamente')
      }
    } catch (error) {
      console.error('Error al exportar:', error)
      toast.error(`Error al exportar a ${formato.toUpperCase()}`)
    }
  }

  const tiposReporte = [
    { id: 'ventas', nombre: 'Ventas', icon: <FiBarChart2 />, color: '#27AE60' },
    { id: 'productos', nombre: 'Productos', icon: <FiTrendingUp />, color: '#E67E22' },
    { id: 'inventario', nombre: 'Inventario', icon: <FiPackage />, color: '#2C3E50' },
    { id: 'movimientos', nombre: 'Movimientos', icon: <FiList />, color: '#3498DB' },
    { id: 'usuarios', nombre: 'Usuarios', icon: <FiUsers />, color: '#9B59B6' }
  ]

  return (
    <div className="reportes-page">
      <div className="page-header">
        <div className="header-title">
          <h2>
            <FiBarChart2 className="title-icon" />
            Reportes
          </h2>
        </div>
          <div className="header-actions">
            <Button
              variant="outline"
              size="medium"
              onClick={() => handleExportar('pdf', tipoReporte)}
              icon={<FiDownload />}
              disabled={!datos}
            >
              PDF
            </Button>
            <Button
              variant="outline"
              size="medium"
              onClick={() => handleExportar('excel', tipoReporte)}
              icon={<FiDownload />}
              disabled={!datos}
            >
              Excel
            </Button>
            <Button
              variant="outline"
              size="medium"
              onClick={() => handleExportar('csv', tipoReporte)}
              icon={<FiDownload />}
              disabled={!datos}
            >
              CSV
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={generarReporte}
              icon={<FiRefreshCw />}
              loading={loading}
            >
              Generar
            </Button>
          </div>
      </div>

      {/* Selector de tipo de reporte */}
      <div className="tipos-reporte">
        {tiposReporte.map(tipo => (
          <button
            key={tipo.id}
            className={`tipo-btn ${tipoReporte === tipo.id ? 'active' : ''}`}
            onClick={() => setTipoReporte(tipo.id)}
            style={{ '--color': tipo.color }}
          >
            <span className="tipo-icon">{tipo.icon}</span>
            <span className="tipo-nombre">{tipo.nombre}</span>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <Card className="filtros-reporte">
        <div className="filtros-header">
          <h3>
            <FiFilter className="filtros-icon" />
            Filtros
          </h3>
        </div>
        
        <div className="filtros-grid">
          <div className="filtro-grupo">
            <label>Fecha inicio</label>
            <input
              type="date"
              value={fechas.fecha_inicio}
              onChange={(e) => setFechas({ ...fechas, fecha_inicio: e.target.value })}
              className="filtro-input"
            />
          </div>
          
          <div className="filtro-grupo">
            <label>Fecha fin</label>
            <input
              type="date"
              value={fechas.fecha_fin}
              onChange={(e) => setFechas({ ...fechas, fecha_fin: e.target.value })}
              className="filtro-input"
            />
          </div>
        </div>
      </Card>

      {/* Selector de vista - para ventas, productos e inventario */}
      {(tipoReporte === 'ventas' || tipoReporte === 'productos' || tipoReporte === 'inventario') && datos && (
        <div className="vista-selector">
          <button
            className={`vista-btn ${vista === 'completa' ? 'active' : ''}`}
            onClick={() => setVista('completa')}
          >
            <FiGrid /> Completa
          </button>
          <button
            className={`vista-btn ${vista === 'grafica' ? 'active' : ''}`}
            onClick={() => setVista('grafica')}
          >
            <FiBarChart2 /> Gráfica
          </button>
          <button
            className={`vista-btn ${vista === 'tabla' ? 'active' : ''}`}
            onClick={() => setVista('tabla')}
          >
            <FiList /> Tabla
          </button>
        </div>
      )}

      {/* Contenido del reporte */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Generando reporte...</p>
        </div>
      ) : (
        <>
          {renderContenido()}
          {!datos && !loading && (
            <div className="no-data">
              <FiBarChart2 className="no-data-icon" />
              <h3>No hay datos para mostrar</h3>
              <p>Selecciona un tipo de reporte y genera los datos</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Reportes