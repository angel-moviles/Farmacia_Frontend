import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './Graficas.css'

const GraficaInventario = ({ data, tipo = 'barras' }) => {
  // Colores para diferentes estados de inventario
  const COLORES_ESTADO = {
    critico: '#E74C3C',      // Rojo - Stock crítico
    bajo: '#F39C12',         // Naranja - Stock bajo
    normal: '#27AE60',       // Verde - Stock normal
    alto: '#3498DB'          // Azul - Stock alto
  }

  // Función segura para formatear cantidad
  const formatCantidad = (value) => {
    if (value === undefined || value === null) return '0'
    const numValue = Number(value)
    if (isNaN(numValue)) return '0'
    return numValue.toLocaleString('es-MX')
  }

  // CustomTooltip para mostrar información detallada
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-fecha">{payload[0]?.payload?.nombre || label}</p>
          <p className="tooltip-valor">
            <span className="tooltip-label">Stock actual:</span>
            <span className="tooltip-valor">{formatCantidad(payload[0]?.value)}</span>
          </p>
          {payload[0]?.payload?.stockMinimo && (
            <p className="tooltip-valor">
              <span className="tooltip-label">Stock mínimo:</span>
              <span className="tooltip-valor">{formatCantidad(payload[0]?.payload?.stockMinimo)}</span>
            </p>
          )}
          {payload[0]?.payload?.estado && (
            <p className="tooltip-valor">
              <span className="tooltip-label">Estado:</span>
              <span className="tooltip-valor">{payload[0]?.payload?.estado}</span>
            </p>
          )}
        </div>
      )
    }
    return null
  }

  // Gráfica de barras - Comparación stock actual vs stock mínimo
  if (tipo === 'barras') {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="nombre" 
            stroke="#64748B"
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis stroke="#64748B" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="stock" 
            fill="#27AE60" 
            name="Stock Actual"
            radius={[8, 8, 0, 0]}
          />
          <Bar 
            dataKey="stockMinimo" 
            fill="#F39C12" 
            name="Stock Mínimo"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Gráfica de línea - Movimiento de inventario en el tiempo
  if (tipo === 'linea') {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="fecha" stroke="#64748B" />
          <YAxis stroke="#64748B" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="stock" 
            stroke="#27AE60" 
            strokeWidth={3}
            dot={{ fill: '#27AE60', r: 4 }}
            activeDot={{ r: 8 }}
            name="Stock Disponible"
          />
          <Line 
            type="monotone" 
            dataKey="stockMinimo" 
            stroke="#F39C12" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Stock Mínimo"
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  // Gráfica de pastel - Distribución de estados
  if (tipo === 'pastel') {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ nombre, value }) => `${nombre}: ${value}`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="cantidad"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORES_ESTADO[entry.estado] || '#95a5a6'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  // Por defecto mostrar gráfica de barras
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="nombre" 
          stroke="#64748B"
          angle={-45}
          textAnchor="end"
          height={100}
        />
        <YAxis stroke="#64748B" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="stock" 
          fill="#27AE60" 
          name="Stock Actual"
          radius={[8, 8, 0, 0]}
        />
        <Bar 
          dataKey="stockMinimo" 
          fill="#F39C12" 
          name="Stock Mínimo"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default GraficaInventario
