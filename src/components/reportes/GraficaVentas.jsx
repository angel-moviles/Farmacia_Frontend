import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import './Graficas.css'

const GraficaVentas = ({ data, tipo = 'linea' }) => {
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
          <p className="tooltip-fecha">{label}</p>
          <p className="tooltip-ventas">
            <span className="tooltip-label">Ventas:</span>
            <span className="tooltip-valor">{payload[0]?.value || 0}</span>
          </p>
          <p className="tooltip-total">
            <span className="tooltip-label">Total:</span>
            <span className="tooltip-valor">{formatMoneda(payload[1]?.value)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  if (tipo === 'area') {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#27AE60" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#27AE60" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2C3E50" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#2C3E50" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="fecha" stroke="#64748B" />
          <YAxis yAxisId="left" stroke="#64748B" />
          <YAxis yAxisId="right" orientation="right" stroke="#64748B" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="cantidad" 
            stroke="#27AE60" 
            fillOpacity={1}
            fill="url(#colorVentas)"
            name="Cantidad de ventas"
          />
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="total" 
            stroke="#2C3E50" 
            fillOpacity={1}
            fill="url(#colorTotal)"
            name="Total ($)"
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="fecha" stroke="#64748B" />
        <YAxis yAxisId="left" stroke="#64748B" />
        <YAxis yAxisId="right" orientation="right" stroke="#64748B" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="cantidad" 
          stroke="#27AE60" 
          strokeWidth={3}
          dot={{ fill: '#27AE60', r: 4 }}
          activeDot={{ r: 8 }}
          name="Cantidad de ventas"
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="total" 
          stroke="#2C3E50" 
          strokeWidth={3}
          dot={{ fill: '#2C3E50', r: 4 }}
          activeDot={{ r: 8 }}
          name="Total ($)"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default GraficaVentas