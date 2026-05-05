import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './Graficas.css'

const GraficaProductos = ({ data, tipo = 'barras' }) => {
  const COLORS = ['#27AE60', '#2C3E50', '#E67E22', '#3498DB', '#9B59B6', '#E74C3C', '#1ABC9C', '#F1C40F']

  // Función segura para formatear moneda
  const formatMoneda = (value) => {
    if (value === undefined || value === null) return '$0.00'
    const numValue = Number(value)
    if (isNaN(numValue)) return '$0.00'
    return `$${numValue.toFixed(2)}`
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-producto">{payload[0]?.payload?.nombre || label}</p>
          <p className="tooltip-cantidad">
            <span className="tooltip-label">Cantidad:</span>
            <span className="tooltip-valor">{payload[0]?.value || 0}</span>
          </p>
          <p className="tooltip-total">
            <span className="tooltip-label">Total:</span>
            <span className="tooltip-valor">{formatMoneda(payload[0]?.payload?.total)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (tipo === 'pastel') {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="cantidad"
            nameKey="nombre"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="nombre" stroke="#64748B" angle={-45} textAnchor="end" height={80} />
        <YAxis yAxisId="left" stroke="#64748B" />
        <YAxis yAxisId="right" orientation="right" stroke="#64748B" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar yAxisId="left" dataKey="cantidad" fill="#27AE60" name="Cantidad vendida" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="right" dataKey="total" fill="#2C3E50" name="Total ($)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default GraficaProductos