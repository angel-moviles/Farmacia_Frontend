import './KPICard.css'

const KPICard = ({ title, value, icon, color }) => {
  return (
    <div className="kpi-card" style={{ borderLeftColor: color }}>
      <div className="kpi-content">
        <h4 className="kpi-title">{title}</h4>
        <p className="kpi-value">{value}</p>
      </div>
      <div className="kpi-icon" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
    </div>
  )
}

export default KPICard