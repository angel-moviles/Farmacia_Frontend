import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { dashboardService } from '../services/dashboardService'
import Card from '../components/common/Card'
import KPICard from '../components/dashboard/KPICard'
import { 
  FiUsers, 
  FiPackage, 
  FiShoppingCart, 
  FiDollarSign,
  FiAlertTriangle,
  FiTrendingUp,
  FiCalendar,
  FiClock,
  FiBarChart2,
  FiActivity,
  FiTruck,
  FiBox,
  FiAward
} from 'react-icons/fi'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('dia')

  const COLORS = ['#27AE60', '#2C3E50', '#E67E22', '#3498DB', '#9B59B6', '#E74C3C']

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await dashboardService.getStats()
      console.log('Dashboard data:', response)
      setData(response)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return `$${Number(value).toFixed(2)}`
  }

  const formatNumber = (value) => {
    return Number(value).toLocaleString()
  }

  const getAlertColor = (tipo) => {
    switch(tipo) {
      case 'stock_bajo': return '#E67E22'
      case 'sin_stock': return '#E74C3C'
      case 'proximos_caducar': return '#3498DB'
      default: return '#27AE60'
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    )
  }

  if (!data || !data.success) {
    return (
      <div className="dashboard-error">
        <FiAlertTriangle className="error-icon" />
        <h3>Error al cargar el dashboard</h3>
        <button onClick={loadDashboardData}>Reintentar</button>
      </div>
    )
  }

  const { stats, producto_mas_vendido, categorias_mas_vendidas, laboratorios_mas_vendidos, ventas_por_hora, ultimas_ventas, alertas } = data

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-welcome">
            Bienvenido, {user?.nombre} {user?.a_paterno}
          </p>
        </div>
        <div className="dashboard-fecha">
          {new Date().toLocaleDateString('es-MX', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="kpi-grid">
        <KPICard
          title="Usuarios Activos"
          value={formatNumber(stats.usuarios_activos)}
          total={formatNumber(stats.total_usuarios)}
          icon={<FiUsers />}
          color="#2C3E50"
        />
        <KPICard
          title="Productos"
          value={formatNumber(stats.productos_activos)}
          total={formatNumber(stats.total_productos)}
          icon={<FiPackage />}
          color="#27AE60"
        />
        <KPICard
          title="Ventas Totales"
          value={formatNumber(stats.total_ventas)}
          icon={<FiShoppingCart />}
          color="#E67E22"
        />
        <KPICard
          title="Ingresos Totales"
          value={formatCurrency(stats.total_ingresos)}
          icon={<FiDollarSign />}
          color="#3498DB"
        />
      </div>

      {/* KPIs de Ventas */}
      <div className="kpi-grid secundario">
        <KPICard
          title="Ventas Hoy"
          value={formatNumber(stats.ventas_hoy)}
          subtitle={formatCurrency(stats.ingresos_hoy)}
          icon={<FiClock />}
          color="#9B59B6"
        />
        <KPICard
          title="Ventas Semana"
          value={formatNumber(stats.ventas_semana)}
          subtitle={formatCurrency(stats.ingresos_semana)}
          icon={<FiCalendar />}
          color="#E67E22"
        />
        <KPICard
          title="Ventas Mes"
          value={formatNumber(stats.ventas_mes)}
          subtitle={formatCurrency(stats.ingresos_mes)}
          icon={<FiTrendingUp />}
          color="#27AE60"
        />
        <KPICard
          title="Ticket Promedio"
          value={formatCurrency(stats.ticket_promedio)}
          icon={<FiActivity />}
          color="#2C3E50"
        />
      </div>

      {/* KPIs de Inventario */}
      <div className="kpi-grid inventario">
        <KPICard
          title="Productos con Stock"
          value={formatNumber(stats.productos_con_stock)}
          icon={<FiBox />}
          color="#27AE60"
        />
        <KPICard
          title="Productos sin Stock"
          value={formatNumber(stats.productos_sin_stock)}
          icon={<FiAlertTriangle />}
          color="#E74C3C"
        />
        <KPICard
          title="Stock Total"
          value={formatNumber(stats.stock_total)}
          icon={<FiPackage />}
          color="#3498DB"
        />
        <KPICard
          title="Valor Inventario"
          value={formatCurrency(stats.valor_inventario)}
          subtitle={`Costo: ${formatCurrency(stats.costo_inventario)}`}
          icon={<FiDollarSign />}
          color="#E67E22"
        />
      </div>

      {/* Gráficas */}
      <div className="dashboard-grid">
        {/* Producto más vendido */}
        {producto_mas_vendido && (
          <Card className="dashboard-card">
            <h3>
              <FiAward className="card-icon" />
              Producto más vendido
            </h3>
            <div className="top-producto">
              <div className="producto-info">
                <span className="producto-nombre">{producto_mas_vendido.nombre}</span>
                <div className="producto-stats">
                  <div className="stat">
                    <span className="stat-label">Cantidad vendida</span>
                    <span className="stat-value">{formatNumber(producto_mas_vendido.total_vendido)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Ingresos generados</span>
                    <span className="stat-value">{formatCurrency(producto_mas_vendido.total_ingresos)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Precio unitario</span>
                    <span className="stat-value">{formatCurrency(producto_mas_vendido.precio_venta)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Categorías más vendidas */}
        {categorias_mas_vendidas && categorias_mas_vendidas.length > 0 && (
          <Card className="dashboard-card">
            <h3>
              <FiBarChart2 className="card-icon" />
              Categorías más vendidas
            </h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categorias_mas_vendidas}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="total_vendido"
                    nameKey="categoria"
                    label
                  >
                    {categorias_mas_vendidas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="categorias-lista">
                {categorias_mas_vendidas.map((cat, index) => (
                  <div key={index} className="categoria-item">
                    <span className="categoria-nombre" style={{ color: COLORS[index % COLORS.length] }}>
                      {cat.categoria}
                    </span>
                    <span className="categoria-valor">{formatNumber(cat.total_vendido)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Laboratorios más vendidos */}
        {laboratorios_mas_vendidos && laboratorios_mas_vendidos.length > 0 && (
          <Card className="dashboard-card">
            <h3>
              <FiTruck className="card-icon" />
              Laboratorios más vendidos
            </h3>
            <div className="laboratorios-lista">
              {laboratorios_mas_vendidos.map((lab, index) => (
                <div key={index} className="laboratorio-item">
                  <span className="laboratorio-nombre">{lab.laboratorio}</span>
                  <div className="laboratorio-bar">
                    <div 
                      className="barra" 
                      style={{ 
                        width: `${(lab.total_vendido / laboratorios_mas_vendidos[0].total_vendido) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    ></div>
                    <span className="laboratorio-valor">{formatNumber(lab.total_vendido)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Ventas por hora */}
        {ventas_por_hora && ventas_por_hora.length > 0 && (
          <Card className="dashboard-card full-width">
            <h3>
              <FiClock className="card-icon" />
              Ventas por hora (hoy)
            </h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ventas_por_hora}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="cantidad" fill="#27AE60" name="Cantidad" />
                  <Bar yAxisId="right" dataKey="total" fill="#2C3E50" name="Total ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Últimas ventas */}
        {ultimas_ventas && ultimas_ventas.length > 0 && (
          <Card className="dashboard-card full-width">
            <h3>
              <FiShoppingCart className="card-icon" />
              Últimas ventas
            </h3>
            <div className="ultimas-ventas">
              <table className="ventas-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Productos</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimas_ventas.map((venta, index) => (
                    <tr key={index}>
                      <td>#{venta.id}</td>
                      <td>{venta.fecha}</td>
                      <td>{venta.usuario}</td>
                      <td>{venta.productos}</td>
                      <td className="total-col">{formatCurrency(venta.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Alertas */}
        <Card className="dashboard-card alertas-card">
          <h3>
            <FiAlertTriangle className="card-icon" />
            Alertas
          </h3>
          <div className="alertas-secciones">
            {alertas.stock_bajo && alertas.stock_bajo.length > 0 && (
              <div className="alerta-seccion">
                <h4 style={{ color: getAlertColor('stock_bajo') }}>
                  Stock bajo ({alertas.stock_bajo.length})
                </h4>
                <div className="alertas-lista">
                  {alertas.stock_bajo.slice(0, 3).map((alerta, idx) => (
                    <div key={idx} className="alerta-item-small">
                      <span>{alerta.nombre}</span>
                      <span className="alerta-valor">{alerta.stock} / {alerta.stock_minimo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {alertas.sin_stock && alertas.sin_stock.length > 0 && (
              <div className="alerta-seccion">
                <h4 style={{ color: getAlertColor('sin_stock') }}>
                  Sin stock ({alertas.sin_stock.length})
                </h4>
                <div className="alertas-lista">
                  {alertas.sin_stock.slice(0, 3).map((alerta, idx) => (
                    <div key={idx} className="alerta-item-small">
                      <span>{alerta.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {alertas.proximos_caducar && alertas.proximos_caducar.length > 0 && (
              <div className="alerta-seccion">
                <h4 style={{ color: getAlertColor('proximos_caducar') }}>
                  Próximos a caducar ({alertas.proximos_caducar.length})
                </h4>
                <div className="alertas-lista">
                  {alertas.proximos_caducar.slice(0, 3).map((alerta, idx) => (
                    <div key={idx} className="alerta-item-small">
                      <span>{alerta.nombre}</span>
                      <span className="alerta-valor">
                        {new Date(alerta.fecha_caducidad).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!alertas.stock_bajo?.length && !alertas.sin_stock?.length && !alertas.proximos_caducar?.length) && (
              <p className="no-alertas">No hay alertas pendientes</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard